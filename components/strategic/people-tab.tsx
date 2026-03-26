"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, X, Mail, Phone, Calendar, Star,
  ChevronRight, ChevronLeft, List, GitFork, ChevronDown,
} from "lucide-react";
import {
  EMPLOYEES, Employee, Dept, avgKPI, kpiLabel,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  emp,
  size = "md",
}: {
  emp: Employee;
  size?: "sm" | "md" | "lg";
}) {
  const initials = emp.name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const gradient =
    emp.gender === "male"
      ? "from-sky-400 to-blue-600"
      : "from-rose-400 to-pink-600";

  const sz = { sm: "w-7 h-7 text-[9px]", md: "w-10 h-10 text-[11px]", lg: "w-16 h-16 text-lg" }[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br shrink-0",
        gradient,
        sz
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ── KPI Badge inline ──────────────────────────────────────────────────────────
function KPIBadge({ score }: { score: number }) {
  const { label, color } = kpiLabel(score);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      KPI: {score} — {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-green-600" : "bg-gray-400")} />
      {isActive ? "Đang làm" : "Nghỉ phép"}
    </span>
  );
}

// ── Employee Drawer ───────────────────────────────────────────────────────────
function EmployeeDrawer({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const score = avgKPI(emp.kpi);
  const { label, color } = kpiLabel(score);

  const kpiItems = [
    { label: "Hoàn thành công việc", value: emp.kpi.completion },
    { label: "Chất lượng",           value: emp.kpi.quality },
    { label: "Đúng hạn",             value: emp.kpi.onTime },
    { label: "Phối hợp nhóm",        value: emp.kpi.teamwork },
    { label: "Học hỏi & phát triển", value: emp.kpi.growth },
  ];

  const roleColors: Record<string, string> = {
    PM: "bg-purple-100 text-purple-700",
    Lead: "bg-blue-100 text-blue-700",
    Developer: "bg-sky-100 text-sky-700",
    Tester: "bg-green-100 text-green-700",
    Reviewer: "bg-orange-100 text-orange-700",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col overflow-y-auto"
        style={{ animation: "slideInRight 0.25s ease-out" }}
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết nhân viên ${emp.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground">
          <div>
            <h2 className="font-bold text-base leading-tight">{emp.name}</h2>
            <p className="text-xs opacity-80 mt-0.5">{emp.role} · {emp.dept}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar emp={emp} size="lg" />
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-foreground">{emp.name}</div>
              <div className="text-xs text-muted-foreground">{emp.role} · {emp.dept}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <KPIBadge score={score} />
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                    emp.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {emp.status === "active" ? "Đang làm việc" : "Nghỉ phép"}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Detail */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-semibold text-foreground">KPI Chi tiết</span>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color }}>
                {score} — {label}
              </span>
            </div>
            <div className="space-y-2">
              {kpiItems.map((item) => {
                const { color: barColor } = kpiLabel(item.value);
                return (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono font-semibold" style={{ color: barColor }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-muted-foreground pt-1 border-t border-border">
              ≥90 Xuất sắc · ≥75 Tốt · ≥60 Đạt · &lt;60 Cần cải thiện
            </p>
          </div>

          {/* Assigned Projects */}
          {emp.assignedProjects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground">Dự án đang tham gia</h3>
              <div className="space-y-1.5">
                {emp.assignedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">{proj.id}</span>
                      <div className="text-xs font-medium text-foreground leading-tight">{proj.name}</div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        roleColors[proj.role] ?? "bg-gray-100 text-gray-600"
                      )}
                    >
                      {proj.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground">Thông tin liên hệ</h3>
            <div className="space-y-1.5 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Ngày vào: {emp.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Org Tree Node ─────────────────────────────────────────────────────────────
function OrgNode({
  emp,
  allEmps,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  emp: Employee;
  allEmps: Employee[];
  onSelect: (e: Employee) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const expanded = expandedIds.has(emp.id);
  const children = allEmps.filter((e) => e.managerId === emp.id);
  const score = avgKPI(emp.kpi);
  const { color } = kpiLabel(score);

  const levelStyle = [
    "border-accent bg-orange-50",
    "border-primary bg-blue-50",
    "border-slate-300 bg-white",
    "border-slate-200 bg-white",
    "border-slate-200 bg-white",
  ][emp.level] ?? "border-slate-200 bg-white";

  return (
    <li className="flex flex-col items-center">
      {/* Node card */}
      <button
        onClick={() => onSelect(emp)}
        className={cn(
          "rounded-xl border-2 px-3 py-2 text-center shadow-sm hover:shadow-md transition-all min-w-[120px] max-w-[140px] cursor-pointer",
          levelStyle
        )}
        aria-label={`Xem hồ sơ ${emp.name}`}
      >
        <Avatar emp={emp} size="sm" />
        <div className="mt-1 text-[10px] font-semibold text-foreground leading-tight truncate" title={emp.name}>
          {emp.name}
        </div>
        <div className="text-[9px] text-muted-foreground truncate">{emp.role}</div>
        <div
          className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          KPI {score}
        </div>
      </button>

      {/* Expand/collapse + children */}
      {children.length > 0 && (
        <>
          <button
            onClick={() => onToggleExpand(emp.id)}
            className="mt-1 p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            aria-label={expanded ? "Thu gọn" : "Mở rộng"}
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", !expanded && "-rotate-90")} />
          </button>

          {expanded && (
            <ul className="flex gap-6 mt-0 relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-3 before:bg-border">
              {children.map((child) => (
                <li key={child.id} className="flex flex-col items-center relative">
                  {/* Horizontal connector */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
                  <OrgNode
                    emp={child}
                    allEmps={allEmps}
                    onSelect={onSelect}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}

// ── People Tab ────────────────────────────────────────────────────────────────
const DEPTS: Dept[] = ["Management", "Engineering", "Product", "QA", "DevOps"];
const PAGE_SIZE = 12;

export function PeopleTab() {
  const [viewMode, setViewMode] = useState<"list" | "org">("list");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Dept | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    let list = [...EMPLOYEES];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.dept.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all") list = list.filter((e) => e.dept === deptFilter);
    if (statusFilter !== "all") list = list.filter((e) => e.status === statusFilter);
    return list;
  }, [search, deptFilter, statusFilter]);

  const employeesById = useMemo(() => {
    return EMPLOYEES.reduce<Record<string, Employee>>((acc, e) => {
      acc[e.id] = e;
      return acc;
    }, {});
  }, []);

  const orgEmployees = useMemo(() => {
    // If user is filtering/searching, keep tree structure by including ancestors.
    const hasAnyFilter = Boolean(search.trim()) || deptFilter !== "all" || statusFilter !== "all";
    if (!hasAnyFilter) return EMPLOYEES;

    const include = new Set<string>();
    for (const e of filtered) {
      include.add(e.id);
      let cur = e;
      while (cur.managerId) {
        include.add(cur.managerId);
        const parent = employeesById[cur.managerId];
        if (!parent) break;
        cur = parent;
      }
    }
    return EMPLOYEES.filter((e) => include.has(e.id));
  }, [deptFilter, employeesById, filtered, search, statusFilter]);

  // Init expand state for current org data (preserve user's toggles).
  useEffect(() => {
    setExpandedIds((prev) => {
      if (prev.size > 0) return prev;
      return new Set(orgEmployees.map((e) => e.id));
    });
  }, [orgEmployees]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deptCounts = useMemo(
    () =>
      DEPTS.reduce<Record<string, number>>((acc, d) => {
        acc[d] = EMPLOYEES.filter((e) => e.dept === d).length;
        return acc;
      }, {}),
    []
  );

  // Root employees for org tree
  const roots = orgEmployees.filter((e) => e.managerId === null);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Nhân sự</h2>
          <p className="text-xs text-muted-foreground">{EMPLOYEES.length} nhân viên</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-3.5 h-3.5" />
            Danh sách
          </button>
          <button
            onClick={() => setViewMode("org")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              viewMode === "org"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitFork className="w-3.5 h-3.5" />
            Sơ đồ
          </button>
        </div>
      </div>

      {/* Dept chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setDeptFilter("all"); setPage(1); }}
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-medium transition-colors",
            deptFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Tất cả ({EMPLOYEES.length})
        </button>
        {DEPTS.map((d) => (
          <button
            key={d}
            onClick={() => { setDeptFilter(d); setPage(1); }}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium transition-colors",
              deptFilter === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {d} ({deptCounts[d]})
          </button>
        ))}
      </div>

      {/* ── List View ── */}
      {viewMode === "list" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm theo tên, chức vụ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s === "all" ? "Tất cả" : s === "active" ? "Đang làm" : "Nghỉ phép"}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paged.map((emp) => {
              const score = avgKPI(emp.kpi);
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelected(emp)}
                  className="flex items-center gap-3 bg-card rounded-xl border border-border p-3 hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                  aria-label={`Xem hồ sơ ${emp.name}`}
                >
                  <Avatar emp={emp} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground truncate">{emp.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{emp.role} · {emp.dept}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <KPIBadge score={score} />
                      <StatusBadge status={emp.status} />
                      <span className="text-[10px] text-muted-foreground">
                        {emp.assignedProjects.length} dự án
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              );
            })}
            {paged.length === 0 && (
              <div className="col-span-3 text-center py-8 text-xs text-muted-foreground">
                Không tìm thấy nhân viên nào
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
                aria-label="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-medium transition-colors",
                    page === n ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
                aria-label="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Org Tree View ── */}
      {viewMode === "org" && (
        <div className="bg-card rounded-xl border border-border p-4 overflow-auto">
          <ul className="flex gap-8 justify-start">
            {roots.map((r) => (
              <OrgNode
                key={r.id}
                emp={r}
                allEmps={orgEmployees}
                onSelect={setSelected}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <EmployeeDrawer emp={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
