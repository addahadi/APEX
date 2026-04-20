import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil, Trash2, Save } from "lucide-react";
import { P, uid, mAllNodes } from "@/lib/design-tokens";
import { Badge, Btn, Card, Sel, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Services() {
  const { 
    services, setServices, 
    units, unitsLoading,
    tree, treeLoading,
    search 
  } = useOutletContext();
  
  const [showNew, setShowNew] = useState(false);
  const [newSvc, setNewSvc] = useState({
    service_name_en: "", service_name_ar: "", category: "",
    unit_id: "",
    equipment_cost: 0, manpower_cost: 0, install_labor_price: 0,
  });

  const leafCategories = mAllNodes(tree)
    .filter(n => !n.children?.length)
    .map(n => ({ v: n.name_en || n.name, l: n.name_en || n.name }));

  const filteredSvc = services.filter(s =>
    s.service_name_en.toLowerCase().includes(search.toLowerCase())
  );

  if (treeLoading || unitsLoading) return <div style={{ padding: 40, textAlign: "center", color: P.txt3 }}>Loading…</div>;

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn icon={<Pencil size={13} />} onClick={() => setShowNew(true)}>Add Service</Btn>
      </div>

      {showNew && (
        <Card style={{ padding: 24, marginBottom: 20, animation: "fadeUp .2s ease" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 18 }}>New Service</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <Field label="Name (EN)" value={newSvc.service_name_en} onChange={v => setNewSvc(s => ({ ...s, service_name_en: v }))} placeholder="Excavation Works…" />
            <Field label="Name (AR)" value={newSvc.service_name_ar} onChange={v => setNewSvc(s => ({ ...s, service_name_ar: v }))} placeholder="اسم الخدمة…" />
            <Sel label="Category" value={newSvc.category} onChange={v => setNewSvc(s => ({ ...s, category: v }))} options={leafCategories} />
            <Sel label="Unit" value={newSvc.unit_id}
              onChange={v => setNewSvc(s => ({ ...s, unit_id: v }))}
              options={units.map(u => ({ v: u.unit_id, l: `${u.name_en} (${u.symbol})` }))} />
            <Field label="Equipment Cost (DA)" value={newSvc.equipment_cost} onChange={v => setNewSvc(s => ({ ...s, equipment_cost: Number(v) || 0 }))} type="number" />
            <Field label="Manpower Cost (DA)" value={newSvc.manpower_cost} onChange={v => setNewSvc(s => ({ ...s, manpower_cost: Number(v) || 0 }))} type="number" />
            <div>
              <Field label="Install Labor (DA)" value={newSvc.install_labor_price} onChange={v => setNewSvc(s => ({ ...s, install_labor_price: Number(v) || 0 }))} type="number" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon={<Save size={13} />} onClick={() => {
              setServices(sv => [...sv, { ...newSvc, id: uid() }]);
              setShowNew(false);
              setNewSvc({ service_name_en: "", service_name_ar: "", category: "", unit_id: "", equipment_cost: 0, manpower_cost: 0, install_labor_price: 0 });
            }}>Save Service</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Service", "Category", "Unit", "Equipment (DA)", "Manpower (DA)", "Install Labor", "Actions"].map(h => (
                <TH key={h}>{h}</TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSvc.map(s => {
              const unitSymbol = units.find(u => u.unit_id === s.unit_id)?.symbol || s.unit_en || "—";
              return (
                <tr key={s.id} style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = P.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <TD>
                    <div style={{ fontWeight: 600, color: P.txt }}>{s.service_name_en}</div>
                    <div style={{ fontSize: 11, color: P.txt3, marginTop: 2 }}>{s.service_name_ar}</div>
                  </TD>
                  <TD><Badge label={s.category || "—"} /></TD>
                  <TD>{unitSymbol}</TD>
                  <TD>{s.equipment_cost.toLocaleString()}</TD>
                  <TD>{s.manpower_cost.toLocaleString()}</TD>
                  <TD style={{ color: s.install_labor_price > 0 ? P.txt : P.txt3 }}>
                    {s.install_labor_price > 0 ? s.install_labor_price.toLocaleString() : "—"}
                  </TD>
                  <TD>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="outline" icon={<Pencil size={11} />}>Edit</Btn>
                      <Btn small variant="danger" icon={<Trash2 size={11} />} onClick={() => setServices(sv => sv.filter(x => x.id !== s.id))} />
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredSvc.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: P.txt3, fontSize: 13 }}>
            No services found.
          </div>
        )}
      </Card>
    </>
  );
}

