import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowRight, BarChart2, Building, Calculator, ChevronRight,
  Copy, History, Info, ListPlus, Lock, PencilRuler,
  Save, SlidersHorizontal
} from "lucide-react";
import { INIT_TREE } from "@/mock/mock-data";

// Recursively find a node by id in the tree
function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

const CategoryDetail = () => {
  const { projectId, categoryId } = useParams();

  // Look up the node from real mock data; null if no categoryId (index route)
  const node = categoryId ? findNode(INIT_TREE, categoryId) : null;

  // Use the backend-schema `type` field: "leaf" | "sub_category"
  const isLeaf = node?.type === "leaf";

  // ─── INDEX / NOT FOUND ──────────────────────────────────────────────────────
  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-10 bg-[#f6f6f8] dark:bg-slate-900">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Building className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Select a Category</h2>
          <p className="text-slate-500 mt-2">Choose a category from the sidebar to start working.</p>
        </div>
      </div>
    );
  }

  // ─── LEAF VIEW (Calculator) ─────────────────────────────────────────────────
  if (isLeaf) {
    const fields = node.fields || [];
    const formulas = node.formulas || [];

    return (
      <div className="flex-1 bg-[#f6f6f8] dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{node.name}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{node.icon} — {node.category_level}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">
              <History className="w-4 h-4" />
              Historique
            </button>
            <button className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-200 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
            <div>
              <div className="flex text-xs font-semibold text-slate-500 mb-2 items-center gap-1">
                <span className="text-primary uppercase tracking-wider">{node.category_level}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{node.name_ar}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{node.name_en}</h3>
              <p className="text-sm text-slate-500 max-w-lg mt-1">
                Enter the required parameters below. All formulas are computed automatically.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Formulas Active</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {formulas.length} formula{formulas.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Input Parameters
                  </h4>
                  <button className="text-xs text-primary font-semibold hover:underline">Reset</button>
                </div>
                <div className="p-6">
                  {fields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              defaultValue={0}
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-4 pr-12 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all focus:outline-none dark:bg-slate-700 dark:text-white"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No input fields defined for this category.</p>
                  )}

                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3 text-sm">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-blue-900 dark:text-blue-200">
                      <strong>Info:</strong> All calculations use standard construction norms. Results include waste factor by default.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden text-white flex flex-col border border-slate-700 relative">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
                <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between relative z-10">
                  <h4 className="font-bold flex items-center gap-2 text-lg">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                    Results
                  </h4>
                  <button
                    className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4 relative z-10">
                  {formulas.length > 0 ? (
                    formulas.map((formula) => (
                      <div
                        key={formula.id}
                        className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 group hover:border-emerald-500/50 transition duration-300"
                      >
                        <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">
                          {formula.label}
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-black font-mono text-emerald-400">—</span>
                          <span className="text-slate-500 font-mono text-sm mb-1">{formula.outputUnit}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500 font-mono">{formula.expression}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No formulas defined.</p>
                  )}
                </div>
                <div className="p-4 bg-slate-900/80 border-t border-slate-700 relative z-10">
                  <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    <ListPlus className="w-5 h-5" />
                    Ajouter au devis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUB-CATEGORY VIEW (Folder Grid) ──────────────────────────────────────────
  const children = node.children || [];

  return (
    <div className="flex-1 bg-[#f6f6f8] dark:bg-slate-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">

        {/* Category Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-slate-700 shrink-0 text-3xl">
              {node.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {node.category_level}
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{node.name}</h1>
              <p className="text-slate-500 text-sm mt-2 max-w-lg">{node.name_ar} — Select a sub-category to continue.</p>
            </div>
          </div>

          <div className="mt-6 md:mt-0 shrink-0 relative z-10">
            <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="block text-2xl font-black text-primary">{children.length}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Sub-categories</span>
            </div>
          </div>
        </div>

        {/* Children Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Sub-categories</h2>

          {children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/projects/${projectId}/explorer/${child.id}`}
                  className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-primary/40 hover:shadow-lg transition-all text-left"
                >
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors mb-4">
                    {child.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{child.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{child.name_ar}</p>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        child.type === "leaf"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {child.type === "leaf" ? "LEAF" : "FOLDER"}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Lock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">No sub-categories yet</p>
              <p className="text-sm mt-1">This category has no children defined.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
