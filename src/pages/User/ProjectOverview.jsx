import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Building, Building2, Clock, Droplets, FileText, Filter, Network, PencilRuler, Download, Users, Zap, History } from 'lucide-react';
import { INIT_PROJECTS, INIT_TREE } from "@/mock/mock-data";

const ProjectOverview = () => {
  const { projectId } = useParams();
  const project = INIT_PROJECTS.find(p => p.project_id === (projectId || '1')) || INIT_PROJECTS[0];

  let budgetColor = "bg-slate-100 text-slate-600 border-slate-200";
  if(project.budget_type === "HIGH") budgetColor = "bg-red-100 text-red-700 border-red-200";
  if(project.budget_type === "MEDIUM") budgetColor = "bg-amber-100 text-amber-700 border-amber-200";
  if(project.budget_type === "LOW") budgetColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="py-8">
      {/* ─── Project Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
        
        {project.image && (
          <div className="md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-md order-1 mb-4 md:mb-0 shrink-0">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-3 flex-1 order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-3">
            {project.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 dark:bg-primary/30 px-3 py-1 text-xs font-bold text-primary dark:text-primary border border-primary/30 dark:border-primary/50">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                ACTIVE
              </span>
            )}
            
            {project.budget_type && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${budgetColor}`}>
                {project.budget_type} BUDGET
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              <Clock className="w-3 h-3" />
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{project.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>
        
        <div className="flex gap-3 order-3 md:order-2 self-start md:self-end">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/25">
            <Download className="text-[18px]" />
            Export
          </button>
        </div>
      </div>

      {/* ─── Project Summary Dashboard ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
           <div className="bg-blue-100 p-4 rounded-xl text-blue-600 shrink-0 shadow-inner">
              <Zap className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Project Total</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white leading-none"><span className="text-lg opacity-60 mr-1">$</span>{project.total_cost?.toLocaleString() || 0}</p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
           <div className="bg-fuchsia-100 p-4 rounded-xl text-fuchsia-600 shrink-0 shadow-inner">
              <Network className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Calculs</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{project.leaf_count || 0} <span className="text-sm text-slate-400 font-medium tracking-normal">Nodes</span></p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
           <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600 shrink-0 shadow-inner">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Project Status</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Active Phase<br/><span className="text-xs text-slate-400 font-medium tracking-normal">Since {new Date(project.created_at).toLocaleDateString()}</span></p>
           </div>
        </div>
      </div>


      {/* ─── Structural Matrix (Root Categories) ─── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Modules</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {INIT_TREE.filter(cat => cat.category_level === 'ROOT').map((cat, i) => {
          const colors = ['blue', 'amber', 'emerald', 'purple'];
          const color = colors[i % colors.length];
          const colorClasses = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:text-blue-600',
            amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 group-hover:text-amber-600',
            emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:text-emerald-600',
            purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 group-hover:text-purple-600'
          };
          return (
            <Link key={cat.category_id} to={`/projects/${project.project_id}/explorer/${cat.category_id}`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-bl-[40px] -z-0 group-hover:scale-110 transition-transform`}></div>
              <div className={`h-10 w-10 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[2]} rounded-lg flex items-center justify-center mb-4 z-10 relative text-2xl`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">{cat.name_en}</h3>
              <p className="text-xs text-slate-500 mb-4 relative z-10">{cat.name_ar}</p>
              <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
                <span>{cat.children?.length || 0} Sub-categories</span>
                <ArrowRight className={`text-[16px] ${colorClasses[color].split(' ')[3]} group-hover:translate-x-1 transition-all`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Recent Calculation ─── */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-primary" />
            Recent Calculation
          </h2>
          <Link to={`/projects/${project.project_id}/history`} className="text-sm font-bold text-primary hover:text-blue-700 transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Formula Used</th>
                  <th className="px-6 py-4">Results</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Saved On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {project.leaf_calculations && project.leaf_calculations.length > 0 ? (
                  project.leaf_calculations.map((calc) => (
                    <tr key={calc.project_details_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{calc.category_name}</div>
                        <div className="text-[10px] uppercase font-mono text-slate-400 mt-1">ID: {calc.category_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{calc.formula_name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {calc.config_name || 'No Material Config'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {Object.entries(calc.results).map(([k, v]) => (
                            <div key={k} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-flex gap-2 w-fit border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500">{k}:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                        ${calc.leaf_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(calc.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No estimation history found. Run a calculation first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
