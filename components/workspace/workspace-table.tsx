"use client";

import { PMProject, PMTask, getAllTasks } from "@/lib/pm-mock-data";
import type { WorkspaceRole } from "@/components/workspace/workspace-types";
import { AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<PMTask["status"], string> = {
  "New": "#9ca3af",
  "In Progress": "#4CABEB",
  "Waiting for Review": "#E36C25",
  "Done": "#22c55e",
};

const PRIORITY_COLORS: Record<PMTask["priority"], string> = {
  Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444",
};

const PHASE_COLORS = ["#063986", "#4CABEB", "#E36C25", "#22c55e", "#f59e0b", "#9b7b94"];

interface TableProps {
  project: PMProject;
  role: WorkspaceRole;
  onTaskClick: (task: PMTask) => void;
}

export function WorkspaceTable({ project, role, onTaskClick }: TableProps) {
  const allTasks = getAllTasks(project);

  // Build phase color map
  const phaseColorMap: Record<string, string> = {};
  project.phases.forEach((ph, i) => {
    phaseColorMap[ph.name] = PHASE_COLORS[i % PHASE_COLORS.length];
  });

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/60 text-left text-muted-foreground text-[10px] uppercase tracking-widest border-b border-border">
              <th className="px-3 py-2.5 font-semibold w-16">ID</th>
              <th className="px-3 py-2.5 font-semibold">Tên task</th>
              <th className="px-3 py-2.5 font-semibold w-24">Phase</th>
              <th className="px-3 py-2.5 font-semibold w-24">Assignee</th>
              <th className="px-3 py-2.5 font-semibold w-20">Priority</th>
              <th className="px-3 py-2.5 font-semibold w-32">Status</th>
              <th className="px-3 py-2.5 font-semibold w-28">Progress</th>
              <th className="px-3 py-2.5 font-semibold w-20">Planned h</th>
              <th className="px-3 py-2.5 font-semibold w-20">Logged h</th>
              <th className="px-3 py-2.5 font-semibold w-20">Pending h</th>
              <th className="px-3 py-2.5 font-semibold w-24">Due date</th>
              {role === "engineer" && <th className="px-3 py-2.5 font-semibold w-20" />}
            </tr>
          </thead>
          <tbody>
            {allTasks.map((task, idx) => {
              const isOverdue = task.progressPercent < 100 && task.dueDate < "2026-03-24";
              const phaseColor = phaseColorMap[task.phase] ?? "#9ca3af";

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "border-b border-border/60 last:border-b-0 cursor-pointer transition-colors hover:bg-muted/20 group",
                    idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                  )}
                  style={{ height: "36px" }}
                >
                  {/* ID */}
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-muted-foreground text-[9px]">{task.id}</span>
                  </td>

                  {/* Title */}
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-xs">
                        {task.title}
                      </span>
                      {isOverdue && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
                    </div>
                  </td>

                  {/* Phase */}
                  <td className="px-3 py-1.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: phaseColor }}
                    >
                      {task.phase}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#063986" }}
                      >
                        {task.assigneeInitials}
                      </span>
                      <span className="text-[10px] text-foreground truncate">{task.assignee}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-1.5">
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: PRIORITY_COLORS[task.priority] }}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-1.5">
                    <span
                      className="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[task.status] }}
                    >
                      {task.status}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${task.progressPercent}%`, backgroundColor: phaseColor }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{task.progressPercent}%</span>
                    </div>
                  </td>

                  {/* Hours */}
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-[10px] text-foreground">{task.plannedHours}h</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-[10px] text-success">{task.approvedHours}h</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={cn("font-mono text-[10px]", task.pendingHours > 0 ? "text-warning font-bold" : "text-muted-foreground")}>
                      {task.pendingHours}h
                    </span>
                  </td>

                  {/* Due */}
                  <td className="px-3 py-1.5">
                    <span className={cn("font-mono text-[10px]", isOverdue ? "text-destructive font-bold" : "text-muted-foreground")}>
                      {task.dueDate}
                    </span>
                  </td>

                  {/* Engineer action */}
                  {role === "engineer" && (
                    <td className="px-3 py-1.5">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[9px] font-semibold text-primary hover:opacity-70 transition-opacity"
                      >
                        <Plus className="w-3 h-3" />
                        Sub-task
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center gap-6 flex-wrap text-[10px] text-muted-foreground">
        <span><span className="font-mono font-bold text-foreground">{allTasks.length}</span> tasks</span>
        <span>
          <span className="font-mono font-bold text-foreground">
            {allTasks.reduce((s, t) => s + t.plannedHours, 0)}h
          </span> kế hoạch
        </span>
        <span>
          <span className="font-mono font-bold text-success">
            {allTasks.reduce((s, t) => s + t.approvedHours, 0)}h
          </span> đã duyệt
        </span>
        <span>
          <span className="font-mono font-bold text-warning">
            {allTasks.reduce((s, t) => s + t.pendingHours, 0)}h
          </span> chờ duyệt
        </span>
      </div>
    </div>
  );
}
