import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";

const PublicArticles = () => {
  return (
    <>
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Insights & Updates</h1>
          <p className="mt-4 text-xl text-slate-500 max-w-3xl">Stay informed with the latest trends in sustainable construction, quantity surveying, and digital transformation in the industry.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Article Card 1 */}
              <article className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img alt="Construction Site" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA52XmgAuLbcWuSeWGYriW7r7W15ijLdYWILa8DVMnIZBtZUw9kaEd96y8fPDsSvywBp-ZMW5wQnUdK5KBCuk41REIoS15KmbKbgZh-QNindxTiiYh6Z-Qv0J8lSuzxccTXdF36j7Zz2DtmnA6L64VdTH6PTkQ8F7gY67W6OFNoCvkmVw7lK49_uqDNaY6-hQpgGj3mIet1CV7u6D4fuVh0TK6mUvoHaUuvymldkCRCYPh01aBBrixosP3WdSIths7QnhLRpbFw2rM" />
                  <span className="absolute top-4 left-4 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
                    Actualité
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-slate-400 mb-2">
                    <span>May 24, 2024</span>
                    <span className="mx-2">•</span>
                    <span>5 min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 article-title-clamp mb-3">The Future of Green Building in Urban Development</h2>
                  <p className="text-slate-600 excerpt-clamp mb-6">Explore how new regulations are shaping the way we approach sustainable materials and energy efficiency in high-density urban projects...</p>
                  <div className="mt-auto">
                    <Link to="/articles/1" className="text-primary font-semibold hover:text-blue-900 inline-flex items-center group">
                      Read More
                      <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Article Card 2 */}
              <article className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img alt="AI Technology" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd-sJe-r16b6nI2XJGh5KmVdNoTGiiNRle2TVoDb3dTKLvzMMzezx9ctKCKPTDcZi8F_6agkCa4XLn7bvzOh-YeIIOIgsZOjr1B3tqdjeKf2MPOtjS3xBfKKAIMGKGJrYdeJu5SNqf35z9oEiUayHxagU1QUSUTMgNw95ty9m9qTxI5Bit14Ljh56yHmXbfKkcyiTNuntpoOz3f84D1DQg2yvBMbonTadWc2hodLmZmB2tO3HQWHPVbwWrRPsorU39Uq1fC24K4R0" />
                  <span className="absolute top-4 left-4 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-white uppercase tracking-wider">
                    Blog
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-slate-400 mb-2">
                    <span>May 18, 2024</span>
                    <span className="mx-2">•</span>
                    <span>8 min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 article-title-clamp mb-3">Using AI to Streamline Cost Estimation Workflows</h2>
                  <p className="text-slate-600 excerpt-clamp mb-6">Discover how our new AI assistant reduces human error and accelerates the takeoff process for complex residential projects...</p>
                  <div className="mt-auto">
                    <Link to="/articles/2" className="text-primary font-semibold hover:text-blue-900 inline-flex items-center group">
                      Read More
                      <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Article Card 3 */}
              <article className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img alt="Risk assessment" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6tdCi_QqD8n_API0Ec5qYLvFU9IFgo8dwwht-t-6GLBnZFKe5FwGInIKspsOk-DSQqcWUG8QDkykhESJZxXayFqv0LIXJf1f2UBDzNGGOkNZTDQ8Q2g58Im9LGi954jKmVSBfsjG8a-IK2n3hSg1jrL8FP_CZ2cKodP5CiMcgwGztqe6Umu_T6uuymanBQjvP-cuFclb6J0VQEODW1rSz9726oguHmAs4opMPgSQR3lsShkRQhzB-BH0v7gmHAoCm46HvscMF6Uw" />
                  <span className="absolute top-4 left-4 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
                    Actualité
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-slate-400 mb-2">
                    <span>May 10, 2024</span>
                    <span className="mx-2">•</span>
                    <span>6 min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 article-title-clamp mb-3">Navigating Supply Chain Volatility in 2024</h2>
                  <p className="text-slate-600 excerpt-clamp mb-6">Proactive strategies for quantity surveyors to mitigate material price fluctuations and secure project budgets in an uncertain market...</p>
                  <div className="mt-auto">
                    <Link to="/articles/3" className="text-primary font-semibold hover:text-blue-900 inline-flex items-center group">
                      Read More
                      <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Article Card 4 */}
              <article className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img alt="Our Team" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLt5j2nfRRFg0KBrboBWiSTmgEaCvuVNSyIULoDpsvrTFez_eBYhJkhU_2TRsYvNgtdCPgwCe2ITJBjVJkWUrkaudA3HJDT8ACnXx79oOSAv2ZruN5ZZYS_cu6LJ03YSJMz0DN658UPsAbEGsBX-EUevSTo65C2cZaKu2Jufrp3eLsOi2buzr6HwiG_X3XxPifmvKdU2VexvoSwJuujlw9fR7fHqbfufxP3DBXYnhtJ6i6gHtdu_xP1SESuRHJeFtg8A5d9yH1Y7Y" />
                  <span className="absolute top-4 left-4 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-white uppercase tracking-wider">
                    Blog
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-slate-400 mb-2">
                    <span>May 02, 2024</span>
                    <span className="mx-2">•</span>
                    <span>4 min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 article-title-clamp mb-3">Why Collaboration is Key in Modern Surveying</h2>
                  <p className="text-slate-600 excerpt-clamp mb-6">Breaking down the silos between architects, contractors, and owners through collaborative digital platforms...</p>
                  <div className="mt-auto">
                    <Link to="/articles/4" className="text-primary font-semibold hover:text-blue-900 inline-flex items-center group">
                      Read More
                      <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav aria-label="Pagination" className="inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button aria-current="page" className="z-10 bg-blue-50 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
                <button className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</button>
                <button className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </section>

          <aside className="lg:w-1/4 space-y-10">
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" data-purpose="sidebar-search">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Search</h3>
              <div className="relative">
                <input className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary text-sm" placeholder="Search articles..." type="text" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" data-purpose="sidebar-categories">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="flex justify-between items-center text-sm text-slate-600 hover:text-primary">
                    <span>Industry News</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">12</span>
                  </Link>
                </li>
                <li>
                  <Link to="#" className="flex justify-between items-center text-sm text-slate-600 hover:text-primary">
                    <span>Digital Transformation</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">8</span>
                  </Link>
                </li>
                <li>
                  <Link to="#" className="flex justify-between items-center text-sm text-slate-600 hover:text-primary">
                    <span>Case Studies</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">15</span>
                  </Link>
                </li>
                <li>
                  <Link to="#" className="flex justify-between items-center text-sm text-slate-600 hover:text-primary">
                    <span>Estimating Tips</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">6</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular Tags Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" data-purpose="sidebar-tags">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">Sustainability</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">BIM</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">AI</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">Safety</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">Risk Management</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">Urbanism</Link>
                <Link to="#" className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-600 text-xs font-medium rounded-full transition-colors">Budgeting</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default PublicArticles;
