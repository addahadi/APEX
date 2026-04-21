import { useDeferredValue, useState } from "react";
import { Ban, Bookmark, CheckCircle, FolderOpen, Heart, Loader2 } from "lucide-react";
import { P } from "@/lib/design-tokens";
import { Badge, Btn, Avatar, Card, SectionTitle, SearchInput, Sel, TH, TD, TabBar } from "@/components/admin/ui-atoms";
import { useAdminUserDetails, useAdminUsers, useUpdateAdminUserStatus } from "@/hooks/admin.queries";

const PAGE_SIZE = 20;

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
  { v: "active", l: "Active" },
  { v: "banned", l: "Banned" },
  { v: "suspended", l: "Suspended" },
  { v: "inactive", l: "Inactive" },
];

const DEFAULT_PLAN_OPTIONS = [{ v: "ALL", l: "All plans" }];

const USER_STATUS_CONF = {
  active: { label: "Active", color: P.success, bg: P.successL },
  banned: { label: "Banned", color: P.error, bg: P.errorL },
  suspended: { label: "Suspended", color: P.warn, bg: P.warnL },
  inactive: { label: "Inactive", color: P.txt3, bg: P.borderL },
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
  if (status === "active") {
    return {
      label: "Ban User",
      nextStatus: "banned",
      variant: "danger",
      icon: <Ban size={13} />,
    };
  }

  return {
    label: status === "banned" ? "Unban" : "Activate",
    nextStatus: "active",
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
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, padding: "28px 30px", overflowY: "auto", animation: "fadeUp .3s ease" }}>
        <SectionTitle title="Users" subtitle={subtitle} />

        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name or email..."
            />
          </div>
          <Sel value={statusF} onChange={handleStatus} options={statusOptions} />
          <Sel value={planF} onChange={handlePlan} options={planOptions} />
        </div>

        <Card style={{ position: "relative" }}>
          {isFetching && !isLoading && (
            <div style={{ position: "absolute", top: 10, right: 14, zIndex: 10 }}>
              <Loader2 size={15} color={P.main} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["User", "Status", "Plan", "Type", "Subscription", "Joined", "End Date"].map((header) => (
                  <TH key={header}>{header}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: 8 }} />
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: P.error, fontSize: 13 }}>
                    {error.message || "Failed to load users."}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: P.txt3, fontSize: 13 }}>
                    No users match your current filters.
                  </td>
                </tr>
              ) : rows.map((user) => {
                const statusConf = USER_STATUS_CONF[user.status] ?? USER_STATUS_CONF.active;
                const planConf = planColor(user.plan?.name ?? "");
                const typeConf = planTypeColor(user.plan?.type ?? "");
                const subscriptionConf = SUBSCRIPTION_CONF[user.plan?.subscription_status] ?? SUBSCRIPTION_CONF.INACTIVE;
                const selected = selectedUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    onClick={() => openUser(user.id)}
                    style={{
                      borderTop: `1px solid ${P.borderL}`,
                      cursor: "pointer",
                      transition: "background .12s",
                      background: selected ? P.mainL : "transparent",
                    }}
                    onMouseEnter={(event) => {
                      if (!selected) event.currentTarget.style.background = P.bg;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = selected ? P.mainL : "transparent";
                    }}
                  >
                    <TD>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={initials(user.name)} size={32} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: P.txt3 }}>{user.email}</div>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <Badge label={statusConf.label} color={statusConf.color} bg={statusConf.bg} />
                    </TD>
                    <TD>
                      <Badge
                        label={user.plan?.name ?? "No plan"}
                        color={user.plan?.name ? planConf.color : P.txt3}
                        bg={user.plan?.name ? planConf.bg : P.borderL}
                      />
                    </TD>
                    <TD>
                      <Badge
                        label={user.plan?.type ?? "-"}
                        color={user.plan?.type ? typeConf.color : P.txt3}
                        bg={user.plan?.type ? typeConf.bg : P.borderL}
                      />
                    </TD>
                    <TD>
                      {user.plan?.subscription_status ? (
                        <Badge
                          label={user.plan.subscription_status}
                          color={subscriptionConf.color}
                          bg={subscriptionConf.bg}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: P.txt3 }}>-</span>
                      )}
                    </TD>
                    <TD style={{ color: P.txt3, fontSize: 12 }}>{formatDate(user.joined_at)}</TD>
                    <TD style={{ color: P.txt3, fontSize: 12 }}>{formatDate(user.plan?.end_date)}</TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {pagination.total_pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: P.txt3 }}>
            <span>
              Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <PageBtn label="Previous" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} />
              {Array.from({ length: pagination.total_pages }, (_, index) => index + 1)
                .filter((pageNumber) => pageNumber === 1 || pageNumber === pagination.total_pages || Math.abs(pageNumber - page) <= 1)
                .reduce((acc, pageNumber, index, pages) => {
                  if (index > 0 && pageNumber - pages[index - 1] > 1) acc.push("...");
                  acc.push(pageNumber);
                  return acc;
                }, [])
                .map((pageNumber, index) =>
                  pageNumber === "..."
                    ? <span key={`ellipsis-${index}`} style={{ padding: "4px 2px", color: P.txt3 }}>...</span>
                    : <PageBtn key={pageNumber} label={pageNumber} active={pageNumber === page} onClick={() => setPage(pageNumber)} />
                )}
              <PageBtn
                label="Next"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((current) => current + 1)}
              />
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <div style={{ width: 360, borderLeft: `1px solid ${P.border}`, background: P.surface, overflowY: "auto", animation: "slideIn .2s ease", flexShrink: 0, position: "relative" }}>
          {detailFetching && (
            <div style={{ position: "absolute", top: 16, right: 42, zIndex: 2 }}>
              <Loader2 size={15} color={P.main} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}

          <div style={{ padding: "24px 22px 16px", borderBottom: `1px solid ${P.borderL}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", position: "relative" }}>
            <Avatar initials={initials(selectedUser?.name)} size={56} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: P.txt }}>{selectedUser?.name ?? "Loading..."}</div>
              <div style={{ fontSize: 12, color: P.txt3 }}>{selectedUser?.email ?? "-"}</div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
              <Badge
                label={(USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.active).label}
                color={(USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.active).color}
                bg={(USER_STATUS_CONF[selectedUser?.status] ?? USER_STATUS_CONF.active).bg}
              />
              <Badge
                label={selectedUser?.plan?.name ?? "No plan"}
                color={selectedUser?.plan?.name ? planColor(selectedUser.plan.name).color : P.txt3}
                bg={selectedUser?.plan?.name ? planColor(selectedUser.plan.name).bg : P.borderL}
              />
            </div>
            <button
              onClick={closeUser}
              style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", cursor: "pointer", color: P.txt3, fontSize: 18 }}
            >
              x
            </button>
          </div>

          <TabBar tabs={[{ k: "profile", l: "Profile" }, { k: "engagement", l: "Engagement" }]} active={tab} onSelect={setTab} />

          <div style={{ padding: "0 22px 22px" }}>
            {detailError ? (
              <Card style={{ padding: 14, color: P.error, fontSize: 13 }}>
                {detailError.message || "Failed to load this user."}
              </Card>
            ) : detailBusy ? (
              <Card style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center", color: P.txt3, fontSize: 13 }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
                Loading details...
              </Card>
            ) : tab === "profile" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card style={{ padding: 14 }}>
                  {[
                    { label: "Plan", value: selectedUser?.plan?.name ?? "No plan" },
                    { label: "Type", value: selectedUser?.plan?.type ?? "-" },
                    { label: "Sub Status", value: selectedUser?.plan?.subscription_status ?? "-" },
                    { label: "Joined", value: formatDate(selectedUser?.joined_at) },
                    { label: "End Date", value: formatDate(selectedUser?.plan?.end_date) },
                    { label: "Role", value: selectedUser?.role ?? "-" },
                  ].map((row, index, allRows) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: index < allRows.length - 1 ? `1px solid ${P.borderL}` : "none", fontSize: 13, gap: 16 }}>
                      <span style={{ color: P.txt3 }}>{row.label}</span>
                      <span style={{ color: P.txt, fontWeight: 500, textAlign: "right" }}>{row.value}</span>
                    </div>
                  ))}
                </Card>

                <Card style={{ padding: 14 }}>
                  {[
                    { label: "Projects", value: selectedUser?.stats?.projects_count ?? 0 },
                    { label: "Liked Articles", value: selectedUser?.stats?.likes_count ?? 0 },
                    { label: "Saved Articles", value: selectedUser?.stats?.saves_count ?? 0 },
                    { label: "AI Calls", value: selectedUser?.stats?.ai_calls_count ?? 0 },
                  ].map((row, index, allRows) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: index < allRows.length - 1 ? `1px solid ${P.borderL}` : "none", fontSize: 13, gap: 16 }}>
                      <span style={{ color: P.txt3 }}>{row.label}</span>
                      <span style={{ color: P.txt, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </Card>

                <div style={{ display: "flex", gap: 6 }}>
                  <Btn
                    variant={action.variant}
                    color={action.color}
                    icon={action.icon}
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ userId: selectedUser.id, status: action.nextStatus })}
                  >
                    {statusMutation.isPending ? "Saving..." : action.label}
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <EngagementSection
                  title="Liked Articles"
                  icon={<Heart size={14} />}
                  color={P.pink}
                  items={selectedUser?.engagement?.liked_articles ?? []}
                  emptyText="No liked articles yet."
                  renderItem={(item) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: P.txt3 }}>Liked on {formatDate(item.created_at)}</div>
                    </div>
                  )}
                />

                <EngagementSection
                  title="Saved Articles"
                  icon={<Bookmark size={14} />}
                  color={P.purple}
                  items={selectedUser?.engagement?.saved_articles ?? []}
                  emptyText="No saved articles yet."
                  renderItem={(item) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: P.txt3 }}>Saved on {formatDate(item.created_at)}</div>
                    </div>
                  )}
                />

                <EngagementSection
                  title="Recent Projects"
                  icon={<FolderOpen size={14} />}
                  color={P.main}
                  items={selectedUser?.engagement?.recent_projects ?? []}
                  emptyText="No projects yet."
                  renderItem={(item) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: P.txt3 }}>
                        {item.status} | {formatDate(item.created_at)}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EngagementSection({ title, icon, color, items, emptyText, renderItem }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: P.txt2, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color }}>{icon}</span>
        {title}
      </div>

      {items.length === 0 ? (
        <Card style={{ padding: 14, fontSize: 13, color: P.txt3 }}>
          {emptyText}
        </Card>
      ) : items.map((item) => (
        <div key={item.id} style={{ padding: "10px 12px", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 7, marginBottom: 6, fontSize: 13, color: P.txt }}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

function PageBtn({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
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
