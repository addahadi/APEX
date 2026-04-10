import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Twitter, Linkedin, Link } from "lucide-react";

const ArticleView = () => {
  const { id } = useParams();

  return (
    <>
      {/* ─── Hero Header ─── */}
      <header className="relative w-full h-[500px] bg-slate-800 overflow-hidden" data-purpose="article-hero">
        <img alt="Construction Site" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBChPvzTnum__nbz0JXcEwcZ-a_zz_ACjEiKsJIiw5l0hNad-X57iuC88ebB0PL2gGu17iuv5NcQXoXYb1pU9syAEDtax8DKzAqMb3s8vHTK7bMdPLwfg6R6cveVfJbm9gNlhBA-8a4Kv9FgfC6ihbHSzt6llcPmWcFcPwRKoneGkBFhB-473BbOJk36ZVC99LxjylaB93LCCuNGlWLtTP1_wxGy48Z2gsMuWEldV6VflvakhC7FJWHudu16dBzqallGe6HbYx9xCo" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Blog</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
              Optimizing Material Procurement for Large-Scale Civil Projects
            </h1>
            <div className="mt-6 flex items-center gap-4 text-slate-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white/20 overflow-hidden">
                  <img alt="Author Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzD2kh-iz_3sN6Q4IC5CDdyCswzrqdWyo1Jkh-hvPPhHEfuoKj8Od4wloT8LWfwGnNxTA27UBRUtEzGAft2YN4dF12EtL1UH9F-ZQSnrY9dHLtfUuQ-3QkN-PLy1CHIAy7ry3U7h0-3Alpu1Ql3cIofpKNiHhW-yhfsPXRdobo_F6HX5H98eX6IBfNIZ8XBCCnX-buqK0a6An79CQl1QvOGPnhLeEvlWiyv33fd4sNIWaF5uDyFppBQ7mPWp533bMC5pku9wOQueY" />
                </div>
                <span className="font-medium">Sarah Jenkins, Senior Analyst</span>
              </div>
              <span className="opacity-40">|</span>
              <time dateTime="2023-11-15">November 15, 2023</time>
              <span className="opacity-40">|</span>
              <span>12 min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Article Body Layout ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content Area */}
          <article className="w-full lg:w-2/3 article-content" data-purpose="article-body">
            <p className="text-xl text-slate-600 mb-8 italic leading-relaxed border-l-4 border-primary pl-6">
              Effective material management is the cornerstone of profitable construction. As supply chains become more volatile, QuantiConstruct explores how digital workflows are mitigating risk.
            </p>
            <h2 className="text-3xl font-bold mt-12 mb-6">The Shifting Landscape of Supply Chain Logistics</h2>
            <p className="text-slate-600 mb-6 leading-loose">
              In the modern era of civil engineering, the complexity of logistics cannot be overstated. From cement shortages to the rising cost of structural steel, project managers are facing unprecedented challenges. Traditional spreadsheets are no longer sufficient to handle the real-time adjustments required for multi-billion dollar infrastructure projects.
            </p>
            <p className="text-slate-600 mb-6 leading-loose">
              Data-driven procurement allows firms to forecast needs months in advance with a degree of accuracy that was previously impossible. By integrating historical price data with current market trends, QuantiConstruct provides a buffer against sudden market fluctuations.
            </p>
            
            <div className="my-10 p-8 bg-blue-50 border border-blue-100 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-blue-900 uppercase tracking-wide text-sm">Key Takeaway</h3>
              <p className="mb-0 text-blue-800">Integrating real-time inventory tracking with procurement software reduces waste by an average of 14% on commercial builds.</p>
            </div>
            
            <h2 className="text-3xl font-bold mt-12 mb-6">Technical Implementation of BIM for Quantity Surveying</h2>
            <p className="text-slate-600 mb-6 leading-loose">
              Building Information Modeling (BIM) isn't just for 3D visualization. When leveraged correctly, it serves as the ultimate source of truth for quantity takeoffs. 
            </p>
            
            <h3 className="text-2xl font-semibold mt-8 mb-4">1. Automated Takeoffs</h3>
            <p className="text-slate-600 mb-6 leading-loose">
              By mapping parametric data to material libraries, surveyors can automate the extraction of quantities. This reduces human error in the estimation phase, ensuring that "just-in-time" delivery schedules are based on precise volumes rather than rounded approximations.
            </p>
            
            <h3 className="text-2xl font-semibold mt-8 mb-4">2. Lifecycle Cost Analysis</h3>
            <p className="text-slate-600 mb-6 leading-loose">
              Our latest updates allow for 5D BIM integration, where cost data is intrinsically linked to the model components. This ensures that any architectural change immediately reflects in the project's bottom line, allowing for faster decision-making.
            </p>
            
            <img alt="Construction Blueprint" className="w-full rounded-xl shadow-lg my-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaqxBY61HeoA4nUrsT-QumP0EGOhYHqDscSENkLrAQ5Sw9n7qL1tzXTloJ18qoXhU0vMMcLnx_9B_n0i65iZP4EF4tpnGuz8iTdYgBHIxW7vBZmyao75DVwjaJwVbJO8y4DFhlWYPlGJJp0gaJ8ynDjm_TpCiXDDA3uSymyhZBYwEHWQWA2ItI1DkR2oIhcUuGToRPXw3gAmFe2ejoI6B99KwDghrKWuTC9hMWPIF6hd7pPPe6-wVEj56UwNDoleRDhAa6JT5GqNU" />
            
            <h2 className="text-3xl font-bold mt-12 mb-6">Conclusion: Building for Resilience</h2>
            <p className="text-slate-600 mb-6 leading-loose">
              As we look toward 2024, the focus for QuantiConstruct remains on providing the tools necessary for resilient construction. By embracing technical sub-headings, rigorous data analysis, and advanced modeling, firms can ensure their projects remain on time and within budget.
            </p>
            
            {/* Social Sharing */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap items-center gap-4" data-purpose="share-controls">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Share this article:</span>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 hover:text-slate-800 transition-colors">
                  <Link className="w-5 h-5" />
                </button>
              </div>
            </div>
          </article>
          
          {/* Side Panel */}
          <aside className="w-full lg:w-1/3" data-purpose="article-sidebar">
            <div className="sticky top-24 space-y-12">
              <section data-purpose="related-articles">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6">Related Articles</h4>
                <div className="space-y-6">
                  <RouterLink to="#" className="group block">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Technology</p>
                    <h5 className="text-slate-900 font-bold group-hover:text-primary transition-colors line-clamp-2">The Impact of AI on Structural Load Calculations</h5>
                    <p className="text-slate-500 text-xs mt-2">Oct 28, 2023</p>
                  </RouterLink>
                  <RouterLink to="#" className="group block">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Sustainability</p>
                    <h5 className="text-slate-900 font-bold group-hover:text-primary transition-colors line-clamp-2">Eco-Friendly Concrete Alternatives in 2024</h5>
                    <p className="text-slate-500 text-xs mt-2">Oct 12, 2023</p>
                  </RouterLink>
                  <RouterLink to="#" className="group block">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Case Study</p>
                    <h5 className="text-slate-900 font-bold group-hover:text-primary transition-colors line-clamp-2">How Tokyo Bridge Project Saved 20% on Labor Costs</h5>
                    <p className="text-slate-500 text-xs mt-2">Sep 30, 2023</p>
                  </RouterLink>
                </div>
              </section>

              <section data-purpose="category-list">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4">Explore Topics</h4>
                <div className="flex flex-wrap gap-2">
                  <RouterLink to="#" className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-all">Estimation</RouterLink>
                  <RouterLink to="#" className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-all">BIM</RouterLink>
                  <RouterLink to="#" className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-all">Supply Chain</RouterLink>
                  <RouterLink to="#" className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-all">Sustainability</RouterLink>
                  <RouterLink to="#" className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-all">Compliance</RouterLink>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export default ArticleView;
