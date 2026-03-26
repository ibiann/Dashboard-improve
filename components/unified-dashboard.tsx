"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, Bell, Plus, ChevronRight, ChevronLeft,
  Network, LayoutDashboard, Users, CalendarRange, Archive,
  ShieldCheck, AlertTriangle, Lock, Folder, ClipboardList,
  Layers, LayoutGrid, Clock, Construction, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── L1 content imports ───────────────────────────────────────────────────────
import { StrategicKpiCard } from "@/components/strategic/strategic-kpi-card";
import { PortfolioTab } from "@/components/strategic/portfolio-tab";
import { PeopleTab } from "@/components/strategic/people-tab";
import { MeetingsTab } from "@/components/strategic/meetings-tab";
import { ArchiveTab } from "@/components/strategic/archive-tab";
import { PermissionsTab } from "@/components/strategic/permissions-tab";
import { ProjectDetail } from "@/components/strategic/project-detail";
import {
  L1_PROJECTS, l1GetPortfolioHealth, l1GetGlobalSPI,
  l1GetResourceEfficiency, l1GetTotalBudget, L1Project,
} from "@/lib/strategic-mock-data";
import { Activity, Layers as LayersIcon, Gauge, Users as UsersIcon, DollarSign, ShieldAlert } from "lucide-react";

// ── L3 content imports ───────────────────────────────────────────────────────
import { EngineerContent } from "@/components/engineer/engineer-content";


import { PMHome } from "@/components/pm/pm-home";
import { PMWorkspace } from "@/components/pm/pm-workspace";
import { PhasePlanTab, ResourceTab } from "@/components/pm/pm-project-detail";
import { KanbanTab } from "@/components/pm/pm-kanban";
import { TimesheetApprovalTab } from "@/components/pm/pm-timesheets";
import { NotificationsTab } from "@/components/pm/pm-notifications";
import {
  PM_PROJECTS, PMProject, getProjectProgress,
  getRAGColor, getRAGLabel, getSPIBadge, getAllTasks,
} from "@/lib/pm-mock-data";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type ViewRole = "CEO" | "CTO" | "PM" | "Engineer";
type L1Tab = "portfolio" | "people" | "meetings" | "archive" | "quality" | "risk" | "permissions";
type PMHomeView = "projects" | "workspace" | "notifications";
type PMProjectTab = "phases" | "kanban" | "resource" | "timesheets" | "reminders";

const ROLE_OPTIONS: { role: ViewRole; title: string; desc: string }[] = [
  { role: "CEO",      title: "CEO",      desc: "Tổng Giám Đốc — Executive Overview" },
  { role: "CTO",      title: "CTO",      desc: "Strategic — Full Technical Access" },
  { role: "PM",       title: "PM",       desc: "Project Manager — My Projects" },
  { role: "Engineer", title: "Engineer", desc: "Kỹ sư — My Tasks & Timesheets" },
];

// Placeholder

function SidebarItem({
  icon: Icon, label, active, onClick, badge, collapsed,
}: {
  icon: React.ElementType; label: string; active: boolean;
  onClick: () => void; badge?: number; collapsed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors text-left relative",
        active
          ? "text-white font-semibold"
          : "text-white/60 hover:text-white hover:bg-white/10"
      )}
      style={active ? { backgroundColor: "#E36C25" } : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="flex-1 text-xs truncate">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full font-mono shrink-0">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sidebar content per role
// ────────────────────────────────────────────────────────────────────────────

interface SidebarContentProps {
  role: ViewRole;
  collapsed: boolean;
  l1Tab: L1Tab;
  setL1Tab: (t: L1Tab) => void;
  pmHomeView: PMHomeView;
  setPmHomeView: (v: PMHomeView) => void;
  pmProject: PMProject | null;
  pmTab: PMProjectTab;
  setPmTab: (t: PMProjectTab) => void;
  onPmBack: () => void;
  engTab: string;
  setEngTab: (t: string) => void;
}

function SidebarContent({
  role, collapsed, l1Tab, setL1Tab,
  pmHomeView, setPmHomeView, pmProject, pmTab, setPmTab, onPmBack,
  engTab, setEngTab,
}: SidebarContentProps) {
  if (role === "CEO") {
    const items: { icon: React.ElementType; label: string; tab: L1Tab }[] = [
      { icon: LayoutDashboard, label: "Danh mục dự án", tab: "portfolio" },
      { icon: Users,           label: "Nhân sự",         tab: "people" },
      { icon: CalendarRange,   label: "Lịch họp",         tab: "meetings" },
      { icon: Archive,         label: "Lưu trữ",          tab: "archive" },
    ];
    return (
      <>
        {!collapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Tổng Giám Đốc
          </p>
        )}
        <nav className="flex-1 py-1 space-y-0.5 px-2">
          {items.map(({ icon, label, tab }) => (
            <SidebarItem key={tab} icon={icon} label={label} active={l1Tab === tab}
              onClick={() => setL1Tab(tab)} collapsed={collapsed} />
          ))}
        </nav>
      </>
    );
  }

  if (role === "CTO") {
    const items: { icon: React.ElementType; label: string; tab: L1Tab }[] = [
      { icon: LayoutDashboard, label: "Danh mục dự án", tab: "portfolio" },
      { icon: Users,           label: "Nhân sự",         tab: "people" },
      { icon: CalendarRange,   label: "Lịch họp",         tab: "meetings" },
      { icon: ShieldCheck,     label: "Chất lượng",       tab: "quality" },
      { icon: AlertTriangle,   label: "Rủi ro",           tab: "risk" },
      { icon: Archive,         label: "Lưu trữ",          tab: "archive" },
      { icon: Lock,            label: "Phân quyền",       tab: "permissions" },
    ];
    return (
      <>
        {!collapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            CTO · Strategic
          </p>
        )}
        <nav className="flex-1 py-1 space-y-0.5 px-2">
          {items.map(({ icon, label, tab }) => (
            <SidebarItem key={tab} icon={icon} label={label} active={l1Tab === tab}
              onClick={() => setL1Tab(tab)} collapsed={collapsed} />
          ))}
        </nav>
      </>
    );
  }

  // PM role
  if (pmProject) {
    const allTasks = getAllTasks(pmProject);
    const reviewBadge = allTasks.filter((t) => t.status === "Waiting for Review").length;
    const projectItems: { icon: React.ElementType; label: string; tab: PMProjectTab; badge?: number }[] = [
      { icon: Layers,      label: "Phase Plan",   tab: "phases" },
      { icon: LayoutGrid,  label: "Task Kanban",  tab: "kanban",     badge: reviewBadge },
      { icon: Users,       label: "Resource",     tab: "resource" },
      { icon: Clock,       label: "Timesheets",   tab: "timesheets", badge: pmProject.pendingTimesheetCount },
      { icon: Bell,        label: "Nhắc việc",    tab: "reminders" },
    ];
    return (
      <>
        {!collapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Level 2 — PM
          </p>
        )}
        <nav className="flex-1 py-1 space-y-0.5 px-2">
          <button
            onClick={onPmBack}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-xs font-semibold truncate">Quay lại</span>}
          </button>
          <div className="h-px bg-white/10 my-1.5" />
          {projectItems.map(({ icon, label, tab, badge }) => (
            <SidebarItem key={tab} icon={icon} label={label} active={pmTab === tab}
              onClick={() => setPmTab(tab)} badge={badge} collapsed={collapsed} />
          ))}
        </nav>
      </>
    );
  }

  // PM Home
  const homeItems: { icon: React.ElementType; label: string; view: PMHomeView }[] = [
    { icon: Folder,       label: "Dự án của tôi", view: "projects" },
    { icon: ClipboardList, label: "Workspace",     view: "workspace" },
    { icon: Bell,         label: "Nhắc việc",      view: "notifications" },
  ];
  if (role === "PM") {
    return (
      <>
        {!collapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Level 2 — PM
          </p>
        )}
        <nav className="flex-1 py-1 space-y-0.5 px-2">
          {homeItems.map(({ icon, label, view }) => (
            <SidebarItem key={view} icon={icon} label={label} active={pmHomeView === view}
              onClick={() => setPmHomeView(view)} collapsed={collapsed} />
          ))}
        </nav>
      </>
    );
  }

  // Engineer
  const engItems: { icon: React.ElementType; label: string; tab: string }[] = [
    { icon: LayoutDashboard, label: "Dashboard",   tab: "dashboard" },
    { icon: ClipboardList,   label: "Công việc",   tab: "tasks" },
    { icon: Clock,           label: "Chấm công",   tab: "timesheet" },
    { icon: CalendarRange,   label: "Lịch & Họp",  tab: "calendar" },
  ];
  return (
    <>
      {!collapsed && (
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Level 3 — Engineer
        </p>
      )}
      <nav className="flex-1 py-1 space-y-0.5 px-2">
        {engItems.map(({ icon, label, tab }) => (
          <SidebarItem key={tab} icon={icon} label={label} active={engTab === tab}
            onClick={() => setEngTab(tab)} collapsed={collapsed} />
        ))}
      </nav>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Project Header Strip (L2 only, inside content area)
// ────────────────────────────────────────────────────────────────────────────

function ProjectHeaderStrip({
  project, activeTab, onTabChange,
}: {
  project: PMProject; activeTab: PMProjectTab; onTabChange: (t: PMProjectTab) => void;
}) {
  const progress = getProjectProgress(project);
  const allTasks = getAllTasks(project);
  const reviewCount = allTasks.filter((t) => t.status === "Waiting for Review").length;
  const ragColor = getRAGColor(project.ragStatus);

  const tabs: { key: PMProjectTab; label: string; badge?: number }[] = [
    { key: "phases",     label: "Phase Plan" },
    { key: "kanban",     label: "Task Kanban", badge: reviewCount },
    { key: "resource",   label: "Resource" },
    { key: "timesheets", label: "Timesheets",  badge: project.pendingTimesheetCount },
    { key: "reminders",  label: "Nhắc việc" },
  ];

  return (
    <div className="bg-white border-b border-border shrink-0">
      <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {project.id}
        </span>
        <span className="text-sm font-bold text-foreground">{project.name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
          style={{ backgroundColor: "#4CABEB" }}>{project.category}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: ragColor }} />
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: ragColor }}>{progress}%</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          SPI <span className="font-semibold" style={{ color: getSPIBadge(project.spi).color }}>
            {project.spi.toFixed(2)}
          </span>
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {project.totalLoggedHours}h/{project.totalPlannedHours}h
        </span>
        <div className="ml-auto">
          <span className="text-[10px] font-bold text-white px-2 py-1 rounded-full"
            style={{ backgroundColor: ragColor }}>{getRAGLabel(project.ragStatus)}</span>
        </div>
      </div>
      <div className="flex overflow-x-auto border-t border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary bg-muted/30"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            {tab.label}
            {tab.badge && tab.badge > 0 ? (
              <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-warning font-mono">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// L1 KPI section
// ────────────────────────────────────────────────────────────────────────────

function L1KPIs({ role }: { role: "CEO" | "CTO" }) {
  const activeProjects = L1_PROJECTS.filter((p) => !p.closed);
  const closedProjects = L1_PROJECTS.filter((p) => p.closed);
  const portfolioHealth = l1GetPortfolioHealth(L1_PROJECTS);
  const spi = l1GetGlobalSPI(L1_PROJECTS);
  const resourceEff = l1GetResourceEfficiency(L1_PROJECTS);
  const budget = l1GetTotalBudget(L1_PROJECTS);
  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount   = activeProjects.filter((p) => p.ragStatus === "red").length;
  const overdueCount = activeProjects.reduce((acc, p) => acc + p.overdueTasks.length, 0);
  const budgetPct = Math.round((budget.spent / budget.total) * 100);

  if (role === "CEO") {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="KPI Indicators">
        <StrategicKpiCard title="Ngân sách" value={`${budgetPct}%`}
          subtitle={`Đã chi ${(budget.spent/1e6).toFixed(1)}M / ${(budget.total/1e6).toFixed(1)}M USD`}
          trend={budgetPct<=80?"up":budgetPct<=95?"neutral":"down"}
          trendLabel={budgetPct<=80?"Trong ngưỡng":budgetPct<=95?"Theo dõi":"Vượt ngân sách"}
          icon={<DollarSign className="w-4 h-4" />} highlight />
        <StrategicKpiCard title="Dự án" value={activeProjects.length}
          subtitle={`${greenCount} đúng tiến độ · ${amberCount} rủi ro · ${redCount} chậm`}
          trend={redCount===0?"up":redCount<=2?"neutral":"down"}
          trendLabel={`${closedProjects.length} đã hoàn thành`}
          icon={<LayersIcon className="w-4 h-4" />} />
        <StrategicKpiCard title="SPI" value={spi.toFixed(2)}
          subtitle="Schedule Performance Index trung bình"
          trend={spi>=1?"up":spi>=0.85?"neutral":"down"}
          trendLabel={spi>=1?"Đúng lịch":spi>=0.85?"Hơi chậm":"Chậm tiến độ"}
          icon={<Gauge className="w-4 h-4" />} />
        <StrategicKpiCard title="Task quá hạn" value={overdueCount}
          subtitle="Tổng số task trễ hạn trên toàn danh mục"
          trend={overdueCount===0?"up":overdueCount<=5?"neutral":"down"}
          trendLabel={overdueCount===0?"Tốt":overdueCount<=5?"Cần theo dõi":"Cần xử lý ngay"}
          icon={<ShieldAlert className="w-4 h-4" />} />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="KPI Indicators">
      <StrategicKpiCard title="Portfolio Health" value={`${portfolioHealth}%`}
        subtitle="Tiến độ thực tế / Kế hoạch trung bình"
        trend={portfolioHealth>=90?"up":portfolioHealth>=75?"neutral":"down"}
        trendLabel={portfolioHealth>=90?"Lành mạnh":portfolioHealth>=75?"Trung bình":"Cần cải thiện"}
        icon={<Activity className="w-4 h-4" />} highlight />
      <StrategicKpiCard title="Dự án" value={activeProjects.length}
        subtitle={`${greenCount} đúng tiến độ · ${amberCount} rủi ro · ${redCount} chậm`}
        trend={redCount===0?"up":redCount<=2?"neutral":"down"}
        trendLabel={`${closedProjects.length} đã hoàn thành`}
        icon={<LayersIcon className="w-4 h-4" />} />
      <StrategicKpiCard title="SPI" value={spi.toFixed(2)}
        subtitle="Schedule Performance Index trung bình"
        trend={spi>=1?"up":spi>=0.85?"neutral":"down"}
        trendLabel={spi>=1?"Đúng lịch":spi>=0.85?"Hơi chậm":"Chậm tiến độ"}
        icon={<Gauge className="w-4 h-4" />} />
      <StrategicKpiCard title="Resource Efficiency" value={`${resourceEff}%`}
        subtitle="Hiệu suất nguồn lực tổng hợp"
        trend={resourceEff>=85?"up":resourceEff>=70?"neutral":"down"}
        trendLabel={resourceEff>=85?"Hiệu quả":"Cần xem xét"}
        icon={<UsersIcon className="w-4 h-4" />} />
    </section>
  );
}

// Placeholder

const L1_TAB_LABELS: Record<L1Tab, string> = {
  portfolio: "Danh mục dự án", people: "Nhân sự", meetings: "Lịch họp",
  archive: "Lưu trữ", quality: "Chất lượng", risk: "Rủi ro", permissions: "Phân quyền",
};
const PM_HOME_LABELS: Record<PMHomeView, string> = {
  projects: "Dự án của tôi", workspace: "Workspace", notifications: "Nhắc việc",
};
const PM_TAB_LABELS: Record<PMProjectTab, string> = {
  phases: "Phase Plan", kanban: "Task Kanban", resource: "Resource",
  timesheets: "Timesheets", reminders: "Nhắc việc",
};

function buildBreadcrumbs(
  role: ViewRole, l1Tab: L1Tab, pmHomeView: PMHomeView,
  pmProject: PMProject | null, pmTab: PMProjectTab, engTab: string,
  selectedProject: L1Project | null
): string[] {
  if (role === "Engineer") {
    const engLabels: Record<string, string> = {
      dashboard: "Dashboard", tasks: "Công việc",
      timesheet: "Chấm công", calendar: "Lịch & Họp",
    };
    return ["Engineer", engLabels[engTab] ?? engTab];
  }
  if (role === "CEO" || role === "CTO") {
    const base = ["Dashboard", L1_TAB_LABELS[l1Tab]];
    if (selectedProject && l1Tab === "portfolio") {
      return [...base, selectedProject.name];
    }
    return base;
  }
  if (!pmProject) {
    return ["PM Home", PM_HOME_LABELS[pmHomeView]];
  }
  return ["PM Home", pmProject.name, PM_TAB_LABELS[pmTab]];
}

// ────────────────────────────────────────────────────────────────────────────
// Unified Dashboard Shell
// ────────────────────────────────────────────────────────────────────────────

export function UnifiedDashboard() {
  const [collapsed, setCollapsed]       = useState(false);
  const [viewRole, setViewRole]         = useState<ViewRole>("CTO");
  const [showRoleDrop, setShowRoleDrop] = useState(false);
  const roleDropRef                     = useRef<HTMLDivElement>(null);

  // L1 state
  const [l1Tab, setL1Tab] = useState<L1Tab>("portfolio");
  const [selectedProject, setSelectedProject] = useState<L1Project | null>(null);

  function handleSetL1Tab(tab: L1Tab) {
    setL1Tab(tab);
    setSelectedProject(null);
  }

  // L2 state
  const [pmHomeView, setPmHomeView] = useState<PMHomeView>("projects");
  const [pmProject, setPmProject]   = useState<PMProject | null>(null);
  const [pmTab, setPmTab]           = useState<PMProjectTab>("phases");

  // L3 Engineer state
  const [engTab, setEngTab] = useState("dashboard");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleDropRef.current && !roleDropRef.current.contains(e.target as Node)) {
        setShowRoleDrop(false);
      }
    }
    if (showRoleDrop) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRoleDrop]);

  function handleRoleChange(role: ViewRole) {
    setViewRole(role);
    setShowRoleDrop(false);
    setSelectedProject(null);
    if (role === "PM") { setPmProject(null); setPmHomeView("projects"); }
    else if (role === "Engineer") { setEngTab("dashboard"); }
    else { setL1Tab("portfolio"); }
  }

  function handleSelectProject(projectId: string, tab?: string) {
    const p = PM_PROJECTS.find((x) => x.id === projectId) ?? null;
    setPmProject(p);
    setPmTab((tab as PMProjectTab) ?? "phases");
  }

  function handlePmBack() {
    setPmProject(null);
  }

  const breadcrumbs = buildBreadcrumbs(viewRole, l1Tab, pmHomeView, pmProject, pmTab, engTab, selectedProject);

  // ── Content renderer ──────────────────────────────────────────────────────
  function renderContent() {
    if (viewRole === "Engineer") {
      return <EngineerContent activeTab={engTab} />;
    }

    if (viewRole === "CEO" || viewRole === "CTO") {
      const role = viewRole;
      // Project detail view — overlay portfolio table
      if (l1Tab === "portfolio" && selectedProject) {
        return (
          <ProjectDetail
            project={selectedProject}
            role={role}
            onBack={() => setSelectedProject(null)}
          />
        );
      }
      switch (l1Tab) {
        case "portfolio":
          return (
            <div className="space-y-6">
              <L1KPIs role={role} />
              <PortfolioTab
                projects={L1_PROJECTS}
                role={role}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            </div>
          );
        case "people":     return <PeopleTab />;
        case "meetings":   return <MeetingsTab />;
        case "archive":    return <ArchiveTab projects={L1_PROJECTS} />;
        case "permissions":
          return role === "CTO" ? <PermissionsTab /> : (
            <PlaceholderView title="Phân quyền" note="Chỉ CTO mới có quyền truy cập" />
          );
        case "quality": return <PlaceholderView title="Chất lượng" />;
        case "risk":    return <PlaceholderView title="Rủi ro" />;
        default: return null;
      }
    }

    // PM
    if (!pmProject) {
      if (pmHomeView === "workspace")     return <PMWorkspace />;
      if (pmHomeView === "notifications") return <NotificationsTab />;
      return <PMHome onSelectProject={handleSelectProject} />;
    }
    switch (pmTab) {
      case "phases":     return <PhasePlanTab project={pmProject} onTaskClick={() => setPmTab("kanban")} />;
      case "kanban":     return <KanbanTab project={pmProject} onTaskUpdate={() => {}} />;
      case "resource":   return <ResourceTab project={pmProject} />;
      case "timesheets": return <TimesheetApprovalTab project={pmProject} />;
      case "reminders":  return <NotificationsTab />;
      default: return null;
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-200 overflow-hidden"
        style={{ width: collapsed ? 56 : 220, backgroundColor: "#063986", minHeight: "100vh" }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 shrink-0">
            <Network className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-sm leading-tight truncate">Lancsnetworks</p>
              <p className="text-white/40 text-[9px] font-semibold tracking-widest uppercase mt-0.5">
                {viewRole === "CEO" ? "Tổng Giám Đốc" : viewRole === "CTO" ? "CTO · Strategic" : viewRole === "Engineer" ? "Level 3 — Engineer" : "Level 2 — PM"}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <SidebarContent
            role={viewRole}
            collapsed={collapsed}
            l1Tab={l1Tab}
            setL1Tab={handleSetL1Tab}
            pmHomeView={pmHomeView}
            setPmHomeView={setPmHomeView}
            pmProject={pmProject}
            pmTab={pmTab}
            setPmTab={setPmTab}
            onPmBack={handlePmBack}
            engTab={engTab}
            setEngTab={setEngTab}
          />
        </div>
      </aside>

      {/* ── Main column ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── ONE Top Bar ──────────────────────────────────────────────── */}
        <header className="h-12 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0 z-30">
          {/* Role dropdown */}
          <div className="relative shrink-0" ref={roleDropRef}>
            <button
              onClick={() => setShowRoleDrop(!showRoleDrop)}
              className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              Xem: <span className="font-bold">{viewRole}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showRoleDrop && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-lg shadow-lg z-50">
                {ROLE_OPTIONS.map(({ role, title, desc }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 border-b border-border/60 last:border-b-0 transition-colors",
                      viewRole === role ? "bg-primary/5" : "hover:bg-slate-50"
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{title}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    {viewRole === role && (
                      <span className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumb */}
          <nav className="flex-1 flex items-center gap-1 text-[11px] text-muted-foreground min-w-0 overflow-hidden" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 shrink-0">
                {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />}
                <span className={cn("truncate", i === breadcrumbs.length - 1 ? "font-semibold text-foreground" : "")}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (viewRole === "PM") { setPmProject(null); setPmHomeView("workspace"); }
                else setL1Tab("meetings");
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg"
              style={{ backgroundColor: "#E36C25" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo lịch họp
            </button>
            <button className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Thông báo">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#E36C25" }}>
              AM
            </div>
          </div>
        </header>

        {/* Project header strip — inside content area, only for PM project view */}
        {viewRole === "PM" && pmProject && (
          <ProjectHeaderStrip
            project={pmProject}
            activeTab={pmTab}
            onTabChange={setPmTab}
          />
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto px-4 py-5 md:px-6 space-y-5">
          {/* Page title (L1 or PM home) — hide for Engineer, PM project view, and L1 project detail */}
          {(viewRole !== "PM" || !pmProject) && viewRole !== "Engineer" && !selectedProject && (
            <div>
              <h1 className="text-base font-extrabold text-foreground tracking-tight font-sans">
                {viewRole === "PM" ? PM_HOME_LABELS[pmHomeView] : L1_TAB_LABELS[l1Tab]}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewRole === "CEO" && l1Tab === "portfolio" && "22 dự án · CEO Executive Overview"}
                {viewRole === "CTO" && l1Tab === "portfolio" && "22 dự án · CTO Strategic"}
                {viewRole === "PM"  && pmHomeView === "projects"      && "Alice Morgan — 3 dự án được giao"}
                {viewRole === "PM"  && pmHomeView === "workspace"     && "Việc cần làm & lịch họp cá nhân"}
                {viewRole === "PM"  && pmHomeView === "notifications" && "Cấu hình quy tắc nhắc nhở"}
              </p>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Placeholder view component

function PlaceholderView({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Construction className="w-12 h-12 text-muted-foreground/40" />
      <h2 className="text-lg font-bold text-muted-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground/70">{note ?? "Tích hợp ở bước tiếp theo"}</p>
    </div>
  );
}
