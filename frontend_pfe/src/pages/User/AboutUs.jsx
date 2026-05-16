import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Layers, Bot, Building2, FileText, Zap, Globe, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
    const { t, i18n } = useTranslation("public");
    const container = useRef();
    const isRTL = i18n.language === 'ar';

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

        tl.from(".about-hero-badge", { y: -20, opacity: 0, delay: 0.2 })
          .from(".about-hero-title", { y: 60, opacity: 0 }, "-=0.7")
          .from(".about-hero-text",  { y: 30, opacity: 0 }, "-=0.7")
          .from(".about-stat",       { scale: 0.85, opacity: 0, stagger: 0.12 }, "-=0.5");

        gsap.from(".story-content > *", {
            scrollTrigger: { trigger: ".story-section", start: "top 70%" },
            x: isRTL ? 50 : -50, opacity: 0, stagger: 0.2, duration: 1,
        });

        gsap.from(".module-card", {
            scrollTrigger: { trigger: ".modules-section", start: "top 75%" },
            y: 50, opacity: 0, stagger: 0.1, duration: 0.7,
        });

        gsap.from(".tech-pill", {
            scrollTrigger: { trigger: ".tech-section", start: "top 80%" },
            scale: 0, opacity: 0, stagger: 0.05, duration: 0.4, ease: "back.out(2)",
        });

        gsap.from(".value-card", {
            scrollTrigger: { trigger: ".values-section", start: "top 80%" },
            y: 40, opacity: 0, stagger: 0.15, duration: 0.8,
        });

    }, { scope: container, dependencies: [isRTL] });

    const modules = [
        {
            icon: <Building2 className="w-6 h-6" />,
            title: t("aboutUs.modules.majorWorks"),
            desc: t("aboutUs.modules.majorWorksDesc"),
            iconBg: "bg-orange-50 text-orange-600",
            border: "border-orange-200",
            bg: "bg-orange-50/40 hover:bg-orange-50",
        },
        {
            icon: <Layers className="w-6 h-6" />,
            title: t("aboutUs.modules.finishing"),
            desc: t("aboutUs.modules.finishingDesc"),
            iconBg: "bg-blue-50 text-blue-600",
            border: "border-blue-200",
            bg: "bg-blue-50/40 hover:bg-blue-50",
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: t("aboutUs.modules.doorsWindows"),
            desc: t("aboutUs.modules.doorsWindowsDesc"),
            iconBg: "bg-violet-50 text-violet-600",
            border: "border-violet-200",
            bg: "bg-violet-50/40 hover:bg-violet-50",
        },
        {
            icon: <Calculator className="w-6 h-6" />,
            title: t("aboutUs.modules.interior"),
            desc: t("aboutUs.modules.interiorDesc"),
            iconBg: "bg-emerald-50 text-emerald-600",
            border: "border-emerald-200",
            bg: "bg-emerald-50/40 hover:bg-emerald-50",
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t("aboutUs.modules.costService"),
            desc: t("aboutUs.modules.costServiceDesc"),
            iconBg: "bg-amber-50 text-amber-600",
            border: "border-amber-200",
            bg: "bg-amber-50/40 hover:bg-amber-50",
        },
        {
            icon: <Bot className="w-6 h-6" />,
            title: t("aboutUs.modules.aiAssistant"),
            desc: t("aboutUs.modules.aiAssistantDesc"),
            iconBg: "bg-pink-50 text-pink-600",
            border: "border-pink-200",
            bg: "bg-pink-50/40 hover:bg-pink-50",
        },
    ];

    const techStack = [
        "Node.js", "Express", "PostgreSQL", "Supabase", "React",
        "math.js", "Groq API", "Llama 3.3 70B", "JWT", "Zod",
        "REST API", "PDF Export", "Exchange Rate API", "i18n (EN/AR)",
    ];

    return (
        <div ref={container} className="bg-white text-slate-900 overflow-hidden">

            {/* ─── Hero ─── */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
                {/* Dot grid */}
                <div className="absolute inset-0 z-0 pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`, backgroundSize: "28px 28px", opacity: 0.5 }}
                />
                {/* Soft glow blobs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-80 pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-100 rounded-full blur-[100px] opacity-70 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <span className="about-hero-badge inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            Ibn Khaldoun University · Tiaret · 2025–2026
                        </span>
                        <h1 className="about-hero-title text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
                            {t("aboutUs.title")}
                        </h1>
                        <p className="about-hero-text text-lg lg:text-xl text-slate-600 mb-16 leading-relaxed max-w-2xl mx-auto">
                            {t("aboutUs.subtitle")}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: t("aboutUs.stats.modules"),   value: "11",   sub: t("aboutUs.stats.modulesSub") },
                                { label: t("aboutUs.stats.entries"),   value: "168",  sub: t("aboutUs.stats.entriesSub") },
                                { label: t("aboutUs.stats.languages"), value: "2",    sub: t("aboutUs.stats.languagesSub") },
                                { label: t("aboutUs.stats.accuracy"),  value: "<2s",  sub: t("aboutUs.stats.accuracySub") },
                            ].map((stat, i) => (
                                <div key={i}
                                    className="about-stat p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                                    <p className="text-3xl font-black text-blue-600 mb-1">{stat.value}</p>
                                    <p className="text-sm font-bold text-slate-900 mb-0.5">{stat.label}</p>
                                    <p className="text-xs text-slate-500">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Mission & Story ─── */}
            <section className="story-section py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="story-content rtl:text-right">
                            <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full mb-6">
                                {t("aboutUs.missionLabel")}
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-5 tracking-tight">
                                {t("aboutUs.mission")}
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-10">
                                {t("aboutUs.missionDesc")}
                            </p>

                            <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-200 rounded-full mb-6">
                                {t("aboutUs.storyLabel")}
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-5 tracking-tight">
                                {t("aboutUs.story")}
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {t("aboutUs.storyDesc")}
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-80 pointer-events-none" />
                            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/80">
                                <img
                                    className="w-full h-[520px] object-cover"
                                    src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800"
                                    alt="Construction Engineering"
                                    style={{ filter: "brightness(0.8) saturate(0.9)" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white shadow-lg rtl:text-right">
                                        <p className="text-slate-800 font-semibold italic text-base leading-relaxed mb-3">
                                            "{t("aboutUs.quote")}"
                                        </p>
                                        <p className="font-black uppercase text-xs tracking-widest text-blue-600">
                                            — {t("aboutUs.quoteAuthor")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Platform Modules ─── */}
            <section className="modules-section py-32 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-200 rounded-full mb-5">
                            {t("aboutUs.modulesLabel")}
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight">
                            {t("aboutUs.modulesTitle")}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t("aboutUs.modulesSubtitle")}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {modules.map((mod, i) => (
                            <div key={i}
                                className={`module-card group relative p-7 rounded-2xl border transition-all duration-300 cursor-default hover:scale-[1.02] hover:shadow-md rtl:text-right ${mod.border} ${mod.bg}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${mod.iconBg} transition-transform group-hover:scale-110 rtl:ml-auto rtl:mr-0`}>
                                    {mod.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{mod.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Tech Stack ─── */}
            <section className="tech-section py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-amber-700 uppercase bg-amber-50 border border-amber-200 rounded-full mb-6">
                        {t("aboutUs.techLabel")}
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">{t("aboutUs.techTitle")}</h2>
                    <p className="text-slate-500 mb-12 max-w-xl mx-auto">{t("aboutUs.techSubtitle")}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {techStack.map((tech, i) => (
                            <span key={i}
                                className="tech-pill px-4 py-2 rounded-full text-sm font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 cursor-default">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Core Values ─── */}
            <section className="values-section py-32 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight">
                            {t("aboutUs.coreLogic")}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t("aboutUs.coreLogicDesc")}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-8 h-8" />,
                                color: "text-blue-600", iconBg: "bg-blue-50",
                                border: "border-blue-100", bg: "bg-white hover:bg-blue-50/50",
                                title: t("aboutUs.values.precision"),
                                desc: t("aboutUs.values.precisionDesc"),
                            },
                            {
                                icon: <Calculator className="w-8 h-8" />,
                                color: "text-violet-600", iconBg: "bg-violet-50",
                                border: "border-violet-100", bg: "bg-white hover:bg-violet-50/50",
                                title: t("aboutUs.values.flexibility"),
                                desc: t("aboutUs.values.flexibilityDesc"),
                            },
                            {
                                icon: <ShieldCheck className="w-8 h-8" />,
                                color: "text-emerald-600", iconBg: "bg-emerald-50",
                                border: "border-emerald-100", bg: "bg-white hover:bg-emerald-50/50",
                                title: t("aboutUs.values.innovation"),
                                desc: t("aboutUs.values.innovationDesc"),
                            },
                        ].map((v, i) => (
                            <div key={i}
                                className={`value-card group p-10 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-500 rtl:text-right ${v.border} ${v.bg}`}>
                                <div className={`w-14 h-14 rounded-2xl ${v.iconBg} flex items-center justify-center mb-7 ${v.color} group-hover:scale-110 transition-transform inline-flex rtl:ml-auto rtl:mr-0`}>
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{v.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Team CTA ─── */}
            <section className="py-24 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-blue-400/30 rounded-full blur-[90px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <div className="flex justify-center mb-10">
                        <div className="flex -space-x-3 rtl:space-x-reverse">
                            {[10, 11, 12, 13, 14, 15].map(idx => (
                                <img
                                    key={idx}
                                    className="w-12 h-12 rounded-full border-2 border-blue-600 shadow-lg"
                                    src={`https://i.pravatar.cc/150?img=${idx}`}
                                    alt="Team member"
                                />
                            ))}
                        </div>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
                        {t("aboutUs.builtBy")}
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">{t("aboutUs.joinUs")}</p>
                    <button className="px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-800/20 text-base">
                        {t("aboutUs.viewRoles")}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
