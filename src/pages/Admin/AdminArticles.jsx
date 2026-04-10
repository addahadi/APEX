import { useState } from "react";
import { Plus, Pencil, Trash2, Globe, Archive, Tag, Heart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { P, ART_TYPE_CONF, ART_STATUS_CONF } from "@/lib/design-tokens";
import { INIT_ARTICLES as ARTICLES_DATA, INIT_TAGS as TAGS_DATA } from "@/mock/mock-data";
import { Badge, Btn, Card, SectionTitle, SearchInput, Sel, TH, TD } from "@/components/admin/ui-atoms";

export default function AdminArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(ARTICLES_DATA);
  const [tags]                  = useState(TAGS_DATA);
  const [search, setSearch]     = useState("");
  const [typeF, setTypeF]       = useState("All");
  const [statusF, setStatusF]   = useState("All");

  const filtered = articles.filter(a => {
    const ms = a.title.toLowerCase().includes(search.toLowerCase());
    const mt = typeF==="All"||a.type===typeF;
    const ms2= statusF==="All"||a.status===statusF;
    return ms&&mt&&ms2;
  });

  const publish  = (id) => setArticles(aa=>aa.map(a=>a.id===id?{...a,status:"PUBLISHED"}:a));
  const archive  = (id) => setArticles(aa=>aa.map(a=>a.id===id?{...a,status:"DRAFT"}:a));
  const deleteA  = (id) => setArticles(aa=>aa.filter(a=>a.id!==id));
  const tagName  = (id) => tags.find(t=>t.id===id)?.name||id;

  return (
    <div style={{ padding:"28px 30px", flex:1, overflowY:"auto", animation:"fadeUp .3s ease" }}>
      <SectionTitle title="Articles" subtitle="Content management & tags"
        action={
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" icon={<Tag size={13}/>} onClick={()=>navigate("/admin/articles/tags")}>Manage Tags</Btn>
            <Btn icon={<Plus size={13}/>} onClick={()=>navigate("/admin/articles/new")}>New Article</Btn>
          </div>
        } 
      />
      <div style={{ display:"flex", borderBottom:`1px solid ${P.border}`, marginBottom:24 }}>
        <button style={{ padding:"10px 20px", background:"none", border:"none", borderBottom:`2px solid ${P.main}`, color:P.main, fontSize:14, fontFamily:"Inter,sans-serif", fontWeight:600, marginBottom:-1 }}>All Articles</button>
      </div>
      <div>
        <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}><SearchInput value={search} onChange={setSearch} placeholder="Search title…" /></div>
          <Sel value={typeF}   onChange={setTypeF}   options={["All","BLOG","ACTUALITE"]} />
          <Sel value={statusF} onChange={setStatusF} options={["All","PUBLISHED","DRAFT"]} />
        </div>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Title","Type","Status","Tags","Likes","Saves","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {filtered.map(a=>{
                const tc = ART_TYPE_CONF[a.type]||ART_TYPE_CONF.BLOG;
                const sc = ART_STATUS_CONF[a.status]||ART_STATUS_CONF.DRAFT;
                return (
                  <tr key={a.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD style={{ maxWidth:280 }}>
                      <div style={{ fontWeight:600, color:P.txt, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</div>
                      <div style={{ fontSize:11, color:P.txt3, marginTop:2 }}>{a.excerpt.slice(0,55)}…</div>
                    </TD>
                    <TD><Badge label={a.type} color={tc.color} bg={tc.bg} /></TD>
                    <TD><Badge label={a.status} color={sc.color} bg={sc.bg} /></TD>
                    <TD><div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{a.tags.slice(0,2).map(tid=><Badge key={tid} label={tagName(tid)} color={P.txt3} bg={P.borderL}/>)}{a.tags.length>2&&<Badge label={`+${a.tags.length-2}`} color={P.txt3} bg={P.borderL}/>}</div></TD>
                    <TD><span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:P.pink }}><Heart size={12}/>{a.likes}</span></TD>
                    <TD><span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:P.purple }}><Bookmark size={12}/>{a.saves}</span></TD>
                    <TD>
                      <div style={{ display:"flex", gap:5 }}>
                        <Btn small variant="outline" icon={<Pencil size={11}/>} onClick={()=>navigate(`/admin/articles/${a.id}/edit`)}>Edit</Btn>
                        {a.status==="DRAFT"
                          ?<Btn small variant="outline" color={P.success} icon={<Globe size={11}/>} onClick={()=>publish(a.id)}>Publish</Btn>
                          :<Btn small variant="ghost" icon={<Archive size={11}/>} onClick={()=>archive(a.id)}>Archive</Btn>}
                        <Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>deleteA(a.id)}/>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{ padding:40, textAlign:"center", color:P.txt3, fontSize:13 }}>No articles match your filters.</div>}
        </Card>
      </div>
    </div>
  );
}
