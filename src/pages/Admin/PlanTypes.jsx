import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Btn, Card, Field, TH, TD } from "@/components/admin/ui-atoms";
import { usePlanTypes, useCreatePlanType, useUpdatePlanType, useDeletePlanType } from "@/hooks/plans.queries";

function Spin() { return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />; }

function PlanTypeRow({ pt }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(null);
  const update = useUpdatePlanType();
  const remove = useDeletePlanType();

  const save = () => {
    update.mutate({ id: pt.plan_type_id, data: draft }, {
      onSuccess: () => { setEditing(false); setDraft(null); },
    });
  };

  if (!editing) return (
    <tr style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
      onMouseEnter={e => e.currentTarget.style.background = P.bg}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <TD style={{ fontWeight: 600 }}>{pt.name_en}</TD>
      <TD style={{ color: P.txt2, direction: "rtl" }}>{pt.name_ar || "—"}</TD>
      <TD>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small variant="outline" icon={<Pencil size={11} />}
            onClick={() => { setDraft({ name_en: pt.name_en, name_ar: pt.name_ar ?? "" }); setEditing(true); }}>
            Edit
          </Btn>
          <Btn small variant="danger" icon={remove.isPending ? <Spin /> : <Trash2 size={11} />}
            onClick={() => remove.mutate(pt.plan_type_id)} />
        </div>
      </TD>
    </tr>
  );

  return (
    <tr style={{ borderTop: `1px solid ${P.borderL}`, background: P.mainL }}>
      <TD>
        <input value={draft.name_en} onChange={e => setDraft(d => ({ ...d, name_en: e.target.value }))}
          style={{ width: "100%", background: P.surface, border: `1.5px solid ${P.main}55`, borderRadius: 6, padding: "5px 8px", fontSize: 13, outline: "none" }} />
      </TD>
      <TD>
        <input value={draft.name_ar} onChange={e => setDraft(d => ({ ...d, name_ar: e.target.value }))}
          placeholder="الاسم بالعربية"
          style={{ width: "100%", background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 13, outline: "none", direction: "rtl" }} />
      </TD>
      <TD>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small icon={update.isPending ? <Spin /> : <Save size={11} />} onClick={save}>Save</Btn>
          <Btn small variant="ghost" icon={<X size={11} />} onClick={() => { setEditing(false); setDraft(null); }} />
        </div>
      </TD>
    </tr>
  );
}

export default function PlanTypes() {
  const [showNew, setShowNew] = useState(false);
  const [newPT,   setNewPT]   = useState({ name_en: "", name_ar: "" });
  const { data: planTypes = [], isLoading } = usePlanTypes();
  const create = useCreatePlanType();

  const handleCreate = () => {
    if (!newPT.name_en.trim()) return;
    create.mutate(newPT, { onSuccess: () => { setShowNew(false); setNewPT({ name_en: "", name_ar: "" }); } });
  };

  return (
    <div style={{ animation: "fadeUp .3s ease", maxWidth: 560 }}>
      {showNew && (
        <Card style={{ padding: 22, marginBottom: 20, animation: "fadeUp .2s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.txt, marginBottom: 16 }}>New Plan Type</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Field label="Name (EN)" value={newPT.name_en} onChange={v => setNewPT(p => ({ ...p, name_en: v }))} placeholder="e.g. Company" />
            <Field label="Name (AR)" value={newPT.name_ar} onChange={v => setNewPT(p => ({ ...p, name_ar: v }))} placeholder="شركة" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon={create.isPending ? <Spin /> : <Save size={13} />} disabled={!newPT.name_en.trim() || create.isPending} onClick={handleCreate}>
              Save
            </Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        {isLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: P.txt3, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}><Spin /> Loading…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Name (EN)", "Name (AR)", "Actions"].map(h => <TH key={h}>{h}</TH>)}</tr>
            </thead>
            <tbody>
              {planTypes.map(pt => <PlanTypeRow key={pt.plan_type_id} pt={pt} />)}
              {planTypes.length === 0 && (
                <tr><td colSpan={3} style={{ padding: "24px 0", textAlign: "center", color: P.txt3, fontSize: 13 }}>No plan types yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {!showNew && (
        <Btn icon={<Plus size={13} />} onClick={() => setShowNew(true)}>Add Plan Type</Btn>
      )}
    </div>
  );
}
