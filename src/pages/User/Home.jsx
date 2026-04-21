import { useRef } from "react";
import { Link } from "react-router-dom";
import { BookmarkPlus, Calculator, ChevronDown, Rss, ArrowRight, Activity, Zap, Shield, Cpu } from 'lucide-react';
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t, i18n } = useTranslation("public");
  const container = useRef();
  const isRTL = i18n.language === 'ar';

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    
    tl.from(".hero-tag", { y: 20, opacity: 0, delay: 0.2 })
      .from(".hero-title", { y: 40, opacity: 0, stagger: 0.2 }, "-=0.8")
      .from(".hero-desc", { y: 20, opacity: 0 }, "-=1")
      .from(".hero-btns", { y: 20, opacity: 0 }, "-=0.8")
      .from(".hero-social", { y: 10, opacity: 0 }, "-=0.6")
      .from(".hero-image", { scale: 1.1, opacity: 0, x: isRTL ? -50 : 50 }, "-=1.2");

    // Feature Cards Scroll Reveal
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: ".features-section",
        start: "top 80%",
      },
      y: 60,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power2.out"
    });

    // Tech Section Reveal
    gsap.from(".tech-reveal", {
      scrollTrigger: {
        trigger: ".tech-section",
        start: "top 75%",
      },
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8
    });

  }, { scope: container, dependencies: [isRTL] });

  return (
    <div ref={container} className="bg-white overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 pb-24 lg:pt-32 lg:pb-40">
        {/* Background Mesh Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="rtl:text-right">
              <span className="hero-tag inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] text-primary uppercase bg-primary/5 border border-primary/10 rounded-full">
                {t("hero.tagline")}
              </span>
              <h1 className="hero-title text-6xl lg:text-8xl font-black text-slate-900 leading-[1] mb-8 tracking-tighter">
                {t("hero.titleLine1")} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  {t("hero.titleLine2")}
                </span>
              </h1>
              <p className="hero-desc text-xl text-slate-600 mb-12 leading-relaxed max-w-xl font-medium">
                {t("hero.description")}
              </p>
              <div className="hero-btns flex flex-col sm:flex-row gap-5">
                <Link to="/auth/register" className="group inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(29,78,216,0.2)]">
                  {t("hero.startTrial")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all">
                  {t("hero.watchDemo")}
                </button>
              </div>
              
              <div className="hero-social mt-12 flex items-center gap-6 rtl:flex-row-reverse rtl:justify-end">
                 <div className="flex -space-x-3 rtl:space-x-reverse">
                  {[1,2,3,4].map(idx => (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="h-8 w-[1px] bg-slate-200"></div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{t("hero.socialProof")}</p>
              </div>
            </div>
            
            <div className="hero-image relative lg:ml-10 rtl:lg:mr-10 rtl:lg:ml-0">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-[40px] blur-2xl opacity-30"></div>
              <div className="relative z-10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12)] border-[12px] border-white/50 backdrop-blur-sm">
                <img 
                  alt="Precision Estimation Engine" 
                  className="w-full object-cover aspect-[4/3] transform hover:scale-110 transition-transform duration-700" 
                  src="https://images.unsplash.com/photo-1541888941259-7907ff12adfe?auto=format&fit=crop&q=80&w=1200" 
                />
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50">
                  <div className="flex items-center justify-between mb-4 rtl:flex-row-reverse">
                    <div className="rtl:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">{t("hero.liveAI")}</p>
                      <p className="text-lg font-bold text-slate-900">{t("hero.projectName")}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[94%]" />
                  </div>
                  <div className="flex justify-between mt-3 rtl:flex-row-reverse">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Integrity</p>
                    <p className="text-sm font-black text-primary">98.4% {t("hero.accuracyRate")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Specialized Modules Section ─── */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">{t("modules.title")}</h2>
            <p className="text-xl text-slate-500 font-medium">{t("modules.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "majorWorks", icon: <Cpu className="w-6 h-6" />, color: "bg-blue-600" },
              { id: "interior", icon: <Shield className="w-6 h-6" />, color: "bg-indigo-600" },
              { id: "doorsWindows", icon: <Zap className="w-6 h-6" />, color: "bg-cyan-600" },
              { id: "finishing", icon: <Activity className="w-6 h-6" />, color: "bg-sky-600" }
            ].map((mod) => (
              <div key={mod.id} className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all duration-300 rtl:text-right">
                <div className={`w-12 h-12 ${mod.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/10 rtl:ml-auto rtl:mr-0`}>
                  {mod.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{t(`modules.${mod.id}.title`)}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{t(`modules.${mod.id}.desc`)}</p>
                <div className="mt-6 flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity rtl:flex-row-reverse rtl:justify-end">
                  {t("modules.explore")} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats/Tech Section ─── */}
      <section className="tech-section py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { icon: <Cpu />, label: "Engine Speed", value: "0.04ms" },
              { icon: <Zap />, label: "Calculations/Sec", value: "24.5k" },
              { icon: <Shield />, label: "Data Integrity", value: "Tier-1" },
              { icon: <Activity />, label: "Response Time", value: "Real-time" }
            ].map((stat, i) => (
              <div key={i} className="tech-reveal text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-4 border border-slate-100">
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="features-section py-32 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">{t("features.title")}</h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">{t("features.subtitle")}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="feature-card group p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 rtl:text-right">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 rtl:ml-auto">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{t("features.calc.title")}</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">{t("features.calc.desc")}</p>
            </div>
            
            <div className="feature-card group p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 rtl:text-right">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 rtl:ml-auto">
                <BookmarkPlus className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{t("features.bookmark.title")}</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">{t("features.bookmark.desc")}</p>
            </div>
            
            <div className="feature-card group p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 rtl:text-right">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 rtl:ml-auto">
                <Rss className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{t("features.blog.title")}</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">{t("features.blog.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-32 bg-slate-900 text-white" data-purpose="faq-accordion">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">{t("faq.title")}</h2>
            <p className="text-xl text-slate-400 font-medium">{t("faq.subtitle")}</p>
          </div>
          <div className="space-y-6">
            {[
              { q: t("faq.q1"), a: t("faq.a1") },
              { q: t("faq.q2"), a: t("faq.a2") },
              { q: t("faq.q3"), a: t("faq.a3") },
            ].map((item, idx) => (
              <div key={idx} className="group bg-white/5 border border-white/10 rounded-[24px] overflow-hidden hover:border-white/20 transition-all duration-300">
                <button className="w-full px-8 py-7 text-left rtl:text-right flex justify-between items-center bg-transparent transition-colors peer">
                  <span className="text-xl font-bold">{item.q}</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-focus-within:rotate-180 transition-transform">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div className="max-h-0 overflow-hidden transition-[max-height] duration-500 ease-in-out group-focus-within:max-h-[300px]">
                  <div className="px-8 pb-8 text-slate-400 text-lg leading-relaxed font-medium border-t border-white/5 pt-6 rtl:text-right">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 dot-grid"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tight">{t("cta.title")}</h2>
          <p className="text-blue-100 text-xl mb-12 font-medium">{t("cta.subtitle")}</p>
          <Link to="/auth/register" className="inline-flex items-center justify-center px-12 py-5 bg-white text-primary font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-black/10 text-lg">
             {t("nav.getStarted")}
             <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
