import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// shadcn/ui
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

import { usePlanTypes, useCreatePlanType, useUpdatePlanType, useDeletePlanType } from "@/hooks/plans.queries";

function Spin() { return <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />; }

function PlanTypeRow({ pt }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const update = useUpdatePlanType();
  const remove = useDeletePlanType();

  const save = () => {
    update.mutate({ id: pt.plan_type_id, data: draft }, {
      onSuccess: () => { setEditing(false); setDraft(null); },
    });
  };

  if (!editing) return (
    <TableRow className="hover:bg-muted/50 transition-colors group">
      <TableCell className="font-semibold">{pt.name_en}</TableCell>
      <TableCell className="text-muted-foreground font-arabic" dir="rtl">{pt.name_ar || "—"}</TableCell>
      <TableCell>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="h-8"
            onClick={() => { setDraft({ name_en: pt.name_en, name_ar: pt.name_ar ?? "" }); setEditing(true); }}>
            <Pencil className="mr-2 h-3 w-3" /> Edit
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0"
            onClick={() => remove.mutate(pt.plan_type_id)}>
            {remove.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <TableRow className="bg-primary/5">
      <TableCell>
        <Input 
          value={draft.name_en} 
          onChange={e => setDraft(d => ({ ...d, name_en: e.target.value }))}
          className="h-9 bg-background" 
        />
      </TableCell>
      <TableCell>
        <Input 
          value={draft.name_ar} 
          onChange={e => setDraft(d => ({ ...d, name_ar: e.target.value }))}
          placeholder="الاسم بالعربية"
          className="h-9 bg-background font-arabic" 
          dir="rtl"
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button size="sm" className="h-8" onClick={save} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
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

export default function PlanTypes() {
  const [showNew, setShowNew] = useState(false);
  const [newPT,   setNewPT]   = useState({ name_en: "", name_ar: "" });
  const { data: planTypes = [], isLoading } = usePlanTypes();
  const create = useCreatePlanType();

  const handleCreate = () => {
    if (!newPT.name_en.trim()) return;
    create.mutate(newPT, { onSuccess: () => { setShowNew(false); setNewPT({ name_en: "", name_ar: "" }); } });
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {showNew && (
        <Card className="shadow-sm border-none bg-card animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight">New Plan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_name_en">Name (EN)</Label>
                <Input 
                  id="new_name_en" 
                  value={newPT.name_en} 
                  onChange={e => setNewPT(p => ({ ...p, name_en: e.target.value }))} 
                  placeholder="e.g. Company" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_name_ar">Name (AR)</Label>
                <Input 
                  id="new_name_ar" 
                  value={newPT.name_ar} 
                  onChange={e => setNewPT(p => ({ ...p, name_ar: e.target.value }))} 
                  placeholder="شركة" 
                  className="font-arabic"
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end bg-muted/20 p-4">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button 
              disabled={!newPT.name_en.trim() || create.isPending} 
              onClick={handleCreate}
            >
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Type
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0 relative">
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider h-10">Name (EN)</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider h-10">Name (AR)</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider h-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planTypes.map(pt => <PlanTypeRow key={pt.plan_type_id} pt={pt} />)}
                {planTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">
                      No plan types yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!showNew && (
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan Type
        </Button>
      )}
    </div>
  );
}
