import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { P, uid } from "@/lib/design-tokens";
import { INIT_UNITS } from "@/mock/mock-data";
import { Btn, Card, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Units() {
  const [units, setUnits] = useState(INIT_UNITS);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name_en:"", name_ar:"", symbol:"" });

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ marginBottom:16, display:"flex", justifyContent:"flex-end" }}>
        <Btn icon={<Plus size={13}/>} onClick={()=>setShowNewUnit(true)}>Add Unit</Btn>
      </div>

      {showNewUnit&&(
        <Card style={{ padding:22, marginBottom:20, animation:"fadeUp .2s ease", maxWidth:440 }}>
          <div style={{ fontSize:15, fontWeight:700, color:P.txt, marginBottom:16 }}>New Unit</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 100px", gap:12, marginBottom:12 }}>
            <Field label="Name (EN)" value={newUnit.name_en} onChange={v=>setNewUnit(u=>({...u,name_en:v}))} placeholder="Meter" />
            <Field label="Name (AR)" value={newUnit.name_ar} onChange={v=>setNewUnit(u=>({...u,name_ar:v}))} placeholder="متر" />
            <Field label="Symbol" value={newUnit.symbol} onChange={v=>setNewUnit(u=>({...u,symbol:v}))} placeholder="m" />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn icon={<Save size={13}/>} onClick={()=>{setUnits(us=>[...us,{...newUnit,id:uid()}]);setShowNewUnit(false);setNewUnit({name_en:"",name_ar:"",symbol:""});}}>Save Unit</Btn>
            <Btn variant="ghost" onClick={()=>setShowNewUnit(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card style={{ maxWidth:560 }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Name (EN)","Name (AR)","Symbol","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {units.map(u=>(
              <tr key={u.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD style={{ fontWeight:600 }}>{u.name_en}</TD>
                <TD style={{ direction:"rtl", color:P.txt2 }}>{u.name_ar}</TD>
                <TD><span style={{ fontFamily:"monospace", fontSize:13, color:P.main, background:P.mainL, padding:"2px 8px", borderRadius:5 }}>{u.symbol}</span></TD>
                <TD><div style={{ display:"flex", gap:5 }}><Btn small variant="outline" icon={<Pencil size={11}/>}>Edit</Btn><Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>setUnits(us=>us.filter(x=>x.id!==u.id))}/></div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
