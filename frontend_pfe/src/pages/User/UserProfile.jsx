import React, { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUsage, useMySubscription } from "@/hooks/useSubscription";
import { useLogout, useUpdateProfile } from "@/hooks/useAuth";
import { useMyLiked, useMySaved } from "@/hooks/useBlog";
import {
  User, Mail, Shield, Calendar, LogOut, CreditCard, Activity, Package,
  Bot, Calculator, ArrowRight, Loader2, Heart, Bookmark, BookOpen,
  Pencil, X, Save, Lock, CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

/* ─── Edit Profile Modal ──────────────────────────────────────── */
function EditProfileModal({ user, onClose }) {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const updateMutation = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name };
    if (newPwd) { payload.currentPassword = currentPwd; payload.newPassword = newPwd; }
    await updateMutation.mutateAsync(payload);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
              {user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "US"}
            </div>
            <div>
              <h2 className="text-lg font-black">{t("profile.editProfileTitle")}</h2>
              <p className="text-blue-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              <User className="w-3 h-3"/> {t("profile.editName")}
            </label>
            <input
              value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Change Password (optional)</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("profile.editCurrentPassword")}</label>
                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("profile.editNewPassword")}</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {t("profile.editCancel")}
            </button>
            <button type="submit" disabled={updateMutation.isPending || saved}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70">
              {saved ? <><CheckCircle className="w-4 h-4"/> Saved!</> :
               updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin"/> {t("profile.editSaving")}</> :
               <><Save className="w-4 h-4"/> {t("profile.editSave")}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── User Info Card (restyled) ─────────────────────────────────── */
function UserInfoCard({ user, onEdit }) {
  const { t } = useTranslation("user");

  const fields = [
    { icon: User,     label: t("profile.fullName"),   value: user?.name },
    { icon: Mail,     label: t("profile.email"),       value: user?.email },
    { icon: Shield,   label: "Role",                   value: user?.role },
    { icon: Calendar, label: t("profile.memberSince"), value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* card header bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("profile.userInfo")}</h3>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors border border-primary/20">
          <Pencil className="w-3 h-3"/> {t("profile.editProfile")}
        </button>
      </div>

      {/* fields */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
              <Icon className="w-4 h-4 text-primary"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{value || "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main UserProfile ──────────────────────────────────────────── */
const UserProfile = () => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const localize = useLocalizedField();
  const { user } = useAuthContext();
  const { data: usageData, isLoading: usageLoading } = useUsage();
  const { data: subData } = useMySubscription();
  const logoutMutation = useLogout();
  const { data: likedArticles = [], isLoading: likedLoading } = useMyLiked();
  const { data: savedArticles = [], isLoading: savedLoading } = useMySaved();
  const [editOpen, setEditOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "US";

  const renderProgressBar = (used, limit, unlimited) => {
    if (unlimited) {
      return <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden"><div className="bg-emerald-500 h-2.5 rounded-full w-full opacity-50"></div></div>;
    }
    const percent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
    const isWarning = percent > 80;
    return (
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2">
        <div className={`h-2.5 rounded-full ${isWarning ? "bg-red-500" : "bg-primary"}`} style={{ width: `${percent}%` }}/>
      </div>
    );
  };

  const usageCardsConfig = [
    { key: "projects",    icon: Package,    title: t("profile.projectsCreated") },
    { key: "ai",          icon: Bot,        title: t("profile.aiQueries") },
    { key: "estimations", icon: Calculator, title: t("profile.estimations") },
  ];

  return (
    <div className="py-8 px-4 md:px-8 max-w-5xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><User className="w-8 h-8"/></div>
          {t("profile.title")}
        </h1>
        <p className="text-slate-500 mt-2">{t("profile.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-blue-500 to-primary opacity-10"/>
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl font-black text-primary relative z-10 mt-4 mb-4">
              {initials}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">{user?.name}</h2>
            <p className="text-slate-500 text-sm mb-4 relative z-10">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative z-10">
              <Shield className="w-3 h-3"/> {user?.role}
            </span>
            <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 flex flex-col gap-3 relative z-10">
              <button onClick={() => setEditOpen(true)}
                className="w-full py-3 rounded-xl bg-primary/5 dark:bg-primary/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border border-primary/20">
                <Pencil className="w-4 h-4"/> {t("profile.editProfile")}
              </button>
              <button onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}
                className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                {logoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <LogOut className="w-4 h-4"/>}
                {t("profile.logout")}
              </button>
            </div>
          </div>

          {/* Restyled user info card */}
          <UserInfoCard user={user} onEdit={() => setEditOpen(true)}/>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* Subscription Banner */}
          <div className="bg-[#1D4ED8] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2"/>
            <div className="flex items-center gap-2 text-blue-200 mb-6 relative z-10">
              <CreditCard className="w-5 h-5"/>
              <h3 className="font-bold tracking-widest uppercase text-xs">{t("profile.subscriptionStatus")}</h3>
            </div>
            {usageLoading ? (
              <div className="flex items-center gap-3 text-blue-200 relative z-10"><Loader2 className="w-6 h-6 animate-spin"/><p>{tc("loading")}</p></div>
            ) : (
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="text-sm text-blue-200 mb-1">{t("profile.activePlan")}</p>
                    <h2 className="text-3xl font-black flex items-center gap-3 w-full">
                      {subData?.plan ? localize(subData.plan, "name") : t("profile.freeTier")}
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-md font-bold uppercase tracking-wider backdrop-blur-md">{t("profile.billingCycle")}</span>
                    </h2>
                  </div>
                  <Link to="/choose-plan"
                    className="px-6 py-2.5 bg-white text-[#1D4ED8] font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors text-center inline-block">
                    {t("profile.switchSubscription")}
                  </Link>
                </div>
                {usageData?.plan_ends_at && (
                  <div className="mt-6 pt-6 border-t border-blue-500/50">
                    <span className="text-sm text-blue-200">{t("profile.nextBilling")}: <strong className="text-white">{new Date(usageData.plan_ends_at).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usage Metrics */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary"/>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t("profile.usageLimits")}</h3>
            </div>
            {usageLoading ? (
              <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin"/></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {usageData?.usage && usageCardsConfig
                  .filter(card => { const m = usageData.usage[card.key]; const isUnlimited = m?.limit === "unlimited" || m?.unlimited === true; return m && !isUnlimited; })
                  .map(card => {
                    const metricData = usageData.usage[card.key];
                    const Icon = card.icon;
                    const percent = metricData.limit > 0 ? Math.min(100, Math.max(0, (metricData.used / metricData.limit) * 100)) : 0;
                    return (
                      <div key={card.key} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto p-3 opacity-20 group-hover:scale-110 transition-transform">
                          <Icon className="w-16 h-16 text-slate-500"/>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</span>
                          <div className="mt-2 flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">{metricData.used || 0}</span>
                            <span className="text-sm font-bold text-slate-400">/ {metricData.limit || "0"}</span>
                          </div>
                          <div className="mt-auto">{renderProgressBar(metricData.used || 0, metricData.limit || 0, false)}</div>
                        </div>
                      </div>
                    );
                  })}
                {usageData?.usage && usageCardsConfig.every(card => {
                  const m = usageData.usage[card.key];
                  return !m || m.limit === "unlimited" || m.unlimited === true;
                }) && (
                  <div className="col-span-full py-6 text-center text-slate-500 dark:text-slate-400">
                    {t("profile.allUnlimited")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Liked Articles */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/><h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t("profile.likedArticles")}</h3></div>
              {likedArticles.length > 0 && <Link to="/articles" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">{t("profile.viewAll")} <ArrowRight className="w-3 h-3 rtl:rotate-180"/></Link>}
            </div>
            {likedLoading ? <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400"/></div>
              : likedArticles.length === 0 ? (
                <div className="py-8 text-center"><Heart className="w-10 h-10 text-slate-200 mx-auto mb-3"/><p className="text-sm text-slate-400">{t("profile.noLiked")}</p><Link to="/articles" className="text-xs text-primary hover:underline mt-2 inline-block">{t("profile.browseArticles")}</Link></div>
              ) : (
                <div className="space-y-3">
                  {likedArticles.slice(0, 5).map(article => (
                    <Link key={article.article_id} to={`/articles/${article.slug}`}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {article.cover_img ? <img src={article.cover_img} alt={article.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen className="w-5 h-5"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary transition-colors">{article.title}</h4>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3"/> {article.likes_count}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary rtl:rotate-180 transition-all flex-shrink-0"/>
                    </Link>
                  ))}
                </div>
              )}
          </div>

          {/* Saved Articles */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2"><Bookmark className="w-5 h-5 text-yellow-500"/><h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t("profile.savedArticles")}</h3></div>
              {savedArticles.length > 0 && <Link to="/articles" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">{t("profile.viewAll")} <ArrowRight className="w-3 h-3 rtl:rotate-180"/></Link>}
            </div>
            {savedLoading ? <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400"/></div>
              : savedArticles.length === 0 ? (
                <div className="py-8 text-center"><Bookmark className="w-10 h-10 text-slate-200 mx-auto mb-3"/><p className="text-sm text-slate-400">{t("profile.noSaved")}</p><Link to="/articles" className="text-xs text-primary hover:underline mt-2 inline-block">{t("profile.browseArticles")}</Link></div>
              ) : (
                <div className="space-y-3">
                  {savedArticles.slice(0, 5).map(article => (
                    <Link key={article.article_id} to={`/articles/${article.slug}`}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {article.cover_img ? <img src={article.cover_img} alt={article.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen className="w-5 h-5"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary transition-colors">{article.title}</h4>
                        <span className="text-[11px] text-slate-400">{t("profile.saved")} {article.saved_at ? new Date(article.saved_at).toLocaleDateString() : ""}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary rtl:rotate-180 transition-all flex-shrink-0"/>
                    </Link>
                  ))}
                </div>
              )}
          </div>

        </div>
      </div>

      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)}/>}
    </div>
  );
};

export default UserProfile;
