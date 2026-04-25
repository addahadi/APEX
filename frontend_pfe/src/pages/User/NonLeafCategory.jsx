import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

const NonLeafCategory = ({ node, childrenData, isChildrenLoading }) => {
  const { projectId } = useParams();
  const { t } = useTranslation("user");
  const localize = useLocalizedField();

  return (
    <div className="p-6 md:p-10 space-y-8 flex-1 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start gap-5 relative z-10">
          <div className="w-16 h-16 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-2xl flex items-center justify-center border border-primary/20 shrink-0 text-3xl shadow-sm">
            {node.icon ? <DynamicIcon name={node.icon} size={32} className="text-primary" /> : '📁'}
          </div>
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              {node.category_level} {t("nonLeaf.folder")}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{localize(node, 'name')}</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">{localize(node, 'description') || node.name_ar}</p>
          </div>
        </div>

        <div className="mt-6 md:mt-0 shrink-0 relative z-10 hidden sm:block">
          <div className="text-center px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
            <span className="block text-3xl font-black text-primary leading-none">
              {isChildrenLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : (childrenData?.length || 0)}
            </span>
            <span className="block text-[10px] uppercase font-bold text-slate-400 mt-2">{t("nonLeaf.subcategories")}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5">{t("nonLeaf.subcategories")}</h2>

        {isChildrenLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : childrenData && childrenData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {childrenData.map((child, i) => {
              const palette = [
                { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', ring: 'border-blue-200 dark:border-blue-800' },
                { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-200 dark:border-amber-800' },
                { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-200 dark:border-emerald-800' },
                { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', ring: 'border-purple-200 dark:border-purple-800' },
                { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', ring: 'border-rose-200 dark:border-rose-800' },
                { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', ring: 'border-cyan-200 dark:border-cyan-800' },
                { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', ring: 'border-orange-200 dark:border-orange-800' },
                { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', ring: 'border-indigo-200 dark:border-indigo-800' },
              ];
              const c = palette[i % palette.length];
              return (
              <Link
                key={child.category_id}
                to={`/projects/${projectId}/explorer/${child.category_id}`}
                className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary/50 hover:shadow-xl transition-all text-left rtl:text-right flex flex-col h-full"
              >
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all mb-5 border ${c.ring} shadow-sm`}>
                  {child.icon ? <DynamicIcon name={child.icon} size={24} className={c.text} /> : '📁'}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight group-hover:text-primary transition-colors">{localize(child, 'name')}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1">{localize(child, 'description') || child.name_ar}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      child.category_level === "SUB_TYPE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {child.category_level === "SUB_TYPE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {child.category_level}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl border-dashed">
            <Lock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">{t("nonLeaf.noChildren")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NonLeafCategory;
