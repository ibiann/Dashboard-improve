"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Info } from "lucide-react";
import {
  PMProject, PMPhase, PMTask,
  getProjectProgress, getPhaseProgress, getRAGColor, getRAGLabel, getSPIBadge,
  getAllTasks,
} from "@/lib/pm-mock-data";

// ──────────────────────────────────────────────────────────────────────────────
// Gantt helpers
// ──────────────────────────────────────────────────────────────────────────────

const TODAY_STR = "2026-03-24";

function dateToMs(d: string) { return new Date(d + "T00:00:00").getTime(); }

function calcBarStyle(startDate: string, endDate: string, projectStart: string, projectEnd: string): React.CSSProperties {
  const total = dateToMs(projectEnd) - dateToMs(projectStart);
  if (total <= 0) return {};
  const left = Math.max(0, (dateToMs(startDate) - dateToMs(projectStart)) / total) * 100;
  const width = Math.min(100 - left, (dateToMs(endDate) - dateToMs(startDate)) / total * 100);
  return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
}

function calcTodayStyle(projectStart: string, projectEnd: string): React.CSSProperties {
  const total = dateToMs(projectEnd) - dateToMs(projectStart);
  if (total <= 0) return { display: "none" };
  const left = Math.min(100, Math.max(0, (dateToMs(TODAY_STR) - dateToMs(projectStart)) / total * 100));
  return { left: `${left}%` };
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase Plan Tab
// ──────────────────────────────────────────────────────────────────────────────

const PHASE_COLORS = ["#063986", "#4CABEB", "#E36C25", "#22c55e", "#9b7b94", "#f59e0b"];

function TaskStatusBadge({ status }: { status: PMTask["status"] }) {
  const map: Record<string, string> = {
    "New": "#9ca3af",
    "In Progress": "#4CABEB",
    "Waiting for Review": "#f59e0b",
    "Done": "#22c55e",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: map[status] ?? "#9ca3af" }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: PMTask["priority"] }) {
  const map: Record<string, string> = { Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444" };
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ color: map[priority] ?? "#9ca3af", backgroundColor: (map[priority] ?? "#9ca3af") + "18" }}>
      {priority}
    </span>
  );
}

interface PhaseCardProps {
  phase: PMPhase;
  index: number;
  projectStart: string;
  projectEnd: string;
  onTaskClick: (task: PMTask) => void;
}

function PhaseCard({ phase, index, projectStart, projectEnd, onTaskClick }: PhaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const progress = getPhaseProgress(phase);
  const color = PHASE_COLORS[index % PHASE_COLORS.length];

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Phase header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{phase.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{phase.weight}% weight</span>
            <span className="text-[10px] text-muted-foreground">{phase.startDate} – {phase.endDate}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color }}>{progress}%</span>
            <span className="text-[10px] text-muted-foreground">{phase.tasks.length} tasks</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Gantt row */}
      <div className="px-4 pb-3 relative">
        <div className="h-5 bg-muted rounded-md relative overflow-hidden">
          <div
            className="absolute h-full rounded-md transition-all opacity-80"
            style={{ ...calcBarStyle(phase.startDate, phase.endDate, projectStart, projectEnd), backgroundColor: color }}
          />
          <div
            className="absolute top-0 bottom-0 w-px z-10"
            style={{ ...calcTodayStyle(projectStart, projectEnd), backgroundColor: "#ef4444" }}
          />
        </div>
      </div>

      {/* Expanded task table */}
      {expanded && phase.tasks.length > 0 && (
        <div className="border-t border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground text-[10px] uppercase tracking-wide">
                <th className="px-4 py-2 font-semibold">Task</th>
                <th className="px-3 py-2 font-semibold">Assignee</th>
                <th className="px-3 py-2 font-semibold">Priority</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Progress</th>
                <th className="px-3 py-2 font-semibold">Due</th>
              </tr>
            </thead>
            <tbody>
              {phase.tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t border-border hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-foreground">{task.title}</span>
                    <span className="ml-2 text-[9px] text-muted-foreground font-mono">{task.id}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold" style={{ backgroundColor: "#063986" }}>
                      {task.assigneeInitials}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-3 py-2.5"><TaskStatusBadge status={task.status} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${task.progressPercent}%` }} />
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">{task.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{task.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {expanded && phase.tasks.length === 0 && (
        <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border">Chua co task nao trong phase nay</p>
      )}
    </div>
  );
}

interface PhasePlanTabProps {
  project: PMProject;
  onTaskClick: (task: PMTask) => void;
}

export function PhasePlanTab({ project, onTaskClick }: PhasePlanTabProps) {
  const totalWeight = project.phases.reduce((s, p) => s + p.weight, 0);
  const overallProgress = getProjectProgress(project);
  const isWeightValid = totalWeight === 100;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Overall Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-40 h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${overallProgress}%`, backgroundColor: getRAGColor(project.ragStatus) }} />
              </div>
              <span className="text-sm font-extrabold font-mono" style={{ color: getRAGColor(project.ragStatus) }}>{overallProgress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Phase weights</p>
            <p className={`text-sm font-bold font-mono mt-1 ${isWeightValid ? "text-success" : "text-danger"}`}>{totalWeight}% {isWeightValid ? "(valid)" : "(must = 100%)"}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Timeline</p>
            <p className="text-sm font-semibold text-foreground mt-1 font-mono">{project.startDate} – {project.endDate}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="w-3 h-3 border-r-2 border-red-500" />
            <span>Today ({TODAY_STR})</span>
          </div>
        </div>
      </div>

      {/* Phase cards */}
      {project.phases.map((phase, i) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          index={i}
          projectStart={project.startDate}
          projectEnd={project.endDate}
          onTaskClick={onTaskClick}
        />
      ))}

      {/* Add phase button (placeholder) */}
      <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/60 hover:bg-muted/30 transition-colors">
        <Plus className="w-4 h-4" />
        Them phase moi
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Resource Tab
// ──────────────────────────────────────────────────────────────────────────────

export function ResourceTab({ project }: { project: PMProject }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {project.team.map((member) => {
          const pct = member.plannedHours > 0 ? Math.round((member.loggedHours / member.plannedHours) * 100) : 0;
          const barColor = pct >= 90 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#22c55e";
          return (
            <div key={member.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#063986" }}>
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Hours logged</span>
                    <span className="font-mono font-semibold text-foreground">{member.loggedHours}h / {member.plannedHours}h</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                  </div>
                  <p className="text-[9px] text-right mt-0.5 font-mono" style={{ color: barColor }}>{pct}%</p>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Active tasks</span>
                  <span className="font-semibold text-foreground font-mono">{member.activeTasks}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team summary */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <h3 className="text-xs font-bold text-foreground mb-3">Team Summary</h3>
        <div className="flex items-center gap-6 flex-wrap text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground font-mono">{project.teamSize}</span> thanh vien
          </div>
          <div>
            <span className="font-semibold text-foreground font-mono">{project.totalLoggedHours.toLocaleString()}h</span> da log
          </div>
          <div>
            <span className="font-semibold text-foreground font-mono">{project.totalPlannedHours.toLocaleString()}h</span> ke hoach
          </div>
          <div>
            <span className="font-semibold text-foreground font-mono">
              {Math.round((project.totalLoggedHours / project.totalPlannedHours) * 100)}%
            </span> su dung nguon luc
          </div>
        </div>
      </div>
    </div>
  );
}
