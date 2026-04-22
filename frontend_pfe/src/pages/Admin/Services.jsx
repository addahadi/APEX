import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil, Trash2, Save, X, Plus, Search, Loader2 } from "lucide-react";
import { P, uid, mAllNodes } from "@/lib/design-tokens";
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

export default function Services() {
  const { 
    services, setServices, 
    units, unitsLoading,
    tree, treeLoading,
    search 
  } = useOutletContext();
  
  const [showNew, setShowNew] = useState(false);
  const [newSvc, setNewSvc] = useState({
    service_name_en: "", service_name_ar: "", category: "",
    unit_id: "",
    equipment_cost: 0, manpower_cost: 0, install_labor_price: 0,
  });

  const leafCategories = mAllNodes(tree)
    .filter(n => !n.children?.length)
    .map(n => ({ v: n.name_en || n.name, l: n.name_en || n.name }));

  const filteredSvc = services.filter(s =>
    s.service_name_en.toLowerCase().includes(search.toLowerCase())
  );

  if (treeLoading || unitsLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p>Loading tree and units…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-end">
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Service</DialogTitle>
            <DialogDescription>
              Define a new service cost structure. Costs are in DA (Dinar Algérien).
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label>Name (EN)</Label>
              <Input 
                value={newSvc.service_name_en} 
                onChange={e => setNewSvc(s => ({ ...s, service_name_en: e.target.value }))} 
                placeholder="Excavation Works…" 
              />
            </div>
            <div className="space-y-2">
              <Label>Name (AR)</Label>
              <Input 
                value={newSvc.service_name_ar} 
                onChange={e => setNewSvc(s => ({ ...s, service_name_ar: e.target.value }))} 
                placeholder="اسم الخدمة…" 
                className="font-arabic"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newSvc.category} onValueChange={v => setNewSvc(s => ({ ...s, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="— select category —" />
                </SelectTrigger>
                <SelectContent>
                  {leafCategories.map(c => (
                    <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={newSvc.unit_id} onValueChange={v => setNewSvc(s => ({ ...s, unit_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="— select unit —" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.unit_id} value={u.unit_id}>{u.name_en} ({u.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipment Cost (DA)</Label>
              <Input type="number" value={newSvc.equipment_cost} onChange={e => setNewSvc(s => ({ ...s, equipment_cost: Number(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Manpower Cost (DA)</Label>
              <Input type="number" value={newSvc.manpower_cost} onChange={e => setNewSvc(s => ({ ...s, manpower_cost: Number(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Install Labor (DA)</Label>
              <Input type="number" value={newSvc.install_labor_price} onChange={e => setNewSvc(s => ({ ...s, install_labor_price: Number(e.target.value) || 0 }))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={() => {
              setServices(sv => [...sv, { ...newSvc, id: uid() }]);
              setShowNew(false);
              setNewSvc({ service_name_en: "", service_name_ar: "", category: "", unit_id: "", equipment_cost: 0, manpower_cost: 0, install_labor_price: 0 });
            }}>
              <Save className="mr-2 h-4 w-4" /> Save Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden border-none shadow-sm relative">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Service</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Unit</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Equipment (DA)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Manpower (DA)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Install Labor</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSvc.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSvc.map(s => {
                const unitSymbol = units.find(u => u.unit_id === s.unit_id)?.symbol || s.unit_en || "—";
                return (
                  <TableRow key={s.id} className="hover:bg-muted/50 transition-colors group">
                    <TableCell>
                      <div className="font-semibold text-sm">{s.service_name_en}</div>
                      {s.service_name_ar && (
                        <div className="text-[11px] text-muted-foreground font-arabic mt-0.5">{s.service_name_ar}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold bg-muted/30">
                        {s.category || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                        {unitSymbol}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-8">
                          <Pencil className="mr-2 h-3 w-3" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setServices(sv => sv.filter(x => x.id !== s.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

