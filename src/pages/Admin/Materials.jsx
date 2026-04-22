import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, FlaskConical, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Btn, Card, Field, Sel, SearchInput, TH, TD } from "@/components/admin/ui-atoms";
import { useMaterials, useMaterialFormulas, useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from "@/hooks/materials.queries";
import { useUnits } from "@/hooks/units.queries";

const MATERIAL_TYPES = [
  { v: "PRIMARY",   l: "Primary"   },
  { v: "ACCESSORY", l: "Accessory" },
];

function Spin() {
  return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />;
}

const EMPTY = {
  material_name_en: "", material_name_ar: "",
  formula_id: "", unit_id: "",
  material_type: "PRIMARY",
  unit_price_usd: 0, min_price_usd: 0, max_price_usd: 0,
  default_waste_factor: 0,
};

// ── Edit modal ────────────────────────────────────────────────────────────────
function MaterialModal({ initial, units, materialFormulas, onClose, onSave, isPending, title }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedFormula = materialFormulas.find(f => f.formula_id === form.formula_id);
  const valid = form.material_name_en.trim() && form.formula_id;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <Card style={{ width: 600, padding: 28, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.txt, marginBottom: 20 }}>{title}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Name (EN)" value={form.material_name_en} onChange={v => set("material_name_en", v)} placeholder="Portland Cement…" />
          <Field label="Name (AR)" value={form.material_name_ar} onChange={v => set("material_name_ar", v)} placeholder="اسم المادة…" />
        </div>

        {/* Formula selector — category is shown next to it, auto-derived */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: P.txt2, fontWeight: 500, marginBottom: 6 }}>MATERIAL Formula</div>
          <select value={form.formula_id} onChange={e => set("formula_id", e.target.value)}
            style={{ width: "100%", background: P.surface, border: `1.5px solid ${form.formula_id ? P.main : P.border}`, borderRadius: 8, padding: "9px 12px", color: P.txt, fontSize: 14, outline: "none", cursor: "pointer" }}>
            <option value="">— select a formula —</option>
            {materialFormulas.map(f => (
              <option key={f.formula_id} value={f.formula_id}>
                {f.name}  ·  {f.category_name}
              </option>
            ))}
          </select>
          {selectedFormula && (
            <div style={{ marginTop: 6, fontSize: 12, color: P.txt3, display: "flex", alignItems: "center", gap: 5 }}>
              <FlaskConical size={11} color={P.purple} />
              Category auto-set to:
              <span style={{ color: P.main, fontWeight: 600 }}>{selectedFormula.category_name}</span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Sel label="Unit"
            value={form.unit_id || ""}
            onChange={v => set("unit_id", v || null)}
            options={[{ v: "", l: "— no unit —" }, ...units.map(u => ({ v: u.unit_id, l: `${u.name_en} (${u.symbol})` }))]}
          />
          <Sel label="Material Type" value={form.material_type} onChange={v => set("material_type", v)} options={MATERIAL_TYPES} />
          <Field label="Unit Price (USD)" value={String(form.unit_price_usd)} onChange={v => set("unit_price_usd", Number(v) || 0)} type="number" />
          <Field label="Min Price (USD)"  value={String(form.min_price_usd)}  onChange={v => set("min_price_usd",  Number(v) || 0)} type="number" />
          <Field label="Max Price (USD)"  value={String(form.max_price_usd)}  onChange={v => set("max_price_usd",  Number(v) || 0)} type="number" />
          <Field label="Waste Factor (0–1)" value={String(form.default_waste_factor)} onChange={v => set("default_waste_factor", Math.min(1, Math.max(0, Number(v) || 0)))} type="number" placeholder="0.05" />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={isPending ? <Spin /> : <Save size={13} />} disabled={!valid || isPending} onClick={() => onSave(form)}>
            {title.startsWith("Edit") ? "Save Changes" : "Create Material"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Materials() {
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(null); // null | "new" | {material}
  const [confirm,  setConfirm]  = useState(null);

  const { data: mats,       isLoading: matsLoading   } = useMaterials({ search, page });
  const { data: units = []                            } = useUnits();
  const { data: mFormulas = []                        } = useMaterialFormulas();
  const createMat = useCreateMaterial();
  const updateMat = useUpdateMaterial();
  const deleteMat = useDeleteMaterial();

  const rows       = mats?.data       ?? [];
  const pagination = mats?.pagination ?? { total: 0, page: 1, total_pages: 1 };

  const handleCreate = (form) => {
    createMat.mutate(form, { onSuccess: () => { setModal(null); setPage(1); } });
  };

  const handleUpdate = (form) => {
    updateMat.mutate({ id: modal.material_id, data: form }, {
      onSuccess: () => setModal(null),
    });
  };

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ maxWidth: 380, flex: 1 }}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search materials…" />
        </div>
        <Btn icon={<Plus size={13} />} onClick={() => setModal("new")}>Add Material</Btn>
      </div>

      <Card style={{ position: "relative" }}>
        {matsLoading && (
          <div style={{ position: "absolute", top: 10, right: 14 }}>
            <Loader2 size={15} color={P.main} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Material", "Category", "Unit", "Type", "Price (USD)", "Formula", "Waste", "Actions"].map(h => <TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {matsLoading && rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}><Spin /> Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}>No materials found.</td></tr>
            ) : rows.map(r => (
              <tr key={r.material_id}
                style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = P.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <TD>
                  <div style={{ fontWeight: 600 }}>{r.material_name_en}</div>
                  {r.material_name_ar && <div style={{ fontSize: 11, color: P.txt3, direction: "rtl", marginTop: 2 }}>{r.material_name_ar}</div>}
                </TD>
                <TD><Badge label={r.category_name ?? "—"} color={P.txt2} bg={P.borderL} /></TD>
                <TD><span style={{ fontFamily: "monospace", fontSize: 12, color: P.main }}>{r.unit_symbol ?? "—"}</span></TD>
                <TD>
                  <Badge
                    label={r.material_type}
                    color={r.material_type === "PRIMARY" ? P.main : P.purple}
                    bg={r.material_type === "PRIMARY" ? P.mainL : P.purpleL}
                  />
                </TD>
                <TD style={{ fontWeight: 600 }}>${r.unit_price_usd}</TD>
                <TD>
                  {r.formula_name
                    ? <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: P.purple, fontWeight: 500 }}>
                        <FlaskConical size={12} /> {r.formula_name}
                      </div>
                    : <span style={{ color: P.txt3 }}>—</span>}
                </TD>
                <TD>
                  <Badge
                    label={`${(r.default_waste_factor * 100).toFixed(0)}%`}
                    color={r.default_waste_factor > 0.07 ? P.warn : P.success}
                    bg={r.default_waste_factor > 0.07 ? P.warnL : P.successL}
                  />
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: 5 }}>
                    <Btn small variant="outline" icon={<Pencil size={11} />}
                      onClick={() => setModal({
                        material_id: r.material_id,
                        material_name_en: r.material_name_en,
                        material_name_ar: r.material_name_ar ?? "",
                        formula_id: r.formula_id ?? "",
                        unit_id: r.unit_id ?? "",
                        material_type: r.material_type ?? "PRIMARY",
                        unit_price_usd: r.unit_price_usd ?? 0,
                        min_price_usd: r.min_price_usd ?? 0,
                        max_price_usd: r.max_price_usd ?? 0,
                        default_waste_factor: r.default_waste_factor ?? 0,
                      })}>
                      Edit
                    </Btn>
                    <Btn small variant="danger" icon={deleteMat.isPending ? <Spin /> : <Trash2 size={11} />}
                      onClick={() => setConfirm(r.material_id)} />
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 12 }}>
          <Btn small variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
          <span style={{ fontSize: 12, color: P.txt3, padding: "5px 8px" }}>{page} / {pagination.total_pages}</span>
          <Btn small variant="outline" disabled={page >= pagination.total_pages} onClick={() => setPage(p => p + 1)}>Next →</Btn>
        </div>
      )}

      {/* Create modal */}
      {modal === "new" && (
        <MaterialModal
          title="New Material"
          initial={{ ...EMPTY }}
          units={units}
          materialFormulas={mFormulas}
          onClose={() => setModal(null)}
          onSave={handleCreate}
          isPending={createMat.isPending}
        />
      )}

      {/* Edit modal */}
      {modal && modal !== "new" && (
        <MaterialModal
          title={`Edit: ${modal.material_name_en}`}
          initial={modal}
          units={units}
          materialFormulas={mFormulas}
          onClose={() => setModal(null)}
          onSave={handleUpdate}
          isPending={updateMat.isPending}
        />
      )}

      {/* Confirm delete */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <Card style={{ width: 340, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: P.txt, marginBottom: 8 }}>Delete material?</div>
            <div style={{ fontSize: 13, color: P.txt2, marginBottom: 20 }}>This cannot be undone.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn color={P.error} icon={deleteMat.isPending ? <Spin /> : <Trash2 size={13} />}
                onClick={() => deleteMat.mutate(confirm, { onSuccess: () => setConfirm(null) })}>
                Delete
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
