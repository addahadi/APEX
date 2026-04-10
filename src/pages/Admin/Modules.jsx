import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Plus, Trash2, X, FolderOpen, FolderTree, Hash, FlaskConical, Save, ToggleLeft, ToggleRight, Layers, CheckCircle } from "lucide-react";
import { P, uid, slugify, CAT_LEVEL_CONF, FORMULA_TYPE_CONF, mFindNode, mGetCrumb, mDeleteNode, mUpdateNode, mCountDesc, mAllNodes } from "@/lib/design-tokens";
import { INIT_TREE } from "@/mock/mock-data";
import { Badge, Btn, Card, Field, Sel } from "@/components/admin/ui-atoms";

const FTYPES = ["NUMBER","TEXT","SELECT","BOOLEAN","AREA","VOLUME"];
const ICONS_LIST = ["📂","🏚️","🎨","🚪","⛏️","🏗️","🟦","⬛","🧱","🏛️","🔲","🖌️","▬","▭","⭕","🔧","💧","⚡","🪟","━"];

function ModTreeRow({ node, depth, selected, onSelect, expanded, onToggle, onDelete }) {
  const isExp = expanded.includes(node.id);
  const isSel = selected===node.id;
  const hasC  = node.children?.length > 0;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 8px", borderRadius:7, background:isSel?P.mainL:"transparent", cursor:"pointer", transition:"background .12s", marginLeft:depth*14 }}
        onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=P.bg;}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent";}}>
        <span onClick={()=>{if(hasC)onToggle(node.id);}} style={{ width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:P.txt3, cursor:hasC?"pointer":"default" }}>
          {hasC ? (isExp?<ChevronDown size={12}/>:<ChevronRight size={12}/>) : <span style={{ width:12 }}/>}
        </span>
        <span style={{ fontSize:14 }}>{node.icon}</span>
        <span onClick={()=>onSelect(node.id)} style={{ flex:1, fontSize:13, fontWeight:isSel?600:400, color:isSel?P.main:P.txt, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{node.name_en||node.name}</span>
        {!node.isActive&&<span style={{ width:7, height:7, borderRadius:2, background:P.error, flexShrink:0 }}/>}
        <button onClick={e=>{e.stopPropagation();onDelete(node.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:P.txt4, display:"flex", padding:2, opacity:.6, flexShrink:0 }} onMouseEnter={e=>e.currentTarget.style.color=P.error} onMouseLeave={e=>e.currentTarget.style.color=P.txt4}><X size={11}/></button>
      </div>
      {isExp&&node.children?.map(c=><ModTreeRow key={c.id} node={c} depth={depth+1} selected={selected} onSelect={onSelect} expanded={expanded} onToggle={onToggle} onDelete={onDelete}/>)}
    </div>
  );
}

function ModSection({ title, icon, subtitle, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
        <span style={{ color:P.main }}>{icon}</span>
        <div style={{ fontSize:14, fontWeight:600, color:P.txt }}>{title}</div>
        {subtitle&&<span style={{ fontSize:12, color:P.txt3, marginLeft:4 }}>{subtitle}</span>}
      </div>
      <div style={{ paddingLeft:4 }}>{children}</div>
    </div>
  );
}

export default function Modules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selected = id || null;
  const setSelected = (newId) => {
    if (newId) navigate(`/admin/modules/${newId}`);
    else navigate(`/admin/modules`);
  };

  const [tree, setTree]         = useState(INIT_TREE);
  const [expanded, setExpanded] = useState(["gt","gt-found","fin"]);
  const [showNew, setShowNew]   = useState(false);
  const [newCat, setNewCat]     = useState({ name:"", name_en:"", name_ar:"", icon:"📂", parentId:"", category_level:"MAIN" });
  const [toast, setToast]       = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(null),2500); };
  const toggle    = (id) => setExpanded(e=>e.includes(id)?e.filter(x=>x!==id):[...e,id]);
  const delNode   = (id) => { setTree(t=>mDeleteNode(t,id)); if(selected===id) setSelected(null); showToast("Category deleted"); };
  const patchNode = (id, patch) => { setTree(t=>mUpdateNode(t,id,patch)); showToast("Saved"); };
  const node      = selected ? mFindNode(tree,selected) : null;
  const crumb     = selected ? mGetCrumb(tree,selected) : null;
  const isLeaf    = node && !node.children?.length;
  const allNodes  = mAllNodes(tree);

  const addField   = () => { if(!node||!isLeaf)return; patchNode(node.id,{fields:[...(node.fields||[]),{id:uid(),label:"New Field",type:"NUMBER",unit:"",required:false}]}); };
  const updField   = (fid, patch) => { const fields=(node.fields||[]).map(f=>f.id===fid?{...f,...patch}:f); setTree(t=>mUpdateNode(t,node.id,{fields})); };
  const delField   = (fid) => { setTree(t=>mUpdateNode(t,node.id,{fields:(node.fields||[]).filter(f=>f.id!==fid)})); showToast("Field removed"); };
  const addFormula = () => { if(!node||!isLeaf)return; patchNode(node.id,{formulas:[...(node.formulas||[]),{id:uid(),label:"New Output",expression:"",outputUnit:"m³",formula_type:"NON_MATERIAL"}]}); };
  const updFormula = (fid, patch) => { const formulas=(node.formulas||[]).map(f=>f.id===fid?{...f,...patch}:f); setTree(t=>mUpdateNode(t,node.id,{formulas})); };
  const delFormula = (fid) => { setTree(t=>mUpdateNode(t,node.id,{formulas:(node.formulas||[]).filter(f=>f.id!==fid)})); showToast("Formula removed"); };

  const createCat = () => {
    if(!newCat.name_en.trim())return;
    const id=uid(), cat={ id, name:newCat.name_en, name_en:newCat.name_en, name_ar:newCat.name_ar, slug:slugify(newCat.name_en), icon:newCat.icon, category_level:newCat.category_level, isActive:true, children:[], fields:[], formulas:[] };
    if(!newCat.parentId){ setTree(t=>[...t,cat]); }
    else { const par=mFindNode(tree,newCat.parentId); setTree(t=>mUpdateNode(t,newCat.parentId,{children:[...(par?.children||[]),cat]})); setExpanded(e=>[...new Set([...e,newCat.parentId])]); }
    setSelected(id); setShowNew(false); setNewCat({name:"",name_en:"",name_ar:"",icon:"📂",parentId:"",category_level:"MAIN"}); showToast(`"${cat.name_en}" created`);
  };

  const allLeaves = allNodes.filter(n=>!n.children?.length).length;
  const allFields = allNodes.reduce((a,n)=>a+(n.fields?.length||0),0);
  const allForms  = allNodes.reduce((a,n)=>a+(n.formulas?.length||0),0);

  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden", position:"relative" }}>
      <div style={{ width:256, borderRight:`1px solid ${P.border}`, display:"flex", flexDirection:"column", background:P.surface, flexShrink:0 }}>
        <div style={{ padding:"12px 12px 10px", borderBottom:`1px solid ${P.border}` }}>
          <div style={{ fontSize:11, color:P.txt3, fontWeight:600, marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>Category Tree</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[{l:`${allNodes.length} nodes`,c:P.main},{l:`${allLeaves} leaves`,c:P.warn},{l:`${allFields} fields`,c:P.success},{l:`${allForms} formulas`,c:P.purple}].map(s=>(
              <span key={s.l} style={{ fontSize:10.5, color:s.c, background:`${s.c}14`, padding:"2px 7px", borderRadius:4, fontWeight:500 }}>{s.l}</span>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 8px" }}>
          {tree.map(n=><ModTreeRow key={n.id} node={n} depth={0} selected={selected} onSelect={setSelected} expanded={expanded} onToggle={toggle} onDelete={delNode}/>)}
        </div>
        <div style={{ padding:"10px 10px", borderTop:`1px solid ${P.border}` }}>
          <button onClick={()=>setShowNew(true)} style={{ width:"100%", padding:"8px", borderRadius:7, border:`1.5px dashed ${P.border}`, background:"transparent", color:P.txt3, cursor:"pointer", fontSize:13, fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=P.main;e.currentTarget.style.color=P.main;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.txt3;}}>
            <Plus size={13}/> Add Category
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"22px 26px", background:P.bg }}>
        {!node ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", gap:12, animation:"fadeUp .3s ease" }}>
            <FolderTree size={40} color={P.txt3} />
            <div style={{ fontSize:16, fontWeight:600, color:P.txt2 }}>Select a category to edit</div>
            <div style={{ fontSize:13, color:P.txt3 }}>Pick any node from the sidebar</div>
          </div>
        ) : (
          <div style={{ animation:"slideIn .2s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:16, flexWrap:"wrap" }}>
              {crumb?.map((n,i)=>(
                <span key={n.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {i>0&&<ChevronRight size={12} color={P.txt3}/>}
                  <span style={{ fontSize:12, color:i===crumb.length-1?P.main:P.txt3, fontWeight:i===crumb.length-1?600:400 }}>{n.icon} {n.name_en||n.name}</span>
                </span>
              ))}
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:P.mainL, border:`1px solid ${P.mainM}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{node.icon}</div>
                <div>
                  <h1 style={{ fontSize:18, fontWeight:700, color:P.txt, margin:0 }}>{node.name_en||node.name}</h1>
                  <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                    <Badge label={isLeaf?"LEAF":"BRANCH"} color={P.main} bg={P.mainL}/>
                    {node.category_level && (() => { const c=CAT_LEVEL_CONF[node.category_level]||CAT_LEVEL_CONF.MAIN; return <Badge label={node.category_level} color={c.color} bg={c.bg}/>; })()}
                    <Badge label={node.isActive?"Active":"Inactive"} color={node.isActive?P.success:P.txt3} bg={node.isActive?P.successL:P.borderL}/>
                    {!isLeaf&&<Badge label={`${mCountDesc(node)} descendants`} color={P.txt3} bg={P.borderL}/>}
                    {isLeaf&&<Badge label={`${node.fields?.length||0} fields · ${node.formulas?.length||0} formulas`} color={P.txt3} bg={P.borderL}/>}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="ghost" icon={node.isActive?<ToggleRight size={14}/>:<ToggleLeft size={14}/>} onClick={()=>patchNode(node.id,{isActive:!node.isActive})}>{node.isActive?"Deactivate":"Activate"}</Btn>
                <Btn variant="danger" icon={<Trash2 size={13}/>} onClick={()=>delNode(node.id)}>Delete</Btn>
              </div>
            </div>

            <ModSection title="Category Metadata" icon={<Layers size={14}/>}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Name (EN)" value={node.name_en||node.name||""} onChange={v=>patchNode(node.id,{name:v,name_en:v,slug:slugify(v)})} />
                <Field label="Name (AR)" value={node.name_ar||""} onChange={v=>patchNode(node.id,{name_ar:v})} placeholder="الاسم بالعربية" />
                <div>
                  <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Slug (auto)</div>
                  <div style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:7, padding:"8px 11px", fontSize:12, color:P.txt3, fontFamily:"monospace" }}>{node.slug||slugify(node.name_en||node.name||"")}</div>
                </div>
                <Sel label="Category Level" value={node.category_level||"MAIN"} onChange={v=>patchNode(node.id,{category_level:v})} options={["MAIN","SUB","ITEM"]} />
                <div style={{ gridColumn:"1/-1" }}>
                  <Field label="Description (EN)" value={node.description_en||""} onChange={v=>patchNode(node.id,{description_en:v})} placeholder="Brief English description…" />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <Field label="Description (AR)" value={node.description_ar||""} onChange={v=>patchNode(node.id,{description_ar:v})} placeholder="وصف مختصر بالعربية…" />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontSize:12, color:P.txt2, marginBottom:6, fontWeight:500 }}>Icon</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {ICONS_LIST.map(ic=>(
                      <button key={ic} onClick={()=>setTree(t=>mUpdateNode(t,node.id,{icon:ic}))}
                        style={{ width:30, height:30, borderRadius:6, border:`1.5px solid ${node.icon===ic?P.main:P.border}`, background:node.icon===ic?P.mainL:P.surface, cursor:"pointer", fontSize:14, transition:"all .12s" }}>{ic}</button>
                    ))}
                  </div>
                </div>
              </div>
            </ModSection>

            {!isLeaf&&(
              <ModSection title="Sub-categories" icon={<FolderOpen size={14}/>}>
                {node.children?.length>0?(
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
                    {node.children.map(c=>(
                      <div key={c.id} onClick={()=>setSelected(c.id)}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:P.bg, borderRadius:7, border:`1px solid ${P.border}`, cursor:"pointer", transition:"border-color .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=P.main} onMouseLeave={e=>e.currentTarget.style.borderColor=P.border}>
                        <span style={{ fontSize:14 }}>{c.icon}</span>
                        <span style={{ fontSize:13, color:P.txt, flex:1, fontWeight:500 }}>{c.name_en||c.name}</span>
                        {c.category_level && (() => { const cl=CAT_LEVEL_CONF[c.category_level]; return cl?<Badge label={c.category_level} color={cl.color} bg={cl.bg}/>:null; })()}
                        <Badge label={!c.children?.length?"LEAF":`${c.children.length} children`} color={P.main} bg={P.mainL}/>
                        <ChevronRight size={13} color={P.txt3}/>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{ fontSize:13, color:P.txt3, marginBottom:12 }}>No sub-categories yet.</div>
                )}
                <Btn variant="outline" icon={<Plus size={13}/>} onClick={()=>{setNewCat(c=>({...c,parentId:node.id}));setShowNew(true);}}>Add Sub-category under "{node.name_en||node.name}"</Btn>
              </ModSection>
            )}

            {isLeaf&&(
              <ModSection title="Field Definitions" icon={<Hash size={14}/>} subtitle={`${node.fields?.length||0} input fields`}>
                {(node.fields||[]).length===0&&<div style={{ fontSize:13, color:P.txt3, marginBottom:12 }}>No fields yet.</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:12 }}>
                  {(node.fields||[]).map((f,i)=>(
                    <div key={f.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px 54px 32px", gap:8, alignItems:"center", padding:"10px 12px", background:P.bg, borderRadius:7, border:`1px solid ${P.border}`, animation:`fadeUp .2s ease ${i*.04}s both` }}>
                      <input value={f.label} onChange={e=>updField(f.id,{label:e.target.value})}
                        style={{ background:"transparent", border:"none", borderBottom:`1.5px solid ${P.border}`, color:P.txt, fontSize:13, fontFamily:"Inter,sans-serif", outline:"none", paddingBottom:2 }}/>
                      <select value={f.type} onChange={e=>updField(f.id,{type:e.target.value})}
                        style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:5, padding:"5px 7px", color:P.txt2, fontSize:11, fontFamily:"Inter,sans-serif", outline:"none" }}>
                        {FTYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      <input value={f.unit} onChange={e=>updField(f.id,{unit:e.target.value})} placeholder="unit"
                        style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:5, padding:"5px 7px", color:P.txt2, fontSize:11, fontFamily:"Inter,sans-serif", outline:"none", width:"100%" }}/>
                      <label style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer" }}>
                        <input type="checkbox" checked={f.required} onChange={e=>updField(f.id,{required:e.target.checked})} style={{ accentColor:P.main }}/>
                        <span style={{ fontSize:11, color:P.txt3 }}>req</span>
                      </label>
                      <button onClick={()=>delField(f.id)} style={{ background:"none", border:`1px solid ${P.border}`, borderRadius:5, cursor:"pointer", color:P.error, display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28 }}><X size={12}/></button>
                    </div>
                  ))}
                </div>
                <Btn variant="outline" color={P.success} icon={<Plus size={13}/>} onClick={addField}>Add Field</Btn>
              </ModSection>
            )}

            {isLeaf&&(
              <ModSection title="Formula Definitions" icon={<FlaskConical size={14}/>} subtitle={`${node.formulas?.length||0} output formulas`}>
                {(node.formulas||[]).length===0&&<div style={{ fontSize:13, color:P.txt3, marginBottom:12 }}>No formulas yet.</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                  {(node.formulas||[]).map((f,i)=>{
                    const ftc = FORMULA_TYPE_CONF[f.formula_type]||FORMULA_TYPE_CONF.NON_MATERIAL;
                    return (
                      <div key={f.id} style={{ padding:"12px 14px", background:P.bg, borderRadius:8, border:`1px solid ${P.border}`, animation:`fadeUp .2s ease ${i*.04}s both` }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 140px 62px 32px", gap:8, alignItems:"end" }}>
                          <Field label="Output Label" value={f.label} onChange={v=>updFormula(f.id,{label:v})} />
                          <div>
                            <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Expression</div>
                            <input value={f.expression} onChange={e=>updFormula(f.id,{expression:e.target.value})} placeholder="e.g. L * W * H"
                              style={{ width:"100%", background:P.surface, border:`1.5px solid ${P.main}55`, borderRadius:7, padding:"8px 10px", color:P.main, fontSize:12, fontFamily:"monospace", outline:"none" }}/>
                          </div>
                          <div>
                            <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Formula Type</div>
                            <select value={f.formula_type||"NON_MATERIAL"} onChange={e=>updFormula(f.id,{formula_type:e.target.value})}
                              style={{ width:"100%", background:ftc.bg, border:`1.5px solid ${ftc.color}55`, borderRadius:7, padding:"8px 10px", color:ftc.color, fontSize:12, fontFamily:"Inter,sans-serif", fontWeight:600, outline:"none", cursor:"pointer" }}>
                              <option value="NON_MATERIAL">NON_MATERIAL</option>
                              <option value="MATERIAL">MATERIAL</option>
                            </select>
                          </div>
                          <Field label="Unit" value={f.outputUnit} onChange={v=>updFormula(f.id,{outputUnit:v})} placeholder="m³" />
                          <button onClick={()=>delFormula(f.id)} style={{ background:"none", border:`1px solid ${P.border}`, borderRadius:6, cursor:"pointer", color:P.error, display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, alignSelf:"flex-end" }}><X size={12}/></button>
                        </div>
                        <div style={{ marginTop:8, padding:"6px 10px", background:P.mainL, borderRadius:5, border:`1px solid ${P.mainM}`, fontSize:12, fontFamily:"monospace", display:"flex", alignItems:"center", gap:8 }}>
                          <Badge label={f.formula_type||"NON_MATERIAL"} color={ftc.color} bg={ftc.bg}/>
                          <span style={{ color:P.txt3 }}>Preview: </span>
                          <span style={{ color:P.main, fontWeight:600 }}>{f.label||"Output"} = </span>
                          <span style={{ color:P.txt }}>{f.expression||"…"}</span>
                          <span style={{ color:P.txt3 }}> [{f.outputUnit||"?"}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Btn variant="outline" color={P.main} icon={<Plus size={13}/>} onClick={addFormula}>Add Formula</Btn>
              </ModSection>
            )}
          </div>
        )}
      </div>

      {showNew&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.4)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}
          onClick={e=>{if(e.target===e.currentTarget)setShowNew(false);}}>
          <div style={{ width:460, background:P.surface, border:`1px solid ${P.border}`, borderRadius:14, padding:28, animation:"fadeUp .2s ease", boxShadow:"0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize:16, fontWeight:700, color:P.txt, marginBottom:4 }}>New Category</div>
            <div style={{ fontSize:12, color:P.txt3, marginBottom:20 }}>{newCat.parentId?`Adding under: ${mFindNode(tree,newCat.parentId)?.name_en||"…"}`:"Root level category"}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Name (EN)" value={newCat.name_en} onChange={v=>setNewCat(c=>({...c,name_en:v}))} placeholder="e.g. Plumbing" />
                <Field label="Name (AR)" value={newCat.name_ar} onChange={v=>setNewCat(c=>({...c,name_ar:v}))} placeholder="السباكة" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Sel label="Category Level" value={newCat.category_level} onChange={v=>setNewCat(c=>({...c,category_level:v}))} options={["MAIN","SUB","ITEM"]} />
                <Sel label="Parent (optional)" value={newCat.parentId} onChange={v=>setNewCat(c=>({...c,parentId:v}))} options={[{v:"",l:"— Root Level —"},...allNodes.map(n=>({v:n.id,l:`${n.icon} ${n.name_en||n.name}`}))]} />
              </div>
              <div>
                <div style={{ fontSize:12, color:P.txt2, marginBottom:6, fontWeight:500 }}>Icon</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {ICONS_LIST.map(ic=><button key={ic} onClick={()=>setNewCat(c=>({...c,icon:ic}))} style={{ width:32, height:32, borderRadius:7, border:`1.5px solid ${newCat.icon===ic?P.main:P.border}`, background:newCat.icon===ic?P.mainL:P.bg, cursor:"pointer", fontSize:15 }}>{ic}</button>)}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:22, justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn>
              <Btn onClick={createCat} disabled={!newCat.name_en.trim()} icon={<Plus size={13}/>}>Create Category</Btn>
            </div>
          </div>
        </div>
      )}
      {toast&&<div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, padding:"10px 18px", borderRadius:8, background:P.successL, border:`1px solid ${P.success}44`, color:P.success, fontSize:13, fontFamily:"Inter,sans-serif", fontWeight:500, animation:"fadeUp .2s ease", boxShadow:"0 4px 16px rgba(0,0,0,0.08)", display:"flex", alignItems:"center", gap:7 }}><CheckCircle size={14}/>{toast}</div>}
    </div>
  );
}
