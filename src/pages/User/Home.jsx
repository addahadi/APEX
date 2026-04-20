import { Link } from "react-router-dom";
import { BookmarkPlus, Calculator, CheckCircle, ChevronDown, Rss } from 'lucide-react';
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation("public");

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40" data-purpose="hero-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-primary uppercase bg-blue-50 rounded-full">
                {t("hero.tagline")}
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                {t("hero.titleLine1")} <br/><span className="text-primary">{t("hero.titleLine2")}</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                {t("hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200">
                  {t("hero.startTrial")}
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-primary hover:text-primary transition-all">
                  {t("hero.watchDemo")}
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  <img alt="User 1" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZT-fGat0mrZk4fyfUY6U4X0rYOfXebQY0iVunrZa5o2GnIhOXqm3jSivWhJDV4h5xcomrut6eWmeK8Jld3SQv6VGcCR9p4_9H_i0koJn2I0pK6epEBY0T9dbY2IRBvL-grufJpFAoolYpGaFc8gBEk30O3v88y4BL0jreecjXscDvvMZuPAwEdmKfQsq3T9iUbdGCybZgal03EnnxwjB_Gli4F8dqbhqpMS2Fr-47qZP5XkkURtMWwlKgap3JVBMofpRm1suUMv8" />
                  <img alt="User 2" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNxF6p5k6RlYsrr5_EtDXWhNwcqSq-vlO1cSbP2cB7Pe4GhzgjfFsOSS-2Nc5i15dS7G8Q8YLmp-TkS8LcwJBEZCl7uP5_ALPt4qC1qYShFUgmrDwz8lUEGI50KKb2RU94RLMDqkNNNoH-rFqVX9mbLTs3IDoaYMtiJuHobXxe0RbGBZdtCf5sXHJPn0yOpYFpBNbkziTNvNg6jshLI9As4GsGXEpownnsifwe0eQYGbj-K2Nghccx98fuWjvIo3SAFIU04Ujv6ek" />
                  <img alt="User 3" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlgCl8uA5f5kRev6CXhuky1nqA-tOnR5feVzaK5HnlSmjzAiyndF7idDmvfV-gMuSj_6BwMm9Sy73ozonVKqrecV3sfhlILc2eKQYQySJ7ShRLiYZCEK742-FSNQumY_Eaij8MVB4Prj9XJ0rjwWcEEisgHI6CfJ7r0-bmI8pv6WQtge-NGBA5kSxFe5FzCrB8UGnengevEcbvkV7ORbRQbG-274sDM6i40RiBL2yioRNTRhqnl-oVirswS0g6UB11xmsz26uPJpA" />
                </div>
                <span>{t("hero.socialProof")}</span>
              </div>
            </div>
            
            <div className="relative lg:ml-10 rtl:lg:mr-10 rtl:lg:ml-0">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white">
                <img alt="Modern construction project planning" className="w-full object-cover aspect-[4/3]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKoU5oR6hOz0HVbRt9xrrZ7SMbd6R5Ox3QNUy8oM-zHERU8j87LMB6WH5I2YFHeMwJqF5OXtq3uJi6nNmE-QdH1MGMXdROPzFmFOIP0b2yM1YmYl3tVNLMW0i-cWHu_gt0AUE6xctAPWXQOSzyGSJsBDgdncKTa2oVWKOlBgvIsriSKUAVutOnjPxPN2PolwzlYjAXrc-dfz_vmSACptAMvDAYvLXyPCSVUqREh6OF3C8O8jpXs7rL2ND0PbSHWLEkMIqLqKOKa6A" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg flex items-center gap-4 border border-slate-100">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t("hero.liveAI")}</p>
                    <p className="text-sm font-bold text-slate-800">{t("hero.projectName")}</p>
                  </div>
                  <div className="text-right rtl:text-left">
                    <p className="text-primary font-bold text-lg leading-none">98.4%</p>
                    <p className="text-[10px] text-slate-500">{t("hero.accuracyRate")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── What you can do ─── */}
      <section className="py-24 bg-slate-50" data-purpose="features-grid" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">{t("features.title")}</h2>
            <p className="text-lg text-slate-600">{t("features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Calculator />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t("features.calc.title")}</h3>
              <p className="text-slate-600 leading-relaxed">{t("features.calc.desc")}</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <BookmarkPlus />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t("features.bookmark.title")}</h3>
              <p className="text-slate-600 leading-relaxed">{t("features.bookmark.desc")}</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Rss />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t("features.blog.title")}</h3>
              <p className="text-slate-600 leading-relaxed">{t("features.blog.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section className="py-24 bg-white" data-purpose="pricing-plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">{t("pricing.title")}</h2>
            <p className="text-lg text-slate-600">{t("pricing.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Normal User */}
            <div className="relative p-8 rounded-3xl border border-slate-200 bg-white hover:border-primary transition-all shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("pricing.normalUser")}</h3>
              <p className="text-slate-500 mb-6">{t("pricing.normalDesc")}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$29</span>
                <span className="text-slate-500">{t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.projects", { count: 3 })}
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.aiRequests", { count: 20 })}
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.pdfExport")}
                </li>
              </ul>
              <Link to="/auth/register?plan=normal" className="block w-full text-center py-4 px-6 border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:border-primary hover:text-primary transition-all">{t("pricing.getStarted")}</Link>
            </div>
            
            {/* Company */}
            <div className="relative p-8 rounded-3xl border-2 border-primary bg-blue-50/30 flex flex-col shadow-xl shadow-blue-900/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">{t("pricing.recommended")}</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("pricing.company")}</h3>
              <p className="text-slate-500 mb-6">{t("pricing.companyDesc")}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$149</span>
                <span className="text-slate-500">{t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.projects", { count: 20 })}
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.unlimitedAI")}
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.pdfExport")}
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> {t("pricing.externalServices")}
                </li>
              </ul>
              <Link to="/auth/register?plan=company" className="block w-full text-center py-4 px-6 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">{t("pricing.chooseEnterprise")}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-24 bg-slate-50" data-purpose="faq-accordion">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">{t("faq.title")}</h2>
            <p className="text-lg text-slate-600">{t("faq.subtitle")}</p>
          </div>
          <div className="space-y-4">
            {[
              { q: t("faq.q1"), a: t("faq.a1") },
              { q: t("faq.q2"), a: t("faq.a2") },
              { q: t("faq.q3"), a: t("faq.a3") },
            ].map((item, idx) => (
              <div key={idx} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20" tabIndex="0">
                <button className="w-full px-6 py-5 text-left rtl:text-right flex justify-between items-center bg-white transition-colors peer">
                  <span className="font-bold text-slate-800">{item.q}</span>
                  <ChevronDown className="transition-transform text-slate-400 group-focus-within:rotate-180" />
                </button>
                <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out group-focus-within:max-h-[200px]">
                  <div className="px-6 pb-6 text-slate-600">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
