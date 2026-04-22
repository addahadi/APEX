import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CreditCard, TrendingUp, FolderOpen, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Card, SectionTitle, ChartTip, KpiCard } from "@/components/admin/ui-atoms";
import { useDashboardStats } from "@/hooks/admin.queries";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Spin() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
      <Loader2 size={22} color={P.txt3} style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
}

// Maps the backend activity type to a color
const ACTIVITY_COLOR = { project: P.main, subscription: P.success, user: P.purple };
const ACTIVITY_VERB  = { project: "created project", subscription: "subscribed to", user: "registered" };

// Maps plan name to a consistent color from design tokens
function planColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("enterprise") || n.includes("pro")) return P.main;
  if (n.includes("standard")   || n.includes("basic")) return P.warn;
  return P.txt3;
}

// ── AI breakdown type colors ──────────────────────────────────────────────────
const AI_COLOR = { QUERY: P.main, RECOMMENDATION: P.success, ANALYSIS: P.purple };

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats();

  const kpis          = data?.kpis           ?? {};
  const planBreakdown = data?.plan_breakdown  ?? [];
  const newUsers30d   = data?.new_users_30d   ?? [];
  const monthlyRev    = data?.monthly_revenue ?? [];
  const activity      = data?.recent_activity ?? [];
  const aiBreakdown   = data?.ai_breakdown    ?? [];

  // Total users for progress bar denominators
  const totalUsers = planBreakdown.reduce((s, p) => s + (p.count ?? 0), 0) || 1;

  return (
    <div style={{ padding: "28px 30px", animation: "fadeUp .3s ease" }}>
      <SectionTitle title="Dashboard" subtitle="Live platform overview" />

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard
          label="Total Users"
          value={isLoading ? "…" : fmt(kpis.total_users)}
          sub={isLoading ? "" : `${fmt(kpis.total_users)} registered`}
          icon={<Users size={16}/>}
          color={P.main}
          delay={0}
        />
        <KpiCard
          label="Active Subs"
          value={isLoading ? "…" : fmt(kpis.active_subs)}
          sub={isLoading ? "" : `of ${fmt(kpis.total_users)} users`}
          icon={<CreditCard size={16}/>}
          color={P.success}
          delay={.05}
        />
        <KpiCard
          label="Monthly Rev."
          value={isLoading ? "…" : `${fmt(kpis.monthly_revenue)} DA`}
          sub="active subscriptions"
          icon={<TrendingUp size={16}/>}
          color={P.warn}
          delay={.1}
        />
        <KpiCard
          label="Total Projects"
          value={isLoading ? "…" : fmt(kpis.total_projects)}
          sub="all time"
          icon={<FolderOpen size={16}/>}
          color={P.purple}
          delay={.15}
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: P.txt3, fontWeight: 600, marginBottom: 14 }}>
            NEW USERS · LAST 30 DAYS
          </div>
          {isLoading
            ? <Spin/>
            : <ResponsiveContainer width="100%" height={160}>
                <LineChart data={newUsers30d}>
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: P.txt3, fontFamily: P.font }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip unit=" users" />} />
                  <Line type="monotone" dataKey="v" stroke={P.main} strokeWidth={2.5} dot={{ r: 3, fill: P.main }} />
                </LineChart>
              </ResponsiveContainer>
          }
        </Card>

        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: P.txt3, fontWeight: 600, marginBottom: 14 }}>
            MONTHLY REVENUE (DA)
          </div>
          {isLoading
            ? <Spin/>
            : <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyRev}>
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: P.txt3, fontFamily: P.font }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip unit=" DA" />} />
                  <Bar dataKey="v" fill={P.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </Card>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Recent activity */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: P.txt3, fontWeight: 600, marginBottom: 14 }}>
            RECENT ACTIVITY
          </div>
          {isLoading
            ? <Spin/>
            : activity.length === 0
              ? <div style={{ fontSize: 13, color: P.txt3 }}>No activity yet.</div>
              : activity.map((a, i) => {
                  const color = ACTIVITY_COLOR[a.type] ?? P.txt3;
                  const verb  = ACTIVITY_VERB[a.type]  ?? "did something";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < activity.length - 1 ? `1px solid ${P.borderL}` : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13, color: P.txt }}>
                        <span style={{ fontWeight: 600, color }}>{a.actor}</span>
                        {" "}{verb}{" "}
                        <span style={{ color: P.txt2 }}>{a.entity}</span>
                      </div>
                      <span style={{ fontSize: 11, color: P.txt3, whiteSpace: "nowrap" }}>
                        {new Date(a.ts).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
          }
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Plan breakdown */}
          <Card style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: P.txt3, fontWeight: 600, marginBottom: 10 }}>
              PLAN BREAKDOWN
            </div>
            {isLoading
              ? <Spin/>
              : planBreakdown.length === 0
                ? <div style={{ fontSize: 13, color: P.txt3 }}>No data.</div>
                : planBreakdown.map(p => {
                    const color = planColor(p.plan_name);
                    return (
                      <div key={p.plan_name} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: P.txt2, fontWeight: 500 }}>{p.plan_name}</span>
                          <span style={{ color: P.txt, fontWeight: 600 }}>{p.count}</span>
                        </div>
                        <div style={{ height: 5, background: P.bg, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.max(2, (p.count / totalUsers) * 100)}%`, background: color, borderRadius: 3, transition: "width .4s ease" }} />
                        </div>
                      </div>
                    );
                  })
            }
          </Card>

          {/* AI usage breakdown */}
          <Card style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: P.txt3, fontWeight: 600, marginBottom: 10 }}>
              AI USAGE BREAKDOWN
            </div>
            {isLoading
              ? <Spin/>
              : aiBreakdown.length === 0
                ? <div style={{ fontSize: 13, color: P.txt3 }}>No AI usage yet.</div>
                : aiBreakdown.map(a => {
                    const color = AI_COLOR[a.type] ?? P.txt3;
                    return (
                      <div key={a.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <Badge label={a.type} color={color} bg={`${color}18`} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: P.txt }}>{a.count}</span>
                      </div>
                    );
                  })
            }
          </Card>
        </div>
      </div>
    </div>
  );
}
