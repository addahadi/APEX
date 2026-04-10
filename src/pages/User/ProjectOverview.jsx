import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Building, Building2, Clock, Droplets, FileText, Filter, Network, PencilRuler, Settings, Share2, Users, Zap } from 'lucide-react';

const ProjectOverview = () => {
  const { projectId } = useParams();

  return (
    <div className="py-8">
      {/* ─── Project Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              IN PROGRESS
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {projectId || '8f2-a91'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Skyline Tower Complex</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <Clock className="text-sm" />
              Due Dec 15, 2024
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="text-sm" />
              Apex Construction
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Share2 className="text-[18px]" />
            Share
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Settings className="text-[18px]" />
            Settings
          </button>
          <Link to={`/projects/${projectId || '8f2-a91'}/explorer`} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/25">
            <Network className="text-[18px]" />
            Work Breakdown
          </Link>
        </div>
      </div>

      {/* ─── Project Summary Dashboard ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="text-primary text-[18px]" />
            Project Scope
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            The Skyline Tower Complex involves the construction of a 45-story mixed-use skyscraper featuring luxury condominiums, commercial office spaces, and retail environments at ground level. The project enforces strict sustainability standards targeting LEED Platinum certification. Phase 1 structural works are currently underway.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Total Budget</p>
              <p className="font-bold text-slate-900 dark:text-white">$145M</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Total Categories</p>
              <p className="font-bold text-slate-900 dark:text-white">12 Modules</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Calculated Formulae</p>
              <p className="font-bold text-slate-900 dark:text-white">340</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Last Updated</p>
              <p className="font-bold text-slate-900 dark:text-white">2 hrs ago</p>
            </div>
          </div>
        </div>

        {/* Members Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="text-primary text-[18px]" />
            Team Access
          </h3>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">John Doe</p>
                  <p className="text-[10px] text-slate-500 mt-1">Project Lead</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">Owner</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500 mt-1">Quant Surveyor</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">Edit</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" alt="User" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Mike Ross</p>
                  <p className="text-[10px] text-slate-500 mt-1">Contractor</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">View</span>
            </div>
          </div>
          <button className="mt-4 w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary transition-colors">
            + Manage Permissions
          </button>
        </div>
      </div>

      {/* ─── Structural Matrix (Root Categories) ─── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Modules</h2>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Filter className="text-[16px]" />
          Filter View
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Card 1 */}
        <Link to={`/projects/${projectId || '8f2-a91'}/explorer/c1`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[40px] -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 z-10 relative">
            <Building />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">Grands Œuvres</h3>
          <p className="text-xs text-slate-500 mb-4 relative z-10">Structural foundation, concrete, masonry.</p>
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
            <span>24 Sub-categories</span>
            <ArrowRight className="text-[16px] group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Category Card 2 */}
        <Link to={`/projects/${projectId || '8f2-a91'}/explorer/c2`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-bl-[40px] -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4 z-10 relative">
            <Zap />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">Électricité</h3>
          <p className="text-xs text-slate-500 mb-4 relative z-10">Power grid, lighting, low voltage systems.</p>
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
            <span>12 Sub-categories</span>
            <ArrowRight className="text-[16px] group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Category Card 3 */}
        <Link to={`/projects/${projectId || '8f2-a91'}/explorer/c3`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[40px] -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 z-10 relative">
            <Droplets />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">Plomberie</h3>
          <p className="text-xs text-slate-500 mb-4 relative z-10">Water supply, drainage, sanitary fixtures.</p>
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
            <span>8 Sub-categories</span>
            <ArrowRight className="text-[16px] group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        
        {/* Category Card 4 */}
        <Link to={`/projects/${projectId || '8f2-a91'}/explorer/c4`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[40px] -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 z-10 relative">
            <PencilRuler />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">Finition</h3>
          <p className="text-xs text-slate-500 mb-4 relative z-10">Flooring, painting, interior design.</p>
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
            <span>15 Sub-categories</span>
            <ArrowRight className="text-[16px] group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

      </div>
    </div>
  );
};

export default ProjectOverview;
