import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Search, Filter, History, Package, Calculator, FileText, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { useProject, useProjectEstimation } from "@/hooks/useProjects";
import DynamicIcon from "@/components/DynamicIcon";
import { useTranslation } from "react-i18next";

const ProjectHistory = () => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const { projectId } = useParams();
  
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const { data: estimationData, isLoading: isEstimationLoading, isError: isEstimationError } = useProjectEstimation(projectId);

  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  if (isProjectLoading || isEstimationLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
        <p>{tc("loading")}</p>
      </div>
    );
  }

  if (isProjectError || isEstimationError || !projectData) {
    return (
      <div className="py-12 px-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl p-8 text-center border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">{t("history.errorTitle")}</h2>
          <p>{t("history.errorDesc")}</p>
          <Link to={`/projects/${projectId}`} className="inline-block mt-4 text-primary font-bold hover:underline">{t("history.returnOverview")}</Link>
        </div>
      </div>
    );
  }

  const project = projectData;
  const calculations = estimationData?.leaf_calculations || [];

  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="mb-12">
        <Link 
          to={`/projects/${project.project_id}`} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("history.returnOverview")}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 rtl:-translate-x-1/4"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <History className="w-8 h-8" />
              </div>
              {t("history.title")}
            </h1>
            <p className="text-slate-500 mt-4 max-w-xl text-base leading-relaxed">
              {t("history.subtitle")} <span className="font-bold text-slate-700 dark:text-slate-300">{project.name}</span>. {t("history.traceDecisions")}
            </p>
          </div>
          <div className="flex gap-3 relative z-10 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t("history.searchLedger")} 
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-inner"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{tc("filter")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Timeline Architecture ─── */}
      <div className="relative">
        {calculations.length > 0 ? (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {calculations.map((calc, index) => {
              const isExpanded = expandedRows.includes(calc.project_details_id);
              
              const fieldValues = typeof calc.field_values === 'string' ? JSON.parse(calc.field_values) : (calc.field_values || {});
              const resultsObj = typeof calc.results === 'string' ? JSON.parse(calc.results) : (calc.results || {});
              const fieldEntries = Object.entries(fieldValues);
              const resultEntries = Object.entries(resultsObj);
              
              return (
                <div key={calc.project_details_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline Pulse Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-primary shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </div>
                  
                  {/* Ledger Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                    <div 
                      onClick={() => toggleRow(calc.project_details_id)}
                      className={`bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-sm border transition-all cursor-pointer overflow-hidden ${
                        isExpanded ? 'border-primary ring-4 ring-primary/10 shadow-xl' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-5 md:p-7 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm shrink-0">
                               <DynamicIcon name="calculator" size={20} className="opacity-80" />
                             </div>
                             <div>
                               <h3 className="font-black text-slate-900 dark:text-white text-xl leading-tight group-hover:text-primary transition-colors">{calc.category_name}</h3>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[11px] font-bold text-slate-400 font-mono tracking-widest flex items-center gap-1 uppercase">
                                   <Clock className="w-3 h-3" />
                                   {new Date(calc.created_at).toLocaleDateString()}
                                 </span>
                               </div>
                             </div>
                           </div>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                             <Calculator className="w-3.5 h-3.5" />
                             {calc.formula_name}
                           </span>
                           {calc.config_name && (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800/50">
                               <Package className="w-3.5 h-3.5" />
                               {calc.config_name}
                             </span>
                           )}
                        </div>

                        {/* Results & Cost */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-4 px-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                          <div className="flex-1 flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                            {resultEntries.slice(0, 2).map(([k, v]) => (
                               <div key={k} className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{k.replace(/_/g, ' ')}</span>
                                 <span className="text-lg font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">{v.toLocaleString()}</span>
                               </div>
                            ))}
                            {resultEntries.length > 2 && (
                              <div className="flex flex-col justify-end">
                                <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">+{resultEntries.length - 2} more</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-left rtl:text-right sm:text-right rtl:sm:text-left shrink-0 border-t sm:border-l rtl:sm:border-l-0 rtl:sm:border-r sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-5 rtl:sm:pl-0 rtl:sm:pr-5">
                             <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t("history.segmentCost")}</span>
                             <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                               <span className="text-sm opacity-50 mr-1 rtl:ml-1 rtl:mr-0 font-semibold pr-0.5 rtl:pl-0.5 rtl:pr-0">{tc("currency")}</span>
                               {calc.leaf_total?.toLocaleString() || 0}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-5 pb-5 md:px-7 md:pb-7 pt-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                            
                            <div className="grid grid-cols-1 gap-8 mt-4">
                               
                               {/* Input Parameters */}
                               <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    {t("history.parametrizedInputs")}
                                  </h4>
                                  {fieldEntries.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {fieldEntries.map(([fieldId, val]) => (
                                        <div key={fieldId} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                                          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest truncate block mb-1">
                                            [PARAM-{fieldId.substring(0, 4)}]
                                          </span>
                                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                                            {typeof val === 'number' && val % 1 !== 0 ? val.toFixed(2) : val}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 italic bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">{t("history.noParams")}</div>
                                  )}
                               </div>

                               {/* Material Resources Invoice */}
                               <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    {t("history.resourceInvoice")}
                                  </h4>
                                  {calc.material_lines && calc.material_lines.length > 0 ? (
                                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left rtl:text-right text-sm whitespace-nowrap">
                                          <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                              <th className="px-5 py-3">{t("history.resourceItem")}</th>
                                              <th className="px-5 py-3 text-right rtl:text-left">{t("history.usage")}</th>
                                              <th className="px-5 py-3 text-right rtl:text-left">{t("history.waste")}</th>
                                              <th className="px-5 py-3 text-right rtl:text-left">{t("history.unitRate")}</th>
                                              <th className="px-5 py-3 text-right rtl:text-left bg-slate-50/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300">{t("history.totalPrice")}</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {calc.material_lines.map(mat => (
                                              <tr key={mat.detail_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{mat.material_name}</td>
                                                <td className="px-5 py-4 text-right rtl:text-left text-slate-600 dark:text-slate-400 font-mono">
                                                  {mat.quantity_with_waste?.toFixed(2)} <span className="text-[10px] text-slate-400">{mat.unit_symbol}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right rtl:text-left text-slate-500 text-xs">
                                                  {(mat.applied_waste * 100).toFixed(0)}%
                                                </td>
                                                <td className="px-5 py-4 text-right rtl:text-left text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                  {mat.unit_price_snapshot?.toLocaleString()} <span className="text-[9px] opacity-70">{tc("currency")}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right rtl:text-left font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30 dark:bg-slate-900/30 font-mono">
                                                  {mat.sub_total?.toLocaleString() || 0} <span className="text-[10px] text-slate-400 font-sans ml-0.5 rtl:mr-0.5 rtl:ml-0">{tc("currency")}</span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 border-dashed text-center">
                                       <TrendingUp className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                       <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("history.pureCalc")}</p>
                                       <p className="text-xs text-slate-400 mt-1">{t("history.noMaterials")}</p>
                                    </div>
                                  )}
                               </div>
                            </div>
                            
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 px-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl border-dashed shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t("history.emptyTitle")}</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">{t("history.emptyDesc")}</p>
            <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-blue-700 transition-all">
               {t("history.calculateNow")}
               <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectHistory;
