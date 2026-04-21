import { useState } from "react";
import { Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Avatar, Card, SearchInput, Sel, TH, TD } from "@/components/admin/ui-atoms";
import { useSubscribers } from "@/hooks/admin.queries";

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE"];

const STATUS_CONF = {
  ACTIVE:   { color: P.success, bg: P.successL  ?? "#f0fdf4" },
  INACTIVE: { color: P.txt3,    bg: P.borderL   ?? "#f1f5f9" },
};

function planColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return { color: P.purple, bg: `${P.purple}18` };
  if (n.includes("pro"))        return { color: P.main,   bg: P.mainL };
  if (n.includes("standard"))   return { color: P.warn,   bg: P.warnL ?? `${P.warn}18` };
  return { color: P.txt3, bg: P.borderL };
}

function initials(name = "") {
  return name.split(" ").map(n => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Subscribers() {
  const [statusF, setStatusF] = useState("ALL");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);

  // Reset to page 1 on filter change
  const handleStatus = (v) => { setStatusF(v); setPage(1); };
  const handleSearch = (v) => { setSearch(v);  setPage(1); };

  const { data, isLoading, isFetching } = useSubscribers({
    status: statusF,
    search,
    page,
    limit: 20,
  });

  const rows       = data?.data        ?? [];
  const pagination = data?.pagination  ?? { total: 0, page: 1, total_pages: 1 };
  const loading    = isLoading || isFetching;

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <SearchInput
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <Sel
          value={statusF}
          onChange={handleStatus}
          options={STATUS_OPTIONS.map(s => ({ v: s, l: s === "ALL" ? "All statuses" : s }))}
        />
      </div>

      {/* Table */}
      <Card style={{ position: "relative" }}>

        {/* Loading overlay — keeps table visible during refetch */}
        {loading && (
          <div style={{ position: "absolute", top: 10, right: 14, zIndex: 10 }}>
            <Loader2 size={15} color={P.main} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["User", "Plan", "Type", "Status", "Start Date", "End Date"].map(h => (
                <TH key={h}>{h}</TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: 8 }} />
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}>
                  No subscriptions found.
                </td>
              </tr>
            ) : rows.map(s => {
              const sc  = STATUS_CONF[s.status]   ?? STATUS_CONF.INACTIVE;
              const pc  = planColor(s.plan?.name  ?? "");
              return (
                <tr
                  key={s.id}
                  style={{ borderTop: `1px solid ${P.borderL}`, transition: "background .12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = P.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <TD>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={initials(s.user?.name)} size={30} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.user?.name ?? "—"}</div>
                        <div style={{ fontSize: 11, color: P.txt3 }}>{s.user?.email ?? "—"}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge label={s.plan?.name ?? "—"} color={pc.color} bg={pc.bg} />
                  </TD>
                  <TD>
                    <span style={{ fontSize: 12, color: P.txt2 }}>{s.plan?.type ?? "—"}</span>
                  </TD>
                  <TD>
                    <Badge label={s.status} color={sc.color} bg={sc.bg} />
                  </TD>
                  <TD style={{ color: P.txt3, fontSize: 12 }}>{formatDate(s.start_date)}</TD>
                  <TD style={{ color: P.txt3, fontSize: 12 }}>{formatDate(s.end_date)}</TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: P.txt3 }}>
          <span>
            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <PageBtn
              label="← Prev"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            />
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…"
                  ? <span key={`ellipsis-${i}`} style={{ padding: "4px 2px", color: P.txt3 }}>…</span>
                  : <PageBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
              )
            }
            <PageBtn
              label="Next →"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage(p => p + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagination button ─────────────────────────────────────────────────────────

function PageBtn({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${active ? P.main : P.border}`,
        background: active ? P.mainL : "transparent",
        color: active ? P.main : disabled ? P.txt3 : P.txt2,
        fontWeight: active ? 600 : 400,
        opacity: disabled ? 0.45 : 1,
        transition: "all .12s",
      }}
    >
      {label}
    </button>
  );
}
