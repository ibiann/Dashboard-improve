"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown, Bell, Plus, ChevronRight,
  Construction,
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
import { CEOExecutiveDashboard } from "@/components/strategic/ceo-executive-dashboard";
import {
  L1_PROJECTS, l1GetPortfolioHealth, l1GetGlobalSPI,
  l1GetResourceEfficiency, l1GetTotalBudget, L1Project,
} from "@/lib/strategic-mock-data";
import { ViewToggle, WorkspaceViewMode } from "@/components/strategic/view-toggle";
import { WorkflowCanvas } from "@/components/strategic/workflow-canvas";
import { WorkflowTabPlaceholder } from "@/components/strategic/workflow-tab-placeholder";
import { CrmHeaderNav, CrmHeaderBrand } from "@/components/layout/crm-header-nav";
import { PmWorkflowCanvas } from "@/components/pm/pm-workflow-canvas";
import { PmProjectWorkflowCanvas } from "@/components/pm/pm-project-workflow-canvas";
import { Activity, Layers as LayersIcon, Gauge, Users as UsersIcon, DollarSign, ShieldAlert } from "lucide-react";

// ── L3 content imports ───────────────────────────────────────────────────────
import { EngineerContent } from "@/components/engineer/engineer-content";


import { PMHome } from "@/components/pm/pm-home";
import { PMWorkspace } from "@/components/pm/pm-workspace";
import { PhasePlanTab, ResourceTab } from "@/components/pm/pm-project-detail";
import { KanbanTab } from "@/components/pm/pm-kanban";
import { TimesheetApprovalTab } from "@/components/pm/pm-timesheets";
import { NotificationsTab } from "@/components/pm/pm-notifications";
import { PM_PROJECTS, PMProject } from "@/lib/pm-mock-data";

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

// ────────────────────────────────────────────────────────────────────────────
// L1 KPI section
// ────────────────────────────────────────────────────────────────────────────

function L1KPIs({ role, projects }: { role: "CEO" | "CTO"; projects: L1Project[] }) {
  const activeProjects = projects.filter((p) => !p.closed);
  const closedProjects = projects.filter((p) => p.closed);
  const portfolioHealth = l1GetPortfolioHealth(projects);
  const spi = l1GetGlobalSPI(projects);
  const resourceEff = l1GetResourceEfficiency(projects);
  const budget = l1GetTotalBudget(projects);
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
  if (role === "CEO") {
    if (selectedProject) {
      return ["CEO", "Executive Dashboard", selectedProject.name];
    }
    return ["CEO", "Executive Dashboard"];
  }
  if (role === "CTO") {
    const base = ["Dashboard", L1_TAB_LABELS[l1Tab]];
    if (selectedProject && l1Tab === "portfolio") {
      return [...base, selectedProject.name];
    }
    return base;
  }
  if (role === "Engineer") {
    const engLabels: Record<string, string> = {
      dashboard: "Dashboard", tasks: "Công việc",
      timesheet: "Chấm công", calendar: "Lịch & Họp",
      profile: "Hồ sơ & Cài đặt",
    };
    return ["Engineer", engLabels[engTab] ?? engTab];
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
  const [viewRole, setViewRole]         = useState<ViewRole>("CTO");
  const [showRoleDrop, setShowRoleDrop] = useState(false);
  const roleDropRef                     = useRef<HTMLDivElement>(null);

  /** List vs Workflow / Tree — all roles */
  const [workspaceViewMode, setWorkspaceViewMode] = useState<WorkspaceViewMode>("list");

  // L1 state — portfolio copy stays in sync across List / Workflow Canvas
  const [l1Tab, setL1Tab] = useState<L1Tab>("portfolio");
  const [selectedProject, setSelectedProject] = useState<L1Project | null>(null);
  const [portfolioProjects, setPortfolioProjects] = useState<L1Project[]>(() => [...L1_PROJECTS]);

  const patchPortfolioProject = useCallback((id: string, patch: Partial<L1Project>) => {
    setPortfolioProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSelectedProject((sp) => (sp?.id === id ? { ...sp, ...patch } : sp));
  }, []);

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
    else {
      setL1Tab("portfolio");
      setPortfolioProjects([...L1_PROJECTS]);
    }
    setWorkspaceViewMode("list");
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

  // ── Content renderer — List vs Workflow applies to every role ────────────
  function renderContent() {
    const wf = workspaceViewMode === "workflow";

    if (viewRole === "Engineer") {
      return (
        <EngineerContent
          activeTab={engTab}
          onNavigate={setEngTab}
          workspaceViewMode={workspaceViewMode}
        />
      );
    }

    if (viewRole === "CEO") {
      if (selectedProject) {
        return (
          <ProjectDetail
            project={selectedProject}
            role="CEO"
            onBack={() => setSelectedProject(null)}
          />
        );
      }
      if (wf) {
        return (
          <WorkflowCanvas
            projects={portfolioProjects}
            onSelectProject={(p) => setSelectedProject(p)}
            onUpdateProject={patchPortfolioProject}
          />
        );
      }
      return <CEOExecutiveDashboard />;
    }

    if (viewRole === "CTO") {
      const role = viewRole;
      if (l1Tab === "portfolio" && selectedProject) {
        return (
          <ProjectDetail
            project={selectedProject}
            role={role}
            onBack={() => setSelectedProject(null)}
          />
        );
      }

      if (wf) {
        if (l1Tab === "portfolio") {
          return (
            <div className="space-y-6">
              <L1KPIs role={role} projects={portfolioProjects} />
              <AnimatePresence mode="wait">
                <motion.div
                  key="cto-wf-portfolio"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <WorkflowCanvas
                    projects={portfolioProjects}
                    onSelectProject={(p) => setSelectedProject(p)}
                    onUpdateProject={patchPortfolioProject}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          );
        }
        return (
          <WorkflowTabPlaceholder
            title={`Workflow — ${L1_TAB_LABELS[l1Tab]}`}
            hint="Chuyển sang Danh sách để dùng đầy đủ tab này, hoặc mở Danh mục dự án để xem canvas portfolio."
          />
        );
      }

      switch (l1Tab) {
        case "portfolio":
          return (
            <div className="space-y-6">
              <L1KPIs role={role} projects={portfolioProjects} />
              <AnimatePresence mode="wait">
                <motion.div
                  key="cto-list-portfolio"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <PortfolioTab
                    projects={portfolioProjects}
                    viewMode="cto"
                    onSelectProject={(p) => setSelectedProject(p)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          );
        case "people":
          return <PeopleTab />;
        case "meetings":
          return <MeetingsTab />;
        case "archive":
          return <ArchiveTab projects={portfolioProjects} />;
        case "permissions":
          return <PermissionsTab />;
        case "quality":
          return <PlaceholderView title="Chất lượng" />;
        case "risk":
          return <PlaceholderView title="Rủi ro" />;
        default:
          return null;
      }
    }

    // PM
    if (!pmProject) {
      if (wf) {
        if (pmHomeView === "projects") {
          return (
            <PmWorkflowCanvas projects={PM_PROJECTS} onSelectProject={handleSelectProject} />
          );
        }
        return (
          <WorkflowTabPlaceholder
            title={`Workflow — ${PM_HOME_LABELS[pmHomeView]}`}
            hint="Canvas workflow cho mục này đang được mở rộng. Dùng Danh sách để làm việc đầy đủ."
          />
        );
      }
      if (pmHomeView === "workspace") return <PMWorkspace />;
      if (pmHomeView === "notifications") return <NotificationsTab />;
      return <PMHome onSelectProject={handleSelectProject} />;
    }

    if (wf) {
      return (
        <PmProjectWorkflowCanvas
          project={pmProject}
          onTaskClick={() => {
            setWorkspaceViewMode("list");
            setPmTab("kanban");
          }}
        />
      );
    }

    switch (pmTab) {
      case "phases":
        return <PhasePlanTab project={pmProject} onTaskClick={() => setPmTab("kanban")} />;
      case "kanban":
        return <KanbanTab project={pmProject} onTaskUpdate={() => {}} />;
      case "resource":
        return <ResourceTab project={pmProject} />;
      case "timesheets":
        return <TimesheetApprovalTab project={pmProject} />;
      case "reminders":
        return <NotificationsTab />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* LinkSafe CRM: primary navigation in header (no left sidebar) */}
      <div className="z-40 shrink-0 bg-[#063986] text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2 sm:px-4">
          <CrmHeaderBrand />
          <CrmHeaderNav
            role={viewRole}
            l1Tab={l1Tab}
            setL1Tab={handleSetL1Tab}
            pmHomeView={pmHomeView}
            setPmHomeView={(v) => {
              setPmHomeView(v);
              setWorkspaceViewMode("list");
            }}
            pmProject={pmProject}
            pmTab={pmTab}
            setPmTab={(t) => {
              setPmTab(t);
              setWorkspaceViewMode("list");
            }}
            onPmBack={handlePmBack}
            engTab={engTab}
            setEngTab={(t) => {
              setEngTab(t);
              setWorkspaceViewMode("list");
            }}
          />
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <ViewToggle
              variant="dark"
              value={workspaceViewMode}
              onChange={setWorkspaceViewMode}
              className="shrink-0"
            />
            <div className="relative shrink-0" ref={roleDropRef}>
              <button
                type="button"
                onClick={() => setShowRoleDrop(!showRoleDrop)}
                className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
              >
                Vai trò: <span className="font-bold">{viewRole}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showRoleDrop && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-white shadow-lg">
                  {ROLE_OPTIONS.map(({ role, title, desc }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "flex w-full items-start justify-between gap-2 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0",
                        viewRole === role ? "bg-primary/5" : "hover:bg-slate-50"
                      )}
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{title}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      {viewRole === role && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (viewRole === "PM") {
                  setPmProject(null);
                  setPmHomeView("workspace");
                } else setL1Tab("meetings");
              }}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white sm:flex"
              style={{ backgroundColor: "#E36C25" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Tạo lịch họp
            </button>
            <button
              type="button"
              className="relative rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Thông báo"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#E36C25" }}
            >
              AM
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-white px-4 py-1.5 text-[11px] text-muted-foreground">
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
              <span
                className={cn(
                  "truncate",
                  i === breadcrumbs.length - 1 ? "font-semibold text-foreground" : ""
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <main className="min-h-0 flex-1 overflow-auto px-4 py-5 md:px-6 space-y-5">
        {(viewRole !== "PM" || !pmProject) &&
          viewRole !== "Engineer" &&
          viewRole !== "CEO" &&
          !selectedProject && (
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-foreground font-sans">
                {viewRole === "PM" ? PM_HOME_LABELS[pmHomeView] : L1_TAB_LABELS[l1Tab]}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {viewRole === "CTO" && l1Tab === "portfolio" && "22 dự án · CTO Strategic"}
                {viewRole === "PM" && pmHomeView === "projects" && "Alice Morgan — 3 dự án được giao"}
                {viewRole === "PM" && pmHomeView === "workspace" && "Việc cần làm & lịch họp cá nhân"}
                {viewRole === "PM" && pmHomeView === "notifications" && "Cấu hình quy tắc nhắc nhở"}
              </p>
            </div>
          )}
        {renderContent()}
      </main>
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
