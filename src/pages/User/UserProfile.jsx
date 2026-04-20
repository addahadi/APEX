import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useSubscription";
import { useLogout } from "@/hooks/useAuth";
import { User, Mail, Shield, Calendar, LogOut, CreditCard, Activity, Package, Bot, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

const UserProfile = () => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const localize = useLocalizedField();
  const { user } = useAuthContext();
  const { data: usageData, isLoading: usageLoading } = useUsage();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "US";

  const renderProgressBar = (used, limit, unlimited) => {
    if (unlimited) {
      return (
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-2.5 rounded-full w-full opacity-50 block p-pattern" title={t("profile.unlimited")}></div>
        </div>
      );
    }
    const percent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
    const isWarning = percent > 80;
    
    return (
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full ${isWarning ? 'bg-red-500' : 'bg-primary'}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="py-8 px-4 md:px-8 max-w-5xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
           <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <User className="w-8 h-8" />
           </div>
           {t("profile.title")}
        </h1>
        <p className="text-slate-500 mt-2">{t("profile.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info & Actions */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-blue-500 to-primary opacity-10"></div>
             
             <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl font-black text-primary relative z-10 mt-4 mb-4">
                {initials}
             </div>
             
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">{user?.name}</h2>
             <p className="text-slate-500 text-sm mb-4 relative z-10">{user?.email}</p>
             
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative z-10">
               <Shield className="w-3 h-3" /> {user?.role}
             </span>

             <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 flex flex-col gap-3 relative z-10">
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {logoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  {t("profile.logout")}
                </button>
             </div>
           </div>

           {/* Account Metadata */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{t("profile.userInfo")}</h3>
             <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> {t("profile.fullName")}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">{user?.name}</span>
                </li>
                <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 -mx-6 px-6 py-3 border-y border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> {t("profile.email")}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">{user?.email}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> {t("profile.memberSince")}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">{new Date(user?.created_at).toLocaleDateString()}</span>
                </li>
             </ul>
           </div>
        </div>

        {/* Right Column: Subscription & Usage Metrics */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Subscription Banner */}
           <div className="bg-[#1D4ED8] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
             <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="flex items-center gap-2 text-blue-200 mb-6 relative z-10">
               <CreditCard className="w-5 h-5" />
               <h3 className="font-bold tracking-widest uppercase text-xs">{t("profile.subscriptionStatus")}</h3>
             </div>

             {usageLoading ? (
               <div className="flex items-center gap-3 text-blue-200 relative z-10">
                 <Loader2 className="w-6 h-6 animate-spin" />
                 <p>{tc("loading")}</p>
               </div>
             ) : (
               <div className="relative z-10">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                   <div>
                     <p className="text-sm text-blue-200 mb-1">{t("profile.activePlan")}</p>
                     <h2 className="text-3xl font-black flex items-center gap-3 w-full">
                        {usageData?.plan ? localize(usageData.plan, 'name') : t("profile.freeTier", "Free Tier")}
                        <span className="text-xs px-2 py-1 bg-white/20 rounded-md font-bold uppercase tracking-wider backdrop-blur-md">
                          {t("profile.billingCycle")}
                        </span>
                     </h2>
                   </div>
                   <Link 
                     to="/choose-plan"
                     className="px-6 py-2.5 bg-white text-[#1D4ED8] font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors text-center inline-block"
                   >
                     {t("profile.switchSubscription")}
                   </Link>
                 </div>
                 
                 {usageData?.plan_ends_at && (
                    <div className="mt-6 pt-6 border-t border-blue-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <span className="text-sm text-blue-200">{t("profile.nextBilling")}: <strong className="text-white">{new Date(usageData.plan_ends_at).toLocaleDateString()}</strong></span>
                    </div>
                 )}
               </div>
             )}
           </div>

           {/* Usage Metrics */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
               <Activity className="w-5 h-5 text-primary" />
               <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t("profile.usageLimits")}</h3>
             </div>

             {usageLoading ? (
               <div className="py-12 flex justify-center text-slate-400">
                 <Loader2 className="w-8 h-8 animate-spin" />
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 {/* Projects Usage */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto p-3 opacity-20 group-hover:scale-110 transition-transform">
                     <Package className="w-16 h-16 text-slate-500" />
                   </div>
                   <div className="relative z-10 flex flex-col h-full">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("profile.projectsCreated")}</span>
                     <div className="mt-2 flex items-baseline gap-2 mb-4">
                       <span className="text-3xl font-black text-slate-800 dark:text-white">{usageData?.usage?.projects?.used || 0}</span>
                       <span className="text-sm font-bold text-slate-400">
                         / {usageData?.usage?.projects?.unlimited ? t("profile.unlimited") : (usageData?.usage?.projects?.limit || "0")}
                       </span>
                     </div>
                     <div className="mt-auto">
                       {renderProgressBar(usageData?.usage?.projects?.used || 0, usageData?.usage?.projects?.limit || 0, usageData?.usage?.projects?.unlimited)}
                     </div>
                   </div>
                 </div>

                 {/* AI Usage */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto p-3 opacity-20 group-hover:scale-110 transition-transform">
                     <Bot className="w-16 h-16 text-slate-500" />
                   </div>
                   <div className="relative z-10 flex flex-col h-full">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("profile.aiQueries")}</span>
                     <div className="mt-2 flex items-baseline gap-2 mb-4">
                       <span className="text-3xl font-black text-slate-800 dark:text-white">{usageData?.usage?.ai?.used || 0}</span>
                       <span className="text-sm font-bold text-slate-400">
                         / {usageData?.usage?.ai?.unlimited ? t("profile.unlimited") : (usageData?.usage?.ai?.limit || "0")}
                       </span>
                     </div>
                     <div className="mt-auto">
                       {renderProgressBar(usageData?.usage?.ai?.used || 0, usageData?.usage?.ai?.limit || 0, usageData?.usage?.ai?.unlimited)}
                     </div>
                   </div>
                 </div>

               </div>
             )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
