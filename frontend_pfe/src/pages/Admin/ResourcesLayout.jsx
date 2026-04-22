import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/admin/ui-atoms";
// Units and tree still needed by Services tab (which remains mock for now)
import { useUnits } from "@/hooks/units.queries";
import { useModulesTree } from "@/hooks/modules.queries";

export default function ResourcesLayout() {
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { data: tree  = [], isLoading: treeLoading  } = useModulesTree();
  const [search, setSearch] = useState("");

  const tabClass = ({ isActive }) => cn(
    "px-4 py-2.5 text-sm font-medium transition-all relative",
    isActive 
      ? "text-primary border-b-2 border-primary" 
      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  );

  return (
    <div className="p-8 flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <SectionTitle 
          title="Resources" 
          subtitle="Catalogue of materials, services & units" 
        />
      </div>

      <div className="flex border-b mb-6 overflow-x-auto no-scrollbar">
        <NavLink to="/admin/resources" end className={tabClass}>Materials</NavLink>
        <NavLink to="/admin/resources/services" className={tabClass}>Services</NavLink>
        <NavLink to="/admin/resources/units" className={tabClass}>Units</NavLink>
      </div>

      <div className="pb-10">
        <Outlet context={{ units, unitsLoading, tree, treeLoading, search, setSearch }} />
      </div>
    </div>
  );
}
