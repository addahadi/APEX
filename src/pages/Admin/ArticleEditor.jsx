import { useState, useEffect } from "react";
import { Save, FileText, Globe } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { P, ART_TYPE_CONF, ART_STATUS_CONF, uid, slugify } from "@/lib/design-tokens";
import { INIT_ARTICLES, INIT_TAGS } from "@/mock/mock-data";
import { Btn, Card, Field } from "@/components/admin/ui-atoms";

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [editing, setEditing] = useState({ id:uid(), title:"", slug:"", excerpt:"", type:"BLOG", status:"DRAFT", tags:[], likes:0, saves:0 });
  const [tags] = useState(INIT_TAGS);

  useEffect(() => {
    if (id) {
      const art = INIT_ARTICLES.find(a => a.id === id);
      if (art) setEditing({...art});
    }
  }, [id]);

  const saveArt = () => {
    // Save logic goes here.
    navigate("/admin/articles");
  };

  return (
    <div style={{ padding:"28px 30px", flex:1, overflowY:"auto", animation:"fadeUp .3s ease" }}>
      <div style={{ display:"flex", borderBottom:`1px solid ${P.border}`, marginBottom:24 }}>
        <span style={{ padding:"10px 20px", borderBottom:`2px solid ${P.main}`, color:P.main, fontSize:14, fontFamily:"Inter,sans-serif", fontWeight:600 }}>✏️ {isNew ? "New Article" : editing.title?.slice(0,28)|| "…"}</span>
      </div>
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Field label="Title (EN)" value={editing.title} onChange={v=>setEditing(e=>({...e,title:v,slug:slugify(v)}))} placeholder="Article title…" />
          <div><div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Slug (auto)</div><div style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:7, padding:"8px 11px", fontSize:13, color:P.txt3, fontFamily:"monospace" }}>{editing.slug||"slug-will-appear-here"}</div></div>
          <div>
            <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Excerpt</div>
            <textarea value={editing.excerpt} onChange={e=>setEditing(v=>({...v,excerpt:e.target.value}))} rows={3} placeholder="Short description…"
              style={{ width:"100%", background:P.surface, border:`1.5px solid ${P.border}`, borderRadius:7, padding:"9px 11px", color:P.txt, fontSize:13, fontFamily:"Inter,sans-serif", outline:"none", resize:"vertical" }}
              onFocus={e=>e.target.style.borderColor=P.main} onBlur={e=>e.target.style.borderColor=P.border} />
          </div>
          <Card style={{ padding:"20px", minHeight:160, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, background:P.bg, border:`2px dashed ${P.border}` }}>
            <FileText size={28} color={P.txt3} /><span style={{ fontSize:12, color:P.txt3 }}>Rich text editor placeholder</span>
          </Card>
          <div style={{ display:"flex", gap:8 }}>
            <Btn icon={<Save size={13}/>} onClick={saveArt}>{isNew?"Create":"Save"} Article</Btn>
            <Btn variant="outline" color={P.success} icon={<Globe size={13}/>} onClick={()=>{setEditing(v=>({...v,status:"PUBLISHED"}));setTimeout(saveArt,0);}}>Save & Publish</Btn>
            <Btn variant="ghost" onClick={()=>navigate("/admin/articles")}>Cancel</Btn>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ padding:16 }}>
            <div style={{ fontSize:12, color:P.txt2, fontWeight:600, marginBottom:12, textTransform:"uppercase", letterSpacing:.5 }}>Metadata</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:P.txt2, marginBottom:6, fontWeight:500 }}>Type</div>
              <div style={{ display:"flex", gap:6 }}>{["BLOG","ACTUALITE"].map(t=>{const tc=ART_TYPE_CONF[t];return <button key={t} onClick={()=>setEditing(v=>({...v,type:t}))} style={{ flex:1, padding:"7px", borderRadius:7, cursor:"pointer", border:`1.5px solid ${editing.type===t?tc.color+"88":P.border}`, background:editing.type===t?tc.bg:P.surface, color:editing.type===t?tc.color:P.txt3, fontSize:12, fontFamily:"Inter,sans-serif", fontWeight:600, transition:"all .12s" }}>{t}</button>;})}</div>
            </div>
            <div>
              <div style={{ fontSize:12, color:P.txt2, marginBottom:6, fontWeight:500 }}>Status</div>
              <div style={{ display:"flex", gap:6 }}>{["DRAFT","PUBLISHED"].map(s=>{const sc=ART_STATUS_CONF[s];return <button key={s} onClick={()=>setEditing(v=>({...v,status:s}))} style={{ flex:1, padding:"7px", borderRadius:7, cursor:"pointer", border:`1.5px solid ${editing.status===s?sc.color+"88":P.border}`, background:editing.status===s?sc.bg:P.surface, color:editing.status===s?sc.color:P.txt3, fontSize:12, fontFamily:"Inter,sans-serif", fontWeight:600, transition:"all .12s" }}>{s}</button>;})}</div>
            </div>
          </Card>
          <Card style={{ padding:16 }}>
            <div style={{ fontSize:12, color:P.txt2, fontWeight:600, marginBottom:10, textTransform:"uppercase", letterSpacing:.5 }}>Tags</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {tags.map(t=>{const sel=editing.tags.includes(t.id);return <button key={t.id} onClick={()=>setEditing(v=>({...v,tags:sel?v.tags.filter(x=>x!==t.id):[...v.tags,t.id]}))} style={{ padding:"3px 10px", borderRadius:20, cursor:"pointer", border:`1.5px solid ${sel?P.main:P.border}`, background:sel?P.mainL:P.surface, color:sel?P.main:P.txt3, fontSize:12, transition:"all .12s" }}>{t.name}</button>;})}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
