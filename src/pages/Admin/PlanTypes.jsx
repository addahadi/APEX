import { useState } from "react";
import { Plus, Pencil, Trash2, Save, Loader2, X } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Btn, Card, TH, TD, SectionTitle, Field } from "@/components/admin/ui-atoms";
import { usePlanTypes, useCreatePlanType, useUpdatePlanType, useDeletePlanType } from "@/hooks/plan.queries";
import { useToast } from "@/hooks/use-toast";

export default function PlanTypes() {
  const { toast } = useToast();
  const { data: planTypes = [], isLoading } = usePlanTypes();
  const createMutation = useCreatePlanType();
  const updateMutation = useUpdatePlanType();
  const deleteMutation = useDeletePlanType();

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name_en: "", name_ar: "" });
  const [showAdd, setShowAdd] = useState(false);

  const handleEdit = (pt) => {
    setEditId(pt.id);
    setFormData({ name_en: pt.name_en, name_ar: pt.name_ar });
    setShowAdd(false);
  };

  const handleCancel = () => {
    setEditId(null);
    setShowAdd(false);
    setFormData({ name_en: "", name_ar: "" });
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...formData });
        toast({ title: "Updated", description: "Plan type updated successfully" });
      } else {
        await createMutation.mutateAsync(formData);
        toast({ title: "Created", description: "Plan type created successfully" });
      }
      handleCancel();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save plan type" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This might affect existing plans.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Plan type removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ animation: "fadeUp .3s ease", paddingBottom: 40 }}>
      
      <div style={{ maxWidth: 700 }}>

        {(showAdd || editId) && (
          <Card style={{ padding: 20, marginBottom: 20, border: `1.5px solid ${P.main}33` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Field label="Name (EN)" value={formData.name_en} onChange={v => setFormData(p => ({ ...p, name_en: v }))} placeholder="e.g. Enterprise" />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Name (AR)" value={formData.name_ar} onChange={v => setFormData(p => ({ ...p, name_ar: v }))} placeholder="مثلاً: شركات" />
              </div>
              <div style={{ display: "flex", gap: 6, paddingBottom: 4 }}>
                <Btn onClick={handleSave} disabled={isPending} icon={isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}>
                  {isPending ? "..." : "Save"}
                </Btn>
                <Btn variant="ghost" icon={<X size={14} />} onClick={handleCancel} />
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 20, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name (EN)", "Name (AR)", "Actions"].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <TD colSpan={3} style={{ textAlign: "center", padding: 30 }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: P.txt3 }} />
                  </TD>
                </tr>
              ) : planTypes.length === 0 ? (
                <tr>
                  <TD colSpan={3} style={{ textAlign: "center", padding: 30, color: P.txt3 }}>
                    No plan types found.
                  </TD>
                </tr>
              ) : (
                planTypes.map((pt) => (
                  <tr key={pt.id} style={{ borderTop: `1px solid ${P.borderL}`, background: editId === pt.id ? P.mainL : "transparent" }}>
                    <TD style={{ fontWeight: 600 }}>{pt.name_en}</TD>
                    <TD style={{ color: P.txt2, direction: "rtl" }}>{pt.name_ar}</TD>
                    <TD>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant="outline" icon={<Pencil size={11} />} onClick={() => handleEdit(pt)}>
                          Edit
                        </Btn>
                        <Btn small variant="ghost" color={P.error} icon={<Trash2 size={11} />} onClick={() => handleDelete(pt.id)} />
                      </div>
                    </TD>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
        
        {!showAdd && !editId && (
          <Btn icon={<Plus size={13} />} onClick={() => setShowAdd(true)}>Add Plan Type</Btn>
        )}
      </div>
    </div>
  );
}
