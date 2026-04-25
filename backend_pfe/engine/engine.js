import { evaluator } from './evaluator.js';

export class CalculationEngine {
  constructor(repo) {
    this.repo = repo;
  }

  async calculate(input) {
    this.validateInput(input);

    // ── 1. Fetch exchange rate and market factor ───────────────────────────
    const latestRate = await this.repo.getLatestExchangeRate();
    console.log('📑 Exchange rate from DB:', latestRate);

    const adminMarketFactor = await this.repo.getMarketFactor();
    console.log(`⚙️ Market Factor: ${adminMarketFactor}`);

    // ── 2. Load selected formula and its field definitions ────────────────
    const selectedFormula = await this.repo.getFormula(input.selected_formula_id);
    this.assertFormulaType(selectedFormula, 'NON_MATERIAL');

    const fieldDefs = await this.repo.getFieldDefinitions(selectedFormula.formula_id);

    // ── 3. Build vars — resolves field UUIDs → variable_name symbols ──────
    //       Now type-aware: NUMBER / BOOLEAN / SELECT (see buildInitialVars)
    const vars = this.buildInitialVars(input.field_values, fieldDefs);

    // ── 4. Evaluate selected NON_MATERIAL formula ─────────────────────────
    const outputs = await this.repo.getFormulaOutputs(selectedFormula.formula_id);
    const intermediateResults = await this.evaluateFormula(selectedFormula, outputs, vars);

    for (const r of intermediateResults) {
      vars[r.output_key]     = r.value; // Legacy flat key
      vars[r.namespaced_key] = r.value; // Isolated namespaced key
    }

    // ── 5. Resolve chained fields (source_formula_id) ─────────────────────
    for (const field of fieldDefs) {
      const symbol = field.variable_name || field.field_id;
      if (field.source_formula_id && !(symbol in vars)) {
        const src     = await this.repo.getFormula(field.source_formula_id);
        const srcOuts = await this.repo.getFormulaOutputs(field.source_formula_id);
        const res     = await this.evaluateFormula(src, srcOuts, vars);
        for (const r of res) {
          vars[r.output_key]     = r.value;
          vars[r.namespaced_key] = r.value;
          vars[symbol]           = r.value;
          vars[field.field_id]   = r.value;
        }
      }
    }

    // ── 6. Inject coefficients ────────────────────────────────────────────
    const coefficients = await this.repo.getCoefficients(
      input.category_id, input.selected_config_id,
    );
    for (const c of coefficients) vars[c.name] = c.value;

    // ── 7. Evaluate material formulas — skip if vars insufficient ─────────
    const materials        = await this.repo.getMaterialsForCategory(input.category_id);
    const matLines         = [];
    const skippedMaterials = [];

    for (const mat of materials) {
      // Gracefully skip if the material's formula doesn't exist in the DB
      let mf;
      try {
        mf = await this.repo.getFormula(mat.formula_id);
        this.assertFormulaType(mf, 'MATERIAL');
      } catch (e) {
        skippedMaterials.push({
          material_id:      mat.material_id,
          material_name:    mat.material_name,
          material_name_en: mat.material_name_en,
          material_name_ar: mat.material_name_ar,
          reason:           e.message,
        });
        continue;
      }

      let rawQty;
      try {
        rawQty = this.evalExpr(mf.expression, vars, mf);
      } catch (e) {
        skippedMaterials.push({
          material_id:      mat.material_id,
          material_name:    mat.material_name,
          material_name_en: mat.material_name_en,
          material_name_ar: mat.material_name_ar,
          reason:           e.message,
        });
        continue;
      }

      if (rawQty < 0) throw new EngineError(
        `Negative quantity for material "${mat.material_name}" (got ${rawQty})`
      );

      const waste   = mat.default_waste_factor;
      const qtyW    = this.r4(rawQty * (1 + waste));
      const sub_dzd = this.r2(qtyW * mat.unit_price_usd * latestRate * adminMarketFactor);
      const unit    = await this.repo.getUnit(mat.unit_id);

      matLines.push({
        material_id:           mat.material_id,
        material_name:         mat.material_name,
        material_name_en:      mat.material_name_en,
        material_name_ar:      mat.material_name_ar,
        material_type:         mat.material_type,
        quantity:              this.r4(rawQty),
        unit_symbol:           unit.symbol,
        unit_price_usd:        mat.unit_price_usd,
        unit_price_snapshot:   mat.unit_price_usd,
        waste_factor:          waste,
        waste_factor_snapshot: waste,
        applied_waste:         this.r4(rawQty * waste),
        quantity_with_waste:   qtyW,
        sub_total:             sub_dzd,
      });
    }

    // ── 8. Roll up ────────────────────────────────────────────────────────
    const primSub = this.r2(
      matLines.filter(m => m.material_type === 'PRIMARY')
              .reduce((s, m) => s + m.sub_total, 0)
    );
    const accSub = this.r2(
      matLines.filter(m => m.material_type === 'ACCESSORY')
              .reduce((s, m) => s + m.sub_total, 0)
    );

    return {
      category_id:              input.category_id,
      selected_formula_id:      input.selected_formula_id,
      selected_config_id:       input.selected_config_id,
      formula_version_snapshot: selectedFormula.version,
      intermediate_results:     intermediateResults,
      material_lines:           matLines,
      skipped_materials:        skippedMaterials,
      subtotal_primary:         primSub,
      subtotal_accessory:       accSub,
      total_cost:               this.r2(primSub + accSub),
      computed_at:              new Date().toISOString(),
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  async evaluateFormula(formula, outputs, vars) {
    // UPDATED: Create namespace prefix
    const namespace = formula.name.toLowerCase().replace(/\s+/g, '_');

    if (outputs.length === 0) {
      const value = this.evalExpr(formula.expression, vars, formula);
      const unit  = await this.repo.getUnit(formula.output_unit_id);
      const key   = formula.name.toLowerCase().replace(/\s+/g, '_');
      
      return [{
        formula_id:      formula.formula_id,
        formula_version: formula.version,
        output_key:      key,
        namespaced_key:  `${namespace}.${key}`,
        output_label_en: formula.name_en,
        output_label_ar: formula.name_ar,
        value:           this.r4(value),
        unit_symbol:     unit.symbol,
      }];
    }

    const results = [];
    for (const out of outputs) {
      const expr  = out.expression ?? formula.expression;
      const value = this.evalExpr(expr, vars, formula);
      const unit  = await this.repo.getUnit(out.output_unit_id);
      
      results.push({
        formula_id:      formula.formula_id,
        formula_version: formula.version,
        output_key:      out.output_key,
        namespaced_key:  `${namespace}.${out.output_key}`,
        output_label_en: out.output_label_en,
        output_label_ar: out.output_label_ar,
        value:           this.r4(value),
        unit_symbol:     unit.symbol,
      });
    }
    return results;
  }

  evalExpr(expression, vars, formula) {
    try {
      return evaluator.evaluate(expression, vars);
    } catch (e) {
      throw new EngineError(`Formula "${formula.name}": ${e.message}`);
    }
  }

  /**
   * Builds the variable context from field_values, with type-aware coercion.
   *
   * Each field's field_type_name (resolved via LEFT JOIN in the repository)
   * determines how the raw incoming value is coerced:
   *
   *   NUMBER  (default) — must already be a finite number, identical to the
   *                        original behaviour.
   *
   *   BOOLEAN           — accepts true/false (JS boolean) or 1/0 (number) or
   *                        the strings "true"/"false". Coerced to 1 or 0 so
   *                        formula expressions can do arithmetic on it,
   *                        e.g.  if(has_basement == 1, depth * 0.3, 0).
   *
   *   SELECT            — the frontend sends the numeric value of the chosen
   *                        option (stored per-option in default_value JSON).
   *                        Validated as a finite number so downstream
   *                        expressions receive a clean numeric variable.
   *
   * field_type_name is matched with a contains-check so minor naming
   * differences in the DB ("Boolean Toggle", "BOOLEAN", etc.) all work.
   *
   * The original UUID key is always kept alongside the symbol key so
   * source_formula_id chaining lookups continue to function unchanged.
   */
  buildInitialVars(fv, fieldDefs) {
    const vars = {};

    for (const [k, v] of Object.entries(fv)) {
      const field      = fieldDefs.find(f => f.field_id === k);
      const symbol     = field?.variable_name || k;
      const typeName   = (field?.field_type_name || 'number'); // already lowercased by repo

      let numVal;

      if (typeName.includes('bool')) {
        // ── BOOLEAN ───────────────────────────────────────────────────────
        if (v === true  || v === 1 || v === 'true')  numVal = 1;
        else if (v === false || v === 0 || v === 'false') numVal = 0;
        else throw new EngineError(
          `Field "${k}" is BOOLEAN — expected true/false/1/0, got "${v}"`
        );

      } else if (typeName.includes('select')) {
        // ── SELECT ────────────────────────────────────────────────────────
        // The frontend sends the numeric value of the chosen option.
        numVal = Number(v);
        if (!isFinite(numVal)) throw new EngineError(
          `Field "${k}" is SELECT — option value must be a number, got "${v}"`
        );

      } else {
        // ── NUMBER (default) ──────────────────────────────────────────────
        if (typeof v !== 'number' || !isFinite(v))
          throw new EngineError(`Invalid value for field "${k}": expected a finite number, got "${v}"`);
        numVal = v;
      }

      vars[symbol] = numVal; // "L" = 5   — used in expressions
      vars[k]      = numVal; // uuid  = 5 — kept for chaining
    }

    return vars;
  }

  assertFormulaType(f, t) {
    if (f.formula_type !== t)
      throw new EngineError(`Formula "${f.name}" is "${f.formula_type}", expected "${t}"`);
  }

  validateInput(i) {
    if (!i.category_id)         throw new EngineError('category_id is required');
    if (!i.selected_formula_id) throw new EngineError('selected_formula_id is required');
  }

  r2(v) { return Math.round(v * 100) / 100; }
  r4(v) { return Math.round(v * 10000) / 10000; }
}

export class EngineError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'EngineError';
  }
}
