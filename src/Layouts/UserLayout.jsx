import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Bot as BotIcon } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import { useAuthContext } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const UserLayout = () => {
  const { t } = useTranslation("common");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuthContext();
  
  // Get initials from user's name (e.g. "Ahmed Karim" -> "AK")
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "US";

  const isDashboard = window.location.pathname.includes('/dashboard');
  const isProject = window.location.pathname.includes('/projects/');
  const currentLocation = isDashboard ? 'DASHBOARD' : isProject ? 'PROJECT_OVERVIEW' : 'GENERAL';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* ─── STICKY USER HEADER ─── */}
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="APEX Logo" className="w-8 h-8 rounded-lg object-cover" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">{t("appName")}</h2>
          </Link>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="minimal" />
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shrink-0"
            >
              <BotIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t("aiAssistant")}</span>
            </button>
            <Link 
              to="/profile"
              className="size-10 shrink-0 rounded-full bg-[#1D4ED8]/10 flex items-center justify-center text-[#1D4ED8] font-bold border border-[#1D4ED8]/20 hover:bg-[#1D4ED8]/20 transition-all cursor-pointer" 
              title={user?.name}
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── PAGE CONTENT AREA ─── */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-x-hidden">
        <Outlet />
      </main>
      {/* ─── GLOBAL CHATBOT ─── */}
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        location={currentLocation}
      />
    </div>
  );
};

export default UserLayout;
