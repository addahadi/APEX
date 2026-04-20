import { useState, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Plus, X, FolderOpen, FolderTree,
  FlaskConical, Save, ToggleLeft, ToggleRight, Layers, CheckCircle,
  Settings2, Sigma, AlertTriangle, Hash, ChevronUp, Loader2, Trash2,
  Home, Palette, DoorOpen, Pickaxe, Construction, Box, Landmark,
  Wrench, Droplets, Zap, Layout, Shield, HardHat, Hammer, Paintbrush,
  BrickWall, AppWindow, Key,
} from "lucide-react";
import {
  P, slugify, CAT_LEVEL_CONF, FORMULA_TYPE_CONF,
} from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, Sel } from "@/components/admin/ui-atoms";
import {
  useModulesTree, useLeafDetails, useUnits,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateFormula,  useUpdateFormula,  useDeleteFormula,
  useCreateFormulaOutput, useUpdateFormulaOutput, useDeleteFormulaOutput,
  useCreateField,    useUpdateField,    useDeleteField,
  useCreateConfig,   useUpdateConfig,   useDeleteConfig,
  useCreateCoefficient, useUpdateCoefficient, useDeleteCoefficient,
} from "@/hooks/modules.queries";

// ── Constants ─────────────────────────────────────────────────────────────────

const CAT_LEVELS = ["ROOT", "DOMAIN", "SUB_TYPE"];

const ICON_MAP = {
  "folder":       FolderOpen,
  "home":         Home,
  "palette":      Palette,
  "door":         DoorOpen,
  "pickaxe":      Pickaxe,
  "construction": Construction,
  "box":          Box,
  "landmark":     Landmark,
  "wrench":       Wrench,
  "droplets":     Droplets,
  "zap":          Zap,
  "layout":       Layout,
  "shield":       Shield,
  "hardhat":      HardHat,
  "hammer":       Hammer,
  "brush":        Paintbrush,
  "wall":         BrickWall,
  "app":          AppWindow,
  // Backwards-compat emoji keys
  "📂": FolderOpen, "🏚️": Home,    "🎨": Palette, "🚪": DoorOpen,
  "⛏️": Pickaxe,  "🏗️": Construction, "🧱": BrickWall, "🏛️": Landmark,
  "🔧": Wrench,   "💧": Droplets, "⚡": Zap,
};

const ICONS_LIST = Object.keys(ICON_MAP).filter(k => !k.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/));

function CategoryIcon({ icon, size = 14, color = "inherit", style = {} }) {
  const IconComp = ICON_MAP[icon] || FolderOpen;
  return <IconComp size={size} color={color} style={{ display: "inline-block", ...style }} />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenTree(nodes = []) {
  const result = [];
  function walk(n) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

function getCrumb(nodes = [], targetId) {
  function find(list, path) {
    for (const n of list) {
      const p = [...path, n];
      if (n.category_id === targetId) return p;
      const found = find(n.children || [], p);
      if (found) return found;
    }
    return null;
  }
  return find(nodes, []);
}

const toVarName = (label) =>
  label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/^[^a-z]+/, "") || "";

function Spin() {
  return <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;
}

// ── Tree Row ──────────────────────────────────────────────────────────────────

function ModTreeRow({ node, depth, selected, onSelect, expanded, onToggle }) {
  const isExp = expanded.includes(node.category_id);
  const isSel = selected === node.category_id;
  const hasC  = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(node.category_id)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: `6px 10px 6px ${12 + depth * 16}px`,
          cursor: "pointer", borderRadius: 6, marginBottom: 1,
          background: isSel ? P.mainL : "transparent",
          border: isSel ? `1px solid ${P.mainM}` : "1px solid transparent",
          transition: "all .12s", opacity: node.is_active ? 1 : 0.5,
        }}
        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = P.bg; }}
        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
        <span
          onClick={e => { e.stopPropagation(); if (hasC) onToggle(node.category_id); }}
          style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: P.txt3, cursor: hasC ? "pointer" : "default" }}>
          {hasC ? (isExp ? <ChevronDown size={12}/> : <ChevronRight size={12}/>) : <span style={{ width: 12 }}/>}
        </span>
        <CategoryIcon icon={node.icon} size={14} color={isSel ? P.main : P.txt2} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: isSel ? 600 : 400, color: isSel ? P.main : P.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name_en}
        </span>
        {!node.is_active && <Badge label="OFF" color={P.txt3} bg={P.borderL}/>}
      </div>
      {isExp && node.children?.map(c => (
        <ModTreeRow key={c.category_id} node={c} depth={depth + 1} selected={selected}
          onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function ModSection({ title, icon, subtitle, children }) {
  return (
    <Card style={{ marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${P.borderL}`, display: "flex", alignItems: "center", gap: 9, background: P.bg }}>
        <span style={{ color: P.main, display: "flex" }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: P.txt }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: P.txt3, marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </Card>
  );
}

// ── Formula Output Row ────────────────────────────────────────────────────────
// Each row defines one output_key that the engine registers in the variable
// context after evaluating the formula.  e.g. output_key = "volume_beton"
// is what MATERIAL formula expressions then reference.

function FormulaOutputRow({ output, formulaId, units, categoryId, onDelete }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? output;
  const isDirty = draft !== null;

  const update = useUpdateFormulaOutput(categoryId);

  const save = () => {
    if (!isDirty) return;
    update.mutate({ outputId: output.output_id, data: cur }, {
      onSuccess: () => setDraft(null),
    });
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1.2fr 80px 28px 28px",
      gap: 8, alignItems: "center",
      padding: "8px 12px", background: P.bg, borderRadius: 7,
      border: `1px solid ${P.main}33`, borderLeft: `3px solid ${P.main}`,
    }}>
      {/* output_key */}
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>
          Output key
          <span style={{ marginLeft: 5, color: P.warn, fontFamily: "monospace" }}>
            used in expressions
          </span>
        </div>
        <input
          value={cur.output_key || ""}
          onChange={e => setDraft(d => ({
            ...(d ?? output),
            output_key: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
          }))}
          placeholder="e.g. volume_beton"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.main}55`, color: P.main, fontSize: 12, fontFamily: "monospace", outline: "none", paddingBottom: 2 }}
        />
      </div>
      {/* output_label */}
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Display label</div>
        <input
          value={cur.output_label || ""}
          onChange={e => setDraft(d => ({ ...(d ?? output), output_label: e.target.value }))}
          placeholder="e.g. Volume béton"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, outline: "none", paddingBottom: 2 }}
        />
      </div>
      {/* unit */}
      <select
        value={cur.output_unit_id || ""}
        onChange={e => setDraft(d => ({ ...(d ?? output), output_unit_id: e.target.value }))}
        style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 5, padding: "5px 6px", color: P.txt2, fontSize: 11, outline: "none" }}>
        <option value="">— unit —</option>
        {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
      </select>
      {/* save */}
      {isDirty && (
        <button onClick={save}
          style={{ background: P.mainL, border: `1px solid ${P.mainM}`, borderRadius: 5, cursor: "pointer", color: P.main, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
          {update.isPending ? <Spin/> : <Save size={12}/>}
        </button>
      )}
      {/* delete */}
      <button onClick={onDelete}
        style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
        <X size={12}/>
      </button>
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────────────────────

function FieldRow({ field, formulaId, allFormulas, units, categoryId }) {
  const [draft, setDraft] = useState(null);
  const cur      = draft ?? field;
  const isDirty  = draft !== null;
  const isComputed = !!cur.source_formula_id;

  const updateField = useUpdateField(categoryId);
  const deleteField = useDeleteField(categoryId);

  const patch = (p) => {
    setDraft(d => {
      const next = { ...(d ?? field), ...p };
      if ("label_en" in p && !d?.variable_name_touched) {
        next.variable_name = toVarName(p.label_en);
      }
      if (next.source_formula_id) next.required = false;
      return next;
    });
  };

  const markVarNameTouched = () =>
    setDraft(d => ({ ...(d ?? field), variable_name_touched: true }));

  const save = () => {
    if (!isDirty) return;
    const { variable_name_touched: _, ...payload } = cur;
    updateField.mutate({ fieldId: field.field_id, data: payload }, {
      onSuccess: () => setDraft(null),
    });
  };

  const chainableFormulas = allFormulas.filter(f => f.formula_id !== formulaId);
  const linkedFormula = chainableFormulas.find(f => f.formula_id === cur.source_formula_id);

  return (
    <div style={{
      padding: "10px 12px", background: P.bg, borderRadius: 7,
      border: `1px solid ${isComputed ? P.main + "55" : P.border}`,
      borderLeft: `3px solid ${isComputed ? P.main : P.border}`,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px auto 32px", gap: 8, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 2 }}>Label (EN)</div>
          <input value={cur.label_en} onChange={e => patch({ label_en: e.target.value })}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, outline: "none", paddingBottom: 2 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 2 }}>Label (AR)</div>
          <input value={cur.label_ar || ""} onChange={e => patch({ label_ar: e.target.value })}
            placeholder="الاسم بالعربية"
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, outline: "none", paddingBottom: 2, direction: "rtl" }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 2 }}>Variable name</div>
          <input value={cur.variable_name || ""}
            onChange={e => { markVarNameTouched(); patch({ variable_name: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }); }}
            placeholder="auto from label"
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.main + "55"}`, color: P.main, fontSize: 12, fontFamily: "monospace", outline: "none", paddingBottom: 2 }} />
        </div>
        <select value={cur.unit_id || ""} onChange={e => patch({ unit_id: e.target.value || null })}
          style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 5, padding: "5px 7px", color: P.txt2, fontSize: 11, outline: "none" }}>
          <option value="">— unit —</option>
          {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol} · {u.name_en}</option>)}
        </select>
        {!isComputed
          ? <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={cur.required} onChange={e => patch({ required: e.target.checked })} style={{ accentColor: P.main }} />
              <span style={{ fontSize: 11, color: P.txt3 }}>req</span>
            </label>
          : <span style={{ fontSize: 10, color: P.main, fontWeight: 600, whiteSpace: "nowrap" }}>computed</span>
        }
        <div style={{ display: "flex", gap: 4 }}>
          {isDirty && (
            <button onClick={save}
              style={{ background: P.mainL, border: `1px solid ${P.mainM}`, borderRadius: 5, cursor: "pointer", color: P.main, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
              {updateField.isPending ? <Spin/> : <Save size={12}/>}
            </button>
          )}
          <button onClick={() => deleteField.mutate(field.field_id)}
            style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
            {deleteField.isPending ? <Spin/> : <X size={12}/>}
          </button>
        </div>
      </div>

      {/* source_formula_id row */}
      <div style={{ marginTop: 9, padding: "7px 10px", borderRadius: 6, background: isComputed ? P.mainL : P.surface, border: `1px dashed ${isComputed ? P.main : P.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 120 }}>
          <Sigma size={12} color={isComputed ? P.main : P.txt3}/>
          <span style={{ fontSize: 11, fontWeight: 600, color: isComputed ? P.main : P.txt3, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {isComputed ? "Computed by" : "Link to formula"}
          </span>
        </div>
        <select value={cur.source_formula_id || ""}
          onChange={e => patch({ source_formula_id: e.target.value || null })}
          style={{ flex: "0 0 200px", background: isComputed ? "white" : P.surface, border: `1.5px solid ${isComputed ? P.main : P.border}`, borderRadius: 6, padding: "5px 8px", color: isComputed ? P.main : P.txt3, fontSize: 12, fontWeight: isComputed ? 600 : 400, outline: "none" }}>
          <option value="">— user input —</option>
          {chainableFormulas.map(f => (
            <option key={f.formula_id} value={f.formula_id}>{f.name}</option>
          ))}
        </select>
        {linkedFormula && cur.variable_name && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "monospace", color: P.txt3 }}>
            <span style={{ color: P.warn }}>{linkedFormula.name.toLowerCase().replace(/\s+/g, "_")}</span>
            <span>→ aliased as</span>
            <span style={{ color: P.main }}>{cur.variable_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Formula Card ──────────────────────────────────────────────────────────────

function FormulaCard({ formula, allFormulas, units, categoryId, onDelete }) {
  const [open,      setOpen]      = useState(true);
  const [outputsOpen, setOutputsOpen] = useState(true);
  const [draft,     setDraft]     = useState(null);
  const cur     = draft ?? formula;
  const isDirty = draft !== null;

  const updateFormula       = useUpdateFormula(categoryId);
  const createField         = useCreateField(categoryId);
  const createFormulaOutput = useCreateFormulaOutput(categoryId);
  const deleteFormulaOutput = useDeleteFormulaOutput(categoryId);

  const patch = (p) => setDraft(d => ({ ...(d ?? formula), ...p }));

  const save = () => {
    if (!isDirty) return;
    updateFormula.mutate(
      { formulaId: formula.formula_id, data: { name: cur.name, expression: cur.expression, output_unit_id: cur.output_unit_id } },
      { onSuccess: () => setDraft(null) },
    );
  };

  const addField = () => {
    createField.mutate({
      formulaId: formula.formula_id,
      data: {
        label_en:      "New Field",
        label_ar:      "",
        variable_name: `field_${Date.now().toString(36)}`,
        required:      true,
        sort_order:    (formula.fields?.length ?? 0),
      },
    });
  };

  const addOutput = () => {
    createFormulaOutput.mutate({
      formulaId: formula.formula_id,
      data: {
        output_key:    `output_${Date.now().toString(36)}`,
        output_label:  "New Output",
        output_unit_id: formula.output_unit_id || "",
      },
    });
  };

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 9, overflow: "hidden", marginBottom: 10 }}>

      {/* Formula header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 100px 32px 32px 32px 32px", gap: 8, alignItems: "center", padding: "10px 14px", background: P.bg }}>
        <div>
          <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Formula name</div>
          <input value={cur.name || ""} onChange={e => patch({ name: e.target.value })}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, fontWeight: 500, outline: "none", paddingBottom: 2 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Expression</div>
          <input value={cur.expression || ""} onChange={e => patch({ expression: e.target.value })}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.main + "55"}`, color: P.main, fontSize: 12, fontFamily: "monospace", outline: "none", paddingBottom: 2 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Output unit</div>
          <select value={cur.output_unit_id || ""} onChange={e => patch({ output_unit_id: e.target.value })}
            style={{ width: "100%", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 5, padding: "4px 6px", color: P.txt2, fontSize: 11, outline: "none" }}>
            <option value="">— unit —</option>
            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Badge label={`v${formula.version}`} color={P.txt3} bg={P.borderL}/>
        </div>
        <button onClick={save} disabled={!isDirty}
          style={{ background: isDirty ? P.mainL : "none", border: `1px solid ${isDirty ? P.mainM : P.border}`, borderRadius: 5, cursor: isDirty ? "pointer" : "not-allowed", color: isDirty ? P.main : P.txt3, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, opacity: isDirty ? 1 : 0.4 }}>
          {updateFormula.isPending ? <Spin/> : <Save size={12}/>}
        </button>
        <button onClick={onDelete}
          style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
          <Trash2 size={12}/>
        </button>
        <button onClick={() => setOpen(o => !o)}
          style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.txt3, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
          {open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${P.borderL}` }}>

          {/* ── Output keys sub-section ────────────────────────────────────
              Defines what the engine registers in the variable context
              after evaluating this formula. output_key is what MATERIAL
              formula expressions reference (e.g. "volume_beton").      */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${P.borderL}`, background: `${P.main}06` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Key size={12} color={P.main}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.txt }}>Output keys</span>
                <Badge label={`${formula.outputs?.length ?? 0}`} color={P.main} bg={P.mainL}/>
                <span style={{ fontSize: 11, color: P.txt3 }}>registered in variable context</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(!formula.outputs || formula.outputs.length === 0) && (
                  <span style={{ fontSize: 11, color: P.warn, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={11}/> No output key — engine uses formula name as fallback
                  </span>
                )}
                <Btn variant="outline" icon={<Plus size={11}/>} onClick={addOutput}
                  style={{ fontSize: 11, padding: "4px 10px" }}>
                  {createFormulaOutput.isPending ? "Adding…" : "Add Output"}
                </Btn>
                <button onClick={() => setOutputsOpen(o => !o)}
                  style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.txt3, display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 }}>
                  {outputsOpen ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                </button>
              </div>
            </div>

            {outputsOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(formula.outputs ?? []).map(o => (
                  <FormulaOutputRow
                    key={o.output_id}
                    output={o}
                    formulaId={formula.formula_id}
                    units={units}
                    categoryId={categoryId}
                    onDelete={() => deleteFormulaOutput.mutate(o.output_id)}
                  />
                ))}
                {(!formula.outputs || formula.outputs.length === 0) && (
                  <div style={{ fontSize: 12, color: P.txt3, fontStyle: "italic" }}>
                    Add at least one output key so MATERIAL formulas can reference this result.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Fields sub-section ──────────────────────────────────────── */}
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Hash size={12} color={P.main}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.txt }}>Fields</span>
                <Badge label={`${formula.fields?.length ?? 0}`} color={P.txt3} bg={P.borderL}/>
              </div>
              <Btn variant="outline" icon={<Plus size={11}/>} onClick={addField}
                style={{ fontSize: 11, padding: "4px 10px" }}>
                {createField.isPending ? "Adding…" : "Add Field"}
              </Btn>
            </div>

            {(!formula.fields || formula.fields.length === 0) && (
              <div style={{ fontSize: 12, color: P.txt3, marginBottom: 4 }}>No fields yet.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(formula.fields ?? []).map(f => (
                <FieldRow
                  key={f.field_id}
                  field={f}
                  formulaId={formula.formula_id}
                  allFormulas={allFormulas}
                  units={units}
                  categoryId={categoryId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Config Row ────────────────────────────────────────────────────────────────

function ConfigRow({ config, updateConfig, deleteConfig, showToast }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? config;
  const isDirty = draft !== null;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: P.bg, borderRadius: 7, border: `1px solid ${P.border}` }}>
      <input value={cur.name} onChange={e => setDraft(d => ({ ...(d ?? config), name: e.target.value }))}
        style={{ background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, outline: "none", paddingBottom: 2, flex: 1 }}/>
      <input value={cur.description || ""} onChange={e => setDraft(d => ({ ...(d ?? config), description: e.target.value }))}
        placeholder="Description…"
        style={{ background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt2, fontSize: 12, outline: "none", paddingBottom: 2, flex: 1 }}/>
      {isDirty && (
        <button onClick={() => updateConfig.mutate({ configId: config.config_id, data: cur }, { onSuccess: () => { setDraft(null); showToast("Saved"); } })}
          style={{ background: P.mainL, border: `1px solid ${P.mainM}`, borderRadius: 5, cursor: "pointer", color: P.main, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
          <Save size={12}/>
        </button>
      )}
      <button onClick={() => deleteConfig.mutate(config.config_id, { onSuccess: () => showToast("Config removed") })}
        style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
        <X size={12}/>
      </button>
    </div>
  );
}

// ── Coefficient Row ───────────────────────────────────────────────────────────

function CoeffRow({ coeff, configs, isDuplicate, updateCoefficient, deleteCoefficient, showToast }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? coeff;
  const isDirty = draft !== null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 1fr 28px 28px", gap: 8, alignItems: "center", padding: "10px 12px", background: P.bg, borderRadius: 7, border: `1px solid ${isDuplicate ? "#F87171" : P.border}` }}>
      <div>
        <div style={{ fontSize: 10, color: isDuplicate ? "#EF4444" : P.txt3, marginBottom: 2 }}>Variable name {isDuplicate && "(!)"}</div>
        <input value={cur.name_en} onChange={e => setDraft(d => ({ ...(d ?? coeff), name_en: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }))}
          style={{ width: "100%", background: P.surface, border: `1.5px solid ${isDuplicate ? "#EF4444" : P.main + "55"}`, borderRadius: 5, padding: "5px 8px", color: isDuplicate ? "#EF4444" : P.main, fontSize: 12, fontFamily: "monospace", outline: "none" }}/>
      </div>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Name (AR)</div>
        <input value={cur.name_ar || ""} onChange={e => setDraft(d => ({ ...(d ?? coeff), name_ar: e.target.value }))}
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${P.border}`, color: P.txt, fontSize: 13, outline: "none", paddingBottom: 2, direction: "rtl" }}/>
      </div>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Value</div>
        <input type="number" value={cur.value} onChange={e => setDraft(d => ({ ...(d ?? coeff), value: Number(e.target.value) || 0 }))}
          style={{ width: "100%", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 5, padding: "5px 7px", color: P.txt, fontSize: 12, fontFamily: "monospace", outline: "none" }}/>
      </div>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 2 }}>Config group</div>
        <select value={cur.config_group_id || ""} onChange={e => setDraft(d => ({ ...(d ?? coeff), config_group_id: e.target.value || null }))}
          style={{ width: "100%", background: cur.config_group_id ? P.warnL : P.surface, border: `1px solid ${cur.config_group_id ? P.warn : P.border}`, borderRadius: 5, padding: "5px 7px", color: cur.config_group_id ? P.warn : P.txt3, fontSize: 11, outline: "none" }}>
          <option value="">— global —</option>
          {configs.map(cfg => <option key={cfg.config_id} value={cfg.config_id}>{cfg.name}</option>)}
        </select>
      </div>
      {isDirty && (
        <button onClick={() => updateCoefficient.mutate({ coefficientId: coeff.coefficient_id, data: cur }, { onSuccess: () => { setDraft(null); showToast("Saved"); } })}
          style={{ background: P.mainL, border: `1px solid ${P.mainM}`, borderRadius: 5, cursor: "pointer", color: P.main, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
          <Save size={12}/>
        </button>
      )}
      <button onClick={() => deleteCoefficient.mutate(coeff.coefficient_id, { onSuccess: () => showToast("Removed") })}
        style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
        <X size={12}/>
      </button>
    </div>
  );
}

// ── Add Formula Modal ─────────────────────────────────────────────────────────

function AddFormulaModal({ units, onClose, onSave, isPending }) {
  const [form, setForm] = useState({ name: "", expression: "", output_unit_id: "" });
  const valid = form.name.trim() && form.expression.trim() && form.output_unit_id;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 440, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 4 }}>New Formula</div>
        <div style={{ fontSize: 12, color: P.txt3, marginBottom: 20 }}>
          After creating, add at least one <strong>Output key</strong> so the engine can register the result.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Formula name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Volume Béton"/>
          <div>
            <div style={{ fontSize: 12, color: P.txt2, marginBottom: 5, fontWeight: 500 }}>Expression</div>
            <input value={form.expression} onChange={e => setForm(f => ({ ...f, expression: e.target.value }))}
              placeholder="e.g. L * l * h"
              style={{ width: "100%", background: P.bg, border: `1.5px solid ${P.main}55`, borderRadius: 7, padding: "8px 10px", color: P.main, fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}/>
          </div>
          <Sel label="Output unit" value={form.output_unit_id} onChange={v => setForm(f => ({ ...f, output_unit_id: v }))}
            options={[{ v: "", l: "— select unit —" }, ...units.map(u => ({ v: u.unit_id, l: `${u.symbol} · ${u.name_en}` }))]}/>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => onSave(form)} disabled={!valid || isPending} icon={isPending ? <Spin/> : <Plus size={13}/>}>
            Create Formula
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── New Category Modal ────────────────────────────────────────────────────────

function NewCategoryModal({ newCat, setNewCat, allNodes, onClose, onCreate, isPending }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 420, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 4 }}>New Category</div>
        <div style={{ fontSize: 12, color: P.txt3, marginBottom: 20 }}>
          {newCat.parent_id ? `Under: ${allNodes.find(n => n.category_id === newCat.parent_id)?.name_en ?? "…"}` : "Root level"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Name (EN)" value={newCat.name_en} onChange={v => setNewCat(c => ({ ...c, name_en: v }))} placeholder="e.g. Plumbing"/>
            <Field label="Name (AR)" value={newCat.name_ar} onChange={v => setNewCat(c => ({ ...c, name_ar: v }))} placeholder="السباكة"/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Sel label="Level" value={newCat.category_level} onChange={v => setNewCat(c => ({ ...c, category_level: v }))}
              options={CAT_LEVELS.map(l => ({ v: l, l }))}/>
            <Sel label="Parent" value={newCat.parent_id} onChange={v => setNewCat(c => ({ ...c, parent_id: v }))}
              options={[{ v: "", l: "— Root —" }, ...allNodes.map(n => ({ v: n.category_id, l: n.name_en }))]}/>
          </div>
          <div>
            <div style={{ fontSize: 12, color: P.txt2, marginBottom: 6, fontWeight: 500 }}>Icon</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {ICONS_LIST.map(ic => (
                <button key={ic} onClick={() => setNewCat(c => ({ ...c, icon: ic }))}
                  style={{ width: 34, height: 34, borderRadius: 7, border: `1.5px solid ${newCat.icon === ic ? P.main : P.border}`, background: newCat.icon === ic ? P.mainL : P.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CategoryIcon icon={ic} size={16} color={newCat.icon === ic ? P.main : P.txt3} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={onCreate} disabled={!newCat.name_en.trim() || isPending} icon={isPending ? <Spin/> : <Plus size={13}/>}>
            Create
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Modules() {
  const [selected,  setSelected]  = useState(null);
  const [expanded,  setExpanded]  = useState([]);
  const [showNew,   setShowNew]   = useState(false);
  const [newCat,    setNewCat]    = useState({ name_en: "", name_ar: "", icon: "folder", parent_id: "", category_level: "ROOT" });
  const [toast,     setToast]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const { data: tree  = [], isLoading: treeLoading } = useModulesTree();
  const { data: units = [] }                          = useUnits();

  const allNodes = useMemo(() => flattenTree(tree), [tree]);
  const node     = useMemo(() => allNodes.find(n => n.category_id === selected), [allNodes, selected]);
  const isLeaf   = node && !node.children?.length;
  const crumb    = useMemo(() => getCrumb(tree, selected), [tree, selected]);

  const { data: leafData, isLoading: leafLoading } = useLeafDetails(selected, { enabled: !!selected && !!isLeaf });

  const createCategory    = useCreateCategory();
  const updateCategory    = useUpdateCategory();
  const deleteCategory    = useDeleteCategory();
  const createFormula     = useCreateFormula(selected);
  const deleteFormula     = useDeleteFormula(selected);
  const createConfig      = useCreateConfig(selected);
  const updateConfig      = useUpdateConfig(selected);
  const deleteConfig      = useDeleteConfig(selected);
  const createCoefficient = useCreateCoefficient(selected);
  const updateCoefficient = useUpdateCoefficient(selected);
  const deleteCoefficient = useDeleteCoefficient(selected);

  const toggle = (id) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  const duplicates = useMemo(() => {
    if (!leafData) return [];
    const all = [
      ...(leafData.formulas ?? []).flatMap(f => (f.fields ?? []).map(fd => fd.variable_name)),
      ...(leafData.coefficients ?? []).map(c => c.name_en),
    ].filter(Boolean);
    return all.filter((v, i) => all.indexOf(v) !== i);
  }, [leafData]);

  const handleCreateCategory = () => {
    if (!newCat.name_en.trim()) return;
    createCategory.mutate(
      { ...newCat, parent_id: newCat.parent_id || null },
      {
        onSuccess: () => {
          setShowNew(false);
          setNewCat({ name_en: "", name_ar: "", icon: "folder", parent_id: "", category_level: "ROOT" });
          showToast("Category created");
        },
      },
    );
  };

  const [catDraft, setCatDraft] = useState(null);
  const catData  = catDraft ?? node;
  const catDirty = catDraft !== null;

  const saveCat = () => {
    if (!catDirty || !node) return;
    updateCategory.mutate({ categoryId: node.category_id, data: catDraft }, {
      onSuccess: () => { setCatDraft(null); showToast("Saved"); },
    });
  };

  const handleSelect = (id) => { setSelected(id); setCatDraft(null); };

  const askDelete = (message, onConfirm) => setConfirm({ message, onConfirm });

  const handleDeleteCategory = (id) => {
    const n = allNodes.find(x => x.category_id === id);
    askDelete(`Delete "${n?.name_en}"? This cannot be undone.`, () => {
      deleteCategory.mutate(id, {
        onSuccess: () => { if (selected === id) setSelected(null); showToast("Deleted"); setConfirm(null); },
      });
    });
  };

  const handleDeleteFormula = (formulaId, formulaName) => {
    const fieldCount = leafData?.formulas.find(f => f.formula_id === formulaId)?.fields?.length ?? 0;
    askDelete(
      `Delete formula "${formulaName}"? This will also remove its ${fieldCount} field(s) and all output keys.`,
      () => {
        deleteFormula.mutate(formulaId, {
          onSuccess: () => { showToast("Formula deleted"); setConfirm(null); },
        });
      },
    );
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div style={{ width: 260, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", background: P.surface, flexShrink: 0 }}>
        <div style={{ padding: "12px 12px 10px", borderBottom: `1px solid ${P.border}` }}>
          <div style={{ fontSize: 11, color: P.txt3, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Category Tree</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, color: P.main, background: `${P.main}14`, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{allNodes.length} nodes</span>
            <span style={{ fontSize: 10.5, color: P.warn, background: `${P.warn}14`, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{allNodes.filter(n => !n.children?.length).length} leaves</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {treeLoading
            ? <div style={{ padding: 20, display: "flex", justifyContent: "center" }}><Spin/></div>
            : tree.map(n => (
              <ModTreeRow key={n.category_id} node={n} depth={0} selected={selected}
                onSelect={handleSelect} expanded={expanded} onToggle={toggle} />
            ))
          }
        </div>
        <div style={{ padding: "10px", borderTop: `1px solid ${P.border}` }}>
          <button onClick={() => setShowNew(true)}
            style={{ width: "100%", padding: "8px", borderRadius: 7, border: `1.5px dashed ${P.border}`, background: "transparent", color: P.txt3, cursor: "pointer", fontSize: 13, fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P.main; e.currentTarget.style.color = P.main; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.txt3; }}>
            <Plus size={13}/> Add Category
          </button>
        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px", background: P.bg }}>
        {!node ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 12 }}>
            <FolderTree size={40} color={P.txt3}/>
            <div style={{ fontSize: 16, fontWeight: 600, color: P.txt2 }}>Select a category to edit</div>
            <div style={{ fontSize: 13, color: P.txt3 }}>Pick any node from the sidebar</div>
          </div>
        ) : (
          <div>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
              {crumb?.map((n, i) => (
                <span key={n.category_id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {i > 0 && <ChevronRight size={12} color={P.txt3}/>}
                  <span style={{ fontSize: 12, color: i === crumb.length - 1 ? P.main : P.txt3, fontWeight: i === crumb.length - 1 ? 600 : 400, display: "flex", alignItems: "center", gap: 4 }}>
                    <CategoryIcon icon={n.icon} size={12} /> {n.name_en}
                  </span>
                </span>
              ))}
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: P.mainL, border: `1px solid ${P.mainM}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CategoryIcon icon={node.icon} size={22} color={P.main} />
                </div>
                <div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: P.txt, margin: 0 }}>{node.name_en}</h1>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Badge label={isLeaf ? "LEAF" : "BRANCH"} color={P.main} bg={P.mainL}/>
                    {node.category_level && (() => { const c = CAT_LEVEL_CONF[node.category_level]; return c ? <Badge label={c.label} color={c.color} bg={c.bg}/> : null; })()}
                    <Badge label={node.is_active ? "Active" : "Inactive"} color={node.is_active ? P.success : P.txt3} bg={node.is_active ? P.successL : P.borderL}/>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost"
                  onClick={() => updateCategory.mutate({ categoryId: node.category_id, data: { is_active: !node.is_active } }, { onSuccess: () => showToast("Updated") })}
                  icon={node.is_active ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}>
                  {node.is_active ? "Deactivate" : "Activate"}
                </Btn>
                <Btn variant="ghost" color={P.error} icon={<Trash2 size={14}/>}
                  onClick={() => handleDeleteCategory(node.category_id)}>
                  Delete
                </Btn>
              </div>
            </div>

            {/* Duplicate variable warning */}
            {duplicates.length > 0 && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #F87171", color: "#B91C1C", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Duplicate variable names detected</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <strong style={{ fontFamily: "monospace" }}>{[...new Set(duplicates)].join(", ")}</strong> appear more than once. The engine uses the last-injected value — rename to make them unique.
                  </div>
                </div>
              </div>
            )}

            {/* Category metadata */}
            <ModSection title="Category Metadata" icon={<Layers size={14}/>}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Name (EN)" value={catData?.name_en || node.name_en}
                  onChange={v => setCatDraft(d => ({ ...(d ?? node), name_en: v }))} />
                <Field label="Name (AR)" value={catData?.name_ar || node.name_ar || ""}
                  onChange={v => setCatDraft(d => ({ ...(d ?? node), name_ar: v }))} placeholder="الاسم بالعربية"/>
                <div style={{ gridColumn: "1/-1" }}>
                  <Field label="Description (EN)" value={catData?.description_en || node.description_en || ""}
                    onChange={v => setCatDraft(d => ({ ...(d ?? node), description_en: v }))} placeholder="Brief description…"/>
                </div>
                <Sel label="Category Level" value={catData?.category_level || node.category_level || "ROOT"}
                  onChange={v => setCatDraft(d => ({ ...(d ?? node), category_level: v }))}
                  options={CAT_LEVELS.map(l => ({ v: l, l }))}/>
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 13, color: P.txt2, marginBottom: 6, fontWeight: 500 }}>Icon</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {ICONS_LIST.map(ic => (
                      <button key={ic} onClick={() => setCatDraft(d => ({ ...(d ?? node), icon: ic }))}
                        style={{ width: 34, height: 34, borderRadius: 7, border: `1.5px solid ${(catData?.icon || node.icon) === ic ? P.main : P.border}`, background: (catData?.icon || node.icon) === ic ? P.mainL : P.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CategoryIcon icon={ic} size={16} color={(catData?.icon || node.icon) === ic ? P.main : P.txt3} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {catDirty && (
                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                  <Btn onClick={saveCat} icon={updateCategory.isPending ? <Spin/> : <Save size={13}/>}>Save Changes</Btn>
                </div>
              )}
            </ModSection>

            {/* Sub-categories (branch only) */}
            {!isLeaf && (
              <ModSection title="Sub-categories" icon={<FolderOpen size={14}/>}>
                {node.children?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {node.children.map(c => (
                      <div key={c.category_id} onClick={() => handleSelect(c.category_id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: P.bg, borderRadius: 7, border: `1px solid ${P.border}`, cursor: "pointer", transition: "border-color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = P.main}
                        onMouseLeave={e => e.currentTarget.style.borderColor = P.border}>
                        <CategoryIcon icon={c.icon} size={14} color={P.txt2} />
                        <span style={{ fontSize: 13, color: P.txt, flex: 1, fontWeight: 500 }}>{c.name_en}</span>
                        {c.category_level && (() => { const cl = CAT_LEVEL_CONF[c.category_level]; return cl ? <Badge label={cl.label} color={cl.color} bg={cl.bg}/> : null; })()}
                        <Badge label={!c.children?.length ? "LEAF" : `${c.children.length} children`} color={P.main} bg={P.mainL}/>
                        <ChevronRight size={13} color={P.txt3}/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: P.txt3, marginBottom: 12 }}>No sub-categories yet.</div>
                )}
                <Btn variant="outline" icon={<Plus size={13}/>}
                  onClick={() => { setNewCat(c => ({ ...c, parent_id: node.category_id })); setShowNew(true); }}>
                  Add Sub-category under "{node.name_en}"
                </Btn>
              </ModSection>
            )}

            {/* Formulas (leaf only) */}
            {isLeaf && (
              <ModSection title="Formulas" icon={<FlaskConical size={14}/>}
                subtitle={leafLoading ? "Loading…" : `${leafData?.formulas?.length ?? 0} NON_MATERIAL formulas`}>
                {leafLoading
                  ? <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spin/></div>
                  : (leafData?.formulas ?? []).map(f => (
                    <FormulaCard
                      key={f.formula_id}
                      formula={f}
                      allFormulas={leafData.formulas}
                      units={units}
                      categoryId={selected}
                      onDelete={() => handleDeleteFormula(f.formula_id, f.name)}
                    />
                  ))
                }
                {!leafLoading && (
                  <Btn variant="outline" icon={<Plus size={13}/>} onClick={() => setShowNew("formula")}>
                    Add Formula
                  </Btn>
                )}
              </ModSection>
            )}

            {/* Material Config (leaf only) */}
            {isLeaf && !leafLoading && (
              <ModSection title="Material Config" icon={<Settings2 size={14}/>}
                subtitle={`${leafData?.configs?.length ?? 0} grade variants`}>
                <div style={{ fontSize: 12, color: P.txt3, marginBottom: 10 }}>
                  Configs group coefficients into variants (e.g. Béton C25 vs C30). Leave empty if no variants needed.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                  {(leafData?.configs ?? []).map(c => (
                    <ConfigRow key={c.config_id} config={c}
                      updateConfig={updateConfig} deleteConfig={deleteConfig} showToast={showToast}/>
                  ))}
                </div>
                <Btn variant="outline" icon={<Plus size={13}/>}
                  onClick={() => createConfig.mutate({ name: "New Config", description: "" }, { onSuccess: () => showToast("Config added") })}>
                  Add Config
                </Btn>
              </ModSection>
            )}

            {/* Coefficients (leaf only) */}
            {isLeaf && !leafLoading && (
              <ModSection title="Coefficients" icon={<Sigma size={14}/>}
                subtitle={`${leafData?.coefficients?.length ?? 0} values`}>
                <div style={{ fontSize: 12, color: P.txt3, marginBottom: 10 }}>
                  Injected as variables into MATERIAL formula expressions (e.g. <code style={{ background: P.mainL, padding: "1px 5px", borderRadius: 3, color: P.main }}>ciment_per_m3</code>). Link to a Config to make them grade-specific.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                  {(leafData?.coefficients ?? []).map(c => (
                    <CoeffRow key={c.coefficient_id} coeff={c} configs={leafData?.configs ?? []}
                      isDuplicate={duplicates.includes(c.name_en) && !!c.name_en}
                      updateCoefficient={updateCoefficient} deleteCoefficient={deleteCoefficient} showToast={showToast}/>
                  ))}
                </div>
                <Btn variant="outline" icon={<Plus size={13}/>}
                  onClick={() => createCoefficient.mutate({ name_en: `coeff_${Date.now().toString(36)}`, name_ar: "", value: 0 }, { onSuccess: () => showToast("Coefficient added") })}>
                  Add Coefficient
                </Btn>
              </ModSection>
            )}
          </div>
        )}
      </div>

      {/* Add formula modal */}
      {showNew === "formula" && (
        <AddFormulaModal units={units} onClose={() => setShowNew(false)}
          onSave={(dto) => { createFormula.mutate(dto, { onSuccess: () => { setShowNew(false); showToast("Formula created"); } }); }}
          isPending={createFormula.isPending}/>
      )}

      {/* New category modal */}
      {showNew === true && (
        <NewCategoryModal newCat={newCat} setNewCat={setNewCat} allNodes={allNodes}
          onClose={() => setShowNew(false)} onCreate={handleCreateCategory}
          isPending={createCategory.isPending}/>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <div style={{ width: 380, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: P.txt, marginBottom: 8 }}>Confirm</div>
            <div style={{ fontSize: 13, color: P.txt2, marginBottom: 22, lineHeight: 1.5 }}>{confirm.message}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn color={P.error} onClick={confirm.onConfirm}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, padding: "10px 18px", borderRadius: 8, background: P.successL, border: `1px solid ${P.success}44`, color: P.success, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 7 }}>
          <CheckCircle size={14}/>{toast}
        </div>
      )}
    </div>
  );
}