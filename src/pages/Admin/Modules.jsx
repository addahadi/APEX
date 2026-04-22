import { useState, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Plus, X, FolderOpen, FolderTree,
  FlaskConical, Save, ToggleLeft, ToggleRight, Layers, CheckCircle,
  Settings2, Sigma, Hash, ChevronUp, Loader2, Trash2, AlertTriangle,
  Key, Home, Palette, DoorOpen, Pickaxe, Construction, Box, Landmark,
  Wrench, Droplets, Zap, Layout, Shield, HardHat, Hammer, Paintbrush,
  BrickWall, AppWindow, Package,
} from "lucide-react";
import { P, CAT_LEVEL_CONF } from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, Sel } from "@/components/admin/ui-atoms";
import {
  useModulesTree, useLeafDetails, useUnits,
  useCreateCategory,  useUpdateCategory,  useDeleteCategory,
  useCreateFormula,   useUpdateFormula,   useDeleteFormula,
  useCreateFormulaOutput, useUpdateFormulaOutput, useDeleteFormulaOutput,
  useCreateField,     useUpdateField,     useDeleteField,
  useCreateConfig,    useUpdateConfig,    useDeleteConfig,
  useCreateCoefficient, useUpdateCoefficient, useDeleteCoefficient,
} from "@/hooks/modules.queries";

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP = {
  folder: FolderOpen, home: Home, palette: Palette, door: DoorOpen,
  pickaxe: Pickaxe, construction: Construction, box: Box, landmark: Landmark,
  wrench: Wrench, droplets: Droplets, zap: Zap, layout: Layout,
  shield: Shield, hardhat: HardHat, hammer: Hammer, brush: Paintbrush,
  wall: BrickWall, app: AppWindow,
};
const ICON_KEYS = Object.keys(ICON_MAP);

function CatIcon({ icon, size = 16, color = "inherit" }) {
  const I = ICON_MAP[icon] ?? FolderOpen;
  return <I size={size} color={color} />;
}

const CAT_LEVELS  = ["ROOT", "DOMAIN", "SUB_TYPE"];
const varNameRegex = /^[a-z][a-z0-9_]*$/;

// color tokens for MATERIAL formula type
const MAT_COLOR = "#EA580C";  // P.orange
const MAT_BG    = "#FFF7ED";  // P.orangeL

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenTree(nodes = []) {
  const out = [];
  const walk = (n) => { out.push(n); n.children?.forEach(walk); };
  nodes.forEach(walk);
  return out;
}

function getCrumb(nodes = [], id) {
  const find = (list, path) => {
    for (const n of list) {
      const p = [...path, n];
      if (n.category_id === id) return p;
      const f = find(n.children || [], p);
      if (f) return f;
    }
    return null;
  };
  return find(nodes, []);
}

const toVar = (s) =>
  s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/^[^a-z]+/, "") || "";

function Spin({ size = 14 }) {
  return <Loader2 size={size} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />;
}

function InlineInput({ value, onChange, placeholder, mono, dir, style = {} }) {
  return (
    <input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      style={{
        width: "100%", 
        background: P.surface, 
        border: `1px solid transparent`, 
        borderRadius: 6,
        color: P.txt, 
        fontSize: 13,
        outline: "none", 
        padding: "6px 10px",
        fontFamily: mono ? "monospace" : "inherit",
        direction: dir === "rtl" ? "rtl" : "ltr",
        transition: "border-color 0.2s ease, background 0.2s ease",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.background = P.bg;
        e.target.style.borderColor = P.mainM;
      }}
      onBlur={(e) => {
        e.target.style.background = P.surface;
        e.target.style.borderColor = "transparent";
      }}
    />
  );
}

// Bilingual input pair (EN left, AR right)
function BilingualRow({ labelEN = "Name (EN)", labelAR = "Name (AR)", valueEN, valueAR, onChangeEN, onChangeAR, placeholderEN = "", placeholderAR = "" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: P.bg, padding: 12, borderRadius: 8, border: `1px solid ${P.borderL}` }}>
      <div>
        <div style={{ fontSize: 11, color: P.txt2, marginBottom: 6, fontWeight: 600 }}>{labelEN}</div>
        <InlineInput value={valueEN} onChange={onChangeEN} placeholder={placeholderEN} style={{ border: `1px solid ${P.border}` }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: P.txt2, marginBottom: 6, fontWeight: 600, textAlign: "right" }}>{labelAR}</div>
        <InlineInput value={valueAR} onChange={onChangeAR} placeholder={placeholderAR} dir="rtl" style={{ border: `1px solid ${P.border}` }} />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Sec({ title, icon, subtitle, children, action, accent }) {
  const accentColor = accent ?? P.main;
  return (
    <Card style={{ marginBottom: 20, overflow: "hidden", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", border: `1px solid ${P.border}` }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${P.borderL}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `${accentColor}05`,
        borderLeft: `4px solid ${accentColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 6, borderRadius: 8, background: `${accentColor}15`, color: accentColor, display: "flex" }}>
             {icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: P.txt }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: P.txt3, marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </Card>
  );
}

// ── Tree Row ──────────────────────────────────────────────────────────────────
function TreeRow({ node, depth, selected, onSelect, expanded, onToggle }) {
  const isExp = expanded.includes(node.category_id);
  const isSel = selected === node.category_id;
  const hasC  = !!node.children?.length;

  return (
    <div>
      <div
        onClick={() => onSelect(node.category_id)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `8px 10px 8px ${12 + depth * 18}px`,
          cursor: "pointer", borderRadius: 8, marginBottom: 2,
          background: isSel ? P.mainL : "transparent",
          border: isSel ? `1px solid ${P.main}33` : "1px solid transparent",
          transition: "all .15s ease", opacity: node.is_active ? 1 : 0.6,
        }}
        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = `${P.txt3}11`; }}
        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
        <span
          onClick={e => { e.stopPropagation(); if (hasC) onToggle(node.category_id); }}
          style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: P.txt3, cursor: hasC ? "pointer" : "default", borderRadius: 4, transition: "background 0.2s" }}
          onMouseEnter={e => { if (hasC) e.currentTarget.style.background = `${P.txt3}22`; }}
          onMouseLeave={e => { if (hasC) e.currentTarget.style.background = "transparent"; }}
        >
          {hasC ? (isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
        </span>
        <CatIcon icon={node.icon} size={14} color={isSel ? P.main : P.txt2} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: isSel ? 600 : 400, color: isSel ? P.main : P.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name_en}
        </span>
        {!node.is_active && <Badge label="OFF" color={P.txt3} bg={P.borderL} />}
      </div>
      {isExp && node.children?.map(c => (
        <TreeRow key={c.category_id} node={c} depth={depth + 1} selected={selected}
          onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────
function FieldRow({ field, formulaId, allNonMaterialFormulas, units, categoryId }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? field;
  const isDirty = draft !== null;
  const isComp  = !!cur.source_formula_id;

  const upd = useUpdateField(categoryId);
  const del = useDeleteField(categoryId);

  const patch = (p) => setDraft(d => {
    const next = { ...(d ?? field), ...p };
    if ("label_en" in p && !d?.vTouched) next.variable_name = toVar(p.label_en);
    if (next.source_formula_id) next.required = false;
    return next;
  });

  const chainable  = allNonMaterialFormulas.filter(f => f.formula_id !== formulaId);
  const linked     = chainable.find(f => f.formula_id === cur.source_formula_id);
  const isInvalid  = cur.variable_name && !varNameRegex.test(cur.variable_name);

  return (
    <div style={{
      padding: "14px", background: P.bg, borderRadius: 10,
      border: `1px solid ${isComp ? P.main + "44" : P.border}`,
      borderLeft: `4px solid ${isComp ? P.main : P.border}`,
      transition: "border-color .15s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 100px auto 60px", gap: 12, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Label (EN)</div>
          <InlineInput value={cur.label_en} onChange={v => patch({ label_en: v })} placeholder="Length…" style={{ border: `1px solid ${P.border}` }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Label (AR)</div>
          <InlineInput value={cur.label_ar} onChange={v => patch({ label_ar: v })} placeholder="الطول…" dir="rtl" style={{ border: `1px solid ${P.border}` }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: isInvalid ? P.error : P.txt3, marginBottom: 4, fontWeight: 500 }}>
            Variable {isInvalid && <span style={{ color: P.error }}>(invalid)</span>}
          </div>
          <InlineInput
            mono
            value={cur.variable_name || ""}
            onChange={v => { setDraft(d => ({ ...(d ?? field), variable_name: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""), vTouched: true })); }}
            style={{ border: `1px solid ${isInvalid ? P.error : P.main + "55"}`, color: isInvalid ? P.error : P.main }}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Unit</div>
          <select value={cur.unit_id || ""} onChange={e => patch({ unit_id: e.target.value || null })}
            style={{ width: "100%", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: "6px 8px", color: P.txt2, fontSize: 12, outline: "none" }}>
            <option value="">— none —</option>
            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
          </select>
        </div>
        <div style={{ height: 30, display: "flex", alignItems: "center" }}>
          {isComp
            ? <span style={{ fontSize: 11, color: P.main, fontWeight: 600, whiteSpace: "nowrap", padding: "0 4px" }}>Computed</span>
            : <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={!!cur.required} onChange={e => patch({ required: e.target.checked })} style={{ accentColor: P.main, width: 14, height: 14 }} />
                <span style={{ fontSize: 12, color: P.txt3 }}>Required</span>
              </label>
          }
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", height: 30, alignItems: "center" }}>
          {isDirty && (
            <button
              onClick={() => { const { vTouched: _, ...pl } = cur; upd.mutate({ fieldId: field.field_id, data: pl }, { onSuccess: () => setDraft(null) }); }}
              title="Save Changes"
              style={{ background: P.main, border: `none`, borderRadius: 6, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, transition: "background 0.15s" }}>
              {upd.isPending ? <Spin size={12} /> : <Save size={12} />}
            </button>
          )}
          <button onClick={() => del.mutate(field.field_id)} title="Remove Field"
            style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={e => e.currentTarget.style.background = P.surface}>
            {del.isPending ? <Spin size={12} /> : <X size={12} />}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: isComp ? P.mainL : P.surface, border: `1px dashed ${isComp ? P.main + "88" : P.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: isComp ? "white" : P.bg, padding: "4px 8px", borderRadius: 6, border: `1px solid ${isComp ? P.main + "44" : P.border}` }}>
          <Sigma size={12} color={isComp ? P.main : P.txt3} />
          <span style={{ fontSize: 11, fontWeight: 600, color: isComp ? P.main : P.txt3, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {isComp ? "Computed via" : "Source Formula"}
          </span>
        </div>
        <select value={cur.source_formula_id || ""}
          onChange={e => patch({ source_formula_id: e.target.value || null })}
          style={{ flex: "0 0 220px", background: isComp ? "white" : P.surface, border: `1.5px solid ${isComp ? P.main : P.border}`, borderRadius: 6, padding: "6px 8px", color: isComp ? P.txt : P.txt3, fontSize: 12, fontWeight: isComp ? 500 : 400, outline: "none", transition: "all 0.2s" }}>
          <option value="">— Requires User Input —</option>
          {chainable.map(f => <option key={f.formula_id} value={f.formula_id}>{f.name_en}</option>)}
        </select>
        {linked && cur.variable_name && (
          <span style={{ fontSize: 12, color: P.txt3 }}>
            Provides value for <code style={{ color: P.main, background: P.mainL, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{cur.variable_name}</code>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Output row ────────────────────────────────────────────────────────────────
function OutputRow({ output, units, categoryId, onDelete }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? output;
  const isDirty = draft !== null;
  const upd     = useUpdateFormulaOutput(categoryId);

  const set = (p) => setDraft(d => ({ ...(d ?? output), ...p }));

  return (
    <div style={{
      padding: "14px", background: P.surface, borderRadius: 8,
      border: `1px solid ${P.main}33`, borderLeft: `4px solid ${P.main}`,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 100px auto", gap: 12, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 10, color: P.main, fontFamily: "monospace", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Output Key
          </div>
          <InlineInput 
            mono
            value={cur.output_key || ""}
            onChange={v => set({ output_key: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") })}
            style={{ border: `1.5px solid ${P.main}66`, color: P.main, background: "white" }} 
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Label (EN)</div>
          <InlineInput value={cur.output_label_en} onChange={v => set({ output_label_en: v })} placeholder="e.g. Concrete Volume" style={{ border: `1px solid ${P.border}` }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Label (AR)</div>
          <InlineInput value={cur.output_label_ar} onChange={v => set({ output_label_ar: v })} placeholder="حجم الخرسانة" dir="rtl" style={{ border: `1px solid ${P.border}` }} />
        </div>
        <div>
           <div style={{ fontSize: 11, color: P.txt3, marginBottom: 4, fontWeight: 500 }}>Unit</div>
           <select value={cur.output_unit_id || ""} onChange={e => set({ output_unit_id: e.target.value || null })}
            style={{ width: "100%", background: "white", border: `1px solid ${P.border}`, borderRadius: 6, padding: "6px 8px", color: P.txt2, fontSize: 12, outline: "none" }}>
            <option value="">— none —</option>
            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", height: 30, alignItems: "center" }}>
          {isDirty && (
            <button onClick={() => upd.mutate({ outputId: output.output_id, data: cur }, { onSuccess: () => setDraft(null) })}
              style={{ background: P.main, border: `none`, borderRadius: 6, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
              {upd.isPending ? <Spin size={12} /> : <Save size={12} />}
            </button>
          )}
          <button onClick={onDelete}
            style={{ background: "white", border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NON_MATERIAL Formula card ─────────────────────────────────────────────────
function FormulaCard({ formula, allNonMaterialFormulas, units, categoryId, onDelete }) {
  const [open,  setOpen]  = useState(true);
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? formula;
  const isDirty = draft !== null;

  const upd       = useUpdateFormula(categoryId);
  const addField  = useCreateField(categoryId);
  const addOutput = useCreateFormulaOutput(categoryId);
  const delOutput = useDeleteFormulaOutput(categoryId);

  const save = () => upd.mutate(
    { formulaId: formula.formula_id, data: { name_en: cur.name_en, name_ar: cur.name_ar, expression: cur.expression, output_unit_id: cur.output_unit_id || null } },
    { onSuccess: () => setDraft(null) }
  );

  const hasOutputs = (formula.outputs ?? []).length > 0;

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", background: "white" }}>
      <div style={{ padding: "16px 20px", background: `${P.main}04`, borderBottom: open ? `1px solid ${P.borderL}` : "none", transition: "background 0.2s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Name (EN)</div>
            <InlineInput value={cur.name_en || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_en: v }))} style={{ fontSize: 14, fontWeight: 600, border: `1px solid ${P.border}` }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Name (AR)</div>
            <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_ar: v }))} placeholder="اسم الصيغة…" style={{ fontSize: 14, border: `1px solid ${P.border}` }} />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto auto auto auto", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Expression</div>
            <InlineInput mono value={cur.expression || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), expression: v }))} placeholder="e.g. L * l * h" style={{ border: `1.5px solid ${P.main}55`, color: P.main, background: "white" }} />
          </div>
          <div>
             <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Unit</div>
            <select value={cur.output_unit_id || ""} onChange={e => setDraft(d => ({ ...(d ?? formula), output_unit_id: e.target.value || null }))}
              style={{ width: "100%", background: "white", border: `1px solid ${P.border}`, borderRadius: 6, padding: "7px 8px", color: P.txt2, fontSize: 12, outline: "none" }}>
              <option value="">— unit —</option>
              {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
            </select>
          </div>
          <div style={{ height: 32, display: "flex", alignItems: "center" }}>
            <Badge label={`v${formula.version}`} color={P.txt3} bg={P.borderL} />
          </div>
          <button onClick={save} disabled={!isDirty} title="Save"
            style={{ background: isDirty ? P.main : P.surface, border: `1px solid ${isDirty ? P.main : P.border}`, borderRadius: 6, cursor: isDirty ? "pointer" : "not-allowed", color: isDirty ? "white" : P.txt3, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, transition: "all 0.2s" }}>
            {upd.isPending ? <Spin size={14} /> : <Save size={14} />}
          </button>
          <button onClick={onDelete} title="Delete formula"
            style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={e => e.currentTarget.style.background = P.surface}>
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen(o => !o)} title={open ? "Collapse" : "Expand"}
            style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.txt2, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: P.bg }}>
          {/* Output keys */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.borderL}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: 4, background: P.mainL, borderRadius: 6 }}><Key size={14} color={P.main} /></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.txt }}>Output Keys</span>
                <Badge label={`${formula.outputs?.length ?? 0}`} color={P.main} bg={P.mainL} />
                {!hasOutputs && (
                  <span style={{ fontSize: 12, color: P.warn, display: "flex", alignItems: "center", gap: 4, marginLeft: 8, background: P.warnL, padding: "2px 8px", borderRadius: 4 }}>
                    <AlertTriangle size={12} /> Add an output to reference this formula's result
                  </span>
                )}
              </div>
              <Btn variant="outline" icon={addOutput.isPending ? <Spin size={12} /> : <Plus size={12} />}
                style={{ fontSize: 12, padding: "6px 12px" }}
                onClick={() => addOutput.mutate({
                  formulaId: formula.formula_id,
                  data: { output_key: `out_${Date.now().toString(36)}`, output_label_en: "New Output", output_label_ar: "", output_unit_id: cur.output_unit_id || null },
                })}>
                Add Output
              </Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(formula.outputs ?? []).map(o => (
                <OutputRow key={o.output_id} output={o} units={units} categoryId={categoryId}
                  onDelete={() => delOutput.mutate(o.output_id)} />
              ))}
              {!hasOutputs && <div style={{ fontSize: 13, color: P.txt3, fontStyle: "italic", padding: "10px 0" }}>No output keys defined.</div>}
            </div>
          </div>

          {/* Input fields */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: 4, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6 }}><Hash size={14} color={P.txt2} /></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.txt }}>Input Fields</span>
                <Badge label={`${formula.fields?.length ?? 0}`} color={P.txt3} bg={P.borderL} />
              </div>
              <Btn variant="outline" icon={addField.isPending ? <Spin size={12} /> : <Plus size={12} />}
                style={{ fontSize: 12, padding: "6px 12px" }}
                onClick={() => addField.mutate({
                  formulaId: formula.formula_id,
                  data: { label_en: "New Field", label_ar: "", variable_name: `field_${Date.now().toString(36)}`, required: true, sort_order: formula.fields?.length ?? 0 },
                })}>
                Add Field
              </Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(formula.fields ?? []).map(f => (
                <FieldRow key={f.field_id} field={f} formulaId={formula.formula_id}
                  allNonMaterialFormulas={allNonMaterialFormulas} units={units} categoryId={categoryId} />
              ))}
              {(!formula.fields || formula.fields.length === 0) && (
                <div style={{ fontSize: 13, color: P.txt3, fontStyle: "italic", padding: "10px 0" }}>No input fields defined.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MATERIAL Formula card ─────────────────────────────────────────────────────
function MaterialFormulaCard({ formula, units, categoryId, onDelete }) {
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? formula;
  const isDirty = draft !== null;
  const upd     = useUpdateFormula(categoryId);

  const save = () => upd.mutate(
    { formulaId: formula.formula_id, data: { name_en: cur.name_en, name_ar: cur.name_ar, expression: cur.expression, output_unit_id: cur.output_unit_id || null } },
    { onSuccess: () => setDraft(null) }
  );

  return (
    <div style={{ border: `1px solid ${MAT_COLOR}33`, borderRadius: 12, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 8px rgba(234,88,12,.04)", background: "white" }}>
      <div style={{ padding: "16px 20px", background: `${MAT_COLOR}05` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Name (EN)</div>
            <InlineInput value={cur.name_en || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_en: v }))} style={{ fontSize: 14, fontWeight: 600, border: `1px solid ${P.border}` }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Name (AR)</div>
            <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_ar: v }))} placeholder="اسم الصيغة…" style={{ fontSize: 14, border: `1px solid ${P.border}` }} />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto auto auto", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Quantity Expression</div>
            <InlineInput mono value={cur.expression || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), expression: v }))} placeholder="e.g. volume_beton * ciment_per_m3" style={{ border: `1.5px solid ${MAT_COLOR}55`, color: MAT_COLOR, background: "white" }} />
          </div>
          <div>
             <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Unit</div>
            <select value={cur.output_unit_id || ""} onChange={e => setDraft(d => ({ ...(d ?? formula), output_unit_id: e.target.value || null }))}
              style={{ width: "100%", background: "white", border: `1px solid ${P.border}`, borderRadius: 6, padding: "7px 8px", color: P.txt2, fontSize: 12, outline: "none" }}>
              <option value="">— unit —</option>
              {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.symbol}</option>)}
            </select>
          </div>
          <div style={{ height: 32, display: "flex", alignItems: "center" }}>
            <Badge label={`v${formula.version}`} color={P.txt3} bg={P.borderL} />
          </div>
          <button onClick={save} disabled={!isDirty} title="Save"
            style={{ background: isDirty ? MAT_COLOR : "white", border: `1px solid ${isDirty ? MAT_COLOR : P.border}`, borderRadius: 6, cursor: isDirty ? "pointer" : "not-allowed", color: isDirty ? "white" : P.txt3, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, transition: "all 0.2s" }}>
            {upd.isPending ? <Spin size={14} /> : <Save size={14} />}
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ background: "white", border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <Trash2 size={14} />
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: MAT_COLOR, padding: "8px 12px", background: MAT_BG, borderRadius: 6, border: `1px solid ${MAT_COLOR}33` }}>
          <strong>Note:</strong> Uses variables from NON_MATERIAL outputs + coefficients. Linked to a material row in the resource catalog.
        </div>
      </div>
    </div>
  );
}

// ── Config row ────────────────────────────────────────────────────────────────
function ConfigRow({ config, updateConfig, deleteConfig }) {
  const [draft, setDraft] = useState(null);
  const cur = draft ?? config;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: "white", borderRadius: 8, border: `1px solid ${P.border}` }}>
      <InlineInput value={cur.name} onChange={v => setDraft(d => ({ ...(d ?? config), name: v }))} placeholder="Config name…" style={{ flex: 1, border: `1px solid ${P.border}` }} />
      <InlineInput value={cur.description || ""} onChange={v => setDraft(d => ({ ...(d ?? config), description: v }))} placeholder="Description…" style={{ flex: 1.5, border: `1px solid ${P.border}` }} />
      {draft !== null && (
        <button onClick={() => updateConfig.mutate({ configId: config.config_id, data: cur }, { onSuccess: () => setDraft(null) })}
          style={{ background: P.main, border: `none`, borderRadius: 6, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
          <Save size={14} />
        </button>
      )}
      <button onClick={() => deleteConfig.mutate(config.config_id)}
        style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── Coefficient row ───────────────────────────────────────────────────────────
function CoeffRow({ coeff, configs, updateCoefficient, deleteCoefficient }) {
  const [draft, setDraft] = useState(null);
  const cur = draft ?? coeff;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px 150px auto", gap: 10, alignItems: "end", padding: "14px", background: "white", borderRadius: 8, border: `1px solid ${P.border}` }}>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Variable</div>
        <InlineInput mono value={cur.name_en || ""} onChange={v => setDraft(d => ({ ...(d ?? coeff), name_en: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }))} style={{ border: `1.5px solid ${P.main + "55"}`, color: P.main, background: P.surface }} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Name (AR)</div>
        <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? coeff), name_ar: v }))} placeholder="الاسم بالعربية" style={{ border: `1px solid ${P.border}` }} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Value</div>
        <input type="number" value={cur.value} onChange={e => setDraft(d => ({ ...(d ?? coeff), value: Number(e.target.value) || 0 }))}
          style={{ width: "100%", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: "7px 10px", color: P.txt, fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
      </div>
      <div>
         <div style={{ fontSize: 10, color: P.txt3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Linked Config</div>
        <select value={cur.config_group_id || ""} onChange={e => setDraft(d => ({ ...(d ?? coeff), config_group_id: e.target.value || null }))}
          style={{ width: "100%", background: cur.config_group_id ? P.warnL : P.surface, border: `1px solid ${cur.config_group_id ? P.warn : P.border}`, borderRadius: 6, padding: "7px 8px", color: cur.config_group_id ? P.warn : P.txt3, fontSize: 12, outline: "none", boxSizing: "border-box" }}>
          <option value="">— global —</option>
          {configs.map(c => <option key={c.config_id} value={c.config_id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 4, height: 32 }}>
        {draft !== null && (
          <button onClick={() => updateCoefficient.mutate({ coefficientId: coeff.coefficient_id, data: cur }, { onSuccess: () => setDraft(null) })}
            style={{ background: P.main, border: `none`, borderRadius: 6, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
            <Save size={14} />
          </button>
        )}
        <button onClick={() => deleteCoefficient.mutate(coeff.coefficient_id)}
          style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", color: P.error, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function NewCatModal({ parentId, allNodes, onClose, onCreate, isPending }) {
  const [form, setForm] = useState({
    name_en: "", name_ar: "", description_en: "", description_ar: "",
    icon: "folder", category_level: "ROOT", parent_id: parentId || "",
  });
  const valid = form.name_en.trim();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <Card style={{ width: 500, padding: 32, borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.14)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: P.txt, marginBottom: 6 }}>New Category</div>
        <div style={{ fontSize: 13, color: P.txt3, marginBottom: 24 }}>
          {form.parent_id ? `Under: ${allNodes.find(n => n.category_id === form.parent_id)?.name_en ?? "…"}` : "Root level"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <BilingualRow valueEN={form.name_en} onChangeEN={v => setForm(f => ({ ...f, name_en: v }))} placeholderEN="e.g. Concrete Work" valueAR={form.name_ar} onChangeAR={v => setForm(f => ({ ...f, name_ar: v }))} placeholderAR="أعمال الخرسانة" />
          <BilingualRow labelEN="Description (EN)" labelAR="Description (AR)" valueEN={form.description_en} onChangeEN={v => setForm(f => ({ ...f, description_en: v }))} placeholderEN="Brief English description…" valueAR={form.description_ar} onChangeAR={v => setForm(f => ({ ...f, description_ar: v }))} placeholderAR="وصف مختصر…" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Sel label="Level" value={form.category_level} onChange={v => setForm(f => ({ ...f, category_level: v }))} options={CAT_LEVELS.map(l => ({ v: l, l }))} />
            <Sel label="Parent" value={form.parent_id} onChange={v => setForm(f => ({ ...f, parent_id: v }))} options={[{ v: "", l: "— Root —" }, ...allNodes.map(n => ({ v: n.category_id, l: n.name_en }))]} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: P.txt2, fontWeight: 600, marginBottom: 8 }}>Icon</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICON_KEYS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${form.icon === ic ? P.main : P.border}`, background: form.icon === ic ? P.mainL : P.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  <CatIcon icon={ic} size={16} color={form.icon === ic ? P.main : P.txt3} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={isPending ? <Spin size={14} /> : <Plus size={14} />} disabled={!valid || isPending} onClick={() => onCreate({ ...form, parent_id: form.parent_id || null, description_en: form.description_en || null, description_ar: form.description_ar || null })}>Create Category</Btn>
        </div>
      </Card>
    </div>
  );
}

function NewFormulaModal({ units, onClose, onSave, isPending }) {
  const [form, setForm] = useState({ name_en: "", name_ar: "", expression: "", output_unit_id: "", formula_type: "NON_MATERIAL" });
  const isMat = form.formula_type === "MATERIAL";
  const valid = form.name_en.trim() && form.expression.trim();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <Card style={{ width: 540, padding: 32, borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.14)" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderRadius: 10, overflow: "hidden", border: `1px solid ${P.border}` }}>
          {[{ t: "NON_MATERIAL", label: "NON_MATERIAL", hint: "Geometry formula — defines shape inputs & results", color: P.main, bg: P.mainL }, { t: "MATERIAL", label: "MATERIAL", hint: "Quantity formula — computes resource needs", color: MAT_COLOR, bg: MAT_BG }].map(({ t, label, hint, color, bg }) => (
            <button key={t} onClick={() => setForm(f => ({ ...f, formula_type: t }))} style={{ flex: 1, padding: "14px 16px", cursor: "pointer", background: form.formula_type === t ? bg : P.surface, border: "none", borderRight: t === "NON_MATERIAL" ? `1px solid ${P.border}` : "none", transition: "all .15s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: form.formula_type === t ? color : P.txt3, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 11, color: P.txt3, lineHeight: 1.5 }}>{hint}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: P.txt, marginBottom: 24 }}>New {isMat ? "Material" : "Geometry"} Formula</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <BilingualRow valueEN={form.name_en} onChangeEN={v => setForm(f => ({ ...f, name_en: v }))} placeholderEN={isMat ? "e.g. Cement Quantity" : "e.g. Volume Béton"} valueAR={form.name_ar} onChangeAR={v => setForm(f => ({ ...f, name_ar: v }))} placeholderAR={isMat ? "كمية الأسمنت" : "حجم الخرسانة"} />
          <div>
            <div style={{ fontSize: 12, color: P.txt2, fontWeight: 600, marginBottom: 8 }}>{isMat ? "Quantity Expression" : "Expression"}</div>
            <input value={form.expression} onChange={e => setForm(f => ({ ...f, expression: e.target.value }))} placeholder={isMat ? "e.g. volume_beton * ciment_per_m3" : "e.g. L * l * h"} style={{ width: "100%", background: P.bg, border: `1.5px solid ${isMat ? MAT_COLOR : P.main}55`, borderRadius: 8, padding: "10px 12px", color: isMat ? MAT_COLOR : P.main, fontSize: 14, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <Sel label="Output unit (optional)" value={form.output_unit_id || ""} onChange={v => setForm(f => ({ ...f, output_unit_id: v || null }))} options={[{ v: "", l: "— none —" }, ...units.map(u => ({ v: u.unit_id, l: `${u.symbol} · ${u.name_en}` }))]} />
          {!isMat && <div style={{ fontSize: 12, color: P.txt, padding: "10px 14px", background: P.mainL, borderRadius: 8, lineHeight: 1.6, border: `1px solid ${P.main}33` }}>After creating, add <strong>Output keys</strong> so MATERIAL formulas can reference this formula's computed values.</div>}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={isPending ? <Spin size={14} /> : <Plus size={14} />} disabled={!valid || isPending} onClick={() => onSave({ ...form, output_unit_id: form.output_unit_id || null })}>Create Formula</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Modules() {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [modal,    setModal]    = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [toast,    setToast]    = useState(null);
  const [catDraft, setCatDraft] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const { data: tree  = [], isLoading: treeLoading } = useModulesTree();
  const { data: units = []                          } = useUnits();

  const allNodes = useMemo(() => flattenTree(tree), [tree]);
  const node     = useMemo(() => allNodes.find(n => n.category_id === selected), [allNodes, selected]);
  const isLeaf   = node && !node.children?.length;
  const crumb    = useMemo(() => getCrumb(tree, selected), [tree, selected]);
  const catData  = catDraft ?? node;
  const catDirty = catDraft !== null;

  const { data: leaf, isLoading: leafLoading } = useLeafDetails(
    selected, { enabled: !!selected && !!isLeaf }
  );

  const createCat  = useCreateCategory();
  const updateCat  = useUpdateCategory();
  const deleteCat  = useDeleteCategory();
  const createFml  = useCreateFormula(selected);
  const deleteFml  = useDeleteFormula(selected);
  const createCfg  = useCreateConfig(selected);
  const updateCfg  = useUpdateConfig(selected);
  const deleteCfg  = useDeleteConfig(selected);
  const createCoef = useCreateCoefficient(selected);
  const updateCoef = useUpdateCoefficient(selected);
  const deleteCoef = useDeleteCoefficient(selected);

  const toggle      = (id) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
  const handleSelect = (id) => { setSelected(id); setCatDraft(null); };

  const doCreateCat = (dto) => createCat.mutate(dto, { onSuccess: () => { setModal(null); showToast("Category created"); } });
  const saveCat = () => { if (!catDirty || !node) return; updateCat.mutate({ categoryId: node.category_id, data: catDraft }, { onSuccess: () => { setCatDraft(null); showToast("Saved"); } }); };
  const askDeleteCat = () => setConfirm({ message: `Delete "${node?.name_en}"? Sub-categories or formulas inside will block this.`, onConfirm: () => deleteCat.mutate(node.category_id, { onSuccess: () => { setSelected(null); setConfirm(null); showToast("Deleted"); }, onError: (e) => { setConfirm(null); showToast(e.message || "Cannot delete"); } }) });
  const askDeleteFormula = (f) => setConfirm({ message: `Delete "${f.name_en}"? Its ${f.fields?.length ?? 0} field(s) and output keys will also be removed.`, onConfirm: () => deleteFml.mutate(f.formula_id, { onSuccess: () => { setConfirm(null); showToast("Formula deleted"); } }) });

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", background: P.bg }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div style={{ width: 280, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", background: "white", flexShrink: 0, boxShadow: "2px 0 8px rgba(0,0,0,0.02)", zIndex: 5 }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${P.borderL}` }}>
          <div style={{ fontSize: 11, color: P.txt3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Category Tree</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: P.main, background: `${P.main}14`, padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>{allNodes.length} nodes</span>
            <span style={{ fontSize: 11, color: MAT_COLOR, background: `${MAT_COLOR}14`, padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>{allNodes.filter(n => !n.children?.length).length} leaves</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {treeLoading ? <div style={{ padding: 20, display: "flex", justifyContent: "center" }}><Spin /></div> : tree.map(n => <TreeRow key={n.category_id} node={n} depth={0} selected={selected} onSelect={handleSelect} expanded={expanded} onToggle={toggle} />)}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${P.borderL}`, background: P.surface }}>
          <button onClick={() => setModal("cat")} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1.5px dashed ${P.border}`, background: "white", color: P.txt2, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = P.main; e.currentTarget.style.color = P.main; }} onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.txt2; }}><Plus size={14} /> Add Root Category</button>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {!node ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "white", border: `1px solid ${P.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}><FolderTree size={36} color={P.main} /></div>
            <div style={{ fontSize: 18, fontWeight: 600, color: P.txt }}>Select a category to view details</div>
            <div style={{ fontSize: 14, color: P.txt3 }}>Navigate using the sidebar tree to configure formulas and materials.</div>
          </div>
        ) : (
          <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 60 }}>
            {/* Sticky Header */}
            <div style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)", background: "rgba(248, 250, 252, 0.85)", padding: "24px 32px 16px", borderBottom: `1px solid ${P.borderL}`, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {crumb?.map((n, i) => (
                  <span key={n.category_id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && <ChevronRight size={14} color={P.txt3} />}
                    <span onClick={() => handleSelect(n.category_id)} style={{ fontSize: 13, color: i === crumb.length - 1 ? P.main : P.txt3, fontWeight: i === crumb.length - 1 ? 600 : 500, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "2px 6px", borderRadius: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = P.surface} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <CatIcon icon={n.icon} size={12} /> {n.name_en}
                    </span>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: P.mainL, border: `1px solid ${P.mainM}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <CatIcon icon={node.icon} size={28} color={P.main} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: P.txt, margin: 0, lineHeight: 1.2 }}>{node.name_en}</h1>
                    {node.name_ar && <div style={{ fontSize: 14, color: P.txt3, direction: "rtl", marginTop: 4 }}>{node.name_ar}</div>}
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <Badge label={isLeaf ? "LEAF" : "BRANCH"} color={P.main} bg={P.mainL} />
                      {node.category_level && (() => { const c = CAT_LEVEL_CONF[node.category_level]; return c ? <Badge label={c.label} color={c.color} bg={c.bg} /> : null; })()}
                      <Badge label={node.is_active ? "Active" : "Inactive"} color={node.is_active ? P.success : P.txt3} bg={node.is_active ? P.successL : P.borderL} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <Btn variant="outline" icon={node.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} onClick={() => updateCat.mutate({ categoryId: node.category_id, data: { is_active: !node.is_active } }, { onSuccess: () => showToast("Updated") })}>
                    {node.is_active ? "Deactivate" : "Activate"}
                  </Btn>
                  <Btn variant="outline" color={P.error} icon={<Trash2 size={16} />} onClick={askDeleteCat}>Delete</Btn>
                </div>
              </div>
            </div>

            <div style={{ padding: "0 32px" }}>
              <Sec title="Category Metadata" icon={<Layers size={16} />}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <BilingualRow valueEN={catData?.name_en || node.name_en} onChangeEN={v => setCatDraft(d => ({ ...(d ?? node), name_en: v }))} placeholderEN="Name in English" valueAR={catData?.name_ar || node.name_ar || ""} onChangeAR={v => setCatDraft(d => ({ ...(d ?? node), name_ar: v }))} placeholderAR="الاسم بالعربية" />
                  <BilingualRow labelEN="Description (EN)" labelAR="Description (AR)" valueEN={catData?.description_en || node.description_en || ""} onChangeEN={v => setCatDraft(d => ({ ...(d ?? node), description_en: v }))} placeholderEN="Brief English description…" valueAR={catData?.description_ar || node.description_ar || ""} onChangeAR={v => setCatDraft(d => ({ ...(d ?? node), description_ar: v }))} placeholderAR="وصف مختصر بالعربية…" />
                  <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start", background: P.surface, padding: 16, borderRadius: 8, border: `1px solid ${P.border}` }}>
                    <Sel label="Hierarchy Level" value={catData?.category_level || node.category_level || "ROOT"} onChange={v => setCatDraft(d => ({ ...(d ?? node), category_level: v }))} options={CAT_LEVELS.map(l => ({ v: l, l }))} />
                    <div>
                      <div style={{ fontSize: 12, color: P.txt2, fontWeight: 600, marginBottom: 8 }}>Interface Icon</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ICON_KEYS.map(ic => (
                          <button key={ic} onClick={() => setCatDraft(d => ({ ...(d ?? node), icon: ic }))} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${(catData?.icon || node.icon) === ic ? P.main : P.border}`, background: (catData?.icon || node.icon) === ic ? P.mainL : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                            <CatIcon icon={ic} size={16} color={(catData?.icon || node.icon) === ic ? P.main : P.txt3} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {catDirty && (
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: `1px solid ${P.borderL}` }}>
                    <Btn onClick={saveCat} icon={updateCat.isPending ? <Spin size={14} /> : <Save size={14} />}>Save Metadata Changes</Btn>
                  </div>
                )}
              </Sec>

              {!isLeaf && (
                <Sec title="Sub-categories" icon={<FolderOpen size={16} />} subtitle={`${node.children?.length ?? 0} children organized under this node`} action={<Btn variant="outline" icon={<Plus size={14} />} style={{ padding: "6px 12px" }} onClick={() => setModal({ type: "cat-child", parentId: node.category_id })}>Add Child</Btn>}>
                  {node.children?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {node.children.map(c => (
                        <div key={c.category_id} onClick={() => handleSelect(c.category_id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "white", borderRadius: 10, border: `1px solid ${P.border}`, cursor: "pointer", transition: "all .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = P.mainM; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)"; }}>
                          <div style={{ background: P.surface, padding: 8, borderRadius: 8 }}><CatIcon icon={c.icon} size={16} color={P.txt2} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: P.txt, fontWeight: 600 }}>{c.name_en}</div>
                            {c.name_ar && <div style={{ fontSize: 12, color: P.txt3, direction: "rtl", marginTop: 2 }}>{c.name_ar}</div>}
                          </div>
                          {c.category_level && (() => { const cl = CAT_LEVEL_CONF[c.category_level]; return cl ? <Badge label={cl.label} color={cl.color} bg={cl.bg} /> : null; })()}
                          <Badge label={!c.children?.length ? "LEAF" : `${c.children.length} children`} color={P.main} bg={P.mainL} />
                          <ChevronRight size={16} color={P.txt3} />
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 14, color: P.txt3, padding: "20px 0", textAlign: "center", background: P.surface, borderRadius: 8, border: `1px dashed ${P.border}` }}>No sub-categories yet.</div>}
                </Sec>
              )}

              {isLeaf && (
                <Sec title="Geometry Formulas (NON_MATERIAL)" icon={<FlaskConical size={16} />} subtitle={leafLoading ? "Loading…" : `${leaf?.formulas?.length ?? 0} formulas · define shape inputs and intermediate mathematical results`} action={!leafLoading && (<Btn variant="outline" color={P.main} icon={<Plus size={14} />} style={{ padding: "6px 12px" }} onClick={() => setModal({ type: "formula", formulaType: "NON_MATERIAL" })}>Add Geometry Formula</Btn>)}>
                  {leafLoading ? <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><Spin size={24} /></div> : (leaf?.formulas ?? []).length === 0 ? <div style={{ fontSize: 14, color: P.txt3, padding: "20px", textAlign: "center", background: P.surface, borderRadius: 8, border: `1px dashed ${P.border}` }}>No geometry formulas defined. These establish user inputs (length, width) and compute intermediate spatial values.</div> : (leaf.formulas).map(f => <FormulaCard key={f.formula_id} formula={f} allNonMaterialFormulas={leaf.formulas} units={units} categoryId={selected} onDelete={() => askDeleteFormula(f)} />)}
                </Sec>
              )}

              {isLeaf && (
                <Sec title="Material Formulas (MATERIAL)" icon={<Package size={16} />} accent={MAT_COLOR} subtitle={leafLoading ? "Loading…" : `${leaf?.material_formulas?.length ?? 0} formulas · compute exact raw resource quantities`} action={!leafLoading && (<Btn variant="outline" color={MAT_COLOR} icon={<Plus size={14} />} style={{ padding: "6px 12px" }} onClick={() => setModal({ type: "formula", formulaType: "MATERIAL" })}>Add Material Formula</Btn>)}>
                  {leafLoading ? <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><Spin size={24} /></div> : (leaf?.material_formulas ?? []).length === 0 ? <div style={{ fontSize: 14, color: P.txt3, padding: "20px", textAlign: "center", background: MAT_BG, borderRadius: 8, border: `1px dashed ${MAT_COLOR}44` }}>No material formulas yet. These reference NON_MATERIAL outputs and coefficients to calculate final resource requirements.</div> : (leaf.material_formulas).map(f => <MaterialFormulaCard key={f.formula_id} formula={f} units={units} categoryId={selected} onDelete={() => askDeleteFormula(f)} />)}
                </Sec>
              )}

              {isLeaf && !leafLoading && (
                <Sec title="Material Configurations" icon={<Settings2 size={16} />} subtitle={`${leaf?.configs?.length ?? 0} grade variants available (e.g., Béton C25, C30)`}>
                  <div style={{ fontSize: 13, color: P.txt3, marginBottom: 16, lineHeight: 1.5, background: P.surface, padding: "10px 14px", borderRadius: 8, border: `1px solid ${P.border}` }}>
                    Configs allow you to group specific coefficients into selectable variants. Leave empty if no specific structural grades apply to this element.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {(leaf?.configs ?? []).map(c => <ConfigRow key={c.config_id} config={c} updateConfig={updateCfg} deleteConfig={deleteCfg} />)}
                  </div>
                  <Btn variant="outline" icon={<Plus size={14} />} onClick={() => createCfg.mutate({ name: "New Config", description: "" }, { onSuccess: () => showToast("Config added") })}>Add New Variant</Btn>
                </Sec>
              )}

              {isLeaf && !leafLoading && (
                <Sec title="Coefficients Library" icon={<Sigma size={16} />} subtitle={`${leaf?.coefficients?.length ?? 0} constant values available for MATERIAL expressions`}>
                  <div style={{ fontSize: 13, color: P.txt3, marginBottom: 16, lineHeight: 1.5, background: P.surface, padding: "10px 14px", borderRadius: 8, border: `1px solid ${P.border}` }}>
                    Coefficients act as static named variables (e.g., <code style={{ background: "white", border: `1px solid ${P.border}`, padding: "2px 6px", borderRadius: 4, color: P.main, fontSize: 12 }}>ciment_per_m3</code>) injected directly into MATERIAL calculations. Assign them to a Config to create grade-specific yields.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {(leaf?.coefficients ?? []).map(c => <CoeffRow key={c.coefficient_id} coeff={c} configs={leaf?.configs ?? []} updateCoefficient={updateCoef} deleteCoefficient={deleteCoef} />)}
                  </div>
                  <Btn variant="outline" icon={<Plus size={14} />} onClick={() => createCoef.mutate({ name_en: `coef_${Date.now().toString(36)}`, name_ar: "", value: 0 }, { onSuccess: () => showToast("Coefficient added") })}>Add New Coefficient</Btn>
                </Sec>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {(modal === "cat" || modal?.type === "cat-child") && <NewCatModal parentId={modal?.type === "cat-child" ? modal.parentId : null} allNodes={allNodes} onClose={() => setModal(null)} onCreate={doCreateCat} isPending={createCat.isPending} />}
      {modal?.type === "formula" && <NewFormulaModal units={units} onClose={() => setModal(null)} onSave={(dto) => createFml.mutate({ ...dto, formula_type: modal.formulaType }, { onSuccess: () => { setModal(null); showToast(`${modal.formulaType === "MATERIAL" ? "Material" : "Geometry"} formula created`); } })} isPending={createFml.isPending} />}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <Card style={{ width: 420, padding: 32, borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.14)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: P.txt, marginBottom: 12 }}>Confirm Action</div>
            <div style={{ fontSize: 14, color: P.txt2, marginBottom: 28, lineHeight: 1.6 }}>{confirm.message}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn color={P.error} onClick={confirm.onConfirm}>Delete Permanently</Btn>
            </div>
          </Card>
        </div>
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000, padding: "12px 20px", borderRadius: 10, background: "white", border: `1px solid ${P.success}44`, color: P.success, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.08)", animation: "fadeUp .25s ease-out" }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </div>
  );
}