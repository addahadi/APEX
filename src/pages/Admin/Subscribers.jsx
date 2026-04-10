import { useState } from "react";
import { P, TYPE_CONF, PLAN_CONF, SUB_CONF } from "@/lib/design-tokens";
import { SUBS } from "@/mock/mock-data";
import { Badge, Avatar, Card, SearchInput, Sel, TH, TD } from "@/components/admin/ui-atoms";

export default function Subscribers() {
  const [subs]                = useState(SUBS);
  const [statusF, setStatusF] = useState("All");
  const filteredSubs = subs.filter(s=>statusF==="All"||s.status===statusF);

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        <div style={{ flex:1 }}><SearchInput placeholder="Search by name or email…" value="" onChange={()=>{}} /></div>
        <Sel value={statusF} onChange={setStatusF} options={["All","ACTIVE","INACTIVE"]} />
      </div>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["User","Plan","Type","Status","Start Date","End Date"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filteredSubs.map(s=>(
              <tr key={s.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar initials={s.user.split(" ").map(n=>n[0]).join("")} size={30} />
                    <div><div style={{ fontWeight:600 }}>{s.user}</div><div style={{ fontSize:11, color:P.txt3 }}>{s.email}</div></div>
                  </div>
                </TD>
                <TD><Badge label={s.plan} color={(PLAN_CONF[s.plan]||PLAN_CONF.Free).color} bg={(PLAN_CONF[s.plan]||PLAN_CONF.Free).bg} /></TD>
                <TD><Badge label={s.type} color={(TYPE_CONF[s.type]||TYPE_CONF.NORMAL).color} bg={(TYPE_CONF[s.type]||TYPE_CONF.NORMAL).bg} /></TD>
                <TD><Badge label={s.status} color={(SUB_CONF[s.status]||SUB_CONF.INACTIVE).color} bg={(SUB_CONF[s.status]||SUB_CONF.INACTIVE).bg} /></TD>
                <TD style={{ color:P.txt3, fontSize:12 }}>{s.start}</TD>
                <TD style={{ color:P.txt3, fontSize:12 }}>{s.end}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
