import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2, CheckCircle } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, Sel } from "@/components/admin/ui-atoms";
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
    <Card style={{ padding: 24, animation: "fadeUp .2s ease", marginBottom: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 18 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Name (EN)" value={form.name_en} onChange={v => set("name_en", v)} placeholder="e.g. Pro" />
        <Field label="Name (AR)" value={form.name_ar} onChange={v => set("name_ar", v)} placeholder="برو" />
        <Field label="Price (DA)" value={String(form.price)} onChange={v => set("price", Number(v) || 0)} type="number" placeholder="0" />
        <Field label="Duration (days)" value={String(form.duration)} onChange={v => set("duration", Number(v) || 0)} type="number" placeholder="365" />
        <Sel label="Plan Type"
          value={form.plan_type_id || ""}
          onChange={v => set("plan_type_id", v || null)}
          options={[{ v: "", l: "— no type —" }, ...planTypes.map(pt => ({ v: pt.plan_type_id, l: pt.name_en }))]}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: P.txt2, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Feature Limits
        </div>
        {form.features.map(ft => {
          const meta = FEATURE_KEYS.find(f => f.key === ft.key);
          return (
            <div key={ft.key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: P.txt, fontWeight: 500 }}>{meta?.label ?? ft.key}</div>
                {meta?.hint && <div style={{ fontSize: 11, color: P.txt3, marginTop: 1 }}>{meta.hint}</div>}
              </div>
              <input
                value={ft.value}
                onChange={e => setFeature(ft.key, e.target.value)}
                placeholder="e.g. 10 or unlimited"
                style={{ background: P.bg, border: `1.5px solid ${P.main}55`, borderRadius: 7, padding: "8px 12px", color: P.main, fontSize: 13, fontFamily: "monospace", outline: "none" }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Btn icon={isPending ? <Spin /> : <Save size={13} />} disabled={!valid || isPending} onClick={() => onSave(form)}>
          Save Plan
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Card>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, planTypes, onEdit, onDelete, isDeleting }) {
  const typeConf = { color: P.cyan, bg: P.cyanL };

  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${P.borderL}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: P.txt }}>{plan.name_en}</div>
          {plan.price > 0
            ? <div style={{ fontSize: 15, fontWeight: 700, color: P.main }}>{plan.price.toLocaleString()} <span style={{ fontSize: 11, color: P.txt3, fontWeight: 400 }}>DA</span></div>
            : <div style={{ fontSize: 14, fontWeight: 600, color: P.success }}>Free</div>}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          {plan.plan_type_name && (
            <Badge label={plan.plan_type_name} color={typeConf.color} bg={typeConf.bg} />
          )}
          <Badge label={`${plan.duration}d`} color={P.txt3} bg={P.borderL} />
          {plan.name_ar && <span style={{ fontSize: 11, color: P.txt3, direction: "rtl" }}>{plan.name_ar}</span>}
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        {plan.features?.length > 0 ? plan.features.map(f => (
          <div key={f.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: P.txt3 }}>{featureLabel(f.key)}</span>
            <span style={{ color: f.value === "unlimited" ? P.success : P.txt, fontWeight: 600, fontFamily: "monospace" }}>
              {f.value === "unlimited"
                ? <span style={{ display: "flex", alignItems: "center", gap: 3 }}><CheckCircle size={11} /> unlimited</span>
                : f.value}
            </span>
          </div>
        )) : (
          <div style={{ fontSize: 12, color: P.txt3 }}>No features defined.</div>
        )}
      </div>

      <div style={{ padding: "0 20px 16px", display: "flex", gap: 6 }}>
        <Btn small variant="outline" icon={<Pencil size={11} />} onClick={onEdit}>Edit</Btn>
        <Btn small variant="danger"  icon={isDeleting ? <Spin /> : <Trash2 size={11} />} onClick={onDelete} />
      </div>
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
    <div style={{ animation: "fadeUp .3s ease" }}>
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
            <div style={{ padding: 40, textAlign: "center", color: P.txt3, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}><Spin /> Loading plans…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
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
              <div
                onClick={() => setModal("new")}
                style={{ background: P.bg, border: `2px dashed ${P.border}`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", minHeight: 220, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = P.main; e.currentTarget.style.background = P.mainL; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bg; }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: P.mainL, display: "flex", alignItems: "center", justifyContent: "center", color: P.main }}>
                  <Plus size={18} />
                </div>
                <span style={{ fontSize: 13, color: P.txt3, fontWeight: 500 }}>New Plan</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm delete */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <Card style={{ width: 360, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: P.txt, marginBottom: 8 }}>Delete this plan?</div>
            <div style={{ fontSize: 13, color: P.txt2, marginBottom: 20, lineHeight: 1.5 }}>
              All active subscriptions on this plan will be deactivated. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn color={P.error} icon={deletePlan.isPending ? <Spin /> : <Trash2 size={13} />}
                onClick={() => deletePlan.mutate(confirm, { onSuccess: () => setConfirm(null) })}>
                Delete Plan
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
