import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ArticleLayout() {
  const { t } = useTranslation("admin");
  const location = useLocation(); 
  const isEditor =
    location.pathname.includes("/articles/new") ||
    (location.pathname.includes("/articles/") && location.pathname.includes("/edit"));

  const tabClass = ({ isActive }) => cn(
    "px-4 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap",
    isActive 
      ? "text-primary border-b-2 border-primary" 
      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  );

  return (
    <div className="flex flex-1 overflow-hidden h-full flex-col">
      <div className="flex-1 overflow-y-auto p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("blog.layout.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("blog.layout.subtitle")}
            </p>
          </div>
          
          <Link to="/admin/articles/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("blog.layout.newArticle")}
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto no-scrollbar">
          <NavLink to="/admin/articles" end className={tabClass}>
            {t("blog.layout.allArticles")}
          </NavLink>
          <NavLink to="/admin/articles/tags" className={tabClass}>
            {t("blog.layout.tags")}
          </NavLink>
          
          {isEditor && (
            <span className={cn(tabClass({ isActive: true }), "cursor-default border-primary text-primary")}>
              {location.pathname.includes("edit") ? t("blog.layout.editArticle") : t("blog.layout.newArticle")}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="pb-10">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
