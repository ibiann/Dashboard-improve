"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Play, Pause, AlertTriangle, Clock, ChevronRight,
  CheckSquare, Square, MessageSquare, FileText, Info, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EngTask } from "@/lib/engineer-mock-data";

type DrawerTab = "overview" | "subtasks" | "chatter" | "logs" | "description";

const DRAWER_TABS: { key: DrawerTab; label: string; icon: React.ElementType }[] = [
  { key: "overview",     label: "Tổng quan",    icon: Info },
  { key: "subtasks",     label: "Sub-tasks",    icon: CheckSquare },
  { key: "chatter",      label: "Chatter",      icon: MessageSquare },
  { key: "logs",         label: "Log history",  icon: Clock },
  { key: "description",  label: "Mô tả",        icon: FileText },
];

function formatTimer(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Tab: Tổng quan ──────────────────────────────────────────────────────────

function OverviewTab({
  task,
  runningId,
  onToggle,
  timerElapsed,
  onLogWork,
  onSubmit,
}: {
  task: EngTask;
  runningId: string | null;
  onToggle: (id: string) => void;
  timerElapsed: number;
  onLogWork: () => void;
  onSubmit: () => void;
}) {
  const isRunning = runningId === task.id;
  const locked = task.status === "Waiting for Review";
  const isDone = task.status === "Done";
  const hoursProgress = task.plannedHours > 0
    ? Math.min(100, Math.round((task.loggedHours / task.plannedHours) * 100))
    : 0;
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      {/* Rejection alert */}
      {task.status === "Rejected" && task.rejectionReason && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">PM từ chối — {task.rejectedBy}</p>
            <p className="text-sm text-red-600 mt-1">{task.rejectionReason}</p>
            <p className="text-xs text-red-500 mt-2 font-semibold">Sửa và submit lại sau khi hoàn chỉnh.</p>
          </div>
        </div>
      )}

      {/* Locked banner */}
      {locked && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Dang cho PM duyet...</p>
        </div>
      )}

      {/* Timer */}
      {!isDone && !locked && (
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors shrink-0",
              isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            )}
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground">{isRunning ? "Running" : "Paused"}</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums">
              {isRunning ? formatTimer(timerElapsed) : "0:00:00"}
            </p>
          </div>
        </div>
      )}

      {/* Hours progress */}
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Giờ thực tế / Kế hoạch</p>
          <span className="text-xs font-mono font-bold">{task.loggedHours}h / {task.plannedHours}h</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${hoursProgress}%`,
              backgroundColor: hoursProgress >= 100 ? "#10B981" : "#3B82F6",
            }}
          />
        </div>
      </div>

      {/* Task progress */}
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Tiến độ task</p>
          <span className="text-xs font-mono font-bold">{task.progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${task.progressPercent}%`,
              backgroundColor: task.progressPercent === 100 ? "#10B981" : "#F59E0B",
            }}
          />
        </div>
        {task.subtasks.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Subtasks: {doneSubtasks}/{task.subtasks.length} hoàn thành
          </p>
        )}
      </div>

      {/* Subtask preview */}
      {task.subtasks.length > 0 && (
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-foreground">Sub-tasks</p>
            <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Xem tất ca <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {task.subtasks.slice(0, 3).map((st) => (
              <div key={st.id} className="flex items-center gap-2 text-xs">
                {st.done
                  ? <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
                  : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                <span className={st.done ? "line-through text-muted-foreground" : "text-foreground"}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Sub-tasks ──────────────────────────────────────────────────────────

function SubtasksTab({ task }: { task: EngTask }) {
  const locked = task.status === "Waiting for Review" || task.status === "Done";

  if (task.subtasks.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Task này không có sub-tasks.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {task.subtasks.map((st) => (
        <div
          key={st.id}
          className={cn(
            "flex items-center gap-3 p-3 border rounded-xl bg-white",
            locked ? "opacity-70" : ""
          )}
        >
          {st.done
            ? <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
            : <Square className="w-5 h-5 text-muted-foreground shrink-0" />}
          <span className={cn("text-sm flex-1", st.done ? "line-through text-muted-foreground" : "text-foreground")}>
            {st.title}
          </span>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
            st.done ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
          )}>
            {st.done ? "Done" : "Open"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Chatter ────────────────────────────────────────────────────────────

function ChatterTab({ task }: { task: EngTask }) {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [task.chatter]);

  const bgFor = (msg: typeof task.chatter[0]) => {
    if (msg.isRejection) return "bg-red-50 border-red-200";
    if (msg.role === "engineer") return "bg-blue-50 border-blue-100";
    return "bg-slate-50 border-slate-200";
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 space-y-3 overflow-y-auto min-h-0 max-h-[420px] pr-1">
        {task.chatter.map((msg) => (
          <div key={msg.id} className={cn("flex items-start gap-3 p-3 rounded-xl border", bgFor(msg))}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: msg.role === "engineer" ? "#3B82F6" : msg.isRejection ? "#DC2626" : "#E36C25" }}
            >
              {msg.authorInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("text-xs font-bold", msg.isRejection ? "text-red-700" : "text-foreground")}>
                  {msg.author}
                </p>
                {msg.isRejection && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    REJECTED
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">{msg.timestamp}</span>
              </div>
              <p className={cn("text-xs mt-1", msg.isRejection ? "text-red-600 font-semibold" : "text-foreground")}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border rounded-xl bg-white px-3 py-2 shrink-0">
        <input
          type="text"
          placeholder="Nhap tin nhan..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none"
        />
        <button
          onClick={() => setMessage("")}
          className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Log history ────────────────────────────────────────────────────────

function LogHistoryTab({ task }: { task: EngTask }) {
  if (task.timesheetEntries.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Chua co log nao.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {task.timesheetEntries.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
        <div key={entry.id} className="bg-white border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              entry.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              {entry.approved ? "Approved" : "Pending"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold font-mono text-green-600">{entry.hours}h</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${entry.progressPercent}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{entry.progressPercent}%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{entry.description}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

export function EngineerTaskDrawer({
  task,
  runningId,
  onToggle,
  timerElapsed,
  onClose,
  onLogWork,
  onSubmit,
}: {
  task: EngTask | null;
  runningId: string | null;
  onToggle: (id: string) => void;
  timerElapsed: number;
  onClose: () => void;
  onLogWork: (task: EngTask) => void;
  onSubmit: (task: EngTask) => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [task?.id]);

  if (!task) return null;

  const locked = task.status === "Waiting for Review";
  const isDone = task.status === "Done";

  const priorityColor: Record<string, string> = {
    Critical: "#DC2626", High: "#F59E0B", Medium: "#3B82F6", Low: "#6B7280",
  };
  const statusBg: Record<string, string> = {
    "New":                "bg-blue-500",
    "In Progress":        "bg-amber-500",
    "Waiting for Review": "bg-purple-500",
    "Done":               "bg-green-500",
    "Rejected":           "bg-red-500",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-label={`Task detail: ${task.title}`}
      >
        {/* Header */}
        <div className="shrink-0 p-5 flex flex-col gap-2" style={{ backgroundColor: "#063986" }}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">
                  {task.id}
                </span>
                <span className="text-[10px] font-mono text-white/60">{task.projectId}</span>
                <span
                  className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", statusBg[task.status] ?? "bg-muted")}
                >
                  {task.status}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: priorityColor[task.priority] ?? "#6B7280" }}
                >
                  {task.priority}
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-white mt-2 leading-tight">{task.title}</h2>
              <p className="text-[11px] text-white/60 mt-0.5">{task.projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mt-1 overflow-x-auto">
            {DRAWER_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors",
                  activeTab === key
                    ? "bg-white text-primary"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <OverviewTab
              task={task}
              runningId={runningId}
              onToggle={onToggle}
              timerElapsed={timerElapsed}
              onLogWork={() => onLogWork(task)}
              onSubmit={() => onSubmit(task)}
            />
          )}
          {activeTab === "subtasks"    && <SubtasksTab task={task} />}
          {activeTab === "chatter"     && <ChatterTab task={task} />}
          {activeTab === "logs"        && <LogHistoryTab task={task} />}
          {activeTab === "description" && (
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t bg-white">
          {locked ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-700">Dang cho PM duyet...</p>
            </div>
          ) : isDone ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-700">Task da hoan thanh.</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onLogWork(task)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                Ghi nhan cong viec
              </button>
              <button
                onClick={() => onSubmit(task)}
                disabled={task.progressPercent < 100}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors",
                  task.progressPercent < 100
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                )}
              >
                Hoan thanh & Gui duyet
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
