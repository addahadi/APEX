import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { P, uid } from "@/lib/design-tokens";
import { INIT_TAGS } from "@/mock/mock-data";
import { Btn, Card, Field, TH, TD } from "@/components/admin/ui-atoms";

export default function Tags() {
  const [tags, setTags]     = useState(INIT_TAGS);
  const [newTag, setNewTag] = useState("");

  const addTag   = () => { if(!newTag.trim()) return; setTags(tt=>[...tt,{id:uid(),name:newTag.trim()}]); setNewTag(""); };

  return (
    <div style={{ padding:"28px 30px", flex:1, overflowY:"auto", animation:"fadeUp .3s ease" }}>
      <div style={{ display:"flex", borderBottom:`1px solid ${P.border}`, marginBottom:24 }}>
        <button style={{ padding:"10px 20px", background:"none", border:"none", borderBottom:`2px solid ${P.main}`, color:P.main, fontSize:14, fontFamily:"Inter,sans-serif", fontWeight:600, marginBottom:-1 }}>Manage Tags</button>
      </div>
      <div style={{ maxWidth:560 }}>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <div style={{ flex:1 }}><Field placeholder="New tag name…" value={newTag} onChange={setNewTag} /></div>
          <Btn icon={<Plus size={13}/>} onClick={addTag}>Add Tag</Btn>
        </div>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Tag Name","ID","Action"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {tags.map(t=>(
                <tr key={t.id} style={{ borderTop:`1px solid ${P.borderL}` }}>
                  <TD style={{ fontWeight:600 }}>{t.name}</TD>
                  <TD style={{ fontFamily:"monospace", color:P.txt3, fontSize:12 }}>{t.id}</TD>
                  <TD><Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>setTags(tt=>tt.filter(x=>x.id!==t.id))}/></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
