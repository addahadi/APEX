import React from "react";
import { useParams, Link } from "react-router-dom";
import { Building, Loader2 } from "lucide-react";
import { useCategoryDetails, useChildCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";
import LeafCategory from "./LeafCategory";
import NonLeafCategory from "./NonLeafCategory";

const CategoryDetail = () => {
  const { t } = useTranslation("user");
  const { projectId, categoryId } = useParams();

  const { data: node, isLoading: isNodeLoading, isError: isNodeError } = useCategoryDetails(categoryId);
  const isLeaf = node?.category_level === "SUB_TYPE";
  
  const { data: childrenData, isLoading: isChildrenLoading } = useChildCategories(categoryId);

  if (!categoryId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-10 bg-[#f6f6f8] dark:bg-slate-900 h-full">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Building className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("nonLeaf.exploreDeeper")}</h2>
          <p className="text-slate-500 mt-2">{t("projectOverview.noModules")}</p>
        </div>
        <Link to={`/projects/${projectId}`} className="px-6 py-2 bg-primary text-white font-bold rounded-lg mt-4 shadow-lg shadow-primary/25">
          {t("projectOverview.returnDashboard")}
        </Link>
      </div>
    );
  }

  if (isNodeLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isNodeError || !node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-red-500 mt-10 h-full">
        <p className="text-lg font-bold">{t("history.errorTitle")}</p>
        <Link to={`/projects/${projectId}`} className="text-primary hover:underline mt-2 block">{t("history.returnOverview")}</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f6f6f8] dark:bg-slate-900 overflow-hidden">
      {isLeaf ? (
        <LeafCategory node={node} />
      ) : (
        <NonLeafCategory node={node} childrenData={childrenData} isChildrenLoading={isChildrenLoading} />
      )}
    </div>
  );
};

export default CategoryDetail;