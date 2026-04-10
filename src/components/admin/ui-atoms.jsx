import { useState } from "react";
import { Search } from "lucide-react";
import { P } from "@/lib/design-tokens";

export function Badge({ label, color, bg }) {
  return <span style={{ fontSize:12, padding:"3px 10px", borderRadius:20, background:bg||P.borderL, color:color||P.txt2, fontWeight:500, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", lineHeight:1.4 }}>{label}</span>;
}

export function Btn({ children, onClick, variant="primary", color, small, icon, disabled }) {
  const c = color || P.main;
  const sz = small ? { padding:"5px 12px", fontSize:13, borderRadius:6 } : { padding:"9px 18px", fontSize:14, borderRadius:8 };
  const base = { fontFamily:"Inter,sans-serif", fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"all .15s", border:"none", opacity:disabled?.5:1, lineHeight:1.4, ...sz };
  const vars = {
    primary:     { background:P.main,    color:"#fff",   boxShadow:`0 1px 2px rgba(16,78,216,.25)`, border:"none",               onHover:{ background:P.mainD } },
    secondary:   { background:P.surface, color:P.txt,    border:`1.5px solid ${P.border}`,                                       onHover:{ background:P.bg } },
    destructive: { background:P.error,   color:"#fff",   border:"none", boxShadow:`0 1px 2px rgba(225,29,72,.25)`,              onHover:{ background:"#C0152E" } },
    ghost:       { background:"transparent", color:P.main, border:"none", padding:sz.padding, boxShadow:"none",                 onHover:{ background:P.mainL } },
    outline:     { background:P.surface, color:c,        border:`1.5px solid ${c}`,                                              onHover:{ background:`${c}0D` } },
    danger:      { background:"transparent", color:P.error, border:`1.5px solid ${P.errorM}`,                                   onHover:{ background:P.errorL } },
  };
  const v = vars[variant] || vars.primary;
  const [hov, setHov] = useState(false);
  const applied = hov && !disabled && v.onHover ? { ...v, ...v.onHover } : v;
  const { onHover: _, ...style } = applied;
  return (
    <button onClick={!disabled?onClick:undefined} disabled={disabled}
      style={{ ...base, ...style }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {icon && <span style={{ display:"flex" }}>{icon}</span>}
      {children}
    </button>
  );
}

export function Avatar({ initials, size=32 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:P.mainL, border:`1.5px solid ${P.mainM}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.3, fontWeight:700, color:P.main, flexShrink:0 }}>{initials}</div>;
}

export function Field({ label, value, onChange, placeholder, type="text", mono, readOnly, error }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? P.error : focused ? P.main : P.border;
  return (
    <div>
      {label && <div style={{ fontSize:13, color:P.txt2, marginBottom:6, fontWeight:500 }}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{ width:"100%", background:readOnly?P.bg:P.surface, border:`1.5px solid ${borderColor}`, borderRadius:8, padding:"9px 12px", color:readOnly?P.txt2:P.txt, fontSize:14, fontFamily:mono?"monospace":"Inter,sans-serif", outline:"none", transition:"border-color .15s", boxShadow:focused&&!error?`0 0 0 3px ${P.mainL}`:"none" }}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
      {error && <div style={{ fontSize:12, color:P.error, marginTop:4 }}>{error}</div>}
    </div>
  );
}

export function Sel({ label, value, onChange, options }) {
  return (
    <div>
      {label && <div style={{ fontSize:13, color:P.txt2, marginBottom:6, fontWeight:500 }}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:P.surface, border:`1.5px solid ${P.border}`, borderRadius:8, padding:"9px 12px", color:P.txt, fontSize:14, fontFamily:"Inter,sans-serif", outline:"none", cursor:"pointer", transition:"border-color .15s" }}
        onFocus={e=>e.target.style.borderColor=P.main} onBlur={e=>e.target.style.borderColor=P.border}>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.v;
          const lab = typeof o === 'string' ? o : o.l;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <Search size={15} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:P.txt3, pointerEvents:"none" }} />
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search…"}
        style={{ paddingLeft:34, paddingRight:12, paddingTop:9, paddingBottom:9, background:P.surface, border:`1.5px solid ${focused?P.main:P.border}`, borderRadius:8, color:P.txt, fontSize:14, fontFamily:"Inter,sans-serif", outline:"none", width:"100%", transition:"border-color .15s", boxShadow:focused?`0 0 0 3px ${P.mainL}`:"none" }}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
    </div>
  );
}

export function Card({ children, style }) {
  return <div style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
      <div>
        <h2 style={{ fontSize:P.h3.size, fontWeight:P.h3.weight, color:P.txt, margin:0, lineHeight:1.3 }}>{title}</h2>
        {subtitle && <p style={{ fontSize:P.sm.size, color:P.txt3, margin:"4px 0 0", fontWeight:400 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const TH = ({ children }) => <th style={{ padding:"10px 16px", fontSize:12, color:P.txt3, textAlign:"left", fontWeight:600, letterSpacing:.4, whiteSpace:"nowrap", background:P.bg, borderBottom:`1px solid ${P.border}` }}>{children}</th>;
export const TD = ({ children, style }) => <td style={{ padding:"12px 16px", fontSize:14, color:P.txt, verticalAlign:"middle", ...style }}>{children}</td>;

export function ChartTip({ active, payload, label, unit="" }) {
  if(!active||!payload?.length) return null;
  return <div style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}><div style={{ color:P.txt3, marginBottom:3, fontSize:12 }}>{label}</div><div style={{ color:P.txt, fontWeight:700, fontSize:14 }}>{payload[0].value.toLocaleString()}{unit}</div></div>;
}

export function KpiCard({ label, value, sub, icon, color, delay=0 }) {
  const c = color || P.main;
  return (
    <Card style={{ padding:"20px", animation:`fadeUp .35s ease ${delay}s both` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <span style={{ fontSize:13, color:P.txt3, fontWeight:500 }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:10, background:`${c}12`, display:"flex", alignItems:"center", justifyContent:"center", color:c }}>{icon}</div>
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:P.txt, lineHeight:1, marginBottom:6 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:sub.includes("↑")?P.success:sub.includes("↓")?P.error:P.txt3, fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>{sub}</div>}
    </Card>
  );
}

export function TabBar({ tabs, active, onSelect }) {
  return (
    <div style={{ display:"flex", borderBottom:`1px solid ${P.border}`, marginBottom:24 }}>
      {tabs.map(t=>(
        <button key={t.k} onClick={()=>onSelect(t.k)}
          style={{ padding:"10px 20px", background:"none", border:"none", borderBottom:`2px solid ${active===t.k?P.main:"transparent"}`, color:active===t.k?P.main:P.txt3, fontSize:14, fontFamily:"Inter,sans-serif", cursor:"pointer", fontWeight:active===t.k?600:400, transition:"all .15s", marginBottom:-1 }}>
          {t.l}
        </button>
      ))}
    </div>
  );
}
