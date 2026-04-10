import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { P, uid } from "@/lib/design-tokens";
import { INIT_RESOURCES, INIT_UNITS } from "@/mock/mock-data";
import { Badge, Btn, Card, SearchInput, Sel, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Materials() {
  const [resources, setResources] = useState(INIT_RESOURCES);
  const [units]                   = useState(INIT_UNITS);
  const [search, setSearch]       = useState("");
  const [showNewRes, setShowNewRes] = useState(false);
  const [newRes, setNewRes] = useState({ material_name_en:"", material_name_ar:"", category:"", unit_id:"un1", min_price_usd:0, max_price_usd:0, unit_price_usd:0, default_waste_factor:0 });

  const filteredRes = resources.filter(r=>r.material_name_en.toLowerCase().includes(search.toLowerCase())||r.material_name_ar.includes(search));
  const unitSymbol  = (id) => units.find(u=>u.id===id)?.symbol||"—";

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ maxWidth:360, flex:1 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search materials…" />
        </div>
        <Btn icon={<Plus size={13}/>} onClick={()=>setShowNewRes(true)}>Add Material</Btn>
      </div>

      {showNewRes&&(
        <Card style={{ padding:22, marginBottom:20, animation:"fadeUp .2s ease" }}>
          <div style={{ fontSize:15, fontWeight:700, color:P.txt, marginBottom:16 }}>New Material</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Name (EN)" value={newRes.material_name_en} onChange={v=>setNewRes(r=>({...r,material_name_en:v}))} placeholder="Portland Cement…" />
            <Field label="Name (AR)" value={newRes.material_name_ar} onChange={v=>setNewRes(r=>({...r,material_name_ar:v}))} placeholder="اسم المادة…" />
            <Field label="Category" value={newRes.category} onChange={v=>setNewRes(r=>({...r,category:v}))} placeholder="Foundations, Finition…" />
            <Sel label="Unit" value={newRes.unit_id} onChange={v=>setNewRes(r=>({...r,unit_id:v}))} options={units.map(u=>({v:u.id,l:`${u.name_en} (${u.symbol})`}))} />
            <Field label="Min Price (USD)" value={String(newRes.min_price_usd)} onChange={v=>setNewRes(r=>({...r,min_price_usd:Number(v)||0}))} type="number" />
            <Field label="Max Price (USD)" value={String(newRes.max_price_usd)} onChange={v=>setNewRes(r=>({...r,max_price_usd:Number(v)||0}))} type="number" />
            <Field label="Unit Price (USD)" value={String(newRes.unit_price_usd)} onChange={v=>setNewRes(r=>({...r,unit_price_usd:Number(v)||0}))} type="number" />
            <Field label="Waste Factor (0–1)" value={String(newRes.default_waste_factor)} onChange={v=>setNewRes(r=>({...r,default_waste_factor:Number(v)||0}))} type="number" placeholder="e.g. 0.05" />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn icon={<Save size={13}/>} onClick={()=>{setResources(rs=>[...rs,{...newRes,id:uid()}]);setShowNewRes(false);setNewRes({material_name_en:"",material_name_ar:"",category:"",unit_id:"un1",min_price_usd:0,max_price_usd:0,unit_price_usd:0,default_waste_factor:0});}}>Save Material</Btn>
            <Btn variant="ghost" onClick={()=>setShowNewRes(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Material","Category","Unit","Price Range (USD)","Unit Price","Waste %","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filteredRes.map(r=>(
              <tr key={r.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD>
                  <div style={{ fontWeight:600 }}>{r.material_name_en}</div>
                  <div style={{ fontSize:11, color:P.txt3, direction:"rtl", marginTop:2 }}>{r.material_name_ar}</div>
                </TD>
                <TD><Badge label={r.category} color={P.txt2} bg={P.borderL}/></TD>
                <TD><span style={{ fontFamily:"monospace", fontSize:12, color:P.main }}>{unitSymbol(r.unit_id)}</span></TD>
                <TD style={{ color:P.txt2, fontSize:13 }}>${r.min_price_usd} – ${r.max_price_usd}</TD>
                <TD style={{ fontWeight:600 }}>${r.unit_price_usd}</TD>
                <TD><Badge label={`${(r.default_waste_factor*100).toFixed(0)}%`} color={r.default_waste_factor>0.07?P.warn:P.success} bg={r.default_waste_factor>0.07?P.warnL:P.successL}/></TD>
                <TD><div style={{ display:"flex", gap:5 }}><Btn small variant="outline" icon={<Pencil size={11}/>}>Edit</Btn><Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>setResources(rs=>rs.filter(x=>x.id!==r.id))}/></div></TD>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRes.length===0&&<div style={{ padding:40, textAlign:"center", color:P.txt3, fontSize:13 }}>No materials found.</div>}
      </Card>
    </div>
  );
}
