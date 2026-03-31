"use client";

import { PMProject, PMPhase, PMTask, getPhaseProgress } from "@/lib/pm-mock-data";
import type { WorkspaceRole } from "@/components/workspace/workspace-types";
import { Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASE_COLORS = ["#063986", "#4CABEB", "#E36C25", "#22c55e", "#f59e0b", "#9b7b94"];

const STATUS_COLORS: Record<PMTask["status"], string> = {
  "New": "#9ca3af",
  "In Progress": "#4CABEB",
  "Waiting for Review": "#f59e0b",
  "Done": "#22c55e",
};

function TaskNode({
  task,
  color,
  role,
  onClick,
}: {
  task: PMTask;
  color: string;
  role: WorkspaceRole;
  onClick: () => void;
}) {
  const statusColor = STATUS_COLORS[task.status];
  const isOverdue = task.progressPercent < 100 && task.dueDate < "2026-03-24";

  return (
    <button
      onClick={onClick}
      className="w-44 bg-white rounded-lg border border-border shadow-sm p-3 text-left hover:shadow-md hover:border-primary/40 transition-all group"
    >
      {/* Status bar */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: statusColor }}>
          {task.status}
        </span>
        {isOverdue && <AlertTriangle className="w-3 h-3 text-destructive ml-auto" />}
      </div>

      {/* Task ID + title */}
      <p className="text-[9px] font-mono text-muted-foreground mb-0.5">{task.id}</p>
      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </p>

      {/* Progress */}
      <div className="mt-2">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${task.progressPercent}%`, backgroundColor: color }} />
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[9px] font-mono text-muted-foreground">{task.progressPercent}%</span>
          <span className="text-[9px] text-muted-foreground">{task.assigneeInitials}</span>
        </div>
      </div>

      {/* Engineer sub-task button */}
      {role === "engineer" && (
        <div className="mt-2 pt-2 border-t border-border/60">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] font-semibold text-primary hover:opacity-70 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            Tạo Sub-task
          </button>
        </div>
      )}
    </button>
  );
}

function PhaseColumn({
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
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  const progress = getPhaseProgress(phase);

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Phase header node */}
      <div
        className="rounded-xl px-4 py-3 text-white shadow-md"
        style={{ backgroundColor: color }}
      >
        <p className="text-[9px] font-mono font-bold opacity-80 uppercase tracking-widest">Phase {index + 1}</p>
        <p className="text-sm font-bold">{phase.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-mono font-bold">{progress}%</span>
        </div>
        <p className="text-[9px] opacity-70 mt-1 font-mono">{phase.startDate} – {phase.endDate}</p>
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="w-px h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>

      {/* Task nodes */}
      <div className="flex flex-col gap-2 items-center">
        {phase.tasks.map((task, ti) => (
          <div key={task.id} className="flex flex-col items-center gap-0">
            <TaskNode task={task} color={color} role={role} onClick={() => onTaskClick(task)} />
            {ti < phase.tasks.length - 1 && (
              <div className="w-px h-2" style={{ backgroundColor: `${color}60` }} />
            )}
          </div>
        ))}
        {phase.tasks.length === 0 && (
          <div className="w-44 bg-white/60 border border-dashed border-border rounded-lg py-4 text-center">
            <p className="text-[10px] text-muted-foreground">Chưa có task</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkspaceCanvas
// ─────────────────────────────────────────────────────────────────────────────

interface CanvasProps {
  project: PMProject;
  role: WorkspaceRole;
  onTaskClick: (task: PMTask) => void;
}

export function WorkspaceCanvas({ project, role, onTaskClick }: CanvasProps) {
  return (
    <div className="min-h-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {(["New", "In Progress", "Waiting for Review", "Done"] as PMTask["status"][]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
            <span className="text-[10px] text-muted-foreground">{s}</span>
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground ml-auto font-mono">
          {project.phases.length} phases · {project.phases.reduce((s, p) => s + p.tasks.length, 0)} tasks
        </span>
      </div>

      {/* Canvas: horizontal phase flow */}
      <div className="flex gap-6 items-start pb-6 overflow-x-auto">
        {project.phases.map((phase, i) => (
          <div key={phase.id} className="flex items-start gap-0">
            <PhaseColumn phase={phase} index={i} role={role} onTaskClick={onTaskClick} />
            {i < project.phases.length - 1 && (
              <div className="flex items-center self-start mt-14 mx-1">
                <div
                  className="w-6 h-px"
                  style={{ backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length] }}
                />
                <div
                  className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent"
                  style={{ borderLeftColor: PHASE_COLORS[i % PHASE_COLORS.length] }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
