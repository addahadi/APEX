import { Link } from "react-router-dom";
import { BookmarkPlus, Calculator, CheckCircle, ChevronDown, Rss } from 'lucide-react';

const Home = () => {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40" data-purpose="hero-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-primary uppercase bg-blue-50 rounded-full">
                The Future of Construction Management
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Build Smarter, <br/><span className="text-primary">Faster.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                From structural blueprints to the final finishing touches. Automate your workflow with AI-driven estimation and precision project management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200">
                  Start Free Trial
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-primary hover:text-primary transition-all">
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <img alt="User 1" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZT-fGat0mrZk4fyfUY6U4X0rYOfXebQY0iVunrZa5o2GnIhOXqm3jSivWhJDV4h5xcomrut6eWmeK8Jld3SQv6VGcCR9p4_9H_i0koJn2I0pK6epEBY0T9dbY2IRBvL-grufJpFAoolYpGaFc8gBEk30O3v88y4BL0jreecjXscDvvMZuPAwEdmKfQsq3T9iUbdGCybZgal03EnnxwjB_Gli4F8dqbhqpMS2Fr-47qZP5XkkURtMWwlKgap3JVBMofpRm1suUMv8" />
                  <img alt="User 2" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNxF6p5k6RlYsrr5_EtDXWhNwcqSq-vlO1cSbP2cB7Pe4GhzgjfFsOSS-2Nc5i15dS7G8Q8YLmp-TkS8LcwJBEZCl7uP5_ALPt4qC1qYShFUgmrDwz8lUEGI50KKb2RU94RLMDqkNNNoH-rFqVX9mbLTs3IDoaYMtiJuHobXxe0RbGBZdtCf5sXHJPn0yOpYFpBNbkziTNvNg6jshLI9As4GsGXEpownnsifwe0eQYGbj-K2Nghccx98fuWjvIo3SAFIU04Ujv6ek" />
                  <img alt="User 3" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlgCl8uA5f5kRev6CXhuky1nqA-tOnR5feVzaK5HnlSmjzAiyndF7idDmvfV-gMuSj_6BwMm9Sy73ozonVKqrecV3sfhlILc2eKQYQySJ7ShRLiYZCEK742-FSNQumY_Eaij8MVB4Prj9XJ0rjwWcEEisgHI6CfJ7r0-bmI8pv6WQtge-NGBA5kSxFe5FzCrB8UGnengevEcbvkV7ORbRQbG-274sDM6i40RiBL2yioRNTRhqnl-oVirswS0g6UB11xmsz26uPJpA" />
                </div>
                <span>Joined by 2,000+ construction firms</span>
              </div>
            </div>
            
            <div className="relative lg:ml-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white">
                <img alt="Modern construction project planning" className="w-full object-cover aspect-[4/3]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKoU5oR6hOz0HVbRt9xrrZ7SMbd6R5Ox3QNUy8oM-zHERU8j87LMB6WH5I2YFHeMwJqF5OXtq3uJi6nNmE-QdH1MGMXdROPzFmFOIP0b2yM1YmYl3tVNLMW0i-cWHu_gt0AUE6xctAPWXQOSzyGSJsBDgdncKTa2oVWKOlBgvIsriSKUAVutOnjPxPN2PolwzlYjAXrc-dfz_vmSACptAMvDAYvLXyPCSVUqREh6OF3C8O8jpXs7rL2ND0PbSHWLEkMIqLqKOKa6A" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg flex items-center gap-4 border border-slate-100">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Live AI Estimation</p>
                    <p className="text-sm font-bold text-slate-800">Project: High-Rise Alpha</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-lg leading-none">98.4%</p>
                    <p className="text-[10px] text-slate-500">Accuracy Rate</p>
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
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">What you can do</h2>
            <p className="text-lg text-slate-600">Explore the powerful capabilities built for construction professionals.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Calculator />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project creation with formula-based calculations</h3>
              <p className="text-slate-600 leading-relaxed">Accurate estimations using Projects, Formulas, Categories, and Units for ultimate precision.</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <BookmarkPlus />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Save and like articles</h3>
              <p className="text-slate-600 leading-relaxed">Build your personal knowledge base from our expert insights and industry best practices.</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Rss />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Access to Blog and News content</h3>
              <p className="text-slate-600 leading-relaxed">Stay informed with technical updates, case studies, and construction industry news.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section className="py-24 bg-white" data-purpose="pricing-plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">Pricing & Plans</h2>
            <p className="text-lg text-slate-600">Choose the perfect plan for your construction management needs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Normal User */}
            <div className="relative p-8 rounded-3xl border border-slate-200 bg-white hover:border-primary transition-all shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Normal User</h3>
              <p className="text-slate-500 mb-6">Perfect for independent surveyors and small projects.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$29</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> Up to 3 projects
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> 20 AI requests
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> PDF export
                </li>
              </ul>
              <Link to="/auth/register?plan=normal" className="block w-full text-center py-4 px-6 border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:border-primary hover:text-primary transition-all">Get Started</Link>
            </div>
            
            {/* Company */}
            <div className="relative p-8 rounded-3xl border-2 border-primary bg-blue-50/30 flex flex-col shadow-xl shadow-blue-900/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">Recommended</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Company</h3>
              <p className="text-slate-500 mb-6">Comprehensive solution for professional construction firms.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$149</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> Up to 20 projects
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> Unlimited AI requests
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> PDF export
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="text-primary text-xl" /> External services integration
                </li>
              </ul>
              <Link to="/auth/register?plan=company" className="block w-full text-center py-4 px-6 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">Choose Enterprise</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-24 bg-slate-50" data-purpose="faq-accordion">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">Answers to common questions about our platform and estimation tools.</p>
          </div>
          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20" tabIndex="0">
              <button className="w-full px-6 py-5 text-left flex justify-between items-center bg-white transition-colors peer">
                <span className="font-bold text-slate-800">How accurate is the AI estimation?</span>
                <ChevronDown className="transition-transform text-slate-400 group-focus-within:rotate-180" />
              </button>
              <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out group-focus-within:max-h-[200px]">
                <div className="px-6 pb-6 text-slate-600">
                  Our AI model is trained on thousands of real-world construction datasets. While accuracy varies by project complexity, our users typically report within 95-98% accuracy compared to final bill of quantities.
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20" tabIndex="0">
              <button className="w-full px-6 py-5 text-left flex justify-between items-center bg-white transition-colors peer">
                <span className="font-bold text-slate-800">Can I import my existing Excel formulas?</span>
                <ChevronDown className="transition-transform text-slate-400 group-focus-within:rotate-180" />
              </button>
              <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out group-focus-within:max-h-[200px]">
                <div className="px-6 pb-6 text-slate-600">
                  Yes! Our formula builder is designed to be familiar to Excel users. You can create custom variables, link categories, and apply complex arithmetic for your structural and finishing calculations.
                </div>
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20" tabIndex="0">
              <button className="w-full px-6 py-5 text-left flex justify-between items-center bg-white transition-colors peer">
                <span className="font-bold text-slate-800">Do you offer trial periods for the Company plan?</span>
                <ChevronDown className="transition-transform text-slate-400 group-focus-within:rotate-180" />
              </button>
              <div className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out group-focus-within:max-h-[200px]">
                <div className="px-6 pb-6 text-slate-600">
                  Absolutely. We offer a 14-day full-access trial for firms to test out our team management features and unlimited AI estimation capabilities before committing.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
