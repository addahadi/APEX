import React, { useState, useEffect } from "react";
import AIChatbot from "@/components/AIChatbot";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { Box, Sparkles, LogOut, ChevronRight, ChevronDown, Folder, Layers, Loader2 } from "lucide-react";
import { useCategoryTree } from "@/hooks/useCategories";
import DynamicIcon from "@/components/DynamicIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

// Helper to recursively find node
function findNode(nodes, id) {
  for (const node of nodes) {
    if ((node.category_id || node.id) === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper to find root category
function findRootCategory(nodes, targetId) {
  for (const root of nodes) {
    if (findNode([root], targetId)) return root;
  }
  return null;
}

/* ─── DYNAMIC TREE ROW (Sidebar Integration) ─── */
function TreeRow({ node, depth, expanded, onToggle }) {
  const { categoryId, projectId } = useParams(); 
  const navigate = useNavigate();
  const localize = useLocalizedField();
  
  const id = node.category_id || node.id;
  const isLeaf = !node.children?.length || node.category_level === "SUB_TYPE";
  const isExp = expanded.includes(id);
  const isSel = categoryId === id;

  const handleRowClick = () => {
    navigate(`/projects/${projectId}/explorer/${id}`);
  };

  return (
    <div>
      <div
        onClick={handleRowClick}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: `8px 12px 8px ${12 + depth * 16}px`,
          cursor: "pointer", borderRadius: 8, marginBottom: 2,
          background: isSel ? "#104ED815" : "transparent",
          color: isSel ? "#104ED8" : "#475569",
          transition: "all .12s", position: "relative",
          fontWeight: isSel ? 600 : 500,
        }}
        onMouseEnter={e => !isSel && (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={e => !isSel && (e.currentTarget.style.background = "transparent")}
      >
        <span
          onClick={e => { e.stopPropagation(); if (!isLeaf) onToggle(id); }}
          style={{ color: "#94A3B8", cursor: isLeaf ? "default" : "pointer", display: "flex" }}
        >
          {!isLeaf ? (isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
        </span>

        <span style={{ display: "flex", alignItems: "center", opacity: isSel ? 1 : 0.7, fontSize: 16 }}>
          {node.icon ? (
            <DynamicIcon name={node.icon} size={14} className={isExp ? "text-amber-500" : "text-current"} />
          ) : (
            isLeaf ? <Layers size={14} /> : <Folder size={14} fill={isExp ? "#F59E0B" : "none"} color={isExp ? "#F59E0B" : "currentColor"} />
          )}
        </span>
        
        <span style={{ fontSize: 13, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {localize(node, 'name')}
        </span>

        {node.category_level === 'SUB_TYPE' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />}
      </div>

      {/* Render Children if Expanded */}
      {!isLeaf && isExp && node.children?.map(c => (
        <TreeRow key={c.category_id || c.id} node={c} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

/* ─── PROJECT EXPLORER LAYOUT ─── */
const ProjectExplorerLayout = () => {
  const { t } = useTranslation("common");
  const { t: tUser } = useTranslation("user");
  const navigate = useNavigate();
  const { projectId, categoryId } = useParams();
  const [expanded, setExpanded] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { data: treeData = [], isLoading } = useCategoryTree();

  // Auto-expand the active tree hierarchy
  useEffect(() => {
    if (categoryId) {
       setExpanded(prev => prev.includes(categoryId) ? prev : [...prev, categoryId]);
    }
  }, [categoryId]);

  const activeRoot = categoryId ? findRootCategory(treeData, categoryId) : null;
  const nodesToRender = treeData;

  const handleToggle = (id) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const collapseAll = () => setExpanded([]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ─── DYNAMIC SIDEBAR ─── */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 shrink-0">
        <div 
          onClick={() => navigate('/dashboard')}
          className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <img src="/logo.png" alt="APEX Logo" className="w-10 h-10 rounded-lg shadow-sm object-cover" />
          <div>
            <h1 className="font-bold text-lg leading-none">{t("appName")}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{t("workspace")}</p>
          </div>
        </div>

        {/* Project Context Info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-2 text-blue-600">
             <Box size={14} />
             <h3 className="text-xs font-bold uppercase tracking-widest">{tUser("explorer.skylineTower")}</h3>
           </div>
        </div>

        {/* INLINE CATEGORY NAV */}
        <nav className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
             <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
             nodesToRender.map(node => (
               <TreeRow 
                 key={node.category_id || node.id} 
                 node={node} 
                 depth={0} 
                 expanded={expanded} 
                 onToggle={handleToggle} 
               />
             ))
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={collapseAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 transition-colors"
          >
            <LogOut size={14} className="rotate-90" />
            {t("collapseAll")}
          </button>
        </div>
      </aside>

      {/* ─── MAIN WORKSPACE ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-100 transition-all font-sans"
            >
              <Sparkles size={16} />
              {t("aiAssistant")}
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-blue-100 overflow-hidden cursor-pointer">
              <img src="https://ui-avatars.com/api/?name=John+Doe" className="w-full h-full" alt="profile" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {/* ─── GLOBAL CHATBOT ─── */}
        <AIChatbot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          location="ESTIMATION"
        />
      </div>
    </div>
  );
};

export default ProjectExplorerLayout;