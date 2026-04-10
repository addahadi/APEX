import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { PLAN_TYPES as INIT_PLAN_TYPES } from "@/mock/mock-data";
import { Btn, Card, TH, TD } from "@/components/admin/ui-atoms";

export default function PlanTypes() {
  const [planTypes] = useState(INIT_PLAN_TYPES);

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ maxWidth: 560 }}>
        <Card style={{ marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name (EN)", "Name (AR)", "Actions"].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {planTypes.map((pt) => (
                <tr key={pt.id} style={{ borderTop: `1px solid ${P.borderL}` }}>
                  <TD style={{ fontWeight: 600 }}>{pt.name_en}</TD>
                  <TD style={{ color: P.txt2, direction: "rtl" }}>
                    {pt.name_ar}
                  </TD>
                  <TD>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="outline" icon={<Pencil size={11} />}>
                        Edit
                      </Btn>
                      <Btn small variant="danger" icon={<Trash2 size={11} />} />
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Btn icon={<Plus size={13} />}>Add Plan Type</Btn>
      </div>
    </div>
  );
}
