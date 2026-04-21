import { Link, Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PublicLayout = () => {
  const { t } = useTranslation("public");

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">
      {/* ─── STICKY NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200" data-purpose="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo & Brand */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 no-underline">
              <img src="/logo.png" alt="APEX Logo" className="w-10 h-10 rounded-lg shadow-sm object-cover" />
              <span className="font-bold text-xl tracking-tight text-slate-900 uppercase">APEX</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10 rtl:space-x-reverse">
              <NavLink 
                to="/" 
                className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? "text-[#1D4ED8]" : "text-slate-600 hover:text-[#1D4ED8]"}`}
              >
                {t("nav.home")}
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? "text-[#1D4ED8]" : "text-slate-600 hover:text-[#1D4ED8]"}`}
              >
                {t("nav.aboutUs")}
              </NavLink>
              <NavLink 
                to="/articles" 
                className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? "text-[#1D4ED8]" : "text-slate-600 hover:text-[#1D4ED8]"}`}
              >
                {t("nav.articles")}
              </NavLink>
              <LanguageSwitcher variant="minimal" />
              <Link 
                to="/auth/register" 
                className="bg-[#1D4ED8] text-white px-7 py-2.5 rounded-md text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
              >
                {t("nav.getStarted")}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher variant="minimal" />
              <button className="text-slate-500" type="button">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── PAGE CONTENT ─── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── SIMPLE FOOTER ─── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12" data-purpose="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 no-underline opacity-50 hover:opacity-100 transition-opacity">
              <img src="/logo.png" alt="APEX Logo" className="w-8 h-8 rounded-lg grayscale object-cover" />
              <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">APEX ENGINE</span>
            </Link>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-500">
              <Link className="hover:text-primary transition-colors no-underline" to="/">{t("nav.home")}</Link>
              <Link className="hover:text-primary transition-colors no-underline" to="/about">{t("nav.aboutUs")}</Link>
              <Link className="hover:text-primary transition-colors no-underline" to="/articles">{t("nav.articles")}</Link>
              <Link className="hover:text-primary transition-colors no-underline" to="/privacy">{t("footer.privacy")}</Link>
            </div>

            {/* Copyright */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
