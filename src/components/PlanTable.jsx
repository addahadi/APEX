import React from "react";
import { P } from "../lib/design-tokens";

export default function PlanTable({ data }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${P.border}`, background: P.surface }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ background: P.bg }}>
            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 14, color: P.txt3, fontWeight: 600, borderBottom: `1px solid ${P.border}` }}>Features</th>
            <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: P.txt3, fontWeight: 600, borderBottom: `1px solid ${P.border}` }}>Normal User</th>
            <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: P.main, fontWeight: 700, borderBottom: `1px solid ${P.border}` }}>Company</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: i === data.length - 1 ? "none" : `1px solid ${P.border}` }}>
              <td style={{ padding: "16px 24px", fontSize: 14, color: P.txt, fontWeight: 500 }}>
                {row.feature}
              </td>
              <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: P.txt2 }}>
                {row.normal === "check" ? "✓" : row.normal === "remove" ? "—" : row.normal}
              </td>
              <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: P.txt, fontWeight: row.highlight ? 700 : 500, background: `${P.main}08` }}>
                {row.company === "check" ? "✓" : row.company === "remove" ? "—" : row.company}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
