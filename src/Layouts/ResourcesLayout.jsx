import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { P } from "../lib/design-tokens.js";
import { SectionTitle } from "../components/admin/ui-atoms.jsx";
import { INIT_RESOURCES, INIT_SERVICES } from "../mock/mock-data.js";
import { useModulesTree, useUnits } from "@/hooks/modules.queries";

export default function ResourcesLayout() {
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { data: tree = [],  isLoading: treeLoading }  = useModulesTree();

  const [resources, setResources] = useState(INIT_RESOURCES);
  const [services, setServices]   = useState(INIT_SERVICES);
  const [search, setSearch]       = useState("");
  const [showNew, setShowNew]     = useState(false);

  const tabStyle = ({ isActive }) => ({
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${isActive ? P.main : "transparent"}`,
    color: isActive ? P.main : P.txt3,
    fontSize: 14,
    fontFamily: P.font,
    cursor: "pointer",
    fontWeight: isActive ? 600 : 400,
    transition: "all .15s",
    marginBottom: -1,
    textDecoration: "none",
    display: "inline-block"
  });

  return (
    <div style={{ padding: "28px 30px", flex:1, overflowY:"auto", animation: "fadeUp .3s ease" }}>
      <SectionTitle 
        title="Resources" 
        subtitle="Catalogue of materials, services & units" 
      />

      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}`, marginBottom: 24, flexWrap:"wrap" }}>
        <NavLink to="/admin/resources" end style={tabStyle}>
          Materials
        </NavLink>
        <NavLink to="/admin/resources/services" style={tabStyle}>
          Services
        </NavLink>
        <NavLink to="/admin/resources/units" style={tabStyle}>
          Units
        </NavLink>
      </div>

      <Outlet context={{ 
        units, unitsLoading,
        resources, setResources, 
        services, setServices,
        tree, treeLoading,
        search, setSearch,
        showNew, setShowNew
      }} />
    </div>
  );
}


