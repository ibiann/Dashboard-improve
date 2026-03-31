"use client";

import { useState } from "react";
import {
  GitBranch, LayoutGrid, List, Table, ChevronLeft,
  Plus, UserCheck, ClipboardCheck, Cpu, Users, Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PMProject, PMTask, getProjectProgress, getRAGColor, getSPIBadge, getAllTasks,
} from "@/lib/pm-mock-data";
import { WorkspaceCanvas } from "@/components/workspace/workspace-canvas";
import { WorkspaceKanban } from "@/components/workspace/workspace-kanban";
import { WorkspaceList } from "@/components/workspace/workspace-list";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { TaskDrawer } from "@/components/workspace/task-drawer";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type WorkspaceView = "canvas" | "kanban" | "list" | "table";
type WorkspaceRole = "management" | "engineer";

const VIEW_OPTIONS: { id: WorkspaceView; label: string; icon: React.ElementType }[] = [
  { id: "canvas",  label: "Sơ đồ",    icon: GitBranch },
  { id: "kanban",  label: "Kanban",   icon: LayoutGrid },
  { id: "list",    label: "Danh sách", icon: List },
  { id: "table",   label: "Bảng",     icon: Table },
];

const ROLE_OPTIONS: { id: WorkspaceRole; label: string }[] = [
  { id: "management", label: "Management (CEO/CTO/PM)" },
  { id: "engineer",   label: "Engineer" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Project Sidebar
// ─────────────────────────────────────────────────────────────────────────────

function WorkspaceSidebar({
  project,
  activeView,
  onViewChange,
  role,
  onRoleChange,
}: {
  project: PMProject;
  activeView: WorkspaceView;
  onViewChange: (v: WorkspaceView) => void;
  role: WorkspaceRole;
  onRoleChange: (r: WorkspaceRole) => void;
}) {
  const progress = getProjectProgress(project);
  const ragColor = getRAGColor(project.ragStatus);
  const spi = getSPIBadge(project.spi);
  const [showRoleDrop, setShowRoleDrop] = useState(false);

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-full border-r border-border bg-white"
      aria-label="Project sidebar"
    >
      {/* Back link */}
      <a
        href="/"
        className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors border-b border-border"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Dashboard
      </a>

      {/* Project identity */}
      <div className="px-3 py-3 border-b border-border space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#063986" }}>{project.id}</span>
          <span className="text-[10px] text-muted-foreground">{project.category}</span>
        </div>
        <p className="text-xs font-bold text-foreground leading-snug">{project.name}</p>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Tiến độ</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: ragColor }}>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: ragColor }} />
          </div>
        </div>

        {/* SPI */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">SPI</span>
          <span className="font-mono font-bold" style={{ color: spi.color }}>{project.spi.toFixed(2)} {spi.label}</span>
        </div>

        {/* Hours */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Giờ công</span>
          <span className="font-mono text-foreground font-semibold">{project.totalLoggedHours}h / {project.totalPlannedHours}h</span>
        </div>

        {/* Team */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Nhân sự</span>
          <span className="font-mono text-foreground font-semibold">{project.teamSize} người</span>
        </div>
      </div>

      {/* View nav */}
      <div className="px-2 py-2 border-b border-border">
        <p className="px-1 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Chế độ xem</p>
        <nav className="space-y-0.5" aria-label="Workspace views">
          {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              aria-current={activeView === id ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-left",
                activeView === id
                  ? "text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={activeView === id ? { backgroundColor: "#063986" } : undefined}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Phases quick list */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <p className="px-1 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Phases</p>
        <div className="space-y-0.5">
          {project.phases.map((phase, i) => {
            const COLORS = ["#063986", "#4CABEB", "#E36C25", "#22c55e", "#f59e0b", "#9b7b94"];
            const color = COLORS[i % COLORS.length];
            return (
              <div key={phase.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-foreground font-medium flex-1 truncate">{phase.name}</span>
                <span className="text-[9px] font-mono text-muted-foreground">{phase.weight}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role switcher */}
      <div className="px-2 py-2 border-t border-border">
        <p className="px-1 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Chế độ vai trò</p>
        <div className="relative">
          <button
            onClick={() => setShowRoleDrop(!showRoleDrop)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            {role === "management" ? <Users className="w-3.5 h-3.5 text-primary" /> : <Cpu className="w-3.5 h-3.5 text-primary" />}
            <span className="flex-1 truncate text-left">
              {role === "management" ? "Management" : "Engineer"}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showRoleDrop && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-border rounded-lg shadow-lg z-20 overflow-hidden">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { onRoleChange(r.id); setShowRoleDrop(false); }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-muted/50 transition-colors",
                    role === r.id && "font-semibold text-primary"
                  )}
                >
                  {r.id === "management" ? <Users className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Bar
// ─────────────────────────────────────────────────────────────────────────────

function ActionBar({
  role,
  activeView,
  pendingReviewCount,
}: {
  role: WorkspaceRole;
  activeView: WorkspaceView;
  pendingReviewCount: number;
}) {
  if (role === "management") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors hover:opacity-90"
          style={{ backgroundColor: "#063986" }}>
          <Plus className="w-3.5 h-3.5" />
          Thêm Phase
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors hover:opacity-90"
          style={{ backgroundColor: "#4CABEB" }}>
          <UserCheck className="w-3.5 h-3.5" />
          Phân công
        </button>
        {pendingReviewCount > 0 && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors hover:opacity-90"
            style={{ backgroundColor: "#E36C25" }}>
            <ClipboardCheck className="w-3.5 h-3.5" />
            Duyệt Log work
            <span className="ml-1 bg-white/25 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
              {pendingReviewCount}
            </span>
          </button>
        )}
      </div>
    );
  }
  // Engineer
  return (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors hover:opacity-90"
        style={{ backgroundColor: "#063986" }}>
        <Plus className="w-3.5 h-3.5" />
        Tạo Sub-task
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top Bar
// ─────────────────────────────────────────────────────────────────────────────

function TopBar({
  project,
  activeView,
  onViewChange,
  role,
  pendingReviewCount,
}: {
  project: PMProject;
  activeView: WorkspaceView;
  onViewChange: (v: WorkspaceView) => void;
  role: WorkspaceRole;
  pendingReviewCount: number;
}) {
  return (
    <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-border bg-white">
      {/* View switcher pills */}
      <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5" role="tablist" aria-label="View switcher">
        {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeView === id}
            onClick={() => onViewChange(id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded transition-colors",
              activeView === id
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Action bar */}
      <ActionBar role={role} activeView={activeView} pendingReviewCount={pendingReviewCount} />

      <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
        <Settings className="w-3.5 h-3.5" />
        <span>Cài đặt workspace</span>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Shell
// ─────────────────────────────────────────────────────────────────────────────

export function WorkspaceShell({ project }: { project: PMProject }) {
  const [activeView, setActiveView] = useState<WorkspaceView>("canvas");
  const [role, setRole] = useState<WorkspaceRole>("management");
  const [selectedTask, setSelectedTask] = useState<PMTask | null>(null);

  const allTasks = getAllTasks(project);
  const pendingReviewCount = allTasks.filter((t) => t.status === "Waiting for Review").length;

  function handleTaskClick(task: PMTask) {
    setSelectedTask(task);
  }

  function renderView() {
    const props = { project, role, onTaskClick: handleTaskClick };
    switch (activeView) {
      case "canvas":  return <WorkspaceCanvas {...props} />;
      case "kanban":  return <WorkspaceKanban {...props} />;
      case "list":    return <WorkspaceList   {...props} />;
      case "table":   return <WorkspaceTable  {...props} />;
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <WorkspaceSidebar
        project={project}
        activeView={activeView}
        onViewChange={setActiveView}
        role={role}
        onRoleChange={setRole}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar
          project={project}
          activeView={activeView}
          onViewChange={setActiveView}
          role={role}
          pendingReviewCount={pendingReviewCount}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-muted/30" aria-label="Workspace content">
          {renderView()}
        </main>
      </div>

      {/* Task Side Drawer */}
      <TaskDrawer
        task={selectedTask}
        role={role}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
