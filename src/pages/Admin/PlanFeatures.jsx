import { useState } from "react";
import { Plus, Pencil, Save } from "lucide-react";
import { P, TYPE_CONF, uid } from "@/lib/design-tokens";
import { PLANS as INIT_PLANS } from "@/mock/mock-data";
import { Badge, Btn, Card, Sel, Field } from "@/components/admin/ui-atoms";

const PREDEFINED_FEATURES = [
  { key: "project_limit", label: "Project Limit" },
  { key: "estimation_limit", label: "Estimation Limit" },
  { key: "ai_limit", label: "AI Limit" }
];

export default function PlanFeatures() {
  const [plans, setPlans]       = useState(INIT_PLANS.map(p => ({
    ...p,
    features: PREDEFINED_FEATURES.map(f => {
      const existing = p.features.find(ef => ef.key === f.key);
      return existing || { key: f.key, val: "0" };
    })
  })));
  
  const [editPlan, setEditPlan] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [newPlan, setNewPlan]   = useState({ 
    name: "", type: "NORMAL", desc: "", price: 0, duration: 365, 
    features: PREDEFINED_FEATURES.map(f => ({ key: f.key, val: "0" }))
  });

  const updFeat = (setter, i, val) => setter(p => ({
    ...p,
    features: p.features.map((f, fi) => fi === i ? { ...f, val } : f)
  }));

  const savePlan = () => {
    if (editPlan) { 
      setPlans(ps => ps.map(p => p.id === editPlan.id ? { ...p, ...editPlan } : p)); 
      setEditPlan(null); 
    }
    else { 
      setPlans(ps => [...ps, { ...newPlan, id: uid(), typeId: "pt1" }]); 
      setShowNew(false); 
      setNewPlan({ 
        name: "", type: "NORMAL", desc: "", price: 0, duration: 365, 
        features: PREDEFINED_FEATURES.map(f => ({ key: f.key, val: "0" }))
      }); 
    }
  };

  const PlanForm = ({ data, setter, title, onSave, onCancel }) => (
    <Card style={{ padding: 24, animation: "fadeUp .2s ease", marginBottom: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 18 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <Field label="Plan Name (EN)" value={data.name} onChange={v => setter(p => ({ ...p, name: v }))} placeholder="e.g. Pro" />
        <Sel label="Plan Type" value={data.type} onChange={v => setter(p => ({ ...p, type: v }))} options={["NORMAL", "COMPANY"]} />
        <Field label="Price (DA / year)" value={String(data.price)} onChange={v => setter(p => ({ ...p, price: Number(v) || 0 }))} type="number" placeholder="0" />
        <Field label="Duration (days)" value={String(data.duration)} onChange={v => setter(p => ({ ...p, duration: Number(v) || 0 }))} type="number" placeholder="365" />
        <div style={{ gridColumn: "1/-1" }}><Field label="Description" value={data.desc} onChange={v => setter(p => ({ ...p, desc: v }))} placeholder="Short description…" /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: P.txt2, fontWeight: 500, marginBottom: 8 }}>Features (Predefined)</div>
        {data.features.map((f, i) => (
          <div key={f.key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: P.txt, fontWeight: 500 }}>{PREDEFINED_FEATURES.find(pf => pf.key === f.key)?.label || f.key}</div>
            <input value={f.val} onChange={e => updFeat(setter, i, e.target.value)} placeholder="Limit value" 
              style={{ background: P.bg, border: `1.5px solid ${P.main}66`, borderRadius: 6, padding: "7px 10px", color: P.main, fontSize: 12, fontFamily: "monospace", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onSave} icon={<Save size={13} />}>Save Plan</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Card>
  );

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      {showNew && <PlanForm data={newPlan} setter={setNewPlan} title="Create New Plan" onSave={savePlan} onCancel={() => setShowNew(false)} />}
      {editPlan && <PlanForm data={editPlan} setter={setEditPlan} title={`Edit: ${editPlan.name}`} onSave={savePlan} onCancel={() => setEditPlan(null)} />}
      {!showNew && !editPlan && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {plans.map(plan => {
            const tc = TYPE_CONF[plan.type] || TYPE_CONF.NORMAL;
            return (
              <Card key={plan.id} style={{ overflow: "hidden", animation: "fadeUp .3s ease" }}>
                <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${P.borderL}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: P.txt }}>{plan.name}</div>
                    {plan.price > 0
                      ? <div style={{ fontSize: 15, fontWeight: 700, color: P.main }}>{plan.price.toLocaleString()} <span style={{ fontSize: 11, color: P.txt3, fontWeight: 400 }}>DA</span></div>
                      : <div style={{ fontSize: 14, fontWeight: 600, color: P.success }}>Free</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <Badge label={plan.type} color={tc.color} bg={tc.bg} />
                    <Badge label={`${plan.duration}d`} color={P.txt3} bg={P.borderL} />
                  </div>
                  <div style={{ fontSize: 13, color: P.txt2, lineHeight: 1.5 }}>{plan.desc}</div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 }}>
                      <span style={{ color: P.txt3 }}>{PREDEFINED_FEATURES.find(pf => pf.key === f.key)?.label || f.key}</span>
                      <span style={{ color: f.val === "true" ? P.success : f.val === "false" ? P.error : P.txt, fontWeight: 500 }}>{f.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0 20px 16px", display: "flex", gap: 6 }}>
                  <Btn small variant="outline" icon={<Pencil size={11} />} onClick={() => setEditPlan({ ...plan })}>Edit</Btn>
                </div>
              </Card>
            );
          })}
          <div onClick={() => setShowNew(true)} style={{ background: P.bg, border: `2px dashed ${P.border}`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:220, transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P.main; e.currentTarget.style.background = P.mainL; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bg; }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: P.mainL, display: "flex", alignItems: "center", justifyContent: "center", color: P.main }}><Plus size={18} /></div>
            <span style={{ fontSize: 13, color: P.txt3, fontWeight: 500 }}>New Plan</span>
          </div>
        </div>
      )}
    </div>
  );
}

