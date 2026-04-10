import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, FolderOpen, HardHat, LayoutDashboard, Plus, PlusCircle, User } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
            <LayoutDashboard className="text-sm" />
            Workspace Dashboard
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Active Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg">
            Manage your architectural portfolio. Monitor status and project metadata as defined in the system registry.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
          <PlusCircle />
          Create Project
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <HardHat className="text-3xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Status</p>
            <p className="text-2xl font-bold">12 Projects</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
            <BadgeCheck className="text-3xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-bold">48 Units</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <FolderOpen className="text-3xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categories</p>
            <p className="text-2xl font-bold">8 Groups</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex gap-8">
          <button className="border-b-2 border-primary text-primary pb-4 font-bold text-sm">All Projects</button>
          <button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-4 font-bold text-sm hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Active</button>
          <button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-4 font-bold text-sm hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Completed</button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Project Card 1 (Active) */}
        <Link to="/projects/1" className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-primary/40">
          <div className="relative h-48 overflow-hidden">
            <img alt="Skyline Tower" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmKj9HeVar9msl6uvNyWVEwHkkSkSbxCx8rkhNxiu69KfUryelDBEf9j6rTJu_OLn2DVMQYdrtCNd71bQuzViVjLO-C654RBxelLh481vhc0gGiw0HK2UZezchlMuQZfbF2zptK3UQKhN7sS7WqhC7JUDIrAspbQmoCcMkF7DePPE5Zv_sy4xmKjYt0lV2Bb2e1dOxmcLaLIt1uZYdVBXCvkjUqkp-WjjM_v_YXDjHnApfOh0Ht-BBzSTua7fL5OKQHce3_zT2ClQ" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-primary border border-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">Skyline Tower</h3>
                <span className="text-[10px] font-mono text-slate-400">UUID: 8f2-a91</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">High-rise luxury residential complex with sustainable architecture and smart energy systems.</p>
            </div>
            <div className="mt-auto">
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <User className="text-slate-400 text-sm" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Apex Corp</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Due Dec 2024</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Project Card 2 (Completed) */}
        <Link to="/projects/2" className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-emerald-500/40">
          <div className="relative h-48 overflow-hidden">
            <img alt="Riverfront Plaza" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw3UkEFZoFdB3sYbUxIwFnrJ8skq7g9ohgATKrFPIXupKJO2xSl9t70bkkXqQF71Spea3pWMFK143VuKY_w20FaE8wSTRSl1QBDHkalNDsT0Ist-xl3riQE5Bxf8rVhlfajEsUPbN9a1a7TCUwsgnQUkF2wC717ynEBbQGU5VtbwrmrFktwZpmR-MRqQziGt8l2a1JDBaVAWePiCkNHWFZjc0KgTsnFRaYEoIfWnFaOyXDffnjU469W2BvRZcGDCwLHG6a-uH9p7E" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                COMPLETED
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">Riverfront Plaza</h3>
                <span className="text-[10px] font-mono text-slate-400">UUID: 4d1-c32</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Public-private partnership for waterfront development including recreational and office spaces.</p>
            </div>
            <div className="mt-auto">
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <User className="text-slate-400 text-sm" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Metro City</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Finished Aug 2023</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Project Card 3 (Active) */}
        <Link to="/projects/3" className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-primary/40">
          <div className="relative h-48 overflow-hidden">
            <img alt="Oakwood Medical" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClbYrFQuTVuahNlALurQmqv0KcomNxKmY0Ce3Xa92BWy6W-6UzyMPrt5E75v_5kbGFHxrvho6gWrxjN7S9rp0ISeAH7EFcbV60wjjNpABfEZValXm7rbaTKPuALJsRGZU5kHsib6kiZab1J1j0jmEpCPM4S-9zdlruLMCat183g2DLU-Pepi7lxcVn0rUg5W23rbyod83UE2DTxUTK9t2RADwA3az8tOPD-Eg9TkNuRnU1HVLEJWUCwqAUAGgLutOdgyVshAdl-Lc" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-primary border border-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">Oakwood Medical</h3>
                <span className="text-[10px] font-mono text-slate-400">UUID: 2b5-e77</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">State-of-the-art medical facility focusing on diagnostic excellence and patient comfort.</p>
            </div>
            <div className="mt-auto">
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <User className="text-slate-400 text-sm" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">HealthFirst</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Due Mar 2025</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Empty State Card / Add New */}
        <button className="group flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[400px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:border-primary">
          <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-primary transition-colors">
            <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
              <Plus className="text-4xl" />
            </div>
            <div className="text-center px-6">
              <p className="text-lg font-bold">Create Project</p>
              <p className="text-sm">Initiate project creation process</p>
            </div>
          </div>
        </button>
      </div>

      {/* Dashboard Footer/Pagination */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-slate-800 pt-8 pb-12">
        <p className="text-sm text-slate-500 dark:text-slate-400">Showing 3 of 12 registered Project entities</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">Previous</button>
          <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm">1</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">2</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
