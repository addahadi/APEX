import { useState } from "react";
import { Plus, Pencil, Trash2, Ban, CheckCircle, Heart, Bookmark } from "lucide-react";
import { P, STATUS_CONF, PLAN_CONF, TYPE_CONF, SUB_CONF } from "@/lib/design-tokens";
import { USERS as INIT_USERS } from "@/mock/mock-data";
import { Badge, Btn, Avatar, Card, SectionTitle, SearchInput, Sel, TH, TD, TabBar } from "@/components/admin/ui-atoms";

export default function UsersPage() {
  const [users, setUsers]     = useState(INIT_USERS);
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("All");
  const [planF, setPlanF]     = useState("All");
  const [detail, setDetail]   = useState(null);
  const [tab, setTab]         = useState("profile");
  const filtered = users.filter(u=>{
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mst = statusF==="All" || u.status===statusF.toLowerCase();
    const mp  = planF==="All"   || u.plan===planF;
    return ms && mst && mp;
  });
  const toggleBan = (id, s) => { setUsers(us=>us.map(u=>u.id===id?{...u,status:s}:u)); if(detail?.id===id) setDetail(d=>d?{...d,status:s}:d); };
  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
      <div style={{ flex:1, padding:"28px 30px", overflowY:"auto", animation:"fadeUp .3s ease" }}>
        <SectionTitle title="Users" subtitle={`${users.length} total accounts`} action={<Btn icon={<Plus size={14}/>}>Invite User</Btn>} />
        <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:220 }}><SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" /></div>
          <Sel value={statusF} onChange={setStatusF} options={["All","Active","Banned","Suspended"]} />
          <Sel value={planF}   onChange={setPlanF}   options={["All","Free","Pro","Enterprise"]} />
        </div>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["User","Status","Plan","Type","Subscription","Joined","End Date"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {filtered.map(u=>{
                const sc = STATUS_CONF[u.status]||STATUS_CONF.active;
                const pc = PLAN_CONF[u.plan]||PLAN_CONF.Free;
                const tc = TYPE_CONF[u.planType]||TYPE_CONF.NORMAL;
                const sbc= SUB_CONF[u.subStatus]||SUB_CONF.INACTIVE;
                return (
                  <tr key={u.id} onClick={()=>{setDetail(u);setTab("profile");}}
                    style={{ borderTop:`1px solid ${P.borderL}`, cursor:"pointer", transition:"background .12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar initials={u.avatar} size={32}/><div><div style={{ fontWeight:600 }}>{u.name}</div><div style={{ fontSize:11, color:P.txt3 }}>{u.email}</div></div></div></TD>
                    <TD><Badge label={sc.label} color={sc.color} bg={sc.bg}/></TD>
                    <TD><Badge label={u.plan} color={pc.color} bg={pc.bg}/></TD>
                    <TD><Badge label={u.planType} color={tc.color} bg={tc.bg}/></TD>
                    <TD><Badge label={u.subStatus} color={sbc.color} bg={sbc.bg}/></TD>
                    <TD style={{ color:P.txt3, fontSize:12 }}>{u.joined}</TD>
                    <TD style={{ color:P.txt3, fontSize:12 }}>{u.endDate}</TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{ padding:40, textAlign:"center", color:P.txt3, fontSize:13 }}>No users match your filters.</div>}
        </Card>
      </div>
      {detail && (
        <div style={{ width:360, borderLeft:`1px solid ${P.border}`, background:P.surface, overflowY:"auto", animation:"slideIn .2s ease", flexShrink:0 }}>
          <div style={{ padding:"24px 22px 16px", borderBottom:`1px solid ${P.borderL}`, display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center" }}>
            <Avatar initials={detail.avatar} size={56} />
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:P.txt }}>{detail.name}</div>
              <div style={{ fontSize:12, color:P.txt3 }}>{detail.email}</div>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              <Badge label={(STATUS_CONF[detail.status]||STATUS_CONF.active).label} color={(STATUS_CONF[detail.status]||STATUS_CONF.active).color} bg={(STATUS_CONF[detail.status]||STATUS_CONF.active).bg}/>
              <Badge label={detail.plan} color={(PLAN_CONF[detail.plan]||PLAN_CONF.Free).color} bg={(PLAN_CONF[detail.plan]||PLAN_CONF.Free).bg}/>
            </div>
            <button onClick={()=>setDetail(null)} style={{ position:"absolute", right:12, top:12, background:"none", border:"none", cursor:"pointer", color:P.txt3, fontSize:18 }}>×</button>
          </div>
          <TabBar tabs={[{k:"profile",l:"Profile"},{k:"engagement",l:"Engagement"}]} active={tab} onSelect={setTab} />
          <div style={{ padding:"0 22px 22px" }}>
            {tab==="profile"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Card style={{ padding:14 }}>
                  {[{l:"Plan",v:detail.plan},{l:"Type",v:detail.planType},{l:"Sub Status",v:detail.subStatus},{l:"Joined",v:detail.joined},{l:"End Date",v:detail.endDate}].map(r=>(
                    <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${P.borderL}`, fontSize:13 }}>
                      <span style={{ color:P.txt3 }}>{r.l}</span>
                      <span style={{ color:P.txt, fontWeight:500 }}>{r.v}</span>
                    </div>
                  ))}
                </Card>
                <div style={{ display:"flex", gap:6 }}>
                  {detail.status==="active"
                    ? <Btn variant="danger" icon={<Ban size={13}/>} onClick={()=>toggleBan(detail.id,"banned")}>Ban User</Btn>
                    : <Btn variant="outline" color={P.success} icon={<CheckCircle size={13}/>} onClick={()=>toggleBan(detail.id,"active")}>Unban</Btn>}
                  <Btn variant="ghost" icon={<Trash2 size={13}/>}>Delete</Btn>
                </div>
              </div>
            )}
            {tab==="engagement"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {[{label:"Liked Articles",icon:<Heart size={14}/>,color:P.pink,items:["Béton armé C25","Calcul de charge"]},{label:"Saved Articles",icon:<Bookmark size={14}/>,color:P.purple,items:["Guide fondations","Isolation thermique"]}].map(s=>(
                  <div key={s.label}>
                    <div style={{ fontSize:12, color:P.txt2, fontWeight:600, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}><span style={{ color:s.color }}>{s.icon}</span>{s.label}</div>
                    {s.items.map((a,i)=><div key={i} style={{ padding:"8px 12px", background:P.bg, border:`1px solid ${P.border}`, borderRadius:7, marginBottom:6, fontSize:13, color:P.txt }}>{a}</div>)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
