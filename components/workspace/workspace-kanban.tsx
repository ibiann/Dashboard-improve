"use client";

import { PMProject, PMTask, getAllTasks } from "@/lib/pm-mock-data";
import type { WorkspaceRole } from "@/components/workspace/workspace-types";
import { Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type KanbanColumn = {
  id: PMTask["status"];
  label: string;
  color: string;
  bg: string;
};

const COLUMNS: KanbanColumn[] = [
  { id: "New",                label: "Mới",              color: "#9ca3af", bg: "#f9fafb" },
  { id: "In Progress",        label: "Đang làm",         color: "#4CABEB", bg: "#eff8ff" },
  { id: "Waiting for Review", label: "Chờ duyệt",        color: "#E36C25", bg: "#fff7ed" },
  { id: "Done",               label: "Hoàn thành",       color: "#22c55e", bg: "#f0fdf4" },
];

const PRIORITY_COLORS: Record<PMTask["priority"], string> = {
  Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444",
};

function KanbanCard({
  task,
  role,
  onClick,
}: {
  task: PMTask;
  role: WorkspaceRole;
  onClick: () => void;
}) {
  const isOverdue = task.progressPercent < 100 && task.dueDate < "2026-03-24";
  const isPending = task.status === "Waiting for Review";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-lg border shadow-sm p-3 hover:shadow-md transition-all group",
        isPending ? "animate-pulse-border border-warning" : "border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-[9px] font-mono text-muted-foreground">{task.id}</span>
        <div className="flex items-center gap-1">
          {isOverdue && <AlertTriangle className="w-3 h-3 text-destructive" />}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ color: PRIORITY_COLORS[task.priority], backgroundColor: PRIORITY_COLORS[task.priority] + "18" }}
          >
            {task.priority}
          </span>
        </div>
      </div>

      <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
        {task.title}
      </p>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold shrink-0"
          style={{ backgroundColor: "#063986" }}
        >
          {task.assigneeInitials}
        </span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${task.progressPercent}%` }} />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">{task.progressPercent}%</span>
      </div>

      {/* Phase tag */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">{task.phase}</span>
        {role === "engineer" && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] font-semibold text-primary hover:opacity-70 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            Sub-task
          </button>
        )}
      </div>
    </button>
  );
}

interface KanbanProps {
  project: PMProject;
  role: WorkspaceRole;
  onTaskClick: (task: PMTask) => void;
}

export function WorkspaceKanban({ project, role, onTaskClick }: KanbanProps) {
  const allTasks = getAllTasks(project);

  return (
    <div className="flex gap-4 items-start overflow-x-auto pb-4 min-h-full">
      {COLUMNS.map((col) => {
        const tasks = allTasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="flex-1 min-w-64 max-w-80 shrink-0 flex flex-col gap-2">
            {/* Column header */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{ backgroundColor: col.bg, borderColor: col.color + "30" }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-xs font-bold" style={{ color: col.color }}>{col.label}</span>
              <span
                className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: col.color }}
              >
                {tasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <KanbanCard key={task.id} task={task} role={role} onClick={() => onTaskClick(task)} />
              ))}
              {tasks.length === 0 && (
                <div className="py-6 text-center text-[10px] text-muted-foreground border border-dashed border-border rounded-lg bg-white/50">
                  Chưa có task
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
