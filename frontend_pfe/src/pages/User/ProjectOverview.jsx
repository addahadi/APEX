import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Building, Building2, Clock, Droplets, FileText, Filter, Network, PencilRuler, Download, Users, Zap, History, Loader2, AlertCircle } from 'lucide-react';
import { useProject, useProjectEstimation, useExportProject } from "@/hooks/useProjects";
import { useRootCategories } from "@/hooks/useCategories";
import DynamicIcon from "@/components/DynamicIcon";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

const ProjectOverview = () => {
  const { t, i18n } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const localize = useLocalizedField();
  const { projectId } = useParams();
  
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const { data: estimationData, isLoading: isEstimationLoading, isError: isEstimationError } = useProjectEstimation(projectId);
  const { data: rootCategories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useRootCategories();
  const exportProjectMutation = useExportProject();

  if (isProjectLoading || isEstimationLoading || isCategoriesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
        <p>{tc("loading")}</p>
      </div>
    );
  }

  if (isProjectError || isEstimationError || !projectData) {
    return (
      <div className="py-12">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl p-8 text-center border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">{t("projectOverview.projectNotFound")}</h2>
          <p>{t("projectOverview.projectNotFoundDesc")}</p>
          <Link to="/dashboard" className="inline-block mt-4 text-primary font-bold hover:underline">{t("projectOverview.returnDashboard")}</Link>
        </div>
      </div>
    );
  }

  const project = { ...projectData, leaf_calculations: estimationData?.leaf_calculations || [] };
  const isAr = String(i18n.language || "").toLowerCase().startsWith("ar");
  const pickLocalizedName = (item, enKey, arKey) => {
    if (!item) return "";
    const en = item[enKey];
    const ar = item[arKey];
    return isAr ? (ar || en || "") : (en || ar || "");
  };

  let budgetColor = "bg-slate-100 text-slate-600 border-slate-200";
  if(estimationData?.budget_type === "LOW") budgetColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  if(estimationData?.budget_type === "MEDIUM") budgetColor = "bg-amber-100 text-amber-700 border-amber-200";
  if(estimationData?.budget_type === "HIGH") budgetColor = "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <div className="py-8">
      {/* ─── Project Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
        
        <div className="md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-md order-1 mb-4 md:mb-0 shrink-0 relative bg-slate-100 dark:bg-slate-800">
          <img 
            src={project.image_url || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1000&auto=format&fit=crop"} 
            alt={project.name} 
            className="w-full h-full object-cover" 
          />
          {!project.image_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <div className="h-12 w-12 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm flex items-center justify-center text-xl font-black text-primary">
                {project.name.charAt(0)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-3">
            {project.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {tc("completed").toUpperCase()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 dark:bg-primary/30 px-3 py-1 text-xs font-bold text-primary dark:text-primary border border-primary/30 dark:border-primary/50">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                {tc("active").toUpperCase()}
              </span>
            )}
            
            {estimationData?.budget_type && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${budgetColor}`}>
                {estimationData.budget_type}
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
          <button 
            onClick={() => exportProjectMutation.mutate(project.project_id)}
            disabled={exportProjectMutation.isPending || project.leaf_calculations.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="text-[18px]" />}
            {tc("export")}
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("projectOverview.totalAllocation")}</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white leading-none"><span className="text-lg opacity-60 mr-1 rtl:ml-1 rtl:mr-0">{tc("currency")}</span>{project.total_cost?.toFixed(2) || 0}</p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
           <div className="bg-fuchsia-100 p-4 rounded-xl text-fuchsia-600 shrink-0 shadow-inner">
              <Network className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("projectOverview.segmentNodes")}</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{project.leaf_calculations?.length || 0} <span className="text-sm text-slate-400 font-medium tracking-normal">{t("projectOverview.entries")}</span></p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
           <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600 shrink-0 shadow-inner">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("projectOverview.phaseIndicator")}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{t("projectOverview.activeOps")}<br/><span className="text-xs text-slate-400 font-medium tracking-normal">{t("projectOverview.since", { date: new Date(project.created_at).toLocaleDateString() })}</span></p>
           </div>
        </div>
      </div>


      {/* ─── Structural Matrix (Root Categories) ─── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("projectOverview.projectModules")}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rootCategories && rootCategories.length > 0 ? (
          rootCategories.map((cat, i) => {
            const colors = ['blue', 'amber', 'emerald', 'purple', 'rose', 'cyan', 'orange', 'indigo'];
            const color = colors[i % colors.length];
            const colorClasses = {
              blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:text-blue-600',
              amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 group-hover:text-amber-600',
              emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:text-emerald-600',
              purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 group-hover:text-purple-600',
              rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 group-hover:text-rose-600',
              cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 group-hover:text-cyan-600',
              orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 group-hover:text-orange-600',
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 group-hover:text-indigo-600',
            };
            return (
              <Link key={cat.category_id} to={`/projects/${project.project_id}/explorer/${cat.category_id}`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 right-0 rtl:right-auto rtl:left-0 w-16 h-16 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-bl-[40px] rtl:rounded-bl-none rtl:rounded-br-[40px] -z-0 group-hover:scale-110 transition-transform`}></div>
                <div className={`h-10 w-10 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[2]} rounded-lg flex items-center justify-center mb-4 z-10 relative text-2xl`}>
                  {cat.icon ? <DynamicIcon name={cat.icon} size={24} className="text-current" /> : '📁'}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">{localize(cat, 'name')}</h3>
                <p className="text-xs text-slate-500 mb-4 relative z-10">{localize(cat, 'description') || cat.name_ar}</p>
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-400 relative z-10">
                  <span>{t("projectOverview.exploreModules")}</span>
                  <ArrowRight className={`text-[16px] ${colorClasses[color].split(' ')[3]} group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all`} />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            {isCategoriesError ? tc("error") : t("projectOverview.noModules")}
          </div>
        )}
      </div>

      {/* ─── Recent Calculation ─── */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-primary" />
            {t("projectOverview.recentCalc")}
          </h2>
          <Link to={`/projects/${project.project_id}/history`} className="text-sm font-bold text-primary hover:text-blue-700 transition-colors flex items-center gap-1">
            {tc("viewAll")} <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">{t("projectOverview.category")}</th>
                  <th className="px-6 py-4">{t("projectOverview.formulaUsed")}</th>
                  <th className="px-6 py-4">{t("projectOverview.results")}</th>
                  <th className="px-6 py-4">{t("projectOverview.totalCostLabel")}</th>
                  <th className="px-6 py-4">{t("projectOverview.savedOn")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {project.leaf_calculations && project.leaf_calculations.length > 0 ? (
                  project.leaf_calculations.slice(0, 5).map((calc) => (
                    <tr key={calc.project_details_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {pickLocalizedName(calc, "category_name_en", "category_name_ar")}
                        </div>
                        <div className="text-[10px] uppercase font-mono text-slate-400 mt-1">ID: {calc.category_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {pickLocalizedName(calc, "formula_name_en", "formula_name_ar")}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {calc.config_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {Object.entries(typeof calc.results === 'string' ? JSON.parse(calc.results) : (calc.results || {})).map(([k, v]) => (
                            <div key={k} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-flex gap-2 w-fit border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500">{k}:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                        ${calc.leaf_total?.toFixed(2) || 0}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(calc.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      {t("projectOverview.noHistory")}
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
