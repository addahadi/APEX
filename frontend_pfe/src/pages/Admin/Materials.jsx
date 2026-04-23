import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, FlaskConical, Loader2, Search } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useMaterials, useMaterialFormulas, useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from "@/hooks/materials.queries";
import { useUnits } from "@/hooks/units.queries";

const PAGE_SIZE = 8;

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
          <DialogDescription>
            Fill in the details for this material. Formulas are linked to specific calculation modules.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="material_name_en">Name (EN)</Label>
            <Input 
              id="material_name_en" 
              value={form.material_name_en} 
              onChange={e => set("material_name_en", e.target.value)} 
              placeholder="Portland Cement…" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material_name_ar">Name (AR)</Label>
            <Input 
              id="material_name_ar" 
              value={form.material_name_ar} 
              onChange={e => set("material_name_ar", e.target.value)} 
              placeholder="اسم المادة…" 
              className="font-arabic"
              dir="rtl"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>MATERIAL Formula</Label>
            <Select value={form.formula_id} onValueChange={v => set("formula_id", v)}>
              <SelectTrigger className={cn(form.formula_id && "border-primary/50 bg-primary/5")}>
                <SelectValue placeholder="— select a formula —" />
              </SelectTrigger>
              <SelectContent>
                {materialFormulas.map(f => (
                  <SelectItem key={f.formula_id} value={f.formula_id}>
                    {f.name} <span className="text-muted-foreground ml-2 text-[11px] uppercase tracking-wider font-semibold opacity-60">· {f.category_name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormula && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                <FlaskConical size={12} className="text-primary" />
                Category auto-set to: <span className="font-bold text-foreground">{selectedFormula.category_name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={form.unit_id || "none"} onValueChange={v => set("unit_id", v === "none" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="— no unit —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— no unit —</SelectItem>
                {units.map(u => (
                  <SelectItem key={u.unit_id} value={u.unit_id}>
                    {u.name_en} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={form.material_type} onValueChange={v => set("material_type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map(t => (
                  <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_price_usd">Unit Price (USD)</Label>
            <Input id="unit_price_usd" type="number" value={String(form.unit_price_usd)} onChange={e => set("unit_price_usd", Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waste_factor">Waste Factor (0–1)</Label>
            <Input id="waste_factor" type="number" step="0.01" value={String(form.default_waste_factor)} onChange={e => set("default_waste_factor", Math.min(1, Math.max(0, Number(e.target.value) || 0)))} placeholder="0.05" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || isPending} onClick={() => onSave(form)}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {title.startsWith("Edit") ? "Save Changes" : "Create Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Materials() {
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(null); // null | "new" | {material}
  const [confirm,  setConfirm]  = useState(null);

  const { data: mats,       isLoading: matsLoading   } = useMaterials({ search, page, limit: PAGE_SIZE });
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials by name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-background"
          />
        </div>
        <Button onClick={() => setModal("new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-sm relative">
        {matsLoading && (
          <div className="absolute top-4 right-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Material</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Unit</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Price (USD)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Formula</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Waste</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matsLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading materials…
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No materials found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(r => (
                <TableRow key={r.material_id} className="hover:bg-muted/50 transition-colors group">
                  <TableCell>
                    <div className="font-semibold text-sm">{r.material_name_en}</div>
                    {r.material_name_ar && (
                      <div className="text-[11px] text-muted-foreground font-arabic mt-0.5" dir="rtl">
                        {r.material_name_ar}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold bg-muted/30">
                      {r.category_name ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                      {r.unit_symbol ?? "—"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5",
                        r.material_type === "PRIMARY" ? "bg-primary/10 text-primary" : "bg-purple-100 text-purple-700"
                      )}
                    >
                      {r.material_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-sm">
                    ${r.unit_price_usd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {r.formula_name ? (
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded w-fit">
                        <FlaskConical size={12} /> {r.formula_name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic opacity-50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-bold",
                        r.default_waste_factor > 0.07 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {(r.default_waste_factor * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="h-8"
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
                        <Pencil className="mr-2 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0"
                        onClick={() => setConfirm(r.material_id)}>
                        {deleteMat.isPending && confirm === r.material_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * PAGE_SIZE, pagination.total)}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> materials
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-2 lg:px-3"
                >
                  Previous
                </Button>
              </PaginationItem>
              <div className="flex items-center px-4 text-xs font-medium">
                Page {page} of {pagination.total_pages}
              </div>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                  disabled={page >= pagination.total_pages}
                  className="h-8 px-2 lg:px-3"
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modals */}
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

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="sm:max-w-[400px] z-[100]">
          <DialogHeader>
            <DialogTitle>Delete material?</DialogTitle>
            <DialogDescription className="py-2">
              This will permanently remove the material from the resource catalog. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMat.mutate(confirm, { onSuccess: () => setConfirm(null) })}
              disabled={deleteMat.isPending}
            >
              {deleteMat.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
