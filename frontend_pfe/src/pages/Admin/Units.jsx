import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from "@/hooks/units.queries";

function Spin() {
  return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />;
}

// ── Inline edit row ───────────────────────────────────────────────────────────
function UnitRow({ unit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(null);
  const updateUnit = useUpdateUnit();

  const save = () => {
    updateUnit.mutate({ unitId: unit.unit_id, data: draft }, {
      onSuccess: () => { setEditing(false); setDraft(null); },
    });
  };

  if (!editing) {
    return (
      <TableRow className="hover:bg-muted/50 transition-colors group">
        <TableCell className="font-medium text-sm">{unit.name_en}</TableCell>
        <TableCell className="text-muted-foreground font-arabic" dir="rtl">{unit.name_ar || "—"}</TableCell>
        <TableCell>
          <code className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
            {unit.symbol}
          </code>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" className="h-8"
              onClick={() => { setDraft({ name_en: unit.name_en, name_ar: unit.name_ar ?? "", symbol: unit.symbol }); setEditing(true); }}>
              <Pencil className="mr-2 h-3 w-3" /> Edit
            </Button>
            <Button variant="destructive" size="sm" className="h-8 w-8 p-0"
              onClick={() => onDelete(unit.unit_id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-primary/5 border-primary/20">
      <TableCell>
        <Input 
          value={draft.name_en} 
          onChange={e => setDraft(d => ({ ...d, name_en: e.target.value }))}
          className="h-8 bg-background border-primary/30"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={draft.name_ar} 
          onChange={e => setDraft(d => ({ ...d, name_ar: e.target.value }))}
          placeholder="اسم بالعربية"
          className="h-8 bg-background text-right font-arabic"
          dir="rtl"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={draft.symbol} 
          onChange={e => setDraft(d => ({ ...d, symbol: e.target.value }))}
          className="h-8 bg-background font-mono w-20 border-primary/30"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" className="h-8" onClick={save} disabled={updateUnit.isPending}>
            {updateUnit.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditing(false); setDraft(null); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function NewUnitModal({ open, onClose }) {
  const [form, setForm] = useState({ name_en: "", name_ar: "", symbol: "" });
  const createUnit = useCreateUnit();
  const valid = form.name_en.trim() && form.symbol.trim();

  const save = () => {
    createUnit.mutate(form, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Measurement Unit</DialogTitle>
          <DialogDescription>
            Add a unit to be used in material and formula calculations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (EN)</Label>
              <Input 
                value={form.name_en} 
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} 
                placeholder="Meter" 
              />
            </div>
            <div className="space-y-2">
              <Label>Name (AR)</Label>
              <Input 
                value={form.name_ar} 
                onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} 
                placeholder="متر" 
                className="font-arabic text-right"
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Input 
              value={form.symbol} 
              onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} 
              placeholder="m" 
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid || createUnit.isPending} onClick={save}>
            {createUnit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Create Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Units() {
  const [showNew, setShowNew] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { data: units = [], isLoading } = useUnits();
  const deleteUnit = useDeleteUnit();

  const askDelete = (unitId) => setConfirm(unitId);
  const doDelete  = () => {
    deleteUnit.mutate(confirm, { onSuccess: () => setConfirm(null) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-end">
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <NewUnitModal open={showNew} onClose={() => setShowNew(false)} />

      <Card className="overflow-hidden border-none shadow-sm relative">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Name (EN)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Name (AR)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Symbol</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading units…
                  </div>
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No units defined.
                </TableCell>
              </TableRow>
            ) : (
              units.map(u => (
                <UnitRow key={u.unit_id} unit={u} onDelete={askDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete measurement unit?</DialogTitle>
            <DialogDescription className="py-2">
              This will fail if any materials or formulas still reference this unit. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={doDelete}
              disabled={deleteUnit.isPending}
            >
              {deleteUnit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
