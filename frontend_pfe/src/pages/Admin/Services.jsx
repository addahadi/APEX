import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, Wrench, Loader2, Search, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination, PaginationContent, PaginationItem,
} from "@/components/ui/pagination";

import {
  useServices, useServiceFormulas, useCreateService, useUpdateService, useDeleteService,
} from "@/hooks/services.queries";
import { useUnits } from "@/hooks/units.queries";

const PAGE_SIZE = 8;

const EMPTY = {
  service_name_en: "", service_name_ar: "",
  category_id: "", formula_id: "", unit_id: "",
  equipment_cost: 0, manpower_cost: 0, install_labor_price: 0,
};

// ── Edit / Create modal ───────────────────────────────────────────────────────
function ServiceModal({ initial, units, serviceFormulas, onClose, onSave, isPending, title }) {
  const { t } = useTranslation("admin");
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedFormula = serviceFormulas.find(f => f.formula_id === form.formula_id);
  const valid = form.service_name_en.trim();

  // Auto-set category from formula selection
  const handleFormulaChange = (formulaId) => {
    const formula = serviceFormulas.find(f => f.formula_id === formulaId);
    setForm(f => ({
      ...f,
      formula_id: formulaId,
      category_id: formula?.category_id || ""
    }));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
          <DialogDescription>
            {t("services.modal.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="service_name_en">{t("services.modal.nameEN")}</Label>
            <Input
              id="service_name_en"
              value={form.service_name_en}
              onChange={e => set("service_name_en", e.target.value)}
              placeholder="Excavation Works…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_name_ar">{t("services.modal.nameAR")}</Label>
            <Input
              id="service_name_ar"
              value={form.service_name_ar}
              onChange={e => set("service_name_ar", e.target.value)}
              placeholder="اسم الخدمة…"
              className="font-arabic"
              dir="rtl"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>{t("services.modal.formula")}</Label>
            <Select value={form.formula_id || "none"} onValueChange={v => {
              if (v === "none") {
                setForm(f => ({ ...f, formula_id: "", category_id: "" }));
              } else {
                handleFormulaChange(v);
              }
            }}>
              <SelectTrigger className={cn(form.formula_id && "border-cyan-500/50 bg-cyan-500/5")}>
                <SelectValue placeholder={t("services.modal.noFormula")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— no formula (skip) —</SelectItem>
                {serviceFormulas.map(f => (
                  <SelectItem key={f.formula_id} value={f.formula_id}>
                    {f.name} <span className="text-muted-foreground ml-2 text-[11px] uppercase tracking-wider font-semibold opacity-60">· {f.category_name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormula && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                <Wrench size={12} className="text-cyan-600" />
                {t("services.modal.categoryAuto")} <span className="font-bold text-foreground">{selectedFormula.category_name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("services.modal.unit")}</Label>
            <Select value={form.unit_id || "none"} onValueChange={v => set("unit_id", v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("services.modal.noUnit")} />
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
            <Label htmlFor="equipment_cost">{t("services.modal.equipment")}</Label>
            <Input id="equipment_cost" type="number" value={String(form.equipment_cost)} onChange={e => set("equipment_cost", Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manpower_cost">{t("services.modal.manpower")}</Label>
            <Input id="manpower_cost" type="number" value={String(form.manpower_cost)} onChange={e => set("manpower_cost", Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="install_labor_price">{t("services.modal.install")}</Label>
            <Input id="install_labor_price" type="number" value={String(form.install_labor_price)} onChange={e => set("install_labor_price", Number(e.target.value) || 0)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>{t("services.modal.cancel")}</Button>
          <Button disabled={!valid || isPending} onClick={() => onSave(form)}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {title.startsWith(t("services.modal.save").replace("Save Changes","Edit")) ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Services() {
  const { t } = useTranslation("admin");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(null); // null | "new" | {service}
  const [confirm, setConfirm] = useState(null);

  const { data: svcData,       isLoading: svcsLoading } = useServices({ search, page, limit: PAGE_SIZE });
  const { data: units = []                             } = useUnits();
  const { data: sFormulas = []                         } = useServiceFormulas();
  const createSvc = useCreateService();
  const updateSvc = useUpdateService();
  const deleteSvc = useDeleteService();

  const rows       = svcData?.data       ?? [];
  const pagination = svcData?.pagination ?? { total: 0, page: 1, total_pages: 1 };

  const handleCreate = (form) => {
    // Clean empty strings to null for optional FK fields
    const payload = { ...form };
    if (!payload.formula_id) delete payload.formula_id;
    if (!payload.unit_id)    delete payload.unit_id;
    if (!payload.category_id) delete payload.category_id;
    createSvc.mutate(payload, { onSuccess: () => { setModal(null); setPage(1); } });
  };

  const handleUpdate = (form) => {
    const payload = { ...form };
    payload.formula_id  = payload.formula_id  || null;
    payload.unit_id     = payload.unit_id     || null;
    payload.category_id = payload.category_id || null;
    updateSvc.mutate({ id: modal.service_id, data: payload }, {
      onSuccess: () => setModal(null),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("services.search")}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-background"
          />
        </div>
        <Button onClick={() => setModal("new")}>
          <Plus className="mr-2 h-4 w-4" /> {t("services.add")}
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-sm relative">
        {svcsLoading && (
          <div className="absolute top-4 right-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.service")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.category")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.unit")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.equipment")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.manpower")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.install")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("services.columns.formula")}</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">{t("services.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {svcsLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("services.loading")}
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {t("services.empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(s => (
                <TableRow key={s.service_id} className="hover:bg-muted/50 transition-colors group">
                  <TableCell>
                    <div className="font-semibold text-sm">{s.service_name_en}</div>
                    {s.service_name_ar && (
                      <div className="text-[11px] text-muted-foreground font-arabic mt-0.5" dir="rtl">
                        {s.service_name_ar}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold bg-muted/30">
                      {s.category_name ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                      {s.unit_symbol ?? s.unit_en ?? "—"}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {s.equipment_cost?.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {s.manpower_cost?.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-sm", s.install_labor_price > 0 ? "font-bold" : "text-muted-foreground opacity-50")}>
                    {s.install_labor_price > 0 ? s.install_labor_price.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    {s.formula_name ? (
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded w-fit">
                        <FlaskConical size={12} /> {s.formula_name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic opacity-50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="h-8"
                        onClick={() => setModal({
                          service_id:         s.service_id,
                          service_name_en:    s.service_name_en,
                          service_name_ar:    s.service_name_ar ?? "",
                          category_id:        s.category_id ?? "",
                          formula_id:         s.formula_id ?? "",
                          unit_id:            s.unit_id ?? "",
                          equipment_cost:     s.equipment_cost ?? 0,
                          manpower_cost:      s.manpower_cost ?? 0,
                          install_labor_price: s.install_labor_price ?? 0,
                        })}>
                        <Pencil className="mr-2 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0"
                        onClick={() => setConfirm(s.service_id)}>
                        {deleteSvc.isPending && confirm === s.service_id ? (
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
            {t("services.showing", { from: ((page-1)*PAGE_SIZE)+1, to: Math.min(page*PAGE_SIZE, pagination.total), total: pagination.total })}
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline" size="sm"
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
                  variant="outline" size="sm"
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

      {/* Create Modal */}
      {modal === "new" && (
        <ServiceModal
          title={t("services.modal.newTitle")}
          initial={{ ...EMPTY }}
          units={units}
          serviceFormulas={sFormulas}
          onClose={() => setModal(null)}
          onSave={handleCreate}
          isPending={createSvc.isPending}
        />
      )}

      {/* Edit Modal */}
      {modal && modal !== "new" && (
        <ServiceModal
          title={`${t('services.modal.editPrefix')} ${modal.service_name_en}`}
          initial={modal}
          units={units}
          serviceFormulas={sFormulas}
          onClose={() => setModal(null)}
          onSave={handleUpdate}
          isPending={updateSvc.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="sm:max-w-[400px] z-[100]">
          <DialogHeader>
            <DialogTitle>{t("services.deleteTitle")}</DialogTitle>
            <DialogDescription className="py-2">
              {t("services.deleteDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteSvc.mutate(confirm, { onSuccess: () => setConfirm(null) })}
              disabled={deleteSvc.isPending}
            >
              {deleteSvc.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}