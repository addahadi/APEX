import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Target, Users, Award, ShieldCheck, Zap } from "lucide-react";
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
        
        tl.from(".about-hero-title", { y: 50, opacity: 0, delay: 0.3 })
          .from(".about-hero-text", { y: 30, opacity: 0 }, "-=0.7")
          .from(".about-stat", { scale: 0.8, opacity: 0, stagger: 0.1 }, "-=0.5");

        gsap.from(".story-content > *", {
            scrollTrigger: {
                trigger: ".story-section",
                start: "top 70%",
            },
            x: isRTL ? 50 : -50,
            opacity: 0,
            stagger: 0.2,
            duration: 1
        });

        gsap.from(".value-card", {
            scrollTrigger: {
                trigger: ".values-section",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8
        });

    }, { scope: container, dependencies: [isRTL] });

    return (
        <div ref={container} className="bg-white overflow-hidden">
            {/* ─── Hero Section ─── */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-slate-50">
                <div className="absolute inset-0 z-0 opacity-40 dot-grid"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1.5 mb-8 text-xs font-black tracking-widest text-primary uppercase bg-primary/10 rounded-full">
                           AEC Logic & Innovation
                        </span>
                        <h1 className="about-hero-title text-5xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                            {t("aboutUs.title")}
                        </h1>
                        <p className="about-hero-text text-xl lg:text-2xl text-slate-600 mb-16 leading-relaxed font-medium">
                            {t("aboutUs.subtitle")}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: t("aboutUs.stats.accuracy"), value: "99.9%" },
                                { label: t("aboutUs.stats.tracked"), value: "1.2k+" },
                                { label: t("aboutUs.stats.users"), value: "8.5k" },
                                { label: t("aboutUs.stats.logic"), value: "400k+" }
                            ].map((stat, i) => (
                                <div key={i} className="about-stat p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Mission & Story ─── */}
            <section className="story-section py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="story-content rtl:text-right">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20 rtl:mr-0 rtl:ml-auto">
                                <Target className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">{t("aboutUs.mission")}</h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
                                {t("aboutUs.missionDesc")}
                            </p>
                            
                            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">{t("aboutUs.story")}</h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                {t("aboutUs.storyDesc")}
                            </p>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                            <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-8 border-white">
                                <img 
                                    className="w-full h-[600px] object-cover" 
                                    src="https://images.unsplash.com/photo-1503387762-592dee581106?auto=format&fit=crop&q=80&w=800" 
                                    alt="Engineering Innovation" 
                                />
                                <div className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur-md p-8 rounded-[32px] border border-slate-100 rtl:text-right">
                                    <p className="text-slate-900 font-bold italic text-lg leading-relaxed">
                                        "APEX isn't just software; it's the digital skeleton of modern infrastructure planning."
                                    </p>
                                    <p className="mt-4 font-black uppercase text-xs tracking-widest text-primary">— Lead Engine Architect</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Core Values ─── */}
            <section className="values-section py-32 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight">{t("aboutUs.coreLogic")}</h2>
                        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">{t("aboutUs.coreLogicDesc")}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: <Zap className="w-10 h-10" />, 
                                title: t("aboutUs.values.precision"), 
                                desc: t("aboutUs.values.precisionDesc")
                            },
                            { 
                                icon: <Activity className="w-10 h-10" />, 
                                title: t("aboutUs.values.flexibility"), 
                                desc: t("aboutUs.values.flexibilityDesc")
                            },
                            { 
                                icon: <ShieldCheck className="w-10 h-10" />, 
                                title: t("aboutUs.values.innovation"), 
                                desc: t("aboutUs.values.innovationDesc")
                            }
                        ].map((v, i) => (
                            <div key={i} className="value-card group p-12 rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 rtl:text-right">
                                <div className="text-primary mb-8 group-hover:scale-110 transition-transform rtl:ml-auto rtl:mr-0">{v.icon}</div>
                                <h3 className="text-2xl font-bold mb-4 tracking-tight">{v.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-medium">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Join Section ─── */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="flex justify-center mb-12">
                        <div className="flex -space-x-4 rtl:space-x-reverse">
                            {[20, 21, 22, 23, 24].map(idx => (
                                <img 
                                    key={idx}
                                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg" 
                                    src={`https://i.pravatar.cc/150?img=${idx}`} 
                                    alt="Team member" 
                                />
                            ))}
                        </div>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight">{t("aboutUs.builtBy")}</h2>
                    <p className="text-xl text-slate-600 mb-12 font-medium">{t("aboutUs.joinUs")}</p>
                    <button className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-black/10 text-lg">
                        {t("aboutUs.viewRoles")}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
