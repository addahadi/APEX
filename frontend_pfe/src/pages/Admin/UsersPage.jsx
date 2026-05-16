import { useDeferredValue, useState } from "react";
import { Ban, Bookmark, CheckCircle, FolderOpen, Heart, Loader2, Search, X, UserPlus } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  useAdminUserDetails, useAdminUsers, useUpdateAdminUserStatus, useCreateAdminUser,
} from "@/hooks/admin.queries";

const PAGE_SIZE = 8;
const DEFAULT_PAGINATION = { total: 0, page: 1, limit: PAGE_SIZE, total_pages: 1 };
const DEFAULT_SUMMARY = { total_users: 0, filtered_users: 0 };

const USER_STATUS_CONF = {
  ACTIVE:   { color: P.success, bg: P.successL },
  INACTIVE: { color: P.error,   bg: P.errorL   },
};
const SUBSCRIPTION_CONF = {
  ACTIVE:    { color: P.success, bg: P.successL },
  INACTIVE:  { color: P.txt3,    bg: P.borderL  },
  SUSPENDED: { color: P.warn,    bg: P.warnL    },
};

function initials(name = "") {
  return name.split(" ").map(p => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}
function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function planColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return { color: P.purple, bg: `${P.purple}18` };
  if (n.includes("pro"))        return { color: P.main,   bg: P.mainL };
  if (n.includes("free"))       return { color: P.txt2,   bg: P.borderL };
  return { color: P.txt3, bg: P.borderL };
}
function planTypeColor(type = "") {
  if (type === "COMPANY") return { color: P.purple, bg: P.purpleL };
  if (type === "NORMAL")  return { color: P.cyan,   bg: P.cyanL };
  return { color: P.txt3, bg: P.borderL };
}
function getStatusAction(status, t) {
  if (status === "ACTIVE") return { label: t("users.detail.deactivate"), nextStatus: "INACTIVE", variant: "danger", icon: <Ban size={13}/> };
  return { label: t("users.detail.activate"), nextStatus: "ACTIVE", variant: "outline", color: P.success, icon: <CheckCircle size={13}/> };
}

/* ── Add Admin Dialog ─────────────────────────────────────────── */
function AddAdminDialog({ open, onOpenChange }) {
  const { t } = useTranslation("admin");
  const createMutation = useCreateAdminUser();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ name: "", email: "", password: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.addAdmin.title")}</DialogTitle>
          <DialogDescription>{t("users.addAdmin.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("users.addAdmin.name")}</Label>
            <Input placeholder={t("users.addAdmin.namePlaceholder")} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("users.addAdmin.email")}</Label>
            <Input type="email" placeholder={t("users.addAdmin.emailPlaceholder")} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("users.addAdmin.password")}</Label>
            <Input type="password" placeholder={t("users.addAdmin.passwordPlaceholder")} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t("users.detail.saving") ? t("nav.dashboard") : "Cancel"}</Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {createMutation.isPending ? t("users.addAdmin.creating") : t("users.addAdmin.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Engagement Section ─────────────────────────────────────────── */
function EngagementSection({ title, icon, color, items, emptyText, renderItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span style={{ color }}>{icon}</span>{title}
      </div>
      {items.length === 0 ? (
        <Card className="shadow-none bg-muted/20 border-dashed">
          <CardContent className="p-4 text-center text-xs text-muted-foreground">{emptyText}</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item.id} className="shadow-none border bg-card hover:bg-muted/30 transition-colors">
              <CardContent className="p-3">{renderItem(item)}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main UsersPage ─────────────────────────────────────────────── */
export default function UsersPage() {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("ALL");
  const [planF, setPlanF] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const { data, error, isLoading, isFetching } = useAdminUsers({
    status: statusF, plan: planF, search: deferredSearch, page, limit: PAGE_SIZE,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination ?? DEFAULT_PAGINATION;
  const summary = data?.summary ?? DEFAULT_SUMMARY;

  const statusOptions = data?.filters?.statuses?.map(o => ({ v: o.value, l: o.label })) ??
    [{ v: "ALL", l: t("users.allStatuses") }, { v: "ACTIVE", l: t("users.active") }, { v: "INACTIVE", l: t("users.inactive") }];

  const planOptions = data?.filters?.plans?.map(o => ({ v: o.value, l: o.label })) ??
    [{ v: "ALL", l: t("users.allPlans") }];

  const selectedPreview = rows.find(r => r.id === selectedUserId) ?? null;

  const { data: selectedDetail, isLoading: detailLoading, isFetching: detailFetching } =
    useAdminUserDetails(selectedUserId, { enabled: !!selectedUserId });

  const statusMutation = useUpdateAdminUserStatus();
  const selectedUser = selectedDetail ?? selectedPreview;
  const filtersActive = Boolean(deferredSearch || statusF !== "ALL" || planF !== "ALL");
  const subtitle = filtersActive
    ? `${summary.filtered_users} matching of ${summary.total_users} accounts`
    : `${summary.total_users} total accounts`;

  const handleSearch = v => { setSearch(v); setPage(1); };
  const handleStatus = v => { setStatusF(v); setPage(1); };
  const handlePlan   = v => { setPlanF(v);   setPage(1); };
  const openUser  = id => setSelectedUserId(id);
  const closeUser = ()  => setSelectedUserId(null);

  const action = getStatusAction(selectedUser?.status, t);
  const detailBusy = detailLoading || (detailFetching && !selectedDetail);

  const headers = [
    t("users.columns.user"), t("users.columns.status"), t("users.columns.plan"),
    t("users.columns.type"), t("users.columns.subscription"), t("users.columns.joined"), t("users.columns.endDate"),
  ];

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* LEFT: table */}
      <div className="flex-1 overflow-y-auto p-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("users.title")}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Button onClick={() => setAddAdminOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4"/> {t("users.addAdmin.button")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder={t("users.search")} className="pl-9 bg-background"/>
          </div>
          <Select value={statusF} onValueChange={handleStatus}>
            <SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder={t("users.statusFilter")}/></SelectTrigger>
            <SelectContent>{statusOptions.map(opt => <SelectItem key={opt.v} value={opt.v}>{opt.l}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={planF} onValueChange={handlePlan}>
            <SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder={t("users.planFilter")}/></SelectTrigger>
            <SelectContent>{planOptions.map(opt => <SelectItem key={opt.v} value={opt.v}>{opt.l}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0 relative">
            {isFetching && !isLoading && <div className="absolute top-2 right-4 z-10"><Loader2 className="h-4 w-4 animate-spin text-primary"/></div>}
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {headers.map(h => <TableHead key={h} className="text-xs font-semibold uppercase tracking-wider h-10">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>{t("users.loading")}</div>
                  </TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-destructive">{error.message || t("users.failed")}</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">{t("users.noMatch")}</TableCell></TableRow>
                ) : rows.map(user => {
                  const sConf = USER_STATUS_CONF[user.status] ?? USER_STATUS_CONF.ACTIVE;
                  const pConf = planColor(user.plan?.name ?? "");
                  const tConf = planTypeColor(user.plan?.type ?? "");
                  const subConf = SUBSCRIPTION_CONF[user.plan?.subscription_status] ?? SUBSCRIPTION_CONF.INACTIVE;
                  const selected = selectedUserId === user.id;
                  return (
                    <TableRow key={user.id} onClick={() => openUser(user.id)}
                      className={cn("cursor-pointer transition-colors", selected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50")}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-primary/10">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{initials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{user.name}</div>
                            <div className="text-[11px] text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5" style={{ color: sConf.color, backgroundColor: sConf.bg }}>{user.status}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5" style={{ color: user.plan?.name ? pConf.color : "inherit", backgroundColor: user.plan?.name ? pConf.bg : undefined }}>{user.plan?.name ?? t("users.detail.noPlan")}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5 opacity-80" style={{ color: user.plan?.type ? tConf.color : "inherit", backgroundColor: user.plan?.type ? tConf.bg : undefined }}>{user.plan?.type ?? "-"}</Badge></TableCell>
                      <TableCell>
                        {user.plan?.subscription_status ? (
                          <Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5" style={{ color: subConf.color, backgroundColor: subConf.bg }}>{user.plan.subscription_status}</Badge>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(user.joined_at)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(user.plan?.end_date)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-xs text-muted-foreground">
              {t("users.showing", { from: ((page-1)*PAGE_SIZE)+1, to: Math.min(page*PAGE_SIZE, pagination.total), total: pagination.total })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1}>{t("users.previous")}</Button>
              {Array.from({ length: pagination.total_pages }, (_,i)=>i+1)
                .filter(p => p===1 || p===pagination.total_pages || Math.abs(p-page)<=1)
                .reduce((acc,p,i,pages) => { if(i>0&&p-pages[i-1]>1) acc.push("..."); acc.push(p); return acc; }, [])
                .map((p,i) => (
                  <Button key={i} variant={p===page?"default":"outline"} size="sm" className="h-8 w-8 p-0" onClick={() => typeof p==="number"&&setPage(p)}>{p}</Button>
                ))}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.total_pages,p+1))} disabled={page>=pagination.total_pages}>{t("users.next")}</Button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: detail panel */}
      {selectedUserId && (
        <div className="w-[380px] border-l bg-card flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b flex flex-col items-center text-center relative">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 text-muted-foreground" onClick={closeUser}>
              <X className="h-4 w-4"/>
            </Button>
            <Avatar className="h-20 w-20 border-2 border-primary/10 mb-4">
              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">{initials(selectedUser?.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 mb-4">
              <h2 className="text-lg font-bold tracking-tight">{selectedUser?.name ?? "..."}</h2>
              <p className="text-sm text-muted-foreground">{selectedUser?.email ?? "-"}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="font-semibold text-[10px] uppercase tracking-wider"
                style={{ color:(USER_STATUS_CONF[selectedUser?.status]??USER_STATUS_CONF.ACTIVE).color, backgroundColor:(USER_STATUS_CONF[selectedUser?.status]??USER_STATUS_CONF.ACTIVE).bg }}>
                {selectedUser?.status}
              </Badge>
              <Badge variant="outline" className="font-semibold text-[10px] uppercase tracking-wider"
                style={{ color: selectedUser?.plan?.name ? planColor(selectedUser.plan.name).color:"inherit", backgroundColor: selectedUser?.plan?.name ? planColor(selectedUser.plan.name).bg:undefined }}>
                {selectedUser?.plan?.name ?? t("users.detail.noPlan")}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 border-b">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="profile" className="text-xs">{t("users.detail.profile")}</TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs">{t("users.detail.engagement")}</TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="profile" className="m-0 space-y-6">
                  <Card className="shadow-none bg-muted/30 border-none">
                    <CardContent className="p-4 space-y-3">
                      {[
                        [t("users.detail.plan"),      selectedUser?.plan?.name ?? t("users.detail.noPlan")],
                        [t("users.detail.type"),      selectedUser?.plan?.type ?? "-"],
                        [t("users.detail.subStatus"), selectedUser?.plan?.subscription_status ?? "-"],
                        [t("users.detail.joined"),    formatDate(selectedUser?.joined_at)],
                        [t("users.detail.endDate"),   formatDate(selectedUser?.plan?.end_date)],
                        [t("users.detail.role"),      selectedUser?.role ?? "-"],
                      ].map(([label, value], idx, arr) => (
                        <div key={label} className={cn("flex justify-between items-center py-1 text-sm", idx!==arr.length-1&&"border-b border-border/50 pb-2")}>
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="shadow-none bg-muted/30 border-none">
                    <CardContent className="p-4 space-y-3">
                      {[
                        [t("users.detail.projects"),      selectedUser?.stats?.projects_count ?? 0],
                        [t("users.detail.likedArticles"), selectedUser?.stats?.likes_count ?? 0],
                        [t("users.detail.savedArticles"), selectedUser?.stats?.saves_count ?? 0],
                        [t("users.detail.aiCalls"),       selectedUser?.stats?.ai_calls_count ?? 0],
                      ].map(([label, value], idx, arr) => (
                        <div key={label} className={cn("flex justify-between items-center py-1 text-sm", idx!==arr.length-1&&"border-b border-border/50 pb-2")}>
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Button variant={action.variant==="danger"?"destructive":"outline"} className="w-full"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ userId: selectedUser.id, status: action.nextStatus })}>
                    {statusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <span className="mr-2">{action.icon}</span>}
                    {statusMutation.isPending ? t("users.detail.saving") : action.label}
                  </Button>
                </TabsContent>

                <TabsContent value="engagement" className="m-0 space-y-6">
                  <EngagementSection title={t("users.detail.likedArticles")} icon={<Heart className="h-4 w-4"/>} color={P.pink}
                    items={selectedUser?.engagement?.liked_articles ?? []} emptyText={t("users.detail.noLiked")}
                    renderItem={item => <div className="space-y-0.5"><div className="font-semibold text-sm">{item.title}</div><div className="text-[10px] text-muted-foreground uppercase">{t("users.detail.likedOn")} {formatDate(item.created_at)}</div></div>}/>
                  <EngagementSection title={t("users.detail.savedArticles")} icon={<Bookmark className="h-4 w-4"/>} color={P.purple}
                    items={selectedUser?.engagement?.saved_articles ?? []} emptyText={t("users.detail.noSaved")}
                    renderItem={item => <div className="space-y-0.5"><div className="font-semibold text-sm">{item.title}</div><div className="text-[10px] text-muted-foreground uppercase">{t("users.detail.savedOn")} {formatDate(item.created_at)}</div></div>}/>
                  <EngagementSection title={t("nav.users")} icon={<FolderOpen className="h-4 w-4"/>} color={P.main}
                    items={selectedUser?.engagement?.recent_projects ?? []} emptyText={t("users.detail.noProjects")}
                    renderItem={item => <div className="space-y-0.5"><div className="font-semibold text-sm">{item.name}</div><div className="text-[10px] text-muted-foreground uppercase">{item.status} · {formatDate(item.created_at)}</div></div>}/>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <AddAdminDialog open={addAdminOpen} onOpenChange={setAddAdminOpen}/>
    </div>
  );
}
