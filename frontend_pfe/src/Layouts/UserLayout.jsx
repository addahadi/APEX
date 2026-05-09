import React, { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { Bot as BotIcon, BookOpen } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import { useAuthContext } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/admin/ui-atoms";

const UserLayout = () => {
  const { t } = useTranslation("common");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuthContext();
  
  // Get initials from user's name (e.g. "Ahmed Karim" -> "AK")
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "US";

  const locationPath = window.location.pathname;
  let currentLocation = 'GENERAL';
  if (locationPath.includes('/dashboard')) currentLocation = 'USER_DASHBOARD';
  else if (locationPath.includes('/profile')) currentLocation = 'USER_PROFILE';
  else if (locationPath.includes('/history')) currentLocation = 'PROJECT_HISTORY';
  else if (locationPath.includes('/projects/')) currentLocation = 'PROJECT_OVERVIEW';

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
            <NavLink
              to="/articles"
              className={({ isActive }) =>
                `hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-slate-600 hover:text-primary hover:bg-primary/5"
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              Articles
            </NavLink>
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
              style={{ textDecoration: "none" }}
              title={user?.name}
            >
              <Avatar 
                src={user?.profile_img} 
                initials={initials} 
                size={40} 
                style={{ cursor: "pointer", border: "1px solid rgba(29, 78, 216, 0.2)" }} 
              />
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
