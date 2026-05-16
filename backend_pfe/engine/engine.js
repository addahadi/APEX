import { evaluator } from './evaluator.js';

export class CalculationEngine {
  constructor(repo) {
    this.repo = repo;
  }

  async calculate(input) {
    this.validateInput(input);

    // ✅ Budget Type
    const budgetType = input.budget_type || 'MEDIUM';

    // ── 1. Fetch exchange rate and market factor ───────────────────────────
    const latestRate = await this.repo.getLatestExchangeRate();
    console.log('📑 Exchange rate from DB:', latestRate);

    const adminMarketFactor = await this.repo.getMarketFactor();
    console.log(`⚙️ Market Factor: ${adminMarketFactor}`);

    // ── 2. Load selected formula and its field definitions ────────────────
    const selectedFormula = await this.repo.getFormula(input.selected_formula_id);
    this.assertFormulaType(selectedFormula, 'NON_MATERIAL');

    const fieldDefs = await this.repo.getFieldDefinitions(selectedFormula.formula_id);

    // ── 3. Build vars ─────────────────────────────────────────────────────
    const vars = this.buildInitialVars(input.field_values, fieldDefs);

    // ── 4. Evaluate selected NON_MATERIAL formula ─────────────────────────
    const outputs = await this.repo.getFormulaOutputs(selectedFormula.formula_id);
    const intermediateResults = await this.evaluateFormula(selectedFormula, outputs, vars);

    for (const r of intermediateResults) {
      vars[r.output_key]     = r.value;
      vars[r.namespaced_key] = r.value;
    }

    // ── 5. Resolve chained fields ─────────────────────────────────────────
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
      input.category_id,
      input.selected_config_id,
    );

    for (const c of coefficients) {
      vars[c.name] = c.value;
    }

    // ── 7. Evaluate material formulas ─────────────────────────────────────
    const materials        = await this.repo.getMaterialsForCategory(input.category_id);
    const matLines         = [];
    const skippedMaterials = [];

    for (const mat of materials) {
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

        console.log(
          `🔍 [DEBUG] Material: ${mat.material_name} | Raw Qty: ${rawQty}`
        );
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

      if (rawQty < 0) {
        throw new EngineError(
          `Negative quantity for material "${mat.material_name}" (got ${rawQty})`
        );
      }

      const waste = mat.default_waste_factor;
      const qtyW  = this.r4(rawQty * (1 + waste));

      // ✅ Select price based on budget type
      const priceUsd =
        budgetType === 'LOW'
          ? (mat.min_price_usd ?? mat.unit_price_usd)
          : budgetType === 'HIGH'
          ? (mat.max_price_usd ?? mat.unit_price_usd)
          : mat.unit_price_usd;

          console.log('======================');
console.log('Material:', mat.material_name);
console.log('LOW:', mat.min_price_usd);
console.log('MEDIUM:', mat.unit_price_usd);
console.log('HIGH:', mat.max_price_usd);
console.log('Budget Type:', budgetType);

      const sub_dzd = this.r2(
        qtyW * priceUsd * latestRate * adminMarketFactor
      );

      const unit = await this.repo.getUnit(mat.unit_id);

      console.log(`--- Material Check ---`);
      console.log(`Budget Type: ${budgetType}`);
      console.log(`Name: ${mat.material_name}`);
      console.log(`Min Price: ${mat.min_price_usd}`);
      console.log(`Medium Price: ${mat.unit_price_usd}`);
      console.log(`Max Price: ${mat.max_price_usd}`);
      console.log(`Selected Price: ${priceUsd}`);
      console.log(`Rate: ${latestRate}`);
      console.log(`Factor: ${adminMarketFactor}`);
      console.log(`Subtotal DZD: ${sub_dzd}`);

      matLines.push({
        material_id:           mat.material_id,
        material_name:         mat.material_name,
        material_name_en:      mat.material_name_en,
        material_name_ar:      mat.material_name_ar,
        material_type:         mat.material_type,

        quantity:              this.r4(rawQty),
        unit_symbol:           unit.symbol,

        unit_price_usd:        priceUsd,
        unit_price_snapshot:   priceUsd,
        budget_type_applied:   budgetType,

        waste_factor:          waste,
        waste_factor_snapshot: waste,

        applied_waste:         this.r4(rawQty * waste),
        quantity_with_waste:   qtyW,
        sub_total:             sub_dzd,
      });
    }

    // ── 7b. Evaluate service formulas ────────────────────────────────────
const services = await this.repo.getServicesForCategory(input.category_id);

const svcLines = [];
const skippedServices = [];

for (const svc of services) {

  if (!svc.formula_id) {
    skippedServices.push({
      service_id: svc.service_id,
      service_name: svc.service_name,
      reason: 'No formula linked'
    });

    continue;
  }

  let sf;

  try {
    sf = await this.repo.getFormula(svc.formula_id);

    // Only accept SERVICE formula_type
    if (sf.formula_type !== 'SERVICE') {
      throw new EngineError(`Wrong type: ${sf.formula_type}`);
    }

  } catch (e) {

    skippedServices.push({
      service_id: svc.service_id,
      service_name: svc.service_name,
      reason: e.message
    });

    continue;
  }

  let rawQty;

  try {
    rawQty = this.evalExpr(sf.expression, vars, sf);

  } catch (e) {

    skippedServices.push({
      service_id: svc.service_id,
      service_name: svc.service_name,
      reason: e.message
    });

    continue;
  }

  if (rawQty < 0) {
    throw new EngineError(
      `Negative qty for service "${svc.service_name}" (${rawQty})`
    );
  }

  const unit = svc.unit_id
    ? await this.repo.getUnit(svc.unit_id)
    : { symbol: svc.unit_en || '' };

  // ✅ Original service pricing
  const unitPriceDZD =
      (Number(svc.equipment_cost) || 0)
    + (Number(svc.manpower_cost) || 0)
    + (Number(svc.install_labor_price) || 0);

  const sub_dzd = this.r2(rawQty * unitPriceDZD);

  console.log(`--- Service Check ---`);
  console.log(`Name: ${svc.service_name}`);
  console.log(`Unit Price (DZD): ${unitPriceDZD}`);
  console.log(`Subtotal DZD: ${sub_dzd}`);

  svcLines.push({
    service_id: svc.service_id,

    service_name: svc.service_name,
    service_name_en: svc.service_name_en,
    service_name_ar: svc.service_name_ar,

    quantity: this.r4(rawQty),

    unit_symbol: unit.symbol,

    unit_price: unitPriceDZD,
    unit_price_snapshot: unitPriceDZD,

    equipment_cost: svc.equipment_cost,
    manpower_cost: svc.manpower_cost,
    install_labor_price: svc.install_labor_price,

    sub_total: sub_dzd,
  });
}

    // ── 8. Roll up ────────────────────────────────────────────────────────
    const primSub = this.r2(
      matLines
        .filter(m => m.material_type === 'PRIMARY')
        .reduce((s, m) => s + m.sub_total, 0)
    );

    const accSub = this.r2(
      matLines
        .filter(m => m.material_type === 'ACCESSORY')
        .reduce((s, m) => s + m.sub_total, 0)
    );

    const svcSub = this.r2(
      svcLines.reduce((s, sv) => s + sv.sub_total, 0)
    );

    return {
      category_id:              input.category_id,
      selected_formula_id:      input.selected_formula_id,
      selected_config_id:       input.selected_config_id,

      formula_version_snapshot: selectedFormula.version,

      budget_type:              budgetType,

      intermediate_results:     intermediateResults,

      material_lines:           matLines,
      skipped_materials:        skippedMaterials,

      subtotal_primary:         primSub,
      subtotal_accessory:       accSub,

      service_lines:            svcLines,
      skipped_services:         skippedServices,

      subtotal_services:        svcSub,

      total_cost: this.r2(
        primSub + accSub + svcSub
      ),

      computed_at: new Date().toISOString(),
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  async evaluateFormula(formula, outputs, vars) {
    const namespace = formula.name
      .toLowerCase()
      .replace(/\s+/g, '_');

    if (outputs.length === 0) {
      const value = this.evalExpr(formula.expression, vars, formula);

      const unit = await this.repo.getUnit(formula.output_unit_id);

      const key = formula.name
        .toLowerCase()
        .replace(/\s+/g, '_');

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

      const unit = await this.repo.getUnit(out.output_unit_id);

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
      throw new EngineError(
        `Formula "${formula.name}": ${e.message}`
      );
    }
  }

  buildInitialVars(fv, fieldDefs) {
    const vars = {};

    for (const [k, v] of Object.entries(fv)) {
      const field = fieldDefs.find(f => f.field_id === k);

      const symbol   = field?.variable_name || k;
      const typeName = (field?.field_type_name || 'number');

      let numVal;

      if (typeName.includes('bool')) {
        if (v === true || v === 1 || v === 'true') {
          numVal = 1;
        } else if (
          v === false ||
          v === 0 ||
          v === 'false'
        ) {
          numVal = 0;
        } else {
          throw new EngineError(
            `Field "${k}" is BOOLEAN`
          );
        }

      } else if (typeName.includes('select')) {
        numVal = Number(v);

        if (!isFinite(numVal)) {
          throw new EngineError(
            `Field "${k}" is SELECT`
          );
        }

      } else {
        if (typeof v !== 'number' || !isFinite(v)) {
          throw new EngineError(
            `Invalid value for field "${k}"`
          );
        }

        numVal = v;
      }

      vars[symbol] = numVal;
      vars[k]      = numVal;
    }

    return vars;
  }

  assertFormulaType(f, t) {
    if (f.formula_type !== t) {
      throw new EngineError(
        `Formula "${f.name}" is "${f.formula_type}", expected "${t}"`
      );
    }
  }

  validateInput(i) {
    if (!i.category_id) {
      throw new EngineError('category_id is required');
    }

    if (!i.selected_formula_id) {
      throw new EngineError('selected_formula_id is required');
    }
  }

  r2(v) {
    return Math.round(v * 100) / 100;
  }

  r4(v) {
    return Math.round(v * 10000) / 10000;
  }
}

export class EngineError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'EngineError';
  }
}