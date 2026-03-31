"use client";

import { PMProject, PMPhase, PMTask, getPhaseProgress } from "@/lib/pm-mock-data";
import type { WorkspaceRole } from "@/components/workspace/workspace-types";
import { ChevronDown, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PHASE_COLORS = ["#063986", "#4CABEB", "#E36C25", "#22c55e", "#f59e0b", "#9b7b94"];

const STATUS_COLORS: Record<PMTask["status"], string> = {
  "New": "#9ca3af",
  "In Progress": "#4CABEB",
  "Waiting for Review": "#E36C25",
  "Done": "#22c55e",
};

const PRIORITY_COLORS: Record<PMTask["priority"], string> = {
  Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444",
};

function PhaseGroup({
  phase,
  index,
  role,
  onTaskClick,
}: {
  phase: PMPhase;
  index: number;
  role: WorkspaceRole;
  onTaskClick: (task: PMTask) => void;
}) {
  const [open, setOpen] = useState(true);
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  const progress = getPhaseProgress(phase);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Phase header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold text-foreground">{phase.name}</span>
        <span className="text-[9px] text-muted-foreground font-mono">{phase.weight}% weight</span>
        <span className="text-[9px] text-muted-foreground">{phase.startDate} – {phase.endDate}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
          </div>
          <span className="text-[9px] font-mono font-bold" style={{ color }}>{progress}%</span>
          <span className="text-[9px] text-muted-foreground font-mono">{phase.tasks.length} tasks</span>
        </div>
      </button>

      {/* Task rows */}
      {open && (
        <div className="border-t border-border">
          {phase.tasks.map((task) => {
            const isOverdue = task.progressPercent < 100 && task.dueDate < "2026-03-24";
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="flex items-center gap-3 px-4 py-2 border-b border-border/60 last:border-b-0 hover:bg-muted/20 cursor-pointer transition-colors group"
                style={{ minHeight: "36px" }}
              >
                {/* Status dot */}
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] }} />

                {/* ID */}
                <span className="text-[9px] font-mono text-muted-foreground w-12 shrink-0">{task.id}</span>

                {/* Title */}
                <span className="flex-1 text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {task.title}
                  {isOverdue && <AlertTriangle className="w-3 h-3 text-destructive inline ml-1.5 -mt-0.5" />}
                </span>

                {/* Assignee */}
                <span
                  className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#063986" }}
                >
                  {task.assigneeInitials}
                </span>

                {/* Priority */}
                <span
                  className="text-[9px] font-bold w-14 text-right shrink-0"
                  style={{ color: PRIORITY_COLORS[task.priority] }}
                >
                  {task.priority}
                </span>

                {/* Status label */}
                <span
                  className="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full w-28 text-center shrink-0 truncate"
                  style={{ backgroundColor: STATUS_COLORS[task.status] }}
                >
                  {task.status}
                </span>

                {/* Progress */}
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${task.progressPercent}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{task.progressPercent}%</span>
                </div>

                {/* Due */}
                <span className="text-[9px] text-muted-foreground font-mono w-20 text-right shrink-0">{task.dueDate}</span>

                {/* Engineer sub-task button */}
                {role === "engineer" && (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[9px] font-semibold text-primary hover:opacity-70 transition-opacity shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    Sub-task
                  </button>
                )}
              </div>
            );
          })}
          {phase.tasks.length === 0 && (
            <p className="px-4 py-2.5 text-[10px] text-muted-foreground italic">Chưa có task trong phase này</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ListProps {
  project: PMProject;
  role: WorkspaceRole;
  onTaskClick: (task: PMTask) => void;
}

export function WorkspaceList({ project, role, onTaskClick }: ListProps) {
  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="w-2 h-2 shrink-0" />
        <span className="w-12 shrink-0">ID</span>
        <span className="flex-1">Tên task</span>
        <span className="w-6 shrink-0" />
        <span className="w-14 text-right shrink-0">Priority</span>
        <span className="w-28 text-center shrink-0">Status</span>
        <span className="w-20 shrink-0">Progress</span>
        <span className="w-20 text-right shrink-0">Due date</span>
        {role === "engineer" && <span className="w-16 shrink-0" />}
      </div>

      {project.phases.map((phase, i) => (
        <PhaseGroup key={phase.id} phase={phase} index={i} role={role} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
}
