import { useState, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Plus, X, FolderOpen, FolderTree,
  FlaskConical, Save, ToggleLeft, ToggleRight, Layers, CheckCircle,
  Settings2, Sigma, Hash, ChevronUp, Loader2, Trash2, AlertTriangle,
  Key, Home, Palette, DoorOpen, Pickaxe, Construction, Box, Landmark,
  Wrench, Droplets, Zap, Layout, Shield, HardHat, Hammer, Paintbrush,
  BrickWall, AppWindow, Package, Search, Copy, Check, ArrowRight,
  GitBranch, Braces, ListOrdered, SlidersHorizontal, BookOpen,
} from "lucide-react";

// shadcn/ui components
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CAT_LEVEL_CONF } from "@/lib/design-tokens";
import {
  useModulesTree, useLeafDetails, useUnits, useFieldTypes,
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

function CatIcon({ icon, size = 16, className }) {
  const I = ICON_MAP[icon] ?? FolderOpen;
  return <I size={size} className={className} />;
}

const CAT_LEVELS  = ["ROOT", "DOMAIN", "SUB_TYPE"];
const varNameRegex = /^[a-z][a-z0-9_]*$/;

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

function Spin({ size = 14, className }) {
  return <Loader2 size={size} className={cn("animate-spin shrink-0", className)} />;
}

// Wrapper around shadcn Input
function InlineInput({ value, onChange, placeholder, mono, dir, className }) {
  return (
    <Input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className={cn(
        "h-8 shadow-none transition-colors hover:border-input focus-visible:ring-1",
        mono && "font-mono",
        className
      )}
    />
  );
}

// Bilingual input pair
function BilingualRow({ labelEN = "Name (EN)", labelAR = "Name (AR)", valueEN, valueAR, onChangeEN, onChangeAR, placeholderEN = "", placeholderAR = "" }) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-muted p-3 rounded-lg border">
      <div>
        <div className="text-[11px] text-muted-foreground mb-1.5 font-semibold">{labelEN}</div>
        <InlineInput value={valueEN} onChange={onChangeEN} placeholder={placeholderEN} className="bg-background" />
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground mb-1.5 font-semibold text-right">{labelAR}</div>
        <InlineInput value={valueAR} onChange={onChangeAR} placeholder={placeholderAR} dir="rtl" className="bg-background" />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Sec({ title, icon, subtitle, children, action, accentClass = "border-l-primary text-primary" }) {
  return (
    <Card className="mb-5 overflow-hidden border">
      <div className={cn("flex items-center justify-between px-5 py-3.5 border-b bg-muted/30 border-l-4", accentClass)}>
        <div className="flex items-center gap-3">
          <div className="flex p-1.5 rounded-md bg-background shadow-sm border text-inherit">
             {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

// ── Leaf Data-Flow Guide ──────────────────────────────────────────────────────
function LeafFlowGuide() {
  const steps = [
    { icon: <FlaskConical size={13} />, label: "Geometry Formulas", desc: "Shape inputs & spatial math", color: "text-primary bg-primary/10 border-primary/20" },
    { icon: <Package size={13} />, label: "Material Formulas", desc: "Quantity expressions", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { icon: <Settings2 size={13} />, label: "Configurations", desc: "Grade variants (e.g. C25, C30)", color: "text-violet-600 bg-violet-50 border-violet-200" },
    { icon: <Sigma size={13} />, label: "Coefficients", desc: "Named constant variables", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];
  return (
    <div className="flex items-center gap-1 mb-6 p-3 rounded-xl bg-muted/40 border border-dashed overflow-x-auto">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1 shrink-0">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold", s.color)}>
            {s.icon}
            <div>
              <div>{s.label}</div>
              <div className="font-normal opacity-70 text-[10px] leading-tight">{s.desc}</div>
            </div>
          </div>
          {i < steps.length - 1 && <ArrowRight size={12} className="text-muted-foreground mx-0.5 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

// ── Tree Row ──────────────────────────────────────────────────────────────────
function TreeRow({ node, depth, selected, onSelect, expanded, onToggle }) {
  const isExp = expanded.includes(node.category_id);
  const isSel = selected === node.category_id;
  const hasC  = !!node.children?.length;
  const isLeafNode = node.category_level === "SUB_TYPE" || (!node.category_level && !node.children?.length);

  return (
    <div>
      <div
        onClick={() => onSelect(node.category_id)}
        className={cn(
          "group flex items-center gap-2 py-2 pr-2.5 cursor-pointer rounded-lg mb-0.5 transition-all border",
          isSel
            ? "bg-primary/10 border-primary/20 shadow-sm"
            : "border-transparent hover:bg-accent/60 hover:border-accent",
          !node.is_active && "opacity-55"
        )}
        style={{ paddingLeft: `${12 + depth * 18}px` }}
      >
        <span
          onClick={e => { e.stopPropagation(); if (hasC) onToggle(node.category_id); }}
          className={cn(
            "flex w-4 h-4 items-center justify-center shrink-0 rounded transition-colors text-muted-foreground",
            hasC ? "cursor-pointer hover:bg-accent" : "cursor-default"
          )}
        >
          {hasC ? (isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span className="w-3.5" />}
        </span>

        {/* Level indicator dot */}
        <span className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
          isLeafNode ? "bg-orange-400" :
          node.category_level === "ROOT" ? "bg-primary" :
          node.category_level === "DOMAIN" ? "bg-indigo-400" : "bg-muted-foreground/40"
        )} />

        <CatIcon icon={node.icon} size={13} className={cn("shrink-0", isSel ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span className={cn("flex-1 text-[13px] truncate whitespace-nowrap", isSel ? "font-semibold text-primary" : "text-foreground")}>
          {node.name_en}
        </span>
        {!node.is_active && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">OFF</Badge>}
        {isLeafNode && !isSel && <span className="w-1 h-1 rounded-full bg-orange-400/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      {isExp && node.children?.map(c => (
        <TreeRow key={c.category_id} node={c} depth={depth + 1} selected={selected}
          onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────
function FieldRow({ field, formulaId, allNonMaterialFormulas, units, fieldTypes, categoryId }) {
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

  // ── Derive field type ──────────────────────────────────────────────────
  const selectedType = fieldTypes.find(t => t.field_type_id === cur.field_type_id);
  const typeName     = (selectedType?.name_en || 'number').toLowerCase();
  const isBoolean    = typeName.includes('bool');
  const isSelect     = typeName.includes('select');

  // ── SELECT options — stored as JSON in default_value ──────────────────
  // Format: [{ label: "High", value: 1.5 }, { label: "Low", value: 1.0 }]
  const parseOptions = (v) => { try { return JSON.parse(v || '[]'); } catch { return []; } };
  const options      = isSelect ? parseOptions(cur.default_value) : [];
  const setOptions   = (newOpts) => patch({ default_value: JSON.stringify(newOpts) });
  const addOption    = () => setOptions([...options, { label: 'Option', value: 0 }]);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, key, val) => {
    const next = [...options];
    next[i] = { ...next[i], [key]: val };
    setOptions(next);
  };

  // ── Accent colour varies by type ───────────────────────────────────────
  const typeAccent = isBoolean
    ? 'border-violet-300/60 bg-violet-50/60'
    : isSelect
      ? 'border-amber-300/60 bg-amber-50/60'
      : isComp
        ? 'border-primary/30 bg-primary/5'
        : 'bg-background border-border hover:border-border/80';

  const isInvalid = cur.variable_name && !varNameRegex.test(cur.variable_name);
  const chainable = allNonMaterialFormulas.filter(f => f.formula_id !== formulaId);
  const linked    = chainable.find(f => f.formula_id === cur.source_formula_id);

  return (
    <div className={cn("rounded-xl border transition-all shadow-sm overflow-hidden", typeAccent)}>
      {/* Top accent line */}
      {isComp    && <div className="h-0.5 bg-gradient-to-r from-primary/60 to-primary/20" />}
      {isBoolean && <div className="h-0.5 bg-gradient-to-r from-violet-500/60 to-violet-500/10" />}
      {isSelect  && <div className="h-0.5 bg-gradient-to-r from-amber-500/60 to-amber-500/10" />}

      <div className="p-3">
        {/* Row 1: Labels + Type + Variable + Unit + Required/Badge + Actions */}
        <div className="grid grid-cols-[1fr_1fr_110px_110px_80px_auto_56px] gap-2.5 items-end">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Label EN</div>
            <InlineInput value={cur.label_en} onChange={v => patch({ label_en: v })} placeholder="e.g. Length…" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Label AR</div>
            <InlineInput value={cur.label_ar} onChange={v => patch({ label_ar: v })} placeholder="الطول…" dir="rtl" />
          </div>

          {/* ── Type selector ───────────────────────────────────────────── */}
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Type</div>
            <Select
              value={cur.field_type_id || "none"}
              onValueChange={v => patch({
                field_type_id: v === "none" ? null : v,
                default_value: v === "none" ? null : cur.default_value,
              })}
            >
              <SelectTrigger className={cn(
                "h-8 text-xs",
                isBoolean && "border-violet-400/50 bg-violet-50 text-violet-700",
                isSelect  && "border-amber-400/50 bg-amber-50 text-amber-700",
              )}>
                <SelectValue placeholder="number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— number (default) —</SelectItem>
                {fieldTypes.map(t => (
                  <SelectItem key={t.field_type_id} value={t.field_type_id}>{t.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className={cn("text-[10px] mb-1 font-semibold uppercase tracking-wide", isInvalid ? "text-destructive" : "text-muted-foreground")}>
              Variable {isInvalid && <span className="normal-case">(invalid)</span>}
            </div>
            <InlineInput
              mono
              value={cur.variable_name || ""}
              onChange={v => setDraft(d => ({ ...(d ?? field), variable_name: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""), vTouched: true }))}
              className={cn(
                isInvalid ? "border-destructive text-destructive" : "text-primary border-primary/30 bg-primary/5",
                "font-mono"
              )}
            />
          </div>

          {/* Unit — replaced with "0 / 1" badge for BOOLEAN */}
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Unit</div>
            {isBoolean ? (
              <div className="h-8 flex items-center px-2 rounded-md border border-dashed border-violet-300/50 bg-violet-50/50">
                <span className="text-[10px] text-violet-500 font-semibold">0 / 1</span>
              </div>
            ) : (
              <Select value={cur.unit_id || "none"} onValueChange={v => patch({ unit_id: v === "none" ? null : v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {units.map(u => <SelectItem key={u.unit_id} value={u.unit_id}>{u.symbol}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="h-8 flex items-center">
            {isComp ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                <GitBranch size={10} /> Computed
              </span>
            ) : isBoolean ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-violet-600 font-semibold px-2 py-0.5 bg-violet-100 rounded-md border border-violet-200">
                <ToggleLeft size={10} /> Bool
              </span>
            ) : (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground whitespace-nowrap">
                <Checkbox checked={!!cur.required} onCheckedChange={c => patch({ required: c })} className="w-3.5 h-3.5" />
                Required
              </label>
            )}
          </div>

          <div className="flex gap-1 justify-end h-8 items-center">
            {isDirty && (
              <Button size="icon" variant="default" className="w-7 h-7" title="Save" onClick={() => { const { vTouched: _, ...pl } = cur; upd.mutate({ fieldId: field.field_id, data: pl }, { onSuccess: () => setDraft(null) }); }}>
                {upd.isPending ? <Spin size={12} /> : <Save size={12} />}
              </Button>
            )}
            <Button size="icon" variant="outline" className="w-7 h-7 text-destructive hover:bg-destructive/10" title="Remove Field" onClick={() => del.mutate(field.field_id)}>
              {del.isPending ? <Spin size={12} /> : <X size={12} />}
            </Button>
          </div>
        </div>

        {/* Row 2: Source formula chain — not shown for SELECT or BOOLEAN */}
        {!isSelect && !isBoolean && (
          <div className={cn(
            "mt-2.5 flex items-center gap-2 flex-wrap px-2 py-1.5 rounded-lg border border-dashed text-[11px]",
            isComp ? "bg-background border-primary/30" : "bg-muted/50 border-border"
          )}>
            <span className={cn("font-semibold flex items-center gap-1", isComp ? "text-primary" : "text-muted-foreground")}>
              <Sigma size={11} /> {isComp ? "Computed via:" : "Chain source:"}
            </span>
            <Select value={cur.source_formula_id || "none"} onValueChange={v => patch({ source_formula_id: v === "none" ? null : v })}>
              <SelectTrigger className={cn("h-7 text-xs w-[220px] shrink-0", isComp && "border-primary/50 bg-primary/5 text-primary")}>
                <SelectValue placeholder="— Requires User Input —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Requires User Input —</SelectItem>
                {chainable.map(f => <SelectItem key={f.formula_id} value={f.formula_id}>{f.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
            {linked && cur.variable_name && (
              <span className="text-muted-foreground">
                → injects <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono text-[11px]">{cur.variable_name}</code>
              </span>
            )}
          </div>
        )}

        {/* Row 3: SELECT options editor */}
        {isSelect && (
          <div className="mt-2.5 px-2 py-2 rounded-lg border border-dashed border-amber-300/60 bg-amber-50/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 uppercase tracking-wide">
                <ListOrdered size={11} /> Options
                <span className="text-amber-500 font-normal normal-case ml-0.5">(label shown to user · numeric value used in formula)</span>
              </span>
              <button
                onClick={addOption}
                className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:text-amber-900 px-1.5 py-0.5 rounded hover:bg-amber-100 transition-colors"
              >
                <Plus size={10} /> Add option
              </button>
            </div>
            {options.length === 0 && (
              <div className="text-[11px] text-amber-600/70 italic py-1 px-1">No options yet — add at least one.</div>
            )}
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1.5 mb-1.5">
                <Input
                  value={opt.label || ''}
                  onChange={e => updateOption(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. High)"
                  className="h-7 text-xs flex-1 bg-white border-amber-200 focus-visible:ring-amber-400/40"
                />
                <Input
                  type="number"
                  value={opt.value ?? 0}
                  onChange={e => updateOption(idx, 'value', Number(e.target.value))}
                  placeholder="0"
                  className="h-7 text-xs w-20 font-mono bg-white border-amber-200 text-amber-800 focus-visible:ring-amber-400/40"
                />
                <button onClick={() => removeOption(idx)} className="text-destructive/60 hover:text-destructive transition-colors p-0.5">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Output row ────────────────────────────────────────────────────────────────
function OutputRow({ output, units, categoryId, onDelete }) {
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);
  const cur     = draft ?? output;
  const isDirty = draft !== null;
  const upd     = useUpdateFormulaOutput(categoryId);

  const set = (p) => setDraft(d => ({ ...(d ?? output), ...p }));

  const copyKey = () => {
    navigator.clipboard?.writeText(cur.output_key || "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-background shadow-sm overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary to-primary/30" />
      <div className="p-3">
        <div className="grid grid-cols-[170px_1fr_1fr_110px_auto] gap-2.5 items-end">
          <div>
            <div className="text-[10px] text-primary font-mono mb-1 font-bold uppercase tracking-wide flex items-center gap-1">
              <Key size={10} /> Output Key
            </div>
            <div className="relative flex items-center gap-1">
              <InlineInput
                mono
                value={cur.output_key || ""}
                onChange={v => set({ output_key: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") })}
                className="border-primary/40 text-primary bg-primary/5 pr-7"
              />
              <button
                onClick={copyKey}
                title="Copy key"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-medium">Label (EN)</div>
            <InlineInput value={cur.output_label_en} onChange={v => set({ output_label_en: v })} placeholder="e.g. Concrete Volume" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-medium">Label (AR)</div>
            <InlineInput value={cur.output_label_ar} onChange={v => set({ output_label_ar: v })} placeholder="حجم الخرسانة" dir="rtl" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-medium">Unit</div>
            <Select value={cur.output_unit_id || "none"} onValueChange={v => set({ output_unit_id: v === "none" ? null : v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="— none —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— none —</SelectItem>
                {units.map(u => <SelectItem key={u.unit_id} value={u.unit_id}>{u.symbol}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 justify-end h-8 items-center">
            {isDirty && (
              <Button size="icon" className="w-7 h-7" onClick={() => upd.mutate({ outputId: output.output_id, data: cur }, { onSuccess: () => setDraft(null) })}>
                {upd.isPending ? <Spin size={12} /> : <Save size={12} />}
              </Button>
            )}
            <Button size="icon" variant="outline" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <X size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NON_MATERIAL Formula card ─────────────────────────────────────────────────
function FormulaCard({ formula, allNonMaterialFormulas, units, fieldTypes, categoryId, onDelete }) {
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
  const fieldCount  = formula.fields?.length ?? 0;
  const outputCount = formula.outputs?.length ?? 0;

  return (
    <Card className="mb-4 overflow-hidden shadow-sm border-primary/20">
      {/* Card header accent */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={cn("px-4 pt-3.5 pb-3 transition-colors", open ? "bg-primary/5 border-b" : "bg-background")}>
        {/* Row 1: Names + meta + actions */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center gap-1.5 mt-1 shrink-0">
            <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
              <FlaskConical size={13} />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Name (EN)</div>
              <InlineInput value={cur.name_en || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_en: v }))} className="font-semibold" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Name (AR)</div>
              <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_ar: v }))} placeholder="اسم الصيغة…" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">v{formula.version}</Badge>
            <Button size="icon" variant="outline" className="w-7 h-7 text-destructive hover:bg-destructive/10 border-destructive/20" onClick={onDelete}>
              <Trash2 size={12} />
            </Button>
            <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => setOpen(o => !o)}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>

        {/* Row 2: Expression (full width code editor) + Unit + Save */}
        <div className="flex gap-2.5 items-end">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide flex items-center gap-1">
              <Braces size={10} /> Expression
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 font-mono text-xs font-bold select-none pointer-events-none">ƒ</span>
              <Input
                value={cur.expression || ""}
                onChange={e => setDraft(d => ({ ...(d ?? formula), expression: e.target.value }))}
                placeholder="e.g. L * l * h"
                className="pl-7 h-9 font-mono text-sm border-primary/40 text-primary bg-primary/5 focus-visible:ring-primary/40 focus-visible:bg-background transition-colors"
              />
            </div>
          </div>
          <div className="w-[120px] shrink-0">
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Output Unit</div>
            <Select value={cur.output_unit_id || "none"} onValueChange={v => setDraft(d => ({ ...(d ?? formula), output_unit_id: v === "none" ? null : v }))}>
              <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="— unit —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— none —</SelectItem>
                {units.map(u => <SelectItem key={u.unit_id} value={u.unit_id}>{u.symbol}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            className={cn("h-9 px-4 shrink-0 transition-all", isDirty ? "opacity-100" : "opacity-40")}
            variant={isDirty ? "default" : "secondary"}
            disabled={!isDirty}
            onClick={save}
          >
            {upd.isPending ? <Spin size={13} className="mr-1.5" /> : <Save size={13} className="mr-1.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* ── Collapsible body ───────────────────────────────────────────── */}
      {open && (
        <div className="bg-muted/20">
          {/* Output keys */}
          <div className="px-5 py-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10 border border-primary/10 text-primary"><Key size={13} /></div>
                <span className="text-[13px] font-semibold">Output Keys</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 h-5 text-[10px]">{outputCount}</Badge>

              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 border-primary/30 text-primary hover:bg-primary/5" onClick={() => addOutput.mutate({
                  formulaId: formula.formula_id,
                  data: { output_key: `out_${Date.now().toString(36)}`, output_label_en: "New Output", output_label_ar: "", output_unit_id: cur.output_unit_id || null },
                })}>
                {addOutput.isPending ? <Spin size={12} className="mr-1.5" /> : <Plus size={12} className="mr-1.5" />}
                Add Output
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(formula.outputs ?? []).map(o => (
                <OutputRow key={o.output_id} output={o} units={units} categoryId={categoryId} onDelete={() => delOutput.mutate(o.output_id)} />
              ))}
              {!hasOutputs && (
                <div className="text-[13px] text-muted-foreground py-4 text-center bg-muted/40 rounded-lg border border-dashed flex flex-col items-center gap-1.5">
                  <Key size={18} className="text-muted-foreground/40" />
                  <span>No output keys yet. Add one so MATERIAL formulas can reference this formula's result.</span>
                </div>
              )}
            </div>
          </div>

          {/* Input fields */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-background border text-muted-foreground"><Hash size={13} /></div>
                <span className="text-[13px] font-semibold">Input Fields</span>
                <Badge variant="secondary" className="h-5 text-[10px]">{fieldCount}</Badge>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2.5" onClick={() => {
                  const numberTypeId = fieldTypes.find(t => t.name_en?.toLowerCase().includes('number'))?.field_type_id || null;
                  addField.mutate({
                    formulaId: formula.formula_id,
                    data: { label_en: "New Field", label_ar: "", variable_name: `field_${Date.now().toString(36)}`, required: true, sort_order: formula.fields?.length ?? 0, field_type_id: numberTypeId },
                  });
                }}>
                {addField.isPending ? <Spin size={12} className="mr-1.5" /> : <Plus size={12} className="mr-1.5" />}
                Add Field
              </Button>
            </div>
            <div className="flex flex-col gap-2.5">
              {(formula.fields ?? []).map(f => (
                <FieldRow key={f.field_id} field={f} formulaId={formula.formula_id} allNonMaterialFormulas={allNonMaterialFormulas} units={units} fieldTypes={fieldTypes} categoryId={categoryId} />
              ))}
              {(!formula.fields || formula.fields.length === 0) && (
                <div className="text-[13px] text-muted-foreground py-4 text-center bg-muted/40 rounded-lg border border-dashed flex flex-col items-center gap-1.5">
                  <Hash size={18} className="text-muted-foreground/40" />
                  <span>No input fields. Add fields to define user-provided values (e.g. L, W, H).</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── MATERIAL Formula card ─────────────────────────────────────────────────────
function MaterialFormulaCard({ formula, units, categoryId, onDelete }) {
  const [open,  setOpen]  = useState(true);
  const [draft, setDraft] = useState(null);
  const cur     = draft ?? formula;
  const isDirty = draft !== null;
  const upd     = useUpdateFormula(categoryId);

  const save = () => upd.mutate(
    { formulaId: formula.formula_id, data: { name_en: cur.name_en, name_ar: cur.name_ar, expression: cur.expression, output_unit_id: cur.output_unit_id || null } },
    { onSuccess: () => setDraft(null) }
  );

  return (
    <Card className="mb-4 overflow-hidden border-orange-500/25 shadow-sm shadow-orange-500/5">
      {/* Card header accent */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400/60 to-transparent" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={cn("px-4 pt-3.5 pb-3 transition-colors", open ? "bg-orange-500/5 border-b border-orange-500/20" : "bg-background")}>
        {/* Row 1: Names + actions */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center gap-1.5 mt-1 shrink-0">
            <div className="p-1.5 rounded-md bg-orange-100 border border-orange-200 text-orange-600">
              <Package size={13} />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Name (EN)</div>
              <InlineInput value={cur.name_en || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_en: v }))} className="font-semibold bg-background" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Name (AR)</div>
              <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? formula), name_ar: v }))} placeholder="اسم الصيغة…" className="bg-background" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">v{formula.version}</Badge>
            <Button size="icon" variant="outline" className="w-7 h-7 text-destructive hover:bg-destructive/10 border-destructive/20 bg-background" onClick={onDelete}>
              <Trash2 size={12} />
            </Button>
            <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => setOpen(o => !o)}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>

        {/* Row 2: Expression + Unit + Save */}
        <div className="flex gap-2.5 items-end">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide flex items-center gap-1">
              <Braces size={10} /> Quantity Expression
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 font-mono text-xs font-bold select-none pointer-events-none">ƒ</span>
              <Input
                value={cur.expression || ""}
                onChange={e => setDraft(d => ({ ...(d ?? formula), expression: e.target.value }))}
                placeholder="e.g. volume_beton * ciment_per_m3"
                className="pl-7 h-9 font-mono text-sm border-orange-500/40 text-orange-600 bg-orange-500/5 focus-visible:ring-orange-500/40 focus-visible:bg-background transition-colors"
              />
            </div>
          </div>
          <div className="w-[120px] shrink-0">
            <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Unit</div>
            <Select value={cur.output_unit_id || "none"} onValueChange={v => setDraft(d => ({ ...(d ?? formula), output_unit_id: v === "none" ? null : v }))}>
              <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="— unit —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— unit —</SelectItem>
                {units.map(u => <SelectItem key={u.unit_id} value={u.unit_id}>{u.symbol}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            className={cn("h-9 px-4 shrink-0 transition-all", isDirty ? "bg-orange-600 hover:bg-orange-700 text-white opacity-100" : "opacity-40")}
            variant={isDirty ? "default" : "secondary"}
            disabled={!isDirty}
            onClick={save}
          >
            {upd.isPending ? <Spin size={13} className="mr-1.5" /> : <Save size={13} className="mr-1.5" />}
            Save
          </Button>
        </div>
      </div>


    </Card>
  );
}

// ── Config row ────────────────────────────────────────────────────────────────
function ConfigRow({ config, updateConfig, deleteConfig }) {
  const [draft, setDraft] = useState(null);
  const cur = draft ?? config;
  return (
    <div className="flex gap-2.5 items-center p-2.5 bg-background rounded-lg border shadow-sm hover:border-border/80 transition-colors">
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        <SlidersHorizontal size={13} />
      </div>
      <InlineInput value={cur.name} onChange={v => setDraft(d => ({ ...(d ?? config), name: v }))} placeholder="Config name…" className="flex-1 font-medium" />
      <InlineInput value={cur.description || ""} onChange={v => setDraft(d => ({ ...(d ?? config), description: v }))} placeholder="Description (optional)…" className="flex-[1.5] text-muted-foreground" />
      {draft !== null && (
        <Button size="icon" className="w-8 h-8 shrink-0" onClick={() => updateConfig.mutate({ configId: config.config_id, data: cur }, { onSuccess: () => setDraft(null) })}>
          <Save size={14} />
        </Button>
      )}
      <Button size="icon" variant="outline" className="w-8 h-8 shrink-0 text-destructive hover:bg-destructive/10" onClick={() => deleteConfig.mutate(config.config_id)}>
        <X size={14} />
      </Button>
    </div>
  );
}

// ── Coefficient row ───────────────────────────────────────────────────────────
function CoeffRow({ coeff, configs, updateCoefficient, deleteCoefficient }) {
  const [draft, setDraft] = useState(null);
  const cur = draft ?? coeff;
  const isLinked = !!cur.config_group_id;

  return (
    <div className={cn(
      "grid grid-cols-[200px_1fr_110px_160px_auto] gap-2.5 items-end p-3 rounded-lg border shadow-sm transition-colors",
      isLinked ? "bg-amber-50/50 border-amber-200/60" : "bg-background border-border"
    )}>
      <div>
        <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Variable Name</div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/50 font-mono text-[11px] select-none pointer-events-none">$</span>
          <InlineInput
            mono
            value={cur.name_en || ""}
            onChange={v => setDraft(d => ({ ...(d ?? coeff), name_en: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }))}
            className="pl-5 border-primary/30 text-primary bg-primary/5"
          />
        </div>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Name (AR)</div>
        <InlineInput dir="rtl" value={cur.name_ar || ""} onChange={v => setDraft(d => ({ ...(d ?? coeff), name_ar: v }))} placeholder="الاسم بالعربية" />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide flex items-center gap-1">
          Value
        </div>
        <Input
          type="number"
          value={cur.value}
          onChange={e => setDraft(d => ({ ...(d ?? coeff), value: Number(e.target.value) || 0 }))}
          className="h-8 font-mono text-sm font-semibold"
        />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Linked Config</div>
        <Select value={cur.config_group_id || "global"} onValueChange={v => setDraft(d => ({ ...(d ?? coeff), config_group_id: v === "global" ? null : v }))}>
          <SelectTrigger className={cn("h-8 text-xs", isLinked && "border-amber-500/50 bg-amber-50 text-amber-700")}>
            <SelectValue placeholder="— global —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">— global (all configs) —</SelectItem>
            {configs.map(c => <SelectItem key={c.config_id} value={c.config_id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-1 h-8 items-end">
        {draft !== null && (
          <Button size="icon" className="w-8 h-8" onClick={() => updateCoefficient.mutate({ coefficientId: coeff.coefficient_id, data: cur }, { onSuccess: () => setDraft(null) })}>
            <Save size={14} />
          </Button>
        )}
        <Button size="icon" variant="outline" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteCoefficient.mutate(coeff.coefficient_id)}>
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function NewCatModal({ parentId, allNodes, onClose, onCreate, isPending }) {
  const [form, setForm] = useState({
    name_en: "", name_ar: "", description_en: "", description_ar: "",
    icon: "folder", category_level: "ROOT", parent_id: parentId || "root",
  });
  const valid = form.name_en.trim();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg z-[100]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
          <DialogDescription>
            {form.parent_id !== "root" ? `Under: ${allNodes.find(n => n.category_id === form.parent_id)?.name_en ?? "…"}` : "Root level"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <BilingualRow valueEN={form.name_en} onChangeEN={v => setForm(f => ({ ...f, name_en: v }))} placeholderEN="e.g. Concrete Work" valueAR={form.name_ar} onChangeAR={v => setForm(f => ({ ...f, name_ar: v }))} placeholderAR="أعمال الخرسانة" />
          <BilingualRow labelEN="Description (EN)" labelAR="Description (AR)" valueEN={form.description_en} onChangeEN={v => setForm(f => ({ ...f, description_en: v }))} placeholderEN="Brief English description…" valueAR={form.description_ar} onChangeAR={v => setForm(f => ({ ...f, description_ar: v }))} placeholderAR="وصف مختصر…" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Level</label>
              <Select value={form.category_level} onValueChange={v => setForm(f => ({ ...f, category_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Parent</label>
              <Select value={form.parent_id} onValueChange={v => setForm(f => ({ ...f, parent_id: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">— Root —</SelectItem>
                  {allNodes.map(n => <SelectItem key={n.category_id} value={n.category_id}>{n.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Icon</div>
            <div className="flex gap-2 flex-wrap">
              {ICON_KEYS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} className={cn(
                  "w-9 h-9 rounded-md border flex items-center justify-center transition-all",
                  form.icon === ic ? "border-primary bg-primary/10 text-primary shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent hover:border-accent-foreground/20"
                )}>
                  <CatIcon icon={ic} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || isPending} onClick={() => onCreate({ ...form, parent_id: form.parent_id === "root" ? null : form.parent_id, description_en: form.description_en || null, description_ar: form.description_ar || null })}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Create Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewFormulaModal({ units, onClose, onSave, isPending }) {
  const [form, setForm] = useState({ name_en: "", name_ar: "", expression: "", output_unit_id: "none", formula_type: "NON_MATERIAL" });
  const isMat = form.formula_type === "MATERIAL";
  const valid = form.name_en.trim() && form.expression.trim();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl z-[100]">
        <DialogHeader>
          <DialogTitle>New {isMat ? "Material" : "Geometry"} Formula</DialogTitle>
        </DialogHeader>
        <div className="flex gap-0 mb-2 rounded-lg overflow-hidden border">
          {[
            { t: "NON_MATERIAL", label: "NON_MATERIAL", hint: "Geometry — defines shape inputs", icon: <FlaskConical size={14} />, colorClass: "text-primary bg-primary/10", defaultBg: "bg-background" },
            { t: "MATERIAL",     label: "MATERIAL",     hint: "Quantity — computes resource needs", icon: <Package size={14} />, colorClass: "text-orange-600 bg-orange-50", defaultBg: "bg-background" }
          ].map(({ t, label, hint, icon, colorClass, defaultBg }) => (
            <button key={t} onClick={() => setForm(f => ({ ...f, formula_type: t }))} className={cn(
              "flex-1 p-3 text-left transition-colors border-r last:border-r-0 flex gap-2.5",
              form.formula_type === t ? colorClass : defaultBg
            )}>
              <div className={cn("mt-0.5 shrink-0", form.formula_type === t ? "" : "text-muted-foreground")}>{icon}</div>
              <div>
                <div className={cn("text-sm font-bold mb-0.5", form.formula_type === t ? "" : "text-muted-foreground")}>{label}</div>
                <div className="text-[11px] text-muted-foreground">{hint}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <BilingualRow valueEN={form.name_en} onChangeEN={v => setForm(f => ({ ...f, name_en: v }))} placeholderEN={isMat ? "e.g. Cement Quantity" : "e.g. Volume Béton"} valueAR={form.name_ar} onChangeAR={v => setForm(f => ({ ...f, name_ar: v }))} placeholderAR={isMat ? "كمية الأسمنت" : "حجم الخرسانة"} />
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Braces size={11} /> {isMat ? "Quantity Expression" : "Expression"}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold select-none pointer-events-none" style={{ color: isMat ? "rgb(234,88,12,0.5)" : "rgb(16,78,216,0.5)" }}>ƒ</span>
              <Input
                value={form.expression}
                onChange={e => setForm(f => ({ ...f, expression: e.target.value }))}
                placeholder={isMat ? "e.g. volume_beton * ciment_per_m3" : "e.g. L * l * h"}
                className={cn(
                  "pl-7 font-mono border-2 h-9",
                  isMat ? "border-orange-500/30 text-orange-600 focus-visible:ring-orange-500/40" : "border-primary/30 text-primary focus-visible:ring-primary/40"
                )}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Output unit (optional)</label>
            <Select value={form.output_unit_id} onValueChange={v => setForm(f => ({ ...f, output_unit_id: v }))}>
              <SelectTrigger><SelectValue placeholder="— none —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— none —</SelectItem>
                {units.map(u => <SelectItem key={u.unit_id} value={u.unit_id}>{u.symbol} · {u.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {!isMat && (
            <div className="text-sm p-3 bg-primary/10 rounded-lg border border-primary/20 text-foreground flex items-start gap-2">
              <BookOpen size={14} className="text-primary shrink-0 mt-0.5" />
              <span>After creating, add <strong>Output keys</strong> so MATERIAL formulas can reference this formula's computed values.</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || isPending} onClick={() => onSave({ ...form, output_unit_id: form.output_unit_id === "none" ? null : form.output_unit_id })}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Create Formula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Modules() {
  const [selected,    setSelected]    = useState(null);
  const [expanded,    setExpanded]    = useState([]);
  const [modal,       setModal]       = useState(null);
  const [confirm,     setConfirm]     = useState(null);
  const [toast,       setToast]       = useState(null);
  const [catDraft,    setCatDraft]    = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const { data: tree  = [], isLoading: treeLoading } = useModulesTree();
  const { data: units      = []                     } = useUnits();
  const { data: fieldTypes = []                     } = useFieldTypes();

  const allNodes = useMemo(() => flattenTree(tree), [tree]);
  const node     = useMemo(() => allNodes.find(n => n.category_id === selected), [allNodes, selected]);
  const isLeaf   = node && (node.category_level === "SUB_TYPE" || (!node.category_level && !node.children?.length));
  const crumb    = useMemo(() => getCrumb(tree, selected), [tree, selected]);
  const catData  = catDraft ?? node;
  const catDirty = catDraft !== null;

  const { data: leaf, isLoading: leafLoading } = useLeafDetails(
    selected, { enabled: !!selected && !!isLeaf }
  );

  // Sidebar filtered list
  const filteredNodes = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return null; // null = show tree
    return allNodes.filter(n =>
      n.name_en?.toLowerCase().includes(q) || n.name_ar?.includes(filterQuery.trim())
    );
  }, [allNodes, filterQuery]);

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

  const toggle       = (id) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
  const handleSelect = (id) => { setSelected(id); setCatDraft(null); };

  const doCreateCat    = (dto) => createCat.mutate(dto, { onSuccess: () => { setModal(null); showToast("Category created"); } });
  const saveCat        = () => { if (!catDirty || !node) return; updateCat.mutate({ categoryId: node.category_id, data: catDraft }, { onSuccess: () => { setCatDraft(null); showToast("Saved"); } }); };
  const askDeleteCat   = () => setConfirm({ message: `Delete "${node?.name_en}"? Sub-categories or formulas inside will block this.`, onConfirm: () => deleteCat.mutate(node.category_id, { onSuccess: () => { setSelected(null); setConfirm(null); showToast("Deleted"); }, onError: (e) => { setConfirm(null); showToast(e.message || "Cannot delete"); } }) });
  const askDeleteFormula = (f) => setConfirm({ message: `Delete "${f.name_en}"? Its ${f.fields?.length ?? 0} field(s) and output keys will also be removed.`, onConfirm: () => deleteFml.mutate(f.formula_id, { onSuccess: () => { setConfirm(null); showToast("Formula deleted"); } }) });

  return (
    <div className="flex flex-1 overflow-hidden relative bg-muted/20">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="w-[280px] border-r flex flex-col bg-background shrink-0 shadow-sm z-10">

        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-3 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Category Tree</div>
            <div className="flex gap-1.5">
              <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">{allNodes.length} nodes</span>
              <span className="text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-semibold">{allNodes.filter(n => n.category_level === "SUB_TYPE" || (!n.children?.length)).length} leaves</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Search categories…"
              className="h-8 pl-7 text-xs shadow-none border-border/60 focus-visible:ring-1 bg-muted/40"
            />
            {filterQuery && (
              <button onClick={() => setFilterQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Tree / Filtered list */}
        <div className="flex-1 overflow-y-auto p-3">
          {treeLoading ? (
            <div className="p-5 flex flex-col items-center gap-2">
              <Spin size={20} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading tree…</span>
            </div>
          ) : filteredNodes !== null ? (
            /* Flat search results */
            filteredNodes.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8 flex flex-col items-center gap-2">
                <Search size={20} className="text-muted-foreground/30" />
                No categories match "{filterQuery}"
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredNodes.map(n => (
                  <div
                    key={n.category_id}
                    onClick={() => handleSelect(n.category_id)}
                    className={cn(
                      "flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg transition-all border text-[13px]",
                      selected === n.category_id
                        ? "bg-primary/10 border-primary/20 font-semibold text-primary"
                        : "border-transparent hover:bg-accent/60 text-foreground"
                    )}
                  >
                    <CatIcon icon={n.icon} size={13} className="shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{n.name_en}</span>
                    {n.category_level && (() => { const c = CAT_LEVEL_CONF[n.category_level]; return c ? <Badge style={{ backgroundColor: c.bg, color: c.color }} className="border-transparent text-[9px] px-1 py-0 h-4 shrink-0">{c.label}</Badge> : null; })()}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Normal tree */
            tree.map(n => <TreeRow key={n.category_id} node={n} depth={0} selected={selected} onSelect={handleSelect} expanded={expanded} onToggle={toggle} />)
          )}
        </div>

        {/* Add root button */}
        <div className="p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            className="w-full border-dashed shadow-sm text-muted-foreground hover:text-primary hover:border-primary border-2 h-9 text-sm"
            onClick={() => setModal("cat")}
          >
            <Plus size={14} className="mr-2" /> Add Root Category
          </Button>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto relative">
        {!node ? (
          <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8">
            <div className="w-20 h-20 rounded-2xl bg-background border shadow-sm flex items-center justify-center">
              <FolderTree size={36} className="text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground">Select a category</div>
            <div className="text-sm text-muted-foreground text-center max-w-xs">Navigate the sidebar tree to configure formulas, coefficients, and material data.</div>
          </div>
        ) : (
          <div className="max-w-[960px] mx-auto pb-16">

            {/* ── Sticky Header ─────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-background/85 px-8 pt-6 pb-4 border-b mb-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 mb-4 flex-wrap">
                {crumb?.map((n, i) => (
                  <span key={n.category_id} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={13} className="text-muted-foreground/60" />}
                    <span
                      onClick={() => handleSelect(n.category_id)}
                      className={cn(
                        "text-[12px] flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-muted",
                        i === crumb.length - 1 ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      <CatIcon icon={n.icon} size={11} /> {n.name_en}
                    </span>
                  </span>
                ))}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                    <CatIcon icon={node.icon} size={28} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-foreground leading-tight truncate">{node.name_en}</h1>
                    {node.name_ar && <div className="text-sm text-muted-foreground mt-0.5 rtl">{node.name_ar}</div>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">{isLeaf ? "LEAF" : "BRANCH"}</Badge>
                      {node.category_level && (() => { const c = CAT_LEVEL_CONF[node.category_level]; return c ? <Badge style={{ backgroundColor: c.bg, color: c.color }} className="border-transparent">{c.label}</Badge> : null; })()}
                      <Badge variant={node.is_active ? "default" : "secondary"} className={node.is_active ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}>{node.is_active ? "Active" : "Inactive"}</Badge>
                      {isLeaf && leaf && !leafLoading && (
                        <Badge variant="secondary" className="text-muted-foreground text-[10px]">
                          {leaf.formulas?.length ?? 0} NON_MAT · {leaf.material_formulas?.length ?? 0} MAT · {leaf.coefficients?.length ?? 0} coef
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => updateCat.mutate({ categoryId: node.category_id, data: { is_active: !node.is_active } }, { onSuccess: () => showToast("Updated") })}>
                    {node.is_active ? <ToggleRight size={15} className="mr-2 text-green-600" /> : <ToggleLeft size={15} className="mr-2" />}
                    {node.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20" onClick={askDeleteCat}>
                    <Trash2 size={15} className="mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-8">

              {/* Leaf data-flow guide */}
              {isLeaf && !leafLoading && <LeafFlowGuide />}

              {/* ── Category Metadata ────────────────────────────────────── */}
              <Sec title="Category Metadata" icon={<Layers size={16} />}>
                <div className="flex flex-col gap-4">
                  <BilingualRow valueEN={catData?.name_en || node.name_en} onChangeEN={v => setCatDraft(d => ({ ...(d ?? node), name_en: v }))} placeholderEN="Name in English" valueAR={catData?.name_ar || node.name_ar || ""} onChangeAR={v => setCatDraft(d => ({ ...(d ?? node), name_ar: v }))} placeholderAR="الاسم بالعربية" />
                  <BilingualRow labelEN="Description (EN)" labelAR="Description (AR)" valueEN={catData?.description_en || node.description_en || ""} onChangeEN={v => setCatDraft(d => ({ ...(d ?? node), description_en: v }))} placeholderEN="Brief English description…" valueAR={catData?.description_ar || node.description_ar || ""} onChangeAR={v => setCatDraft(d => ({ ...(d ?? node), description_ar: v }))} placeholderAR="وصف مختصر بالعربية…" />
                  <div className="grid grid-cols-[240px_1fr] gap-5 items-start bg-muted/40 p-4 rounded-lg border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Hierarchy Level</label>
                      <Select value={catData?.category_level || node.category_level || "ROOT"} onValueChange={v => setCatDraft(d => ({ ...(d ?? node), category_level: v }))}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CAT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Interface Icon</div>
                      <div className="flex gap-2 flex-wrap">
                        {ICON_KEYS.map(ic => (
                          <button key={ic} onClick={() => setCatDraft(d => ({ ...(d ?? node), icon: ic }))} className={cn(
                            "w-9 h-9 rounded-md border flex items-center justify-center transition-all",
                            (catData?.icon || node.icon) === ic ? "border-primary bg-primary/10 text-primary shadow-sm" : "bg-background text-muted-foreground hover:bg-muted"
                          )}>
                            <CatIcon icon={ic} size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {catDirty && (
                  <div className="mt-5 flex justify-end pt-4 border-t">
                    <Button onClick={saveCat} className="gap-2">
                      {updateCat.isPending ? <Spin size={14} /> : <Save size={14} />}
                      Save Metadata Changes
                    </Button>
                  </div>
                )}
              </Sec>

              {/* ── Sub-categories ───────────────────────────────────────── */}
              {!isLeaf && (
                <Sec
                  title="Sub-categories"
                  icon={<FolderOpen size={16} />}
                  subtitle={`${node.children?.length ?? 0} children under this node`}
                  action={
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setModal({ type: "cat-child", parentId: node.category_id })}>
                      <Plus size={14} className="mr-1.5" /> Add Child
                    </Button>
                  }
                >
                  {node.children?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {node.children.map(c => (
                        <div key={c.category_id} onClick={() => handleSelect(c.category_id)} className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer transition-all hover:border-primary/40 hover:shadow-md group">
                          <div className="bg-muted p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                            <CatIcon icon={c.icon} size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground">{c.name_en}</div>
                            {c.name_ar && <div className="text-xs text-muted-foreground rtl mt-0.5">{c.name_ar}</div>}
                          </div>
                          {c.category_level && (() => { const cl = CAT_LEVEL_CONF[c.category_level]; return cl ? <Badge style={{ backgroundColor: cl.bg, color: cl.color }} className="border-transparent px-2 py-0.5 shrink-0">{cl.label}</Badge> : null; })()}
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 px-2 py-0.5 shrink-0">
                            {c.category_level === "SUB_TYPE" ? "LEAF" : `${c.children?.length || 0} children`}
                          </Badge>
                          <ChevronRight size={15} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-8 text-center bg-muted/50 rounded-lg border border-dashed flex flex-col items-center gap-2">
                      <FolderOpen size={24} className="text-muted-foreground/30" />
                      No sub-categories yet. Add a child to build the hierarchy.
                    </div>
                  )}
                </Sec>
              )}

              {/* ── NON_MATERIAL Formulas ────────────────────────────────── */}
              {isLeaf && (
                <Sec
                  title="Geometry Formulas (NON_MATERIAL)"
                  icon={<FlaskConical size={16} />}
                  subtitle={leafLoading ? "Loading…" : `${leaf?.formulas?.length ?? 0} formulas · shape inputs and intermediate mathematical results`}
                  action={!leafLoading && (
                    <Button variant="outline" size="sm" className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/5" onClick={() => setModal({ type: "formula", formulaType: "NON_MATERIAL" })}>
                      <Plus size={14} className="mr-1.5" /> Add Geometry Formula
                    </Button>
                  )}
                >
                  {leafLoading ? (
                    <div className="flex justify-center p-8"><Spin size={24} /></div>
                  ) : (leaf?.formulas ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center bg-muted/50 rounded-lg border border-dashed flex flex-col items-center gap-2">
                      <FlaskConical size={24} className="text-muted-foreground/30" />
                      <span>No geometry formulas yet.</span>
                      <span className="text-xs max-w-xs">These define user inputs (length, width) and compute intermediate spatial values used by MATERIAL formulas.</span>
                    </div>
                  ) : (
                    (leaf.formulas).map(f => (
                      <FormulaCard key={f.formula_id} formula={f} allNonMaterialFormulas={leaf.formulas} units={units} fieldTypes={fieldTypes} categoryId={selected} onDelete={() => askDeleteFormula(f)} />
                    ))
                  )}
                </Sec>
              )}

              {/* ── MATERIAL Formulas ────────────────────────────────────── */}
              {isLeaf && (
                <Sec
                  title="Material Formulas (MATERIAL)"
                  icon={<Package size={16} />}
                  accentClass="border-l-orange-500 text-orange-600"
                  subtitle={leafLoading ? "Loading…" : `${leaf?.material_formulas?.length ?? 0} formulas · compute exact raw resource quantities`}
                  action={!leafLoading && (
                    <Button variant="outline" size="sm" className="h-8 text-xs text-orange-600 border-orange-500/30 hover:bg-orange-50 hover:text-orange-700" onClick={() => setModal({ type: "formula", formulaType: "MATERIAL" })}>
                      <Plus size={14} className="mr-1.5" /> Add Material Formula
                    </Button>
                  )}
                >
                  {leafLoading ? (
                    <div className="flex justify-center p-8"><Spin size={24} /></div>
                  ) : (leaf?.material_formulas ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center bg-orange-50/60 rounded-lg border border-dashed border-orange-300/50 flex flex-col items-center gap-2">
                      <Package size={24} className="text-orange-300" />
                      <span className="text-orange-800/70">No material formulas yet.</span>
                      <span className="text-xs max-w-xs text-orange-700/60">These reference NON_MATERIAL outputs and coefficients to calculate final resource requirements.</span>
                    </div>
                  ) : (
                    (leaf.material_formulas).map(f => (
                      <MaterialFormulaCard key={f.formula_id} formula={f} units={units} categoryId={selected} onDelete={() => askDeleteFormula(f)} />
                    ))
                  )}
                </Sec>
              )}

              {/* ── Configurations ───────────────────────────────────────── */}
              {isLeaf && !leafLoading && (
                <Sec
                  title="Material Configurations"
                  icon={<Settings2 size={16} />}
                  accentClass="border-l-violet-500 text-violet-600"
                  subtitle={`${leaf?.configs?.length ?? 0} grade variants (e.g. Béton C25, C30)`}
                >
                  <div className="text-[13px] text-muted-foreground mb-4 leading-relaxed bg-muted/40 p-3 rounded-lg border">
                    Configs group coefficients into selectable variants. Leave empty if no structural grades apply to this element.
                  </div>
                  <div className="flex flex-col gap-2.5 mb-4">
                    {(leaf?.configs ?? []).map(c => <ConfigRow key={c.config_id} config={c} updateConfig={updateCfg} deleteConfig={deleteCfg} />)}
                  </div>
                  {(leaf?.configs ?? []).length === 0 && (
                    <div className="text-sm text-muted-foreground py-5 text-center bg-muted/50 rounded-lg border border-dashed mb-4 flex flex-col items-center gap-1.5">
                      <SlidersHorizontal size={20} className="text-muted-foreground/30" />
                      No config variants yet.
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => createCfg.mutate({ name: "New Config", description: "" }, { onSuccess: () => showToast("Config added") })}>
                    <Plus size={14} className="mr-2" /> Add New Variant
                  </Button>
                </Sec>
              )}

              {/* ── Coefficients ─────────────────────────────────────────── */}
              {isLeaf && !leafLoading && (
                <Sec
                  title="Coefficients Library"
                  icon={<Sigma size={16} />}
                  accentClass="border-l-emerald-500 text-emerald-600"
                  subtitle={`${leaf?.coefficients?.length ?? 0} constant values for MATERIAL expressions`}
                >
                  <div className="text-[13px] text-muted-foreground mb-4 leading-relaxed bg-muted/40 p-3 rounded-lg border">
                    Coefficients act as static named variables (e.g. <code className="bg-background border px-1.5 py-0.5 rounded text-primary text-xs">ciment_per_m3</code>) injected into MATERIAL calculations. Assign to a Config for grade-specific values.
                  </div>
                  <div className="flex flex-col gap-2.5 mb-4">
                    {(leaf?.coefficients ?? []).map(c => <CoeffRow key={c.coefficient_id} coeff={c} configs={leaf?.configs ?? []} updateCoefficient={updateCoef} deleteCoefficient={deleteCoef} />)}
                  </div>
                  {(leaf?.coefficients ?? []).length === 0 && (
                    <div className="text-sm text-muted-foreground py-5 text-center bg-muted/50 rounded-lg border border-dashed mb-4 flex flex-col items-center gap-1.5">
                      <Sigma size={20} className="text-muted-foreground/30" />
                      No coefficients yet.
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => createCoef.mutate({ name_en: `coef_${Date.now().toString(36)}`, name_ar: "", value: 0 }, { onSuccess: () => showToast("Coefficient added") })}>
                    <Plus size={14} className="mr-2" /> Add New Coefficient
                  </Button>
                </Sec>
              )}

            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {(modal === "cat" || modal?.type === "cat-child") && (
        <NewCatModal parentId={modal?.type === "cat-child" ? modal.parentId : null} allNodes={allNodes} onClose={() => setModal(null)} onCreate={doCreateCat} isPending={createCat.isPending} />
      )}
      {modal?.type === "formula" && (
        <NewFormulaModal units={units} onClose={() => setModal(null)} onSave={(dto) => createFml.mutate({ ...dto, formula_type: modal.formulaType }, { onSuccess: () => { setModal(null); showToast(`${modal.formulaType === "MATERIAL" ? "Material" : "Geometry"} formula created`); } })} isPending={createFml.isPending} />
      )}

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">{confirm?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirm?.onConfirm}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold flex items-center gap-2 shadow-xl">
          <CheckCircle size={15} className="text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}