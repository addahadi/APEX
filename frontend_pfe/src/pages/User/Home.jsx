import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkPlus, Calculator, ChevronDown, ArrowRight,
  Activity, Cpu, Building2, Layers,
  Bot, Globe, FileText, CheckCircle2, Zap
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── FAQ accordion item ───
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
      ${open ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-8 py-6 text-left rtl:text-right flex justify-between items-center gap-4 bg-transparent"
      >
        <span className="text-lg font-bold text-slate-900">{q}</span>
        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180 bg-blue-100" : "bg-slate-100"}`}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </button>
      <div
        className="transition-all duration-500 ease-in-out overflow-hidden"
        style={{ maxHeight: open ? "300px" : "0px" }}
      >
        <p className="px-8 pb-7 text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-5 rtl:text-right">
          {a}
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  const { t, i18n } = useTranslation("public");
  const container = useRef();
  const isRTL = i18n.language === 'ar';

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    tl.from(".hero-tag",    { y: 20, opacity: 0, delay: 0.15 })
      .from(".hero-title",  { y: 50, opacity: 0, stagger: 0.15 }, "-=0.8")
      .from(".hero-desc",   { y: 20, opacity: 0 }, "-=0.9")
      .from(".hero-btns",   { y: 20, opacity: 0 }, "-=0.8")
      .from(".hero-social", { y: 10, opacity: 0 }, "-=0.6")
      .from(".hero-card",   { scale: 0.92, opacity: 0, x: isRTL ? -40 : 40 }, "-=1.1");

    gsap.from(".stat-item", {
      scrollTrigger: { trigger: ".stats-section", start: "top 80%" },
      y: 30, opacity: 0, stagger: 0.12, duration: 0.6,
    });
    gsap.from(".faq-item", {
      scrollTrigger: { trigger: ".faq-section", start: "top 80%" },
      y: 30, opacity: 0, stagger: 0.12, duration: 0.6,
    });
  }, { scope: container, dependencies: [isRTL] });

  const modules = [
    { id: "majorWorks",   icon: <Building2 className="w-5 h-5" />, accent: "text-orange-600", iconBg: "bg-orange-50",  ring: "border-orange-200 bg-orange-50/50 hover:border-orange-300 hover:bg-orange-50" },
    { id: "interior",     icon: <Layers    className="w-5 h-5" />, accent: "text-emerald-600", iconBg: "bg-emerald-50", ring: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50" },
    { id: "doorsWindows", icon: <FileText  className="w-5 h-5" />, accent: "text-violet-600",  iconBg: "bg-violet-50",  ring: "border-violet-200 bg-violet-50/50 hover:border-violet-300 hover:bg-violet-50" },
    { id: "finishing",    icon: <Zap       className="w-5 h-5" />, accent: "text-blue-600",    iconBg: "bg-blue-50",    ring: "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50" },
  ];

  return (
    <div ref={container} className="bg-white overflow-hidden text-slate-900">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`, backgroundSize: "28px 28px", opacity: 0.5 }}
        />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[130px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-indigo-100 rounded-full blur-[110px] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="rtl:text-right">
              <span className="hero-tag inline-flex items-center gap-2 px-4 py-1.5 mb-7 text-xs font-bold tracking-[0.18em] text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                {t("hero.tagline")}
              </span>
              <h1 className="hero-title text-5xl lg:text-7xl font-black leading-[1.02] mb-6 tracking-tight text-slate-900">
                {t("hero.titleLine1")}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
                  {t("hero.titleLine2")}
                </span>
              </h1>
              <p className="hero-desc text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
                {t("hero.description")}
              </p>
              <div className="hero-btns flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(29,78,216,0.25)] text-base">
                  {t("hero.startTrial")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                </Link>
                <Link to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-base">
                  {t("hero.watchDemo")}
                </Link>
              </div>
              <div className="hero-social mt-10 flex items-center gap-5 rtl:flex-row-reverse rtl:justify-end">
                <div className="flex -space-x-2.5 rtl:space-x-reverse">
                  {[1, 2, 3, 4].map(idx => (
                    <img key={idx} className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                      src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt="User" />
                  ))}
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{t("hero.socialProof")}</p>
              </div>
            </div>

            <div className="hero-card relative">
              <div className="absolute -inset-4 bg-blue-200/40 rounded-[44px] blur-2xl" />
              <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-300/50">
                <img alt="Construction site" className="w-full object-cover aspect-[4/3]"
                  src="https://images.unsplash.com/photo-1541888941259-7907ff12adfe?auto=format&fit=crop&q=80&w=1200"
                  style={{ filter: "brightness(0.75) saturate(0.9)" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

                <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t("hero.liveAI")}</span>
                </div>
                <div className="absolute top-5 right-5 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">Llama 3.3 70B</span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-3 rtl:flex-row-reverse">
                    <div className="rtl:text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600/80 mb-0.5">{t("hero.liveAI")}</p>
                      <p className="text-sm font-bold text-slate-900">{t("hero.projectName")}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full w-[94%] rounded-full" />
                  </div>
                  <div className="flex justify-between rtl:flex-row-reverse">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formula Accuracy</p>
                    <p className="text-xs font-black text-blue-600">94% {t("hero.accuracyRate")}</p>
                  </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl hidden lg:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modules</p>
                  <p className="text-2xl font-black text-slate-900">11</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="modules-section py-28 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full mb-5">
              Platform Modules
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight">{t("modules.title")}</h2>
            <p className="text-lg text-slate-500">{t("modules.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <div key={mod.id}
                className={`module-card group relative p-7 rounded-2xl border transition-all duration-300 rtl:text-right cursor-default ${mod.ring}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${mod.iconBg} ${mod.accent} rtl:ml-auto rtl:mr-0 group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{t(`modules.${mod.id}.title`)}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{t(`modules.${mod.id}.desc`)}</p>
                <div className={`mt-5 flex items-center text-xs font-bold ${mod.accent} opacity-0 group-hover:opacity-100 transition-opacity rtl:flex-row-reverse rtl:justify-end gap-1`}>
                  {t("modules.explore")} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {[
              { id: "costService", icon: <Globe className="w-5 h-5" />, accent: "text-amber-600", iconBg: "bg-amber-50",
                ring: "border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50",
                title: t("aboutUs.modules.costService"), desc: t("aboutUs.modules.costServiceDesc") },
              { id: "aiAssistant", icon: <Bot className="w-5 h-5" />, accent: "text-pink-600", iconBg: "bg-pink-50",
                ring: "border-pink-200 bg-pink-50/50 hover:border-pink-300 hover:bg-pink-50",
                title: t("aboutUs.modules.aiAssistant"), desc: t("aboutUs.modules.aiAssistantDesc") },
            ].map((mod) => (
              <div key={mod.id}
                className={`module-card group relative p-7 rounded-2xl border transition-all duration-300 rtl:text-right cursor-default ${mod.ring}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${mod.iconBg} ${mod.accent} rtl:ml-auto rtl:mr-0 group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{mod.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section py-20 border-y border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: <Cpu className="w-5 h-5" />,      label: "Sub-Modules",   value: "11",      color: "text-blue-600",    bg: "bg-blue-50 border-blue-100"   },
              { icon: <Bot className="w-5 h-5" />,      label: "Bilingual FAQ", value: "168",     color: "text-pink-600",    bg: "bg-pink-50 border-pink-100"   },
              { icon: <Activity className="w-5 h-5" />, label: "Response Time", value: "< 2s",    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { icon: <Globe className="w-5 h-5" />,    label: "Languages",     value: "EN / AR", color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
            ].map((stat, i) => (
              <div key={i} className="stat-item text-center flex flex-col items-center">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section py-32 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-200 rounded-full mb-5">
              Core Capabilities
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight">{t("features.title")}</h2>
            <p className="text-lg text-slate-500 leading-relaxed">{t("features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                icon: <Calculator className="w-7 h-7" />, key: "calc",
                color: "text-blue-600", iconBg: "bg-blue-50", cardBg: "bg-blue-50/40 border-blue-100 hover:bg-blue-50",
                bullets: ["math.js real-time parser", "hauteur × largeur formula", "No-code formula updates"],
              },
              {
                icon: <BookmarkPlus className="w-7 h-7" />, key: "bookmark",
                color: "text-violet-600", iconBg: "bg-violet-50", cardBg: "bg-violet-50/40 border-violet-100 hover:bg-violet-50",
                bullets: ["Root → sub-category → leaf", "Progressive form loading", "Multi-session persistence"],
              },
              {
                icon: <Globe className="w-7 h-7" />, key: "blog",
                color: "text-amber-600", iconBg: "bg-amber-50", cardBg: "bg-amber-50/40 border-amber-100 hover:bg-amber-50",
                bullets: ["Live Exchange Rate API", "×1.7 parallel market factor", "3-tier budget (Opt/Normal/Pess)"],
              },
            ].map((f) => (
              <div key={f.key}
                className={`feature-card group p-9 rounded-3xl border transition-all duration-500 rtl:text-right ${f.cardBg}`}>
                <div className={`w-14 h-14 rounded-2xl ${f.iconBg} border border-slate-100 flex items-center justify-center mb-7 ${f.color} group-hover:scale-110 transition-transform rtl:ml-auto rtl:mr-0`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t(`features.${f.key}.title`)}</h3>
                <p className="text-slate-500 leading-relaxed mb-6 text-base">{t(`features.${f.key}.desc`)}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500 rtl:flex-row-reverse">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${f.color}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section py-32 border-t border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-200 rounded-full mb-5">FAQ</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">{t("faq.title")}</h2>
            <p className="text-lg text-slate-500">{t("faq.subtitle")}</p>
          </div>
          <div className="space-y-4">
            {[
              { q: t("faq.q1"), a: t("faq.a1") },
              { q: t("faq.q2"), a: t("faq.a2") },
              { q: t("faq.q3"), a: t("faq.a3") },
            ].map((item, idx) => (
              <div key={idx} className="faq-item"><FAQItem q={item.q} a={item.a} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-blue-400/30 rounded-full blur-[90px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-blue-100 uppercase bg-white/10 border border-white/20 rounded-full mb-8">
            Ibn Khaldoun University · Tiaret · 2025–2026
          </span>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">{t("cta.title")}</h2>
          <p className="text-blue-100 text-lg mb-12 max-w-xl mx-auto leading-relaxed">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-800/20 text-base">
              {t("nav.getStarted")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link to="/about"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-base">
              {t("nav.aboutUs")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;