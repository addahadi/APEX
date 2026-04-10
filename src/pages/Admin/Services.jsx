import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { P, uid } from "@/lib/design-tokens";
import { INIT_SERVICES } from "@/mock/mock-data";
import { Badge, Btn, Card, SearchInput, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Services() {
  const [services, setServices] = useState(INIT_SERVICES);
  const [search, setSearch]     = useState("");
  const [showNewSvc, setShowNewSvc] = useState(false);
  const [newSvc, setNewSvc] = useState({ service_name_en:"", service_name_ar:"", category:"", unit_en:"m²", unit_ar:"م²", equipment_cost:0, manpower_cost:0, install_labor_price:0 });

  const filteredSvc = services.filter(s=>s.service_name_en.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ maxWidth:360, flex:1 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search services…" />
        </div>
        <Btn icon={<Plus size={13}/>} onClick={()=>setShowNewSvc(true)}>Add Service</Btn>
      </div>

      {showNewSvc&&(
        <Card style={{ padding:22, marginBottom:20, animation:"fadeUp .2s ease" }}>
          <div style={{ fontSize:15, fontWeight:700, color:P.txt, marginBottom:16 }}>New Service</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Name (EN)" value={newSvc.service_name_en} onChange={v=>setNewSvc(s=>({...s,service_name_en:v}))} placeholder="Excavation Works…" />
            <Field label="Name (AR)" value={newSvc.service_name_ar} onChange={v=>setNewSvc(s=>({...s,service_name_ar:v}))} placeholder="اسم الخدمة…" />
            <Field label="Category" value={newSvc.category} onChange={v=>setNewSvc(s=>({...s,category:v}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="Unit (EN)" value={newSvc.unit_en} onChange={v=>setNewSvc(s=>({...s,unit_en:v}))} placeholder="m²" />
              <Field label="Unit (AR)" value={newSvc.unit_ar} onChange={v=>setNewSvc(s=>({...s,unit_ar:v}))} placeholder="م²" />
            </div>
            <Field label="Equipment Cost (DA)" value={String(newSvc.equipment_cost)} onChange={v=>setNewSvc(s=>({...s,equipment_cost:Number(v)||0}))} type="number" />
            <Field label="Manpower Cost (DA)" value={String(newSvc.manpower_cost)} onChange={v=>setNewSvc(s=>({...s,manpower_cost:Number(v)||0}))} type="number" />
            <div style={{ gridColumn:"1/-1" }}><Field label="Install Labor Price (DA)" value={String(newSvc.install_labor_price)} onChange={v=>setNewSvc(s=>({...s,install_labor_price:Number(v)||0}))} type="number" /></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn icon={<Save size={13}/>} onClick={()=>{setServices(sv=>[...sv,{...newSvc,id:uid()}]);setShowNewSvc(false);setNewSvc({service_name_en:"",service_name_ar:"",category:"",unit_en:"m²",unit_ar:"م²",equipment_cost:0,manpower_cost:0,install_labor_price:0});}}>Save Service</Btn>
            <Btn variant="ghost" onClick={()=>setShowNewSvc(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Service","Category","Unit","Equipment (DA)","Manpower (DA)","Install Labor","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filteredSvc.map(s=>(
              <tr key={s.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD>
                  <div style={{ fontWeight:600 }}>{s.service_name_en}</div>
                  <div style={{ fontSize:11, color:P.txt3, direction:"rtl", marginTop:2 }}>{s.service_name_ar}</div>
                </TD>
                <TD><Badge label={s.category} color={P.txt2} bg={P.borderL}/></TD>
                <TD><span style={{ fontFamily:"monospace", fontSize:12, color:P.main }}>{s.unit_en}</span></TD>
                <TD style={{ fontWeight:600 }}>{s.equipment_cost.toLocaleString()}</TD>
                <TD style={{ fontWeight:600 }}>{s.manpower_cost.toLocaleString()}</TD>
                <TD style={{ color:s.install_labor_price>0?P.txt:P.txt3 }}>{s.install_labor_price > 0 ? s.install_labor_price.toLocaleString() : "—"}</TD>
                <TD><div style={{ display:"flex", gap:5 }}><Btn small variant="outline" icon={<Pencil size={11}/>}>Edit</Btn><Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>setServices(sv=>sv.filter(x=>x.id!==s.id))}/></div></TD>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSvc.length===0&&<div style={{ padding:40, textAlign:"center", color:P.txt3, fontSize:13 }}>No services found.</div>}
      </Card>
    </div>
  );
}
