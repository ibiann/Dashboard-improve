"use client";

import { useState } from "react";
import {
  Folder, ClipboardList, Bell, ChevronLeft, ChevronRight,
  Layers, Kanban, Users, Clock, Menu, Plus,
  Home, LayoutGrid,
} from "lucide-react";
import { PM_PROJECTS, PMProject, getProjectProgress, getRAGColor, getRAGLabel, getSPIBadge, getAllTasks } from "@/lib/pm-mock-data";
import { PMHome } from "@/components/pm/pm-home";
import { PMWorkspace } from "@/components/pm/pm-workspace";
import { PhasePlanTab, ResourceTab } from "@/components/pm/pm-project-detail";
import { KanbanTab } from "@/components/pm/pm-kanban";
import { TimesheetApprovalTab } from "@/components/pm/pm-timesheets";
import { NotificationsTab } from "@/components/pm/pm-notifications";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type HomeView = "projects" | "workspace" | "notifications";
type ProjectTab = "phases" | "kanban" | "resource" | "timesheets" | "reminders";

// ──────────────────────────────────────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeProject: PMProject | null;
  activeHomeView: HomeView;
  activeProjectTab: ProjectTab;
  onHomeNav: (view: HomeView) => void;
  onProjectTab: (tab: ProjectTab) => void;
  onBack: () => void;
}

function Sidebar({
  collapsed, setCollapsed, activeProject,
  activeHomeView, activeProjectTab,
  onHomeNav, onProjectTab, onBack,
}: SidebarProps) {
  const isProject = !!activeProject;

  const homeItems: { key: HomeView; label: string; icon: React.ReactNode }[] = [
    { key: "projects",      label: "Du an cua toi",   icon: <Folder className="w-4 h-4" /> },
    { key: "workspace",     label: "Workspace",        icon: <ClipboardList className="w-4 h-4" /> },
    { key: "notifications", label: "Nhac viec",        icon: <Bell className="w-4 h-4" /> },
  ];

  const projectItems: { key: ProjectTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "phases",     label: "Phase Plan",  icon: <Layers className="w-4 h-4" /> },
    { key: "kanban",     label: "Task Kanban", icon: <LayoutGrid className="w-4 h-4" />, badge: activeProject ? getAllTasks(activeProject).filter((t) => t.status === "Waiting for Review").length : 0 },
    { key: "resource",   label: "Resource",    icon: <Users className="w-4 h-4" /> },
    { key: "timesheets", label: "Timesheets",  icon: <Clock className="w-4 h-4" />, badge: activeProject?.pendingTimesheetCount },
    { key: "reminders",  label: "Nhac viec",   icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-200"
      style={{ width: collapsed ? 56 : 220, backgroundColor: "#063986", minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight truncate">PM Workspace</p>
            <p className="text-white/50 text-[9px] font-semibold tracking-widest uppercase mt-0.5">LEVEL 2 — PM</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/50 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {isProject ? (
          <>
            {/* Back button */}
            <button
              onClick={onBack}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-xs font-semibold truncate">Danh sach du an</span>}
            </button>
            <div className="h-px bg-white/10 my-1.5" />
            {projectItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onProjectTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  activeProjectTab === item.key
                    ? "text-white font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                style={activeProjectTab === item.key ? { backgroundColor: "#E36C25" } : {}}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="flex-1 text-xs truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && item.badge > 0 ? (
                  <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full font-mono flex-shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </>
        ) : (
          homeItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onHomeNav(item.key)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                activeHomeView === item.key
                  ? "text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              style={activeHomeView === item.key ? { backgroundColor: "#E36C25" } : {}}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-xs truncate">{item.label}</span>}
            </button>
          ))
        )}
      </nav>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Top Bar
// ──────────────────────────────────────────────────────────────────────────────

interface TopBarProps {
  activeProject: PMProject | null;
  activeHomeView: HomeView;
  activeProjectTab: ProjectTab;
  onCreateMeeting: () => void;
}

const HOME_LABELS: Record<HomeView, string> = {
  projects: "Du an cua toi",
  workspace: "Workspace",
  notifications: "Nhac viec",
};

const TAB_LABELS: Record<ProjectTab, string> = {
  phases: "Phase Plan",
  kanban: "Task Kanban",
  resource: "Resource",
  timesheets: "Timesheets",
  reminders: "Nhac viec",
};

function TopBar({ activeProject, activeHomeView, activeProjectTab, onCreateMeeting }: TopBarProps) {
  const breadcrumbs: string[] = ["PM Home"];
  if (activeProject) {
    breadcrumbs.push(activeProject.name);
    breadcrumbs.push(TAB_LABELS[activeProjectTab]);
  } else {
    breadcrumbs.push(HOME_LABELS[activeHomeView]);
  }

  return (
    <header className="h-12 bg-white border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* PM badge */}
      <span className="flex-shrink-0 text-[10px] font-extrabold text-white px-2 py-1 rounded-md" style={{ backgroundColor: "#063986" }}>
        PM
      </span>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 flex-1">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
            <span className={i === breadcrumbs.length - 1 ? "font-semibold text-foreground truncate" : "truncate"}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onCreateMeeting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg"
          style={{ backgroundColor: "#E36C25" }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tao lich hop</span>
        </button>
        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger" />
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#E36C25" }}>
          AM
        </div>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Project Header Strip
// ──────────────────────────────────────────────────────────────────────────────

function ProjectHeaderStrip({
  project,
  activeTab,
  onTabChange,
}: {
  project: PMProject;
  activeTab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
}) {
  const progress = getProjectProgress(project);
  const allTasks = getAllTasks(project);
  const reviewCount = allTasks.filter((t) => t.status === "Waiting for Review").length;

  const tabs: { key: ProjectTab; label: string; badge?: number }[] = [
    { key: "phases",     label: "Phase Plan" },
    { key: "kanban",     label: "Task Kanban", badge: reviewCount },
    { key: "resource",   label: "Resource" },
    { key: "timesheets", label: "Timesheets",  badge: project.pendingTimesheetCount },
    { key: "reminders",  label: "Nhac viec" },
  ];

  const ragColor = getRAGColor(project.ragStatus);

  return (
    <div className="bg-white border-b border-border flex-shrink-0">
      {/* Header strip */}
      <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
        {/* Left: ID + name + category */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{project.id}</span>
          <span className="text-sm font-bold text-foreground">{project.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: "#4CABEB" }}>{project.category}</span>
        </div>

        {/* Center: progress + SPI + hours */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: ragColor }} />
            </div>
            <span className="font-mono font-bold" style={{ color: ragColor }}>{progress}%</span>
          </div>
          <span>
            SPI <span className="font-semibold" style={{ color: getSPIBadge(project.spi).color }}>{project.spi.toFixed(2)}</span>
          </span>
          <span className="font-mono">{project.totalLoggedHours}h/{project.totalPlannedHours}h</span>
        </div>

        {/* Right: RAG */}
        <div className="ml-auto">
          <span className="text-[10px] font-bold text-white px-2 py-1 rounded-full" style={{ backgroundColor: ragColor }}>
            {getRAGLabel(project.ragStatus)}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-t border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.key
                ? "border-primary text-primary bg-muted/30"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
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

// ──────────────────────────────────────────────────────────────────────────────
// Main PM Dashboard
// ──────────────────────────────────────────────────────────────────────────────

export function PMDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeHomeView, setActiveHomeView] = useState<HomeView>("projects");
  const [activeProject, setActiveProject] = useState<PMProject | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectTab>("phases");
  const [updatedProjects, setUpdatedProjects] = useState<PMProject[]>(PM_PROJECTS);

  function handleSelectProject(projectId: string, tab?: string) {
    const project = updatedProjects.find((p) => p.id === projectId) ?? null;
    setActiveProject(project);
    setActiveProjectTab((tab as ProjectTab) ?? "phases");
  }

  function handleBack() {
    setActiveProject(null);
  }

  function handleHomeNav(view: HomeView) {
    setActiveHomeView(view);
    setActiveProject(null);
  }

  function handleTaskUpdate() {
    // In a real app this would sync back to a database
  }

  function renderContent() {
    if (!activeProject) {
      if (activeHomeView === "workspace") return <PMWorkspace />;
      if (activeHomeView === "notifications") return <NotificationsTab />;
      return <PMHome onSelectProject={handleSelectProject} />;
    }

    switch (activeProjectTab) {
      case "phases":
        return (
          <PhasePlanTab
            project={activeProject}
            onTaskClick={() => setActiveProjectTab("kanban")}
          />
        );
      case "kanban":
        return <KanbanTab project={activeProject} onTaskUpdate={handleTaskUpdate} />;
      case "resource":
        return <ResourceTab project={activeProject} />;
      case "timesheets":
        return <TimesheetApprovalTab project={activeProject} />;
      case "reminders":
        return <NotificationsTab />;
      default:
        return null;
    }
  }

  const pageTitle = activeProject
    ? TAB_LABELS[activeProjectTab]
    : HOME_LABELS[activeHomeView];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeProject={activeProject}
        activeHomeView={activeHomeView}
        activeProjectTab={activeProjectTab}
        onHomeNav={handleHomeNav}
        onProjectTab={setActiveProjectTab}
        onBack={handleBack}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeProject={activeProject}
          activeHomeView={activeHomeView}
          activeProjectTab={activeProjectTab}
          onCreateMeeting={() => {
            setActiveProject(null);
            setActiveHomeView("workspace");
          }}
        />

        {/* Project header strip (when inside a project) */}
        {activeProject && (
          <ProjectHeaderStrip
            project={activeProject}
            activeTab={activeProjectTab}
            onTabChange={setActiveProjectTab}
          />
        )}

        <main className="flex-1 px-4 py-5 md:px-6 space-y-5 overflow-auto">
          {/* Page heading (only on home views) */}
          {!activeProject && (
            <div>
              <h1 className="text-base font-extrabold text-foreground tracking-tight font-sans">
                {pageTitle}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeHomeView === "projects" && "Alice Morgan — 3 du an duoc giao"}
                {activeHomeView === "workspace" && "Viec can lam & lich hop ca nhan"}
                {activeHomeView === "notifications" && "Cau hinh quy tac nhac nho"}
              </p>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
