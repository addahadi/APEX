import { useState } from "react";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import { P, TYPE_CONF } from "@/lib/design-tokens";
import { Badge, Btn, Card } from "@/components/admin/ui-atoms";
import { usePlans, useUpdatePlan, useDeletePlan } from "@/hooks/plan.queries";
import { useToast } from "@/hooks/use-toast";
import PlanForm, { PREDEFINED_FEATURES } from "@/components/admin/PlanForm";

export default function PlanFeatures() {
  const { toast } = useToast();
  const { data: plans = [], isLoading } = usePlans();

  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  const [editPlan, setEditPlan] = useState(null);

  const saveEdit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        id: data.id,
        name_en: data.name_en,
        name_ar: data.name_ar,
        price: Number(data.price),
        duration: Number(data.duration),
        plan_type_id: data.typeId,
        features: data.features
      });
      setEditPlan(null);
      toast({ title: "Success", description: "Plan updated successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Update failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Plan removed successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete plan" });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, color: P.txt3 }}>
        <Loader2 size={24} className="animate-spin" style={{ marginRight: 10 }} />
        Loading plans...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp .3s ease", paddingBottom: 40 }}>
      {editPlan && (
        <Card style={{ padding: 24, marginBottom: 24, border: `2px solid ${P.main}33` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 18 }}>Edit Plan: {editPlan.name_en}</div>
          <PlanForm 
            initialData={editPlan} 
            onSave={saveEdit} 
            onCancel={() => setEditPlan(null)} 
            isPending={updateMutation.isPending} 
          />
        </Card>
      )}
      
      {plans.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center", color: P.txt3 }}>
          No plans found. Use the button above to create your first plan.
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {plans.map(plan => {
            const tc = TYPE_CONF[plan.plan_type_name] || TYPE_CONF.NORMAL;
            return (
              <Card key={plan.id} style={{ overflow: "hidden", animation: "fadeUp .3s ease" }}>
                <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${P.borderL}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: P.txt }}>{plan.name_en}</div>
                    {plan.price > 0
                      ? <div style={{ fontSize: 15, fontWeight: 700, color: P.main }}>{plan.price.toLocaleString()} <span style={{ fontSize: 11, color: P.txt3, fontWeight: 400 }}>DA</span></div>
                      : <div style={{ fontSize: 14, fontWeight: 600, color: P.success }}>Free</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <Badge label={plan.plan_type_name || "NORMAL"} color={tc.color} bg={tc.bg} />
                    <Badge label={`${plan.duration}d`} color={P.txt3} bg={P.borderL} />
                  </div>
                  <div style={{ fontSize: 13, color: P.txt2, direction: "rtl", marginBottom: 4 }}>{plan.name_ar}</div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {PREDEFINED_FEATURES.map((pf) => {
                    const f = plan.features?.find(ef => ef.key === pf.key) || { key: pf.key, val: "0" };
                    return (
                      <div key={pf.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 }}>
                        <span style={{ color: P.txt3 }}>{pf.label}</span>
                        <span style={{ color: f.val === "true" ? P.success : f.val === "false" ? P.error : P.txt, fontWeight: 500 }}>{f.val}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "0 20px 16px", display: "flex", gap: 6 }}>
                  <Btn small variant="outline" icon={<Pencil size={11} />} onClick={() => setEditPlan({ 
                    ...plan, 
                    typeId: plan.plan_type_id, 
                    features: PREDEFINED_FEATURES.map(pf => {
                      const existing = plan.features?.find(ef => ef.key === pf.key);
                      return { key: pf.key, value: existing?.val || "0" };
                    })
                  })}>Edit</Btn>
                  <Btn small variant="ghost" color={P.error} icon={<Trash2 size={11} />} onClick={() => handleDelete(plan.id)} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


