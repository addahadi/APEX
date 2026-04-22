import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2, CheckCircle } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { usePlansAdmin, usePlanTypes, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/plans.queries";

function Spin() { return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />; }

// Feature keys the engine and backend actually use
const FEATURE_KEYS = [
  { key: "projects_limit",   label: "Projects Limit",   hint: "number or 'unlimited'" },
  { key: "leaf_calculations_limit", label: "Calculations Limit", hint: "number or 'unlimited'" },
  { key: "ai_usage_limit",   label: "AI Calls Limit",    hint: "number or 'unlimited'" },
];

function featureLabel(key) {
  return FEATURE_KEYS.find(f => f.key === key)?.label ?? key;
}

// Build a features array from a plan's features array (backend format: [{key,value}])
function planToForm(plan) {
  return {
    name_en:      plan.name_en ?? "",
    name_ar:      plan.name_ar ?? "",
    price:        plan.price ?? 0,
    duration:     plan.duration ?? 365,
    plan_type_id: plan.plan_type_id ?? "",
    features: FEATURE_KEYS.map(fk => {
      const existing = plan.features?.find(f => f.key === fk.key);
      return { key: fk.key, value: existing?.value ?? "0" };
    }),
  };
}

const EMPTY_FORM = {
  name_en: "", name_ar: "", price: 0, duration: 365, plan_type_id: "",
  features: FEATURE_KEYS.map(f => ({ key: f.key, value: "0" })),
};

// ── Plan form (create / edit) ─────────────────────────────────────────────────
function PlanForm({ initial, planTypes, onSave, onCancel, isPending, title }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFeature = (key, value) => setForm(f => ({
    ...f,
    features: f.features.map(ft => ft.key === key ? { ...ft, value } : ft),
  }));

  const valid = form.name_en.trim();

  return (
    <Card className="mb-6 shadow-sm border-none bg-card animate-in fade-in slide-in-from-top-4 duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name_en">Name (EN)</Label>
            <Input id="name_en" value={form.name_en} onChange={e => set("name_en", e.target.value)} placeholder="e.g. Pro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_ar">Name (AR)</Label>
            <Input id="name_ar" value={form.name_ar} onChange={e => set("name_ar", e.target.value)} placeholder="برو" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (DA)</Label>
            <Input id="price" type="number" value={String(form.price)} onChange={e => set("price", Number(e.target.value) || 0)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input id="duration" type="number" value={String(form.duration)} onChange={e => set("duration", Number(e.target.value) || 0)} placeholder="365" />
          </div>
          <div className="space-y-2">
            <Label>Plan Type</Label>
            <Select value={form.plan_type_id || "none"} onValueChange={v => set("plan_type_id", v === "none" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="— no type —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— no type —</SelectItem>
                {planTypes.map(pt => (
                  <SelectItem key={pt.plan_type_id} value={pt.plan_type_id}>
                    {pt.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Feature Limits
          </h3>
          <div className="space-y-3">
            {form.features.map(ft => {
              const meta = FEATURE_KEYS.find(f => f.key === ft.key);
              return (
                <div key={ft.key} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{meta?.label ?? ft.key}</p>
                    {meta?.hint && <p className="text-[10px] text-muted-foreground">{meta.hint}</p>}
                  </div>
                  <Input
                    value={ft.value}
                    onChange={e => setFeature(ft.key, e.target.value)}
                    placeholder="e.g. 10 or unlimited"
                    className="w-32 h-9 text-xs font-mono"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end bg-muted/20 p-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!valid || isPending} onClick={() => onSave(form)}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, planTypes, onEdit, onDelete, isDeleting }) {

  return (
    <Card className="overflow-hidden border-none shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-bold tracking-tight">{plan.name_en}</CardTitle>
          <div className="text-right">
            {plan.price > 0 ? (
              <div className="text-lg font-bold text-primary">
                {plan.price.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">DA</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-emerald-600">Free</div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {plan.plan_type_name && (
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider h-5 bg-primary/5 text-primary border-primary/20">
              {plan.plan_type_name}
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] font-semibold h-5">
            {plan.duration}d
          </Badge>
          {plan.name_ar && <span className="text-[11px] text-muted-foreground font-arabic ml-auto" dir="rtl">{plan.name_ar}</span>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 py-4 space-y-2">
        {plan.features?.length > 0 ? (
          plan.features.map((f) => (
            <div key={f.key} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{featureLabel(f.key)}</span>
              <span className={cn(
                "font-mono font-bold",
                f.value === "unlimited" ? "text-emerald-600" : "text-foreground"
              )}>
                {f.value === "unlimited" ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> unlimited
                  </span>
                ) : (
                  f.value
                )}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground italic">No features defined.</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-8" onClick={onEdit}>
          <Pencil className="mr-2 h-3 w-3" /> Edit
        </Button>
        <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={onDelete} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PlanFeatures() {
  const [modal,   setModal]   = useState(null); // null | "new" | plan object
  const [confirm, setConfirm] = useState(null);

  const { data: plans     = [], isLoading: plansLoading } = usePlansAdmin();
  const { data: planTypes = []                           } = usePlanTypes();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const handleSave = (form) => {
    // Map features array to the format updatePlan/createPlan expects: [{key, value}]
    const payload = {
      name_en:      form.name_en,
      name_ar:      form.name_ar,
      price:        form.price,
      duration:     form.duration,
      plan_type_id: form.plan_type_id || undefined,
      features:     form.features.map(f => ({ key: f.key, value: f.value })),
    };

    if (modal === "new") {
      createPlan.mutate(payload, { onSuccess: () => setModal(null) });
    } else {
      updatePlan.mutate({ id: modal.plan_id, data: payload }, { onSuccess: () => setModal(null) });
    }
  };

  const isPending = modal === "new" ? createPlan.isPending : updatePlan.isPending;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {modal && (
        <PlanForm
          title={modal === "new" ? "Create New Plan" : `Edit: ${modal.name_en}`}
          initial={modal === "new" ? EMPTY_FORM : planToForm(modal)}
          planTypes={planTypes}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          isPending={isPending}
        />
      )}

      {!modal && (
        <>
          {plansLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading plans…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans.map(plan => (
                <PlanCard
                  key={plan.plan_id}
                  plan={plan}
                  planTypes={planTypes}
                  onEdit={() => setModal(plan)}
                  onDelete={() => setConfirm(plan.plan_id)}
                  isDeleting={deletePlan.isPending && confirm === plan.plan_id}
                />
              ))}
              <Card
                onClick={() => setModal("new")}
                className="flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[220px] border-2 border-dashed bg-muted/10 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  New Plan
                </span>
              </Card>
            </div>
          )}
        </>
      )}

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete this plan?</DialogTitle>
            <DialogDescription className="py-2">
              All active subscriptions on this plan will be deactivated. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletePlan.mutate(confirm, { onSuccess: () => setConfirm(null) })}
              disabled={deletePlan.isPending}
            >
              {deletePlan.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
