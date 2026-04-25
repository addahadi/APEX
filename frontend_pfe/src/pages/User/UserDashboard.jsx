import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, FolderOpen, HardHat, LayoutDashboard, Plus, PlusCircle, X, Loader2 } from 'lucide-react';
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { useTranslation } from "react-i18next";

const UserDashboard = () => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', image: null, budget_type: 'MEDIUM' });
  const navigate = useNavigate();

  const { data: projectsData, isLoading, isError } = useProjects();
  const createProjectMutation = useCreateProject();

  const handleCreate = (e) => {
    e.preventDefault();
    createProjectMutation.mutate(newProject, {
      onSuccess: (data) => {
        setIsModalOpen(false);
        setNewProject({ name: '', description: '', image: null, budget_type: 'MEDIUM' });
        navigate(`/projects/${data.project_id}`);
      }
    });
  };

  const [activeTab, setActiveTab] = useState('ALL');
  const projects = projectsData || [];
  
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjectsCount = projects.filter(p => p.status === 'COMPLETED').length;
  
  const totalValuation = projects.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const totalLeaves = projects.reduce((sum, p) => sum + (p.leaf_count || 0), 0);

  return (
    <div className="py-8 relative">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
            <LayoutDashboard className="text-sm" />
            {t("dashboard.workspaceDashboard")}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
        >
          <PlusCircle />
          {t("dashboard.newProject")}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="bg-primary/10 p-3.5 rounded-xl text-primary shrink-0 shadow-inner">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("dashboard.assetInventory")}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{totalProjectsCount} <span className="text-sm text-slate-400 font-medium tracking-normal">{t("dashboard.projects")}</span></p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="bg-emerald-100 p-3.5 rounded-xl text-emerald-600 shrink-0 shadow-inner">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("dashboard.totalEstValue")}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none"><span className="text-lg opacity-60 mr-1 rtl:ml-1 rtl:mr-0">{tc("currency")}</span>{totalValuation.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="bg-amber-100 p-3.5 rounded-xl text-amber-600 shrink-0 shadow-inner">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("dashboard.calculationDensity")}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{totalLeaves} <span className="text-sm text-slate-400 font-medium tracking-normal">{t("dashboard.nodes")}</span></p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`pb-4 font-bold text-sm transition-all ${activeTab === 'ALL' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            {t("dashboard.allProjects")} ({totalProjectsCount})
          </button>
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-4 font-bold text-sm transition-all ${activeTab === 'ACTIVE' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            {t("dashboard.active")} ({activeProjectsCount})
          </button>
          <button 
            onClick={() => setActiveTab('COMPLETED')}
            className={`pb-4 font-bold text-sm transition-all ${activeTab === 'COMPLETED' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            {t("dashboard.completed")} ({completedProjectsCount})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>{tc("loading")}</p>
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
          <p className="font-bold">{tc("error")}</p>
          <p className="text-sm mt-1">{tc("retry")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            return (
              <Link key={project.project_id} to={`/projects/${project.project_id}`} className={`group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 ${project.status === 'COMPLETED' ? 'border-b-emerald-500/40' : 'border-b-primary/40'}`}>
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-center">
                  <img 
                    src={project.image_url || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1000&auto=format&fit=crop"} 
                    alt={project.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500 group-hover:backdrop-blur-[1px]">
                    {!project.image_url && (
                      <div className="h-16 w-16 rounded-2xl bg-white/90 dark:bg-slate-900/90 shadow-xl flex items-center justify-center text-3xl font-black text-primary z-10 transition-all duration-500 group-hover:scale-110">
                        {project.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 flex flex-col items-end rtl:items-start gap-2">
                    {project.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {tc("completed").toUpperCase()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-sm border border-primary/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                        {tc("active").toUpperCase()}
                      </span>
                    )}
                    {project.budget_type && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black tracking-wider shadow-sm ${
                        project.budget_type === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 
                        project.budget_type === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {t(`createModal.budget${project.budget_type.charAt(0) + project.budget_type.slice(1).toLowerCase()}`)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors ${project.status === 'COMPLETED' ? 'group-hover:text-emerald-600' : 'group-hover:text-primary'}`}>{project.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">UUID: {project.project_id.split('-')[0]}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="mt-auto">
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.totalCost")}</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">${project.total_cost?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right rtl:text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tc("createdAt")}</span>
                        <span className="text-xs font-medium text-slate-500">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          
          {/* Empty State Card */}
          <button onClick={() => setIsModalOpen(true)} className="group flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[400px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:border-primary">
            <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-primary transition-colors">
              <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                <Plus className="text-4xl" />
              </div>
              <div className="text-center px-6">
                <p className="text-lg font-bold">{t("dashboard.createProject")}</p>
                <p className="text-sm">{t("dashboard.initiate")}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-slate-800 pt-8 pb-12">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.showing", { count: projects.length, total: projects.length })}</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">{tc("previous")}</button>
          <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm">1</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">{tc("next")}</button>
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t("createModal.title")}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={createProjectMutation.isPending}
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("createModal.projectName")}</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none dark:text-white disabled:opacity-50"
                  placeholder={t("createModal.projectNamePlaceholder")}
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  disabled={createProjectMutation.isPending}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("createModal.description")}</label>
                <textarea 
                  rows="3"
                  className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none dark:text-white disabled:opacity-50"
                  placeholder={t("createModal.descriptionPlaceholder")}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  disabled={createProjectMutation.isPending}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("createModal.imageUrl")}</label>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {newProject.image ? (
                      <img src={URL.createObjectURL(newProject.image)} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="flex-1 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer"
                    onChange={(e) => setNewProject({...newProject, image: e.target.files[0]})}
                    disabled={createProjectMutation.isPending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("createModal.budgetType")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['LOW', 'MEDIUM', 'HIGH'].map((type) => (
                    <label 
                      key={type} 
                      className={`cursor-pointer border rounded-lg px-3 py-2.5 text-center text-[10px] font-black tracking-wider transition-all ${
                        newProject.budget_type === type 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      } ${createProjectMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="budget_type" 
                        value={type} 
                        checked={newProject.budget_type === type}
                        onChange={(e) => setNewProject({...newProject, budget_type: e.target.value})}
                        className="hidden"
                        disabled={createProjectMutation.isPending}
                      />
                      {t(`createModal.budget${type.charAt(0) + type.slice(1).toLowerCase()}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  disabled={createProjectMutation.isPending}
                >
                  {t("createModal.cancel")}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("createModal.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
