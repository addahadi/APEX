import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Search, Filter, History, Package, ChevronDown, ChevronRight, Calculator, FileText } from "lucide-react";
import { INIT_PROJECTS } from "@/mock/mock-data";

const ProjectHistory = () => {
  const { projectId } = useParams();
  const project = INIT_PROJECTS.find((p) => p.project_id === (projectId || "1")) || INIT_PROJECTS[0];
  const calculations = project.leaf_calculations || [];

  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  return (
    <div className="py-8">
      {/* ─── Header ─── */}
      <div className="mb-8">
        <Link 
          to={`/projects/${project.project_id}`} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project Overview
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <History className="text-primary" />
              Calculation History
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl">
              Complete historical ledger of all metric and material estimations committed within <span className="font-bold text-slate-700 dark:text-slate-300">{project.name}</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* ─── History Detailed List ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {calculations.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {calculations.map((calc) => {
              const isExpanded = expandedRows.includes(calc.project_details_id);
              
              return (
                <div key={calc.project_details_id} className="group">
                  {/* Row Header (Clickable) */}
                  <div 
                    onClick={() => toggleRow(calc.project_details_id)}
                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4 flex-1">
                       <button className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                         {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                       </button>
                       <div>
                         <h3 className="font-bold text-slate-900 dark:text-white text-lg">{calc.category_name}</h3>
                         <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                              <Calculator className="w-3 h-3" />
                              {calc.formula_name}
                            </span>
                            {calc.config_name && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500">
                                <Package className="w-3 h-3" />
                                {calc.config_name}
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(calc.created_at).toLocaleString()}
                            </span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-8 pl-10 lg:pl-0">
                       {/* Primary Output Snapshot */}
                       <div className="flex flex-col gap-1 items-start lg:items-end">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Metric</span>
                         <div className="flex flex-wrap gap-2">
                           {Object.entries(calc.results || {}).map(([k, v]) => (
                             <span key={k} className="text-sm font-black text-slate-700 dark:text-slate-300">
                               {v} <span className="text-xs font-semibold text-slate-400 capitalize">{k}</span>
                             </span>
                           ))}
                         </div>
                       </div>

                       {/* Total Leaf Cost */}
                       <div className="flex flex-col gap-1 items-end min-w-[120px]">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
                         <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                           <span className="text-sm opacity-50 mr-0.5">$</span>{calc.leaf_total?.toLocaleString() || 0}
                         </span>
                       </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Breakdown */}
                  {isExpanded && (
                    <div className="px-6 pb-8 pt-2 pl-16 border-t border-slate-50 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-800/10 hidden-fade-in">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           {/* Inputs Section */}
                           <div className="lg:col-span-1">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Argument Inputs
                              </h4>
                              {calc.field_values && Object.keys(calc.field_values).length > 0 ? (
                                <ul className="space-y-2">
                                  {Object.entries(calc.field_values).map(([fieldId, val]) => (
                                    <li key={fieldId} className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700/50 border-dotted pb-2">
                                      <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">{fieldId.split('-')[0]}...</span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{val}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-xs text-slate-400 italic">No static field inputs provided for this calculation.</div>
                              )}
                           </div>

                           {/* Materials Section */}
                           <div className="lg:col-span-2">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-400" />
                                Granular Material Breakdown
                              </h4>
                              {calc.material_lines && calc.material_lines.length > 0 ? (
                                <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                                      <tr>
                                        <th className="px-4 py-2">Material</th>
                                        <th className="px-4 py-2">Base Qty</th>
                                        <th className="px-4 py-2">Waste</th>
                                        <th className="px-4 py-2">Unit Price</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                      {calc.material_lines.map(mat => (
                                        <tr key={mat.detail_id}>
                                          <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{mat.material_name}</td>
                                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{mat.quantity} <span className="text-xs">{mat.unit_symbol}</span></td>
                                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{(mat.applied_waste * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono">${mat.unit_price_snapshot}</td>
                                          <td className="px-4 py-2 text-right font-bold text-slate-700 dark:text-slate-200">${mat.sub_total.toLocaleString()}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-sm py-8 text-center text-slate-500">
                                  No material lines mapped for this calculation.
                                </div>
                              )}
                           </div>
                        </div>
                        
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">No History Available</p>
            <p className="text-sm mt-1">There are currently no saved calculations for this project.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectHistory;
