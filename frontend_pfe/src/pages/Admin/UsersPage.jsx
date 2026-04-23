import { useDeferredValue, useState } from "react";
import { Ban, Bookmark, CheckCircle, FolderOpen, Heart, Loader2, Search, X } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useAdminUserDetails, useAdminUsers, useUpdateAdminUserStatus } from "@/hooks/admin.queries";

const PAGE_SIZE = 8;

const DEFAULT_PAGINATION = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  total_pages: 1,
};

const DEFAULT_SUMMARY = {
  total_users: 0,
  filtered_users: 0,
};

const DEFAULT_STATUS_OPTIONS = [
  { v: "ALL", l: "All statuses" },
  { v: "ACTIVE", l: "Active" },
  { v: "INACTIVE", l: "Inactive" },
];

const DEFAULT_PLAN_OPTIONS = [{ v: "ALL", l: "All plans" }];

const USER_STATUS_CONF = {
  ACTIVE: { label: "Active", color: P.success, bg: P.successL },
  INACTIVE: { label: "Inactive", color: P.error, bg: P.errorL },
};

const SUBSCRIPTION_CONF = {
  ACTIVE: { color: P.success, bg: P.successL },
  INACTIVE: { color: P.txt3, bg: P.borderL },
  SUSPENDED: { color: P.warn, bg: P.warnL },
};

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function planColor(name = "") {
  const normalised = name.toLowerCase();
  if (normalised.includes("enterprise")) return { color: P.purple, bg: `${P.purple}18` };
  if (normalised.includes("pro")) return { color: P.main, bg: P.mainL };
  if (normalised.includes("free")) return { color: P.txt2, bg: P.borderL };
  return { color: P.txt3, bg: P.borderL };
}

function planTypeColor(type = "") {
  if (type === "COMPANY") return { color: P.purple, bg: P.purpleL };
  if (type === "NORMAL") return { color: P.cyan, bg: P.cyanL };
  return { color: P.txt3, bg: P.borderL };
}

function getStatusAction(status) {
  if (status === "ACTIVE") {
    return {
      label: "Deactivate",
      nextStatus: "INACTIVE",
      variant: "danger",
      icon: <Ban size={13} />,
    };
  }

  return {
    label: "Activate",
    nextStatus: "ACTIVE",
    variant: "outline",
    color: P.success,
    icon: <CheckCircle size={13} />,
  };
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("ALL");
  const [planF, setPlanF] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tab, setTab] = useState("profile");

  const deferredSearch = useDeferredValue(search);

  const { data, error, isLoading, isFetching } = useAdminUsers({
    status: statusF,
    plan: planF,
    search: deferredSearch,
    page,
    limit: PAGE_SIZE,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination ?? DEFAULT_PAGINATION;
  const summary = data?.summary ?? DEFAULT_SUMMARY;
  const statusOptions = data?.filters?.statuses?.map((option) => ({
    v: option.value,
    l: option.label,
  })) ?? DEFAULT_STATUS_OPTIONS;
  const planOptions = data?.filters?.plans?.map((option) => ({
    v: option.value,
    l: option.label,
  })) ?? DEFAULT_PLAN_OPTIONS;

  const selectedPreview = rows.find((row) => row.id === selectedUserId) ?? null;

  const {
    data: selectedDetail,
    error: detailError,
    isLoading: detailLoading,
    isFetching: detailFetching,
  } = useAdminUserDetails(selectedUserId, { enabled: !!selectedUserId });

  const statusMutation = useUpdateAdminUserStatus();
  const selectedUser = selectedDetail ?? selectedPreview;
  const filtersActive = Boolean(deferredSearch || statusF !== "ALL" || planF !== "ALL");
  const subtitle = filtersActive
    ? `${summary.filtered_users} matching of ${summary.total_users} accounts`
    : `${summary.total_users} total accounts`;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value) => {
    setStatusF(value);
    setPage(1);
  };

  const handlePlan = (value) => {
    setPlanF(value);
    setPage(1);
  };

  const openUser = (userId) => {
    setSelectedUserId(userId);
    setTab("profile");
  };

  const closeUser = () => {
    setSelectedUserId(null);
    setTab("profile");
  };

  const action = getStatusAction(selectedUser?.status);
  const detailBusy = detailLoading || (detailFetching && !selectedDetail);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto p-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 bg-background"
            />
          </div>

          <Select value={statusF} onValueChange={handleStatus}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.v} value={opt.v}>
                  {opt.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={planF} onValueChange={handlePlan}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              {planOptions.map((opt) => (
                <SelectItem key={opt.v} value={opt.v}>
                  {opt.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0 relative">
            {isFetching && !isLoading && (
              <div className="absolute top-2 right-4 z-10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {["User", "Status", "Plan", "Type", "Subscription", "Joined", "End Date"].map((header) => (
                    <TableHead key={header} className="text-xs font-semibold uppercase tracking-wider h-10">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-destructive">
                      {error.message || "Failed to load users."}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No users match your current filters.
                    </TableCell>
                  </TableRow>
                ) : rows.map((user) => {
                  const statusConf = USER_STATUS_CONF[user.status] ?? USER_STATUS_CONF.ACTIVE;
                  const planConf = planColor(user.plan?.name ?? "");
                  const typeConf = planTypeColor(user.plan?.type ?? "");
                  const subscriptionConf = SUBSCRIPTION_CONF[user.plan?.subscription_status] ?? SUBSCRIPTION_CONF.INACTIVE;
                  const selected = selectedUserId === user.id;

                  return (
                    <TableRow
                      key={user.id}
                      onClick={() => openUser(user.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-primary/10">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{user.name}</div>
                            <div className="text-[11px] text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className="font-medium text-[11px] px-2 py-0.5"
                          style={{ color: statusConf.color, backgroundColor: statusConf.bg }}
                        >
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium text-[11px] px-2 py-0.5"
                          style={{ 
                            color: user.plan?.name ? planConf.color : "inherit", 
                            backgroundColor: user.plan?.name ? planConf.bg : undefined 
                          }}
                        >
                          {user.plan?.name ?? "No plan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium text-[11px] px-2 py-0.5 opacity-80"
                          style={{ 
                            color: user.plan?.type ? typeConf.color : "inherit", 
                            backgroundColor: user.plan?.type ? typeConf.bg : undefined 
                          }}
                        >
                          {user.plan?.type ?? "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.plan?.subscription_status ? (
                          <Badge
                            variant="secondary"
                            className="font-medium text-[11px] px-2 py-0.5"
                            style={{ color: subscriptionConf.color, backgroundColor: subscriptionConf.bg }}
                          >
                            {user.plan.subscription_status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
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
              Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * PAGE_SIZE, pagination.total)}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> users
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
                  .reduce((acc, p, i, pages) => {
                    if (i > 0 && p - pages[i - 1] > 1) acc.push("...");
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

      {selectedUserId && (
        <div className="w-[380px] border-l bg-card flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b flex flex-col items-center text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
              onClick={closeUser}
            >
              <X className="h-4 w-4" />
            </Button>

            <Avatar className="h-20 w-20 border-2 border-primary/10 mb-4">
              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                {initials(selectedUser?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 mb-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {selectedUser?.name ?? "Loading..."}
              </h2>
              <p className="text-sm text-muted-foreground">{selectedUser?.email ?? "-"}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant="outline"
                className="font-semibold text-[10px] uppercase tracking-wider"
                style={{
                  color: (USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.ACTIVE).color,
                  backgroundColor: (USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.ACTIVE).bg,
                }}
              >
                {(USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.ACTIVE).label}
              </Badge>
              <Badge
                variant="outline"
                className="font-semibold text-[10px] uppercase tracking-wider"
                style={{
                  color: selectedUser?.plan?.name ? planColor(selectedUser.plan.name).color : "inherit",
                  backgroundColor: selectedUser?.plan?.name ? planColor(selectedUser.plan.name).bg : undefined,
                }}
              >
                {selectedUser?.plan?.name ?? "No plan"}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 border-b">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="profile" className="m-0 space-y-6">
                  <div className="space-y-4">
                    <Card className="shadow-none bg-muted/30 border-none">
                      <CardContent className="p-4 space-y-3">
                        {[
                          { label: "Plan", value: selectedUser?.plan?.name ?? "No plan" },
                          { label: "Type", value: selectedUser?.plan?.type ?? "-" },
                          { label: "Sub Status", value: selectedUser?.plan?.subscription_status ?? "-" },
                          { label: "Joined", value: formatDate(selectedUser?.joined_at) },
                          { label: "End Date", value: formatDate(selectedUser?.plan?.end_date) },
                          { label: "Role", value: selectedUser?.role ?? "-" },
                        ].map((row, idx, arr) => (
                          <div
                            key={row.label}
                            className={cn(
                              "flex justify-between items-center py-1 text-sm",
                              idx !== arr.length - 1 && "border-b border-border/50 pb-2"
                            )}
                          >
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-semibold text-foreground">{row.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="shadow-none bg-muted/30 border-none">
                      <CardContent className="p-4 space-y-3">
                        {[
                          { label: "Projects", value: selectedUser?.stats?.projects_count ?? 0 },
                          { label: "Liked Articles", value: selectedUser?.stats?.likes_count ?? 0 },
                          { label: "Saved Articles", value: selectedUser?.stats?.saves_count ?? 0 },
                          { label: "AI Calls", value: selectedUser?.stats?.ai_calls_count ?? 0 },
                        ].map((row, idx, arr) => (
                          <div
                            key={row.label}
                            className={cn(
                              "flex justify-between items-center py-1 text-sm",
                              idx !== arr.length - 1 && "border-b border-border/50 pb-2"
                            )}
                          >
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-bold text-foreground">{row.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Button
                      variant={action.variant === "danger" ? "destructive" : "outline"}
                      className="w-full"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({ userId: selectedUser.id, status: action.nextStatus })
                      }
                    >
                      {statusMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {statusMutation.isPending ? "Saving..." : action.label}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="m-0 space-y-6">
                  <EngagementSection
                    title="Liked Articles"
                    icon={<Heart className="h-4 w-4" />}
                    color={P.pink}
                    items={selectedUser?.engagement?.liked_articles ?? []}
                    emptyText="No liked articles yet."
                    renderItem={(item) => (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          Liked on {formatDate(item.created_at)}
                        </div>
                      </div>
                    )}
                  />

                  <EngagementSection
                    title="Saved Articles"
                    icon={<Bookmark className="h-4 w-4" />}
                    color={P.purple}
                    items={selectedUser?.engagement?.saved_articles ?? []}
                    emptyText="No saved articles yet."
                    renderItem={(item) => (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          Saved on {formatDate(item.created_at)}
                        </div>
                      </div>
                    )}
                  />

                  <EngagementSection
                    title="Recent Projects"
                    icon={<FolderOpen className="h-4 w-4" />}
                    color={P.main}
                    items={selectedUser?.engagement?.recent_projects ?? []}
                    emptyText="No projects yet."
                    renderItem={(item) => (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {item.status} · {formatDate(item.created_at)}
                        </div>
                      </div>
                    )}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function EngagementSection({ title, icon, color, items, emptyText, renderItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {title}
      </div>

      {items.length === 0 ? (
        <Card className="shadow-none bg-muted/20 border-dashed">
          <CardContent className="p-4 text-center text-xs text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="shadow-none border bg-card hover:bg-muted/30 transition-colors">
              <CardContent className="p-3">
                {renderItem(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
