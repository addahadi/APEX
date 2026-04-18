import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowRight, BarChart2, Building, Calculator, ChevronRight,
  Copy, History, Info, ListPlus, Lock, PencilRuler,
  Save, SlidersHorizontal, CheckCircle2, Package
} from "lucide-react";
import { INIT_TREE } from "@/mock/mock-data";

// Recursively find a node by category_id in the tree
function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.category_id === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const CategoryDetail = () => {
  const { projectId, categoryId } = useParams();
  const [selectedFormulaId, setSelectedFormulaId] = useState(null);

  // Look up the node from real mock data; null if no categoryId (index route)
  const node = categoryId ? findNode(INIT_TREE, categoryId) : null;

  // Use the backend-schema `category_level` field: "ROOT" | "BRANCH" | "LEAF"
  const isLeaf = node?.category_level === "LEAF";
  
  const formulas = node?.formulas || [];
  
  // Update selected formula when node changes
  useEffect(() => {
    if (isLeaf && formulas.length > 0) {
      if (!formulas.find(f => f.formula_id === selectedFormulaId)) {
        setSelectedFormulaId(formulas[0].formula_id);
      }
    } else {
      setSelectedFormulaId(null);
    }
  }, [categoryId, isLeaf, formulas, selectedFormulaId]);

  const activeFormula = formulas.find(f => f.formula_id === selectedFormulaId) || formulas[0];
  const fields = activeFormula?.fields || [];

  // ─── INDEX / NOT FOUND ──────────────────────────────────────────────────────
  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-10 bg-[#f6f6f8] dark:bg-slate-900">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Building className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Select a Category</h2>
          <p className="text-slate-500 mt-2">Choose a root category from your project overview to start working.</p>
        </div>
        <Link to={`/projects/${projectId}`} className="px-6 py-2 bg-primary text-white font-bold rounded-lg mt-4 shadow-lg shadow-primary/25">
          Back to Project Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f6f6f8] dark:bg-slate-900 overflow-hidden">
      {/* ─── MAIN CONTENT ─── */}
        {isLeaf ? (
          // ─── LEAF VIEW (Calculator) ───
          <>
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{node.name_en}</h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{node.name_ar} — {node.category_level}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-200 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Calculation
                </button>
              </div>
            </header>

            <div className="p-4 md:p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Input Fields & Formulas */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Select Formula Radio Group */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                       <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                         Methodology
                       </h4>
                     </div>
                     <div className="p-6">
                        {formulas.length > 0 ? (
                           <div className="flex flex-col gap-3">
                             {formulas.map(f => (
                               <label 
                                 key={f.formula_id} 
                                 className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFormulaId === f.formula_id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                               >
                                 <input 
                                   type="radio" 
                                   name="formula" 
                                   value={f.formula_id}
                                   checked={selectedFormulaId === f.formula_id}
                                   onChange={() => setSelectedFormulaId(f.formula_id)}
                                   className="mt-1 w-4 h-4 text-primary focus:ring-primary border-slate-300"
                                 />
                                 <div className="flex-1">
                                   <div className="font-bold text-slate-800 dark:text-slate-200 flex justify-between">
                                      {f.name}
                                      <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">v{f.version}</span>
                                   </div>
                                   <div className="text-xs font-mono text-slate-500 mt-1 p-1 bg-slate-50 dark:bg-slate-900 rounded">
                                      {f.expression}
                                   </div>
                                 </div>
                               </label>
                             ))}
                           </div>
                        ) : (
                          <div className="text-sm text-slate-500">No formulas exist for this leaf.</div>
                        )}
                     </div>
                  </div>

                  {/* Dynamic Fields for Selected Formula */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        Dynamic Field Values
                      </h4>
                    </div>
                    <div className="p-6 text-sm">
                      {fields.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {fields.map((field) => (
                            <div key={field.field_id}>
                              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                                 <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                                 {!field.is_computed && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded">Input</span>}
                                 {field.is_computed && <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded">Computed</span>}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  defaultValue={field.default_value || 0}
                                  readOnly={field.is_computed}
                                  className={`w-full border rounded-lg py-2.5 pl-4 pr-12 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all focus:outline-none dark:text-white ${field.is_computed ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900'}`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                  {field.unit_symbol}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">Select a formula to view its required input fields.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prominent Blue Results Panel */}
                <div className="xl:col-span-1">
                  <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col relative sticky top-6">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                     
                     <div className="px-6 py-5 border-b border-blue-500/50 flex flex-col relative z-10">
                        <h4 className="font-bold flex items-center gap-2 text-lg">
                           <BarChart2 className="w-5 h-5 text-blue-300" />
                           Estimation Results
                        </h4>
                     </div>
                     
                     <div className="p-6 relative z-10 flex flex-col gap-6">
                        
                        {/* Selected Formula Output (Non-Material) */}
                        <div className="bg-blue-700/60 backdrop-blur-md rounded-2xl p-5 border border-blue-500/50 shadow-inner">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Primary Output</span>
                           </div>
                           <div className="flex items-end gap-2">
                              {/* Mocked Calculation Output */}
                              <span className="text-5xl font-black tracking-tight leading-none text-white">45.0</span>
                              <span className="text-xl font-bold text-blue-300 mb-1">{activeFormula?.output_unit_symbol || '-'}</span>
                           </div>
                           <div className="mt-3 text-[10px] text-blue-300 font-mono">Based on: {activeFormula?.name || 'No Formula Selected'}</div>
                        </div>

                        {/* Material Resources Calculation */}
                        <div>
                           <div className="flex items-center gap-2 mb-3">
                              <Package className="w-4 h-4 text-blue-300"/>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Required Resources</h5>
                           </div>
                           
                           {activeFormula ? (
                              <div className="space-y-2">
                                 {/* Mock Material Item 1 */}
                                 <div className="flex justify-between items-center bg-blue-800/40 rounded-xl p-3 border border-blue-700/50 hover:bg-blue-700/50 transition-colors">
                                    <div>
                                       <div className="font-semibold text-sm">Portland Cement</div>
                                       <div className="text-[10px] text-blue-300 font-mono mt-0.5">Waste: 5% — 150 DZD/bag</div>
                                    </div>
                                    <div className="text-right">
                                       <div className="font-bold text-sm">120 bags</div>
                                       <div className="text-[10px] text-blue-200 font-mono mt-0.5">18,000 DZD</div>
                                    </div>
                                 </div>

                                 {/* Mock Material Item 2 */}
                                 <div className="flex justify-between items-center bg-blue-800/40 rounded-xl p-3 border border-blue-700/50 hover:bg-blue-700/50 transition-colors">
                                    <div>
                                       <div className="font-semibold text-sm">Fine Sand</div>
                                       <div className="text-[10px] text-blue-300 font-mono mt-0.5">Waste: 2% — 1200 DZD/m3</div>
                                    </div>
                                    <div className="text-right">
                                       <div className="font-bold text-sm">4.5 m³</div>
                                       <div className="text-[10px] text-blue-200 font-mono mt-0.5">5,400 DZD</div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className="text-sm text-blue-300 text-center py-4">Select a formula to see materials</div>
                           )}
                        </div>

                        {/* Grand Total */}
                        <div className="pt-5 border-t border-blue-500/50 flex justify-between items-center mt-2">
                           <span className="text-sm font-bold text-blue-200">Total Leaf Cost</span>
                           <span className="text-2xl font-black text-white text-emerald-300">
                             24,500 <span className="text-sm font-bold opacity-80">DZD</span>
                           </span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // ─── SUB-CATEGORY VIEW (Folder Grid) ───
          <div className="p-6 md:p-10 space-y-8 flex-1">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-start gap-5 relative z-10">
                <div className="w-16 h-16 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0 text-3xl shadow-sm">
                  {node.icon || '📁'}
                </div>
                <div>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {node.category_level} FOLDER
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{node.name_en}</h1>
                  <p className="text-slate-500 text-sm mt-2 max-w-xl">{node.name_ar} — Navigate deeper into the taxonomy to reach leaf calculation nodes.</p>
                </div>
              </div>

              <div className="mt-6 md:mt-0 shrink-0 relative z-10 hidden sm:block">
                <div className="text-center px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                  <span className="block text-3xl font-black text-primary leading-none">{node.children?.length || 0}</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-2">Sub-categories</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5">Sub-categories Grid</h2>

              {node.children && node.children.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {node.children.map((child) => (
                    <Link
                      key={child.category_id}
                      to={`/projects/${projectId}/explorer/${child.category_id}`}
                      className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary/50 hover:shadow-xl transition-all text-left flex flex-col h-full"
                    >
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-primary/5 group-hover:scale-110 transition-all mb-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                        {child.icon || '📁'}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight group-hover:text-primary transition-colors">{child.name_en}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1">{child.name_ar}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            child.category_level === "LEAF"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {child.category_level === "LEAF" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {child.category_level}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                           <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl border-dashed">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-xl font-bold text-slate-600 dark:text-slate-300">No content below</p>
                  <p className="text-sm mt-2 text-slate-400">This category has no structured children.</p>
                </div>
              )}
            </div>
          </div>
        )}
      {/* End main content */}
    </div>
  );
};

export default CategoryDetail;
