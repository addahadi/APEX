import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, TH, TD } from "@/components/admin/ui-atoms";
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from "@/hooks/units.queries";

function Spin() {
  return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />;
}

// ── Inline edit row ───────────────────────────────────────────────────────────
function UnitRow({ unit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(null);
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const save = () => {
    updateUnit.mutate({ unitId: unit.unit_id, data: draft }, {
      onSuccess: () => { setEditing(false); setDraft(null); },
    });
  };

  if (!editing) {
    return (
      <tr style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
        onMouseEnter={e => e.currentTarget.style.background = P.bg}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <TD>{unit.name_en}</TD>
        <TD style={{ direction: "rtl", color: P.txt2 }}>{unit.name_ar || "—"}</TD>
        <TD><Badge label={unit.symbol} color={P.cyan} bg={P.cyanL} /></TD>
        <TD>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn small variant="outline" icon={<Pencil size={11} />}
              onClick={() => { setDraft({ name_en: unit.name_en, name_ar: unit.name_ar ?? "", symbol: unit.symbol }); setEditing(true); }}>
              Edit
            </Btn>
            <Btn small variant="danger" icon={deleteUnit.isPending ? <Spin /> : <Trash2 size={11} />}
              onClick={() => onDelete(unit.unit_id)} />
          </div>
        </TD>
      </tr>
    );
  }

  return (
    <tr style={{ borderTop: `1px solid ${P.borderL}`, background: P.mainL }}>
      <TD>
        <input value={draft.name_en} onChange={e => setDraft(d => ({ ...d, name_en: e.target.value }))}
          style={{ width: "100%", background: P.surface, border: `1.5px solid ${P.main}55`, borderRadius: 6, padding: "5px 8px", fontSize: 13, outline: "none" }} />
      </TD>
      <TD>
        <input value={draft.name_ar} onChange={e => setDraft(d => ({ ...d, name_ar: e.target.value }))}
          placeholder="اسم بالعربية"
          style={{ width: "100%", background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 13, outline: "none", direction: "rtl" }} />
      </TD>
      <TD>
        <input value={draft.symbol} onChange={e => setDraft(d => ({ ...d, symbol: e.target.value }))}
          style={{ width: 70, background: P.surface, border: `1.5px solid ${P.main}55`, borderRadius: 6, padding: "5px 8px", fontSize: 13, fontFamily: "monospace", outline: "none" }} />
      </TD>
      <TD>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small icon={updateUnit.isPending ? <Spin /> : <Save size={11} />} onClick={save}>Save</Btn>
          <Btn small variant="ghost" icon={<X size={11} />} onClick={() => { setEditing(false); setDraft(null); }} />
        </div>
      </TD>
    </tr>
  );
}

// ── New unit form ─────────────────────────────────────────────────────────────
function NewUnitForm({ onClose }) {
  const [form, setForm] = useState({ name_en: "", name_ar: "", symbol: "" });
  const createUnit = useCreateUnit();
  const valid = form.name_en.trim() && form.symbol.trim();

  const save = () => {
    createUnit.mutate(form, { onSuccess: onClose });
  };

  return (
    <Card style={{ padding: 22, marginBottom: 20, animation: "fadeUp .2s ease" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: P.txt, marginBottom: 16 }}>New Unit</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 14, marginBottom: 14 }}>
        <Field label="Name (EN)" value={form.name_en} onChange={v => setForm(f => ({ ...f, name_en: v }))} placeholder="Meter" />
        <Field label="Name (AR)" value={form.name_ar} onChange={v => setForm(f => ({ ...f, name_ar: v }))} placeholder="متر" />
        <Field label="Symbol"    value={form.symbol}   onChange={v => setForm(f => ({ ...f, symbol: v }))}  placeholder="m" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn icon={createUnit.isPending ? <Spin /> : <Save size={13} />} disabled={!valid || createUnit.isPending} onClick={save}>
          Save Unit
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Units() {
  const [showNew, setShowNew] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { data: units = [], isLoading } = useUnits();
  const deleteUnit = useDeleteUnit();

  const askDelete = (unitId) => setConfirm(unitId);
  const doDelete  = () => {
    deleteUnit.mutate(confirm, { onSuccess: () => setConfirm(null) });
  };

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn icon={<Plus size={13} />} onClick={() => setShowNew(true)}>Add Unit</Btn>
      </div>

      {showNew && <NewUnitForm onClose={() => setShowNew(false)} />}

      <Card>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: P.txt3, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <Spin /> Loading units…
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Name (EN)", "Name (AR)", "Symbol", "Actions"].map(h => <TH key={h}>{h}</TH>)}</tr>
            </thead>
            <tbody>
              {units.map(u => (
                <UnitRow key={u.unit_id} unit={u} onDelete={askDelete} />
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && units.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: P.txt3, fontSize: 13 }}>No units yet.</div>
        )}
      </Card>

      {/* Confirm delete */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <Card style={{ width: 340, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: P.txt, marginBottom: 8 }}>Delete Unit?</div>
            <div style={{ fontSize: 13, color: P.txt2, marginBottom: 20, lineHeight: 1.5 }}>
              This will fail if any materials or formulas still reference this unit. Check before deleting.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn color={P.error} icon={deleteUnit.isPending ? <Spin /> : <Trash2 size={13} />} onClick={doDelete}>Delete</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
