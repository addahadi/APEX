import { useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, FileText, FolderOpen,
  Settings, Package, Bot, BookOpen, X, Save, Loader2, Pencil,
} from "lucide-react";
import { Avatar } from "../components/admin/ui-atoms.jsx";
import { P } from "../lib/design-tokens.js";
import AIChatbot from "../components/AIChatbot.jsx";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import  LanguageSwitcher  from "@/components/LanguageSwitcher.jsx";
import { useUpdateProfile } from "@/hooks/useAuth";

function AdminProfileModal({ user, onClose }) {
  const { t } = useTranslation("admin");
  const updateMutation = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { name };
    if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }
    await updateMutation.mutateAsync(payload);
    onClose();
  };

  const inp = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${P.border}`, background:P.bg, color:P.txt, fontSize:14, fontFamily:P.font, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:12, fontWeight:600, color:P.txt3, marginBottom:6, display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:P.surface, borderRadius:16, padding:32, width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", border:`1px solid ${P.border}`, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer", color:P.txt3 }}><X size={18}/></button>
        <h2 style={{ fontSize:18, fontWeight:700, color:P.txt, marginBottom:4 }}>{t("profile.editProfile")}</h2>
        <p style={{ fontSize:13, color:P.txt3, marginBottom:24 }}>{user?.email}</p>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom:16 }}><label style={lbl}>{t("profile.name")}</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} required /></div>
          <div style={{ marginBottom:16 }}><label style={lbl}>Current Password</label><input style={inp} type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="••••••••" /></div>
          <div style={{ marginBottom:24 }}><label style={lbl}>New Password (optional)</label><input style={inp} type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••" /></div>
          <div style={{ display:"flex", gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:"10px 0", borderRadius:8, border:`1px solid ${P.border}`, background:"transparent", color:P.txt2, fontSize:14, fontFamily:P.font, fontWeight:600, cursor:"pointer" }}>{t("profile.cancel")}</button>
            <button type="submit" disabled={updateMutation.isPending} style={{ flex:1, padding:"10px 0", borderRadius:8, border:"none", background:P.main, color:"#fff", fontSize:14, fontFamily:P.font, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:updateMutation.isPending?0.7:1 }}>
              {updateMutation.isPending ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
              {updateMutation.isPending ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuthContext();

  const initials = user?.name ? user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "AD";

  const NAV = [
    { path:"/admin",             icon:<LayoutDashboard size={16}/>, label:t("nav.dashboard"), exact:true },
    { path:"/admin/users",         icon:<Users size={16}/>,         label:t("nav.users")          },
    { path:"/admin/subscriptions", icon:<CreditCard size={16}/>,    label:t("nav.subscriptions")  },
    { path:"/admin/articles",      icon:<FileText size={16}/>,      label:t("nav.articles")       },
    { path:"/admin/modules",       icon:<FolderOpen size={16}/>,    label:t("nav.modules")        },
    { path:"/admin/resources",     icon:<Package size={16}/>,       label:t("nav.resources")      },
  ];

  let currentLocation = "ADMIN_DASHBOARD";
  const p = location.pathname;
  if (p.includes("/admin/users")) currentLocation = "ADMIN_USERS";
  else if (p.includes("/admin/subscriptions/types")) currentLocation = "ADMIN_PLAN_TYPES";
  else if (p.includes("/admin/subscriptions/subscribers")) currentLocation = "ADMIN_SUBSCRIBERS";
  else if (p.includes("/admin/subscriptions")) currentLocation = "ADMIN_PLAN_FEATURES";
  else if (p.includes("/admin/resources/units")) currentLocation = "ADMIN_UNITS";
  else if (p.includes("/admin/resources")) currentLocation = "ADMIN_MATERIALS";
  else if (p.includes("/admin/articles/tags")) currentLocation = "ADMIN_TAGS";
  else if (p.includes("/admin/articles/new") || p.includes("/edit")) currentLocation = "ADMIN_ARTICLE_EDITOR";
  else if (p.includes("/admin/articles")) currentLocation = "ADMIN_ARTICLES";
  else if (p.includes("/admin/modules")) currentLocation = "ADMIN_MODULES";
  else if (p.includes("/admin/settings")) currentLocation = "ADMIN_SETTINGS";

  const isActive = (navPath, isExact) => isExact ? location.pathname === navPath : location.pathname.startsWith(navPath);

  return (
    <div style={{ height:"100vh", background:P.bg, display:"flex", flexDirection:"column", fontFamily:P.font, color:P.txt, fontSize:P.body.size, overflow:"hidden" }}>

      {/* TOPBAR */}
      <div style={{ height:60, borderBottom:`1px solid ${P.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:14, background:P.surface, position:"sticky", top:0, zIndex:40, flexShrink:0 }}>
        <Link to="/admin" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", color:"inherit" }}>
          <img src="/logo.png" alt="APEX Logo" style={{ width:34, height:34, borderRadius:9, objectFit:"cover", boxShadow:`0 2px 8px rgba(16,78,216,.3)` }}/>
          <div>
            <div style={{ fontSize:P.body.size, fontWeight:700, color:P.txt, lineHeight:1.2 }}>APEX</div>
            <div style={{ fontSize:11, color:P.txt3, fontWeight:400 }}>{t("topbar.version")}</div>
          </div>
        </Link>

        <div style={{ flex:1 }}/>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <LanguageSwitcher />

          <Link to="/articles"
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:8, background:"transparent", color:P.txt2, fontSize:13, fontFamily:P.font, fontWeight:600, cursor:"pointer", border:`1px solid ${P.border}`, textDecoration:"none", transition:"all .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background=P.bg; e.currentTarget.style.color=P.main; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=P.txt2; }}>
            <BookOpen size={15}/> {t("topbar.viewBlog")}
          </Link>

          <button
            style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:8, background:P.main, color:"#fff", fontSize:14, fontFamily:P.font, fontWeight:600, cursor:"pointer", border:"none", boxShadow:`0 1px 3px rgba(16,78,216,.3)`, transition:"background .15s" }}
            onClick={()=>setChatOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.background=P.mainD}
            onMouseLeave={e=>e.currentTarget.style.background=P.main}>
            <Bot size={16} strokeWidth={2}/> {t("topbar.aiAssistant")}
          </button>

          <div style={{ width:1, height:28, background:P.border }}/>

          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 8px", borderRadius:8, transition:"background .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=P.bg}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <Avatar src={user?.profile_img} initials={initials} name={user?.name} size={36}/>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:P.txt, lineHeight:1.3 }}>{user?.name||"Admin"}</div>
              <div style={{ fontSize:12, color:P.txt3, lineHeight:1.2 }}>{user?.email||"admin@apex.dz"}</div>
            </div>
            <button onClick={()=>setProfileOpen(true)}
              title={t("profile.editProfile")}
              style={{ background:"none", border:"none", cursor:"pointer", color:P.txt3, display:"flex", alignItems:"center", padding:5, borderRadius:6, transition:"all .15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.color=P.main; e.currentTarget.style.background=P.mainL; }}
              onMouseLeave={e=>{ e.currentTarget.style.color=P.txt3; e.currentTarget.style.background="none"; }}>
              <Pencil size={14}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* SIDEBAR */}
        <div style={{ width:220, borderRight:`1px solid ${P.border}`, display:"flex", flexDirection:"column", background:P.surface, flexShrink:0 }}>
          <div style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
            <div style={{ fontSize:11, fontWeight:600, color:P.txt3, letterSpacing:.8, textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>{t("nav.title")}</div>
            {NAV.map(n => {
              const active = isActive(n.path, n.exact);
              return (
                <Link key={n.path} to={n.path}
                  style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", margin:"1px 0", borderRadius:8, border:"none", cursor:"pointer", width:"100%", textAlign:"left", background:active?P.mainL:"transparent", color:active?P.main:P.txt2, transition:"all .15s", fontFamily:P.font, fontSize:14, fontWeight:active?600:500 }}
                  onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=P.bg; }}
                  onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
                  <span style={{ display:"flex", color:active?P.main:P.txt3 }}>{n.icon}</span>
                  {n.label}
                  {active && <div style={{ marginLeft:"auto", width:3, height:18, borderRadius:2, background:P.main }}/>}
                </Link>
              );
            })}
          </div>
          <div style={{ padding:"14px 20px", borderTop:`1px solid ${P.border}`, fontSize:12, color:P.txt4, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:P.main, flexShrink:0 }}/> {t("footer")}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}><Outlet/></div>
      </div>

      <AIChatbot isOpen={chatOpen} onClose={()=>setChatOpen(false)} location={currentLocation}/>
      {profileOpen && <AdminProfileModal user={user} onClose={()=>setProfileOpen(false)}/>}
    </div>
  );
}
