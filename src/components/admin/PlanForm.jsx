import { useState, useMemo, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Btn, Sel, Field } from "@/components/admin/ui-atoms";
import { usePlanTypes } from "@/hooks/plan.queries";

export const PREDEFINED_FEATURES = [
  { key: "project_limit", label: "Project Limit" },
  { key: "ai_limit", label: "AI Limit" }
];

export default function PlanForm({ initialData, onSave, onCancel, isPending }) {
  const { data: planTypes = [] } = usePlanTypes();
  const [data, setData] = useState(initialData || { 
    name_en: "", name_ar: "", typeId: "", price: 0, duration: 30, 
    features: PREDEFINED_FEATURES.map(f => ({ key: f.key, value: "0" }))
  });

  const typeOptions = useMemo(() => 
    planTypes.map(t => ({ v: t.id, l: t.name_en })), 
  [planTypes]);

  // Default to first type if none selected
  useEffect(() => {
    if (!data.typeId && typeOptions.length > 0) {
      setData(prev => ({ ...prev, typeId: typeOptions[0].v }));
    }
  }, [typeOptions, data.typeId]);

  const updFeat = (i, val) => setData(p => ({
    ...p,
    features: p.features.map((f, fi) => fi === i ? { ...f, value: val } : f)
  }));

  const handleSave = () => {
    // Sanitize typeId: empty string should be undefined or first option
    const sanitizedData = {
      ...data,
      typeId: data.typeId || (typeOptions[0]?.v) || undefined
    };
    onSave(sanitizedData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Plan Name (EN)" value={data.name_en || ""} onChange={v => setData(p => ({ ...p, name_en: v }))} placeholder="e.g. Pro" />
        <Field label="Plan Name (AR)" value={data.name_ar || ""} onChange={v => setData(p => ({ ...p, name_ar: v }))} placeholder="مثلاً: احترافي" />
        <Sel label="Plan Type" value={data.typeId || ""} onChange={v => setData(p => ({ ...p, typeId: v }))} options={typeOptions} />
        <Field label="Price (DA / month)" value={String(data.price || 0)} onChange={v => setData(p => ({ ...p, price: v }))} type="number" placeholder="0" />
        <Field label="Duration (days)" value={String(data.duration || 30)} onChange={v => setData(p => ({ ...p, duration: v }))} type="number" placeholder="30" />
      </div>

      <div>
        <div style={{ fontSize: 12, color: P.txt2, fontWeight: 500, marginBottom: 8 }}>Features (Predefined)</div>
        {data.features.map((f, i) => (
          <div key={f.key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: P.txt, fontWeight: 500 }}>{PREDEFINED_FEATURES.find(pf => pf.key === f.key)?.label || f.key}</div>
            <input value={f.value} onChange={e => updFeat(i, e.target.value)} placeholder="Limit value" 
              style={{ background: P.bg, border: `1.5px solid ${P.main}66`, borderRadius: 6, padding: "7px 10px", color: P.main, fontSize: 12, fontFamily: "monospace", outline: "none" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Btn onClick={handleSave} disabled={isPending} icon={isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}>
          {isPending ? "Saving..." : "Save Plan"}
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}
