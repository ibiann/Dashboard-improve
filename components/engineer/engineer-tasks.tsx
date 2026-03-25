"use client";

import { useState } from "react";
import { Search, Play, Pause, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENG_TASKS, EngTask } from "@/lib/engineer-mock-data";

function TaskCard({
  task,
  runningId,
  onToggle,
  onClick,
  timerElapsed,
}: {
  task: EngTask;
  runningId: string | null;
  onToggle: (id: string) => void;
  onClick: (id: string) => void;
  timerElapsed: number;
}) {
  const isRunning = runningId === task.id;
  const locked = task.status === "Waiting for Review" || task.status === "Done";
  const progress = task.plannedHours > 0
    ? Math.min(100, Math.round((task.loggedHours / task.plannedHours) * 100))
    : 0;

  function formatTimer(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const priorityColor: Record<string, string> = {
    Critical: "#DC2626", High: "#F59E0B", Medium: "#3B82F6", Low: "#6B7280",
  };
  const statusBg: Record<string, string> = {
    "New":                "bg-blue-100 text-blue-700",
    "In Progress":        "bg-amber-100 text-amber-700",
    "Waiting for Review": "bg-purple-100 text-purple-700",
    "Done":               "bg-green-100 text-green-700",
    "Rejected":           "bg-red-100 text-red-700",
  };

  return (
    <div
      className="bg-white border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onClick(task.id)}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          disabled={locked}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
            isRunning ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600",
            locked && "opacity-40 cursor-not-allowed"
          )}
          aria-label={isRunning ? "Pause" : "Play"}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {task.id}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: priorityColor[task.priority] ?? "#6B7280" }}
            >
              {task.priority}
            </span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusBg[task.status] ?? "bg-muted text-muted-foreground")}>
              {task.status}
            </span>
            {task.subtasks.length > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-foreground mt-1">{task.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{task.projectId} · {task.projectName}</p>
        </div>
        {isRunning && (
          <span className="text-xs font-mono text-green-600 font-bold shrink-0 tabular-nums">
            {formatTimer(timerElapsed)}
          </span>
        )}
      </div>

      {/* Rejection alert */}
      {task.status === "Rejected" && task.rejectionReason && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-red-700">PM từ chối — {task.rejectedBy}</p>
            <p className="text-[11px] text-red-600 mt-0.5 line-clamp-2">{task.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Progress bar + hours */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? "#10B981" : progress >= 60 ? "#F59E0B" : "#3B82F6",
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
          {task.loggedHours}h / {task.plannedHours}h
        </span>
        <span className="text-[10px] font-mono font-bold" style={{ color: progress === 100 ? "#10B981" : "#F59E0B" }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

export function EngineerTasks({
  runningId,
  onToggle,
  onTaskClick,
  timerElapsed,
}: {
  runningId: string | null;
  onToggle: (id: string) => void;
  onTaskClick: (id: string) => void;
  timerElapsed: number;
}) {
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const projects = Array.from(new Set(ENG_TASKS.map((t) => t.projectId)));

  const filtered = ENG_TASKS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === "all" || t.projectId === filterProject;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchProject && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Tất cả dự án</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Waiting for Review">Waiting for Review</option>
          <option value="Done">Done</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Không tìm thấy task nào.</p>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              runningId={runningId}
              onToggle={onToggle}
              onClick={onTaskClick}
              timerElapsed={timerElapsed}
            />
          ))
        )}
      </div>
    </div>
  );
}
