import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CreditCard, FolderOpen, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/admin.queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function fmt(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function DashboardTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{fmt(payload[0]?.value)}{unit}</p>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, iconClass }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <div className={cn("rounded-md border p-2", iconClass)}><Icon size={16} /></div>
        </div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

const ACTIVITY_DOT = { project: "bg-blue-500", subscription: "bg-emerald-500", user: "bg-violet-500" };

function planProgressClass(name = "") {
  const n = String(name).toLowerCase();
  if (n.includes("enterprise") || n.includes("pro")) return "h-2 bg-muted [&>div]:bg-blue-500";
  if (n.includes("standard") || n.includes("basic")) return "h-2 bg-muted [&>div]:bg-amber-500";
  return "h-2 bg-muted [&>div]:bg-slate-500";
}

function aiBadgeClass(type = "") {
  if (type === "QUERY") return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  if (type === "RECOMMENDATION") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (type === "ANALYSIS") return "bg-violet-100 text-violet-700 hover:bg-violet-100";
  return "bg-muted text-muted-foreground hover:bg-muted";
}

export default function Dashboard() {
  const { t } = useTranslation("admin");
  const { data, isLoading } = useDashboardStats();

  const kpis = data?.kpis ?? {};
  const planBreakdown = data?.plan_breakdown ?? [];
  const newUsers30d = data?.new_users_30d ?? [];
  const monthlyRev = data?.monthly_revenue ?? [];
  const activity = data?.recent_activity ?? [];
  const aiBreakdown = data?.ai_breakdown ?? [];
  const totalUsers = planBreakdown.reduce((sum, plan) => sum + (plan.count ?? 0), 0) || 1;

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles size={12} /> {t("dashboard.realtime")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("dashboard.totalUsers")} value={isLoading ? "…" : fmt(kpis.total_users)}
          sub={isLoading ? "…" : `${fmt(kpis.total_users)} ${t("dashboard.registered")}`}
          icon={Users} iconClass="border-blue-200 bg-blue-50 text-blue-700" />
        <StatCard label={t("dashboard.activeSubs")} value={isLoading ? "…" : fmt(kpis.active_subs)}
          sub={isLoading ? "…" : `${t("dashboard.ofUsers").replace("of", "of")} ${fmt(kpis.total_users)} ${t("dashboard.users")}`}
          icon={CreditCard} iconClass="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <StatCard label={t("dashboard.monthlyRevenue")} value={isLoading ? "…" : `${fmt(kpis.monthly_revenue)} DA`}
          sub={t("dashboard.activeSubs2")} icon={TrendingUp} iconClass="border-amber-200 bg-amber-50 text-amber-700" />
        <StatCard label={t("dashboard.totalProjects")} value={isLoading ? "…" : fmt(kpis.total_projects)}
          sub={t("dashboard.allTime")} icon={FolderOpen} iconClass="border-violet-200 bg-violet-50 text-violet-700" />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader><CardTitle className="text-sm">{t("dashboard.newUsers30d")}</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            {isLoading ? <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newUsers30d}>
                  <XAxis dataKey="d" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip content={<DashboardTooltip unit={` ${t("dashboard.users")}`} />} />
                  <Line type="monotone" dataKey="v" strokeWidth={2.5} stroke="hsl(var(--primary))" dot={{ r: 2.5, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-sm">{t("dashboard.monthlyRevenueDA")}</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            {isLoading ? <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRev}>
                  <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip content={<DashboardTooltip unit=" DA" />} />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("dashboard.recentActivity")}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.event")}</TableHead>
                    <TableHead>{t("dashboard.entity")}</TableHead>
                    <TableHead className="text-right">{t("dashboard.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.map((a, i) => (
                    <TableRow key={`${a.type}-${a.ts}-${i}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", ACTIVITY_DOT[a.type] ?? "bg-slate-500")} />
                          <span className="font-medium">{a.actor}</span>
                          <span className="text-muted-foreground">{t(`dashboard.activityVerbs.${a.type}`, a.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.entity}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {a.ts ? new Date(a.ts).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("dashboard.planBreakdown")}</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
              ) : planBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noData")}</p>
              ) : (
                <div className="space-y-3">
                  {planBreakdown.map((p) => {
                    const count = p.count ?? 0;
                    const ratio = Math.max(2, Math.round((count / totalUsers) * 100));
                    return (
                      <div key={p.plan_name ?? "unknown"}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{p.plan_name || t("dashboard.unknownPlan")}</span>
                          <span className="font-semibold text-foreground">{count}</span>
                        </div>
                        <Progress value={ratio} className={planProgressClass(p.plan_name)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("dashboard.aiBreakdown")}</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
              ) : aiBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noAi")}</p>
              ) : (
                <div className="space-y-2.5">
                  {aiBreakdown.map((a) => (
                    <div key={a.type} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <Badge className={aiBadgeClass(a.type)}>{a.type}</Badge>
                      <span className="text-sm font-bold">{a.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
