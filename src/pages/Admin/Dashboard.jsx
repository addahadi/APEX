import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CreditCard, TrendingUp, FolderOpen, Bot, Boxes, DollarSign, Heart, Bookmark } from "lucide-react";
import { P, AI_TYPE_CONF } from "@/lib/design-tokens";
import { INIT_RESOURCES, INIT_SERVICES, INIT_FINANCIAL, AI_USAGE, newUsersData, revenueData, ACTIVITY } from "@/mock/mock-data";
import { Badge, Card, SectionTitle, ChartTip, KpiCard } from "@/components/admin/ui-atoms";

export default function Dashboard() {
  const aiBreakdown = ["QUERY","RECOMMENDATION","ANALYSIS"].map(t=>({ name:t, val:AI_USAGE.filter(a=>a.usage_type===t).length }));
  return (
    <div style={{ padding:"28px 30px", animation:"fadeUp .3s ease" }}>
      <SectionTitle title="Dashboard" subtitle="Live platform overview" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <KpiCard label="Total Users"    value="192"  sub="↑ 14 this month" icon={<Users size={16}/>}        color={P.main}    delay={0}   />
        <KpiCard label="Active Subs"    value="72"   sub="↑ 6 this month"  icon={<CreditCard size={16}/>}    color={P.success} delay={.05} />
        <KpiCard label="Monthly Rev."   value="189K" sub="↑ 9.6% vs Feb"   icon={<TrendingUp size={16}/>}    color={P.warn}    delay={.1}  />
        <KpiCard label="Total Projects" value="437"  sub="↑ 23 this week"  icon={<FolderOpen size={16}/>}    color={P.purple}  delay={.15} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
        <KpiCard label="AI Queries (Today)" value={AI_USAGE.filter(a=>a.usage_date==="2026-04-09").length} sub="↑ 3 vs yesterday" icon={<Bot size={16}/>}      color={P.cyan}   delay={.2} />
        <KpiCard label="Resources Listed"   value={INIT_RESOURCES.length+INIT_SERVICES.length} sub="Materials & services"    icon={<Boxes size={16}/>}    color={P.orange} delay={.25} />
        <KpiCard label="Exchange Rate"      value="155.82" sub={`Market factor ×${INIT_FINANCIAL.market_factor}`}            icon={<DollarSign size={16}/>} color={P.success} delay={.3} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:14, marginBottom:14 }}>
        <Card style={{ padding:"18px 20px" }}>
          <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:14 }}>NEW USERS · MARCH 2026</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={newUsersData}>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:P.txt3, fontFamily:"Inter" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTip unit=" users" />} />
              <Line type="monotone" dataKey="v" stroke={P.main} strokeWidth={2.5} dot={{ r:3, fill:P.main }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding:"18px 20px" }}>
          <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:14 }}>MONTHLY REVENUE (DA)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData}>
              <XAxis dataKey="m" tick={{ fontSize:11, fill:P.txt3, fontFamily:"Inter" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTip unit=" DA" />} />
              <Bar dataKey="v" fill={P.main} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card style={{ padding:"18px 20px" }}>
          <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:14 }}>RECENT ACTIVITY</div>
          {ACTIVITY.map((a,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<ACTIVITY.length-1?`1px solid ${P.borderL}`:"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, flexShrink:0 }} />
              <div style={{ flex:1, fontSize:13, color:P.txt }}>
                <span style={{ fontWeight:600, color:a.color }}>{a.user}</span> {a.action} <span style={{ color:P.txt2 }}>{a.entity}</span>
              </div>
              <span style={{ fontSize:11, color:P.txt3, whiteSpace:"nowrap" }}>{a.time}</span>
            </div>
          ))}
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:10 }}>PLAN BREAKDOWN</div>
            {[{name:"Free",val:120,color:P.txt3},{name:"Pro",val:54,color:P.main},{name:"Enterprise",val:18,color:P.purple}].map(p=>(
              <div key={p.name} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:P.txt2, fontWeight:500 }}>{p.name}</span>
                  <span style={{ color:P.txt, fontWeight:600 }}>{p.val}</span>
                </div>
                <div style={{ height:5, background:P.bg, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(p.val/192)*100}%`, background:p.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </Card>
          <Card style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:10 }}>AI USAGE BREAKDOWN</div>
            {aiBreakdown.map(a=>{
              const c = AI_TYPE_CONF[a.name];
              return (
                <div key={a.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <Badge label={a.name} color={c.color} bg={c.bg} />
                  <span style={{ fontSize:14, fontWeight:700, color:P.txt }}>{a.val}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}
