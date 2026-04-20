import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil, Trash2, Save } from "lucide-react";
import { P, uid } from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Units() {
  const { units, setUnits } = useOutletContext();
  const [showNew, setShowNew] = useState(false);
  const [newUnit, setNewUnit] = useState({ name_en: "", name_ar: "", symbol: "" });

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn icon={<Pencil size={13} />} onClick={() => setShowNew(true)}>Add Unit</Btn>
      </div>

      {showNew && (
        <Card style={{ padding: 24, marginBottom: 20, animation: "fadeUp .2s ease" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 18 }}>New Unit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <Field label="Name (EN)" value={newUnit.name_en} onChange={v => setNewUnit(u => ({ ...u, name_en: v }))} placeholder="Meter" />
            <Field label="Name (AR)" value={newUnit.name_ar} onChange={v => setNewUnit(u => ({ ...u, name_ar: v }))} placeholder="متر" />
            <Field label="Symbol" value={newUnit.symbol} onChange={v => setNewUnit(u => ({ ...u, symbol: v }))} placeholder="m" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon={<Save size={13} />} onClick={() => {
              setUnits(us => [...us, { ...newUnit, id: uid() }]);
              setShowNew(false);
              setNewUnit({ name_en: "", name_ar: "", symbol: "" });
            }}>Save Unit</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name (EN)", "Name (AR)", "Symbol", "Actions"].map(h => <TH key={h}>{h}</TH>)}
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = P.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <TD>{u.name_en}</TD>
                <TD>{u.name_ar}</TD>
                <TD>
                  <Badge label={u.symbol} color={P.cyan} bg={P.cyanL} />
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small variant="outline" icon={<Pencil size={11} />}>Edit</Btn>
                    <Btn small variant="danger" icon={<Trash2 size={11} />} onClick={() => setUnits(us => us.filter(x => x.id !== u.id))} />
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
        {units.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: P.txt3, fontSize: 13 }}>
            No units found.
          </div>
        )}
      </Card>
    </div>
  );
}