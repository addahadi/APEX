import { useState } from "react";
import { Plus, Pencil, Trash2, Save, CheckCircle, RefreshCw, AlertCircle, Activity } from "lucide-react";
import { P, AI_TYPE_CONF, uid } from "@/lib/design-tokens";
import { INIT_FINANCIAL, INIT_EXCHANGE_RATES, INIT_QUESTIONS, AI_USAGE } from "@/mock/mock-data";
import { Badge, Btn, Card, SectionTitle, Field, TH, TD, TabBar, KpiCard } from "@/components/admin/ui-atoms";

export default function SettingsPage() {
  const [tab, setTab]             = useState("financial");
  const [financial, setFinancial] = useState(INIT_FINANCIAL);
  const [rates]                   = useState(INIT_EXCHANGE_RATES);
  const [questions, setQuestions] = useState(INIT_QUESTIONS);
  const [aiUsage]                 = useState(AI_USAGE);
  const [editQ, setEditQ]         = useState(null);
  const [showNewQ, setShowNewQ]   = useState(false);
  const [newQ, setNewQ]           = useState({ question_text_en:"", question_text_ar:"", answer_text_en:"", answer_text_ar:"", display_location:"" });
  const [saved, setSaved]         = useState(false);

  const saveFinancial = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const aiByType = ["QUERY","RECOMMENDATION","ANALYSIS"].map(t=>({ type:t, count:aiUsage.filter(a=>a.usage_type===t).length }));
  const aiByDate = [...new Set(aiUsage.map(a=>a.usage_date))].sort().reverse().map(d=>({ date:d, count:aiUsage.filter(a=>a.usage_date===d).length }));

  return (
    <div style={{ padding:"28px 30px", flex:1, overflowY:"auto", animation:"fadeUp .3s ease" }}>
      <SectionTitle title="Settings" subtitle="Financial config, exchange rates, Q&A, AI usage" />
      <TabBar
        tabs={[
          {k:"financial",l:"Financial Settings"},
          {k:"exchange",l:"Exchange Rates"},
          {k:"questions",l:`Predefined Q&A (${questions.length})`},
          {k:"ai",l:"AI Usage History"},
        ]}
        active={tab} onSelect={setTab}
      />

      {tab==="financial"&&(
        <div style={{ maxWidth:560 }}>
          <Card style={{ padding:24 }}>
            <div style={{ fontSize:14, fontWeight:600, color:P.txt, marginBottom:4 }}>Market Factor</div>
            <div style={{ fontSize:13, color:P.txt3, marginBottom:20, lineHeight:1.6 }}>
              Applied on top of the official exchange rate to compute the final applied rate.<br/>
              <span style={{ fontFamily:"monospace", fontSize:12, color:P.main }}>final_rate = official_rate × market_factor</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <Field label="Market Factor" value={String(financial.market_factor)} onChange={v=>setFinancial(f=>({...f,market_factor:parseFloat(v)||1.0}))} type="number" placeholder="1.15" />
              <div>
                <div style={{ fontSize:13, color:P.txt2, marginBottom:6, fontWeight:500 }}>Last Updated</div>
                <div style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:8, padding:"9px 12px", fontSize:14, color:P.txt3 }}>{financial.updated_at}</div>
              </div>
            </div>
            <div style={{ padding:"14px 16px", background:P.mainL, border:`1px solid ${P.mainM}`, borderRadius:8, marginBottom:20 }}>
              <div style={{ fontSize:12, color:P.txt2, fontWeight:600, marginBottom:4 }}>PREVIEW</div>
              <div style={{ fontSize:13, color:P.txt }}>
                If official rate = <strong>135.50 DZD/USD</strong>, then:<br/>
                Final applied rate = 135.50 × {financial.market_factor} = <strong style={{ color:P.main }}>{(135.50 * financial.market_factor).toFixed(2)} DZD/USD</strong>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Btn icon={<Save size={13}/>} onClick={saveFinancial}>Save Settings</Btn>
              {saved&&<span style={{ fontSize:13, color:P.success, display:"flex", alignItems:"center", gap:5 }}><CheckCircle size={14}/>Saved!</span>}
            </div>
          </Card>
        </div>
      )}

      {tab==="exchange"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, color:P.txt3 }}>Auto-synced daily. Market factor: <strong style={{ color:P.main }}>×{financial.market_factor}</strong></div>
            <Btn variant="secondary" icon={<RefreshCw size={13}/>}>Sync Now</Btn>
          </div>
          <Card>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Date","Official Rate (DZD)","Final Applied Rate","API Status","Config"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
              <tbody>
                {rates.map((r,i)=>(
                  <tr key={r.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD style={{ fontWeight:600 }}>{r.last_sync_at}{i===0&&<Badge label="Latest" color={P.success} bg={P.successL}/>}</TD>
                    <TD style={{ fontFamily:"monospace" }}>{r.official_rate.toFixed(2)}</TD>
                    <TD style={{ fontFamily:"monospace", fontWeight:700, color:P.main }}>{r.final_applied_rate.toFixed(2)}</TD>
                    <TD>
                      {r.api_status
                        ? <Badge label="Online" color={P.success} bg={P.successL}/>
                        : <span style={{ display:"flex", alignItems:"center", gap:5 }}><Badge label="Offline" color={P.error} bg={P.errorL}/><AlertCircle size={13} color={P.error}/></span>}
                    </TD>
                    <TD style={{ color:P.txt3, fontSize:12, fontFamily:"monospace" }}>×{financial.market_factor}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab==="questions"&&(
        <div>
          {showNewQ&&(
            <Card style={{ padding:22, marginBottom:20, animation:"fadeUp .2s ease" }}>
              <div style={{ fontSize:15, fontWeight:700, color:P.txt, marginBottom:16 }}>{editQ?"Edit Q&A":"New Predefined Q&A"}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Question (EN)" value={newQ.question_text_en} onChange={v=>setNewQ(q=>({...q,question_text_en:v}))} placeholder="How do I…" />
                  <Field label="Question (AR)" value={newQ.question_text_ar} onChange={v=>setNewQ(q=>({...q,question_text_ar:v}))} placeholder="كيف أقوم بـ…" />
                </div>
                <div>
                  <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Answer (EN)</div>
                  <textarea value={newQ.answer_text_en} onChange={e=>setNewQ(q=>({...q,answer_text_en:e.target.value}))} rows={3}
                    style={{ width:"100%", background:P.surface, border:`1.5px solid ${P.border}`, borderRadius:7, padding:"9px 11px", color:P.txt, fontSize:13, fontFamily:"Inter,sans-serif", outline:"none", resize:"vertical" }}
                    onFocus={e=>e.target.style.borderColor=P.main} onBlur={e=>e.target.style.borderColor=P.border} />
                </div>
                <div>
                  <div style={{ fontSize:12, color:P.txt2, marginBottom:5, fontWeight:500 }}>Answer (AR)</div>
                  <textarea value={newQ.answer_text_ar} onChange={e=>setNewQ(q=>({...q,answer_text_ar:e.target.value}))} rows={3}
                    style={{ width:"100%", background:P.surface, border:`1.5px solid ${P.border}`, borderRadius:7, padding:"9px 11px", color:P.txt, fontSize:13, fontFamily:"Inter,sans-serif", outline:"none", resize:"vertical", direction:"rtl" }}
                    onFocus={e=>e.target.style.borderColor=P.main} onBlur={e=>e.target.style.borderColor=P.border} />
                </div>
                <Field label="Display Location" value={newQ.display_location} onChange={v=>setNewQ(q=>({...q,display_location:v}))} placeholder="calculator, materials, estimation…" />
              </div>
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <Btn icon={<Save size={13}/>} onClick={()=>{
                  if(editQ){ setQuestions(qs=>qs.map(q=>q.id===editQ?{...q,...newQ}:q)); }
                  else { setQuestions(qs=>[...qs,{...newQ,id:uid()}]); }
                  setShowNewQ(false); setEditQ(null); setNewQ({question_text_en:"",question_text_ar:"",answer_text_en:"",answer_text_ar:"",display_location:""});
                }}>Save Q&A</Btn>
                <Btn variant="ghost" onClick={()=>{setShowNewQ(false);setEditQ(null);}}>Cancel</Btn>
              </div>
            </Card>
          )}
          {!showNewQ&&(
            <div style={{ marginBottom:16 }}>
              <Btn icon={<Plus size={13}/>} onClick={()=>setShowNewQ(true)}>Add Q&A</Btn>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {questions.map(q=>(
              <Card key={q.id} style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:P.txt, marginBottom:2 }}>{q.question_text_en}</div>
                    <div style={{ fontSize:12, color:P.txt3, direction:"rtl", marginBottom:8 }}>{q.question_text_ar}</div>
                    <div style={{ fontSize:13, color:P.txt2, marginBottom:4, lineHeight:1.6 }}>{q.answer_text_en}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginLeft:16, flexShrink:0 }}>
                    <Badge label={q.display_location} color={P.cyan} bg={P.cyanL}/>
                    <Btn small variant="outline" icon={<Pencil size={11}/>} onClick={()=>{setEditQ(q.id);setNewQ({...q});setShowNewQ(true);}}>Edit</Btn>
                    <Btn small variant="danger" icon={<Trash2 size={11}/>} onClick={()=>setQuestions(qs=>qs.filter(x=>x.id!==q.id))}/>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="ai"&&(
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {aiByType.map(({type:t,count})=>{
              const c = AI_TYPE_CONF[t];
              return <KpiCard key={t} label={t} value={count} sub="" icon={<Activity size={16}/>} color={c.color}/>;
            })}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
            <Card>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["User","Type","Date"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                <tbody>
                  {aiUsage.map(a=>{
                    const c = AI_TYPE_CONF[a.usage_type];
                    return (
                      <tr key={a.id} style={{ borderTop:`1px solid ${P.borderL}`, transition:"background .12s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=P.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <TD style={{ fontWeight:600 }}>{a.user}</TD>
                        <TD><Badge label={a.usage_type} color={c.color} bg={c.bg}/></TD>
                        <TD style={{ color:P.txt3, fontSize:12 }}>{a.usage_date}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
            <Card style={{ padding:"18px 20px" }}>
              <div style={{ fontSize:12, color:P.txt3, fontWeight:600, marginBottom:14 }}>USAGE BY DATE</div>
              {aiByDate.map(({date,count})=>(
                <div key={date} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                    <span style={{ color:P.txt2, fontWeight:500 }}>{date}</span>
                    <span style={{ color:P.txt, fontWeight:600 }}>{count}</span>
                  </div>
                  <div style={{ height:5, background:P.bg, borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(count/3)*100}%`, background:P.main, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
