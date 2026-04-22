import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={statusF} onValueChange={handleStatus}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0 relative">
          {loading && !isLoading && (
            <div className="absolute top-2 right-4 z-10">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}

          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {["User", "Plan", "Type", "Status", "Start Date", "End Date"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold uppercase tracking-wider h-10">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => {
                  const sc = STATUS_CONF[s.status] ?? STATUS_CONF.INACTIVE;
                  const pc = planColor(s.plan?.name ?? "");
                  return (
                    <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-primary/10">
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                              {initials(s.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{s.user?.name ?? "—"}</div>
                            <div className="text-[11px] text-muted-foreground">{s.user?.email ?? "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium text-[11px] px-2 py-0.5"
                          style={{ color: pc.color, backgroundColor: pc.bg }}
                        >
                          {s.plan?.name ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{s.plan?.type ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium text-[11px] px-2 py-0.5"
                          style={{ color: sc.color, backgroundColor: sc.bg }}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(s.start_date)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(s.end_date)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 20, pagination.total)}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> subscribers
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-2 lg:px-3"
                >
                  Previous
                </Button>
              </PaginationItem>

              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => (
                  <PaginationItem key={i}>
                    {p === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <Button
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )}
                  </PaginationItem>
                ))}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
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
    </div>
  );
}
