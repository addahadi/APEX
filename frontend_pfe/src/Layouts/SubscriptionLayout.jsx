import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CreditCard, Users, Plus } from "lucide-react";
import { P } from "../lib/design-tokens.js";
import { Btn, SectionTitle, Modal } from "../components/admin/ui-atoms.jsx";
import PlanForm, { PREDEFINED_FEATURES } from "../components/admin/PlanForm.jsx";
import { useCreatePlan } from "@/hooks/plan.queries";
import { useToast } from "@/hooks/use-toast";


export default function SubscriptionLayout() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createMutation = useCreatePlan();

  const handleCreatePlan = async (data) => {
    try {
      await createMutation.mutateAsync({
        name_en: data.name_en,
        name_ar: data.name_ar,
        price: Number(data.price),
        duration: Number(data.duration),
        plan_type_id: data.typeId,
        features: data.features
      });
      setIsModalOpen(false);
      toast({ title: "Success", description: "New plan created successfully!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to create plan" });
    }
  };

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
    <div style={{ padding: "28px 30px", animation: "fadeUp .3s ease" }}>
      {/* Header section with Dynamic Action button */}
      <SectionTitle 
        title="Subscriptions" 
        subtitle="Manage billing plans and monitor active subscribers" 
        action={<Btn onClick={() => setIsModalOpen(true)} icon={<Plus size={14}/>}>Create New Plan</Btn>} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Subscription Plan"
      >
        <PlanForm 
          onSave={handleCreatePlan} 
          onCancel={() => setIsModalOpen(false)} 
          isPending={createMutation.isPending} 
        />
      </Modal>

      {/* Section Navigation Tabs */}

      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}`, marginBottom: 24 }}>
        <NavLink to="/admin/subscriptions" end style={tabStyle}>
          Plan Features
        </NavLink>
        <NavLink to="/admin/subscriptions/types" style={tabStyle}>
          Plan Types
        </NavLink>
        <NavLink to="/admin/subscriptions/subscribers" style={tabStyle}>
          Subscribers List
        </NavLink>
      </div>

      {/* This renders PlanFeatures or Subscribers based on the route */}
      <Outlet />
    </div>
  );
}
