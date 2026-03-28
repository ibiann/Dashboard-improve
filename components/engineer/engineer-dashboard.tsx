"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Clock, CheckCircle2, X, Play, Pause, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ENG_PROFILE, ENG_TASKS, ENG_NOTIFICATIONS, ENG_MEETINGS,
  MEETING_TYPE_COLORS, engIsOverdue, engDaysUntil, EngTask, EngNotification,
} from "@/lib/engineer-mock-data";

// ─── Shared timer hook ───────────────────────────────────────────────────────

function useTimer(runningTaskId: string | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!runningTaskId) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [runningTaskId]);
  return elapsed;
}

function formatTimer(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Reminder Banners ────────────────────────────────────────────────────────

function ReminderBanners({
  onDismiss, onClickTask,
}: {
  onDismiss: (id: string) => void;
  onClickTask: (taskId: string) => void;
}) {
  const unread = ENG_NOTIFICATIONS.filter((n) => !n.read);
  if (!unread.length) return null;

  return (
    <section className="space-y-2.5">
      {unread.map((n) => {
        const bg = n.severity === "red" ? "bg-red-50" : n.severity === "amber" ? "bg-amber-50" : "bg-blue-50";
        const icon = n.type === "rejected" ? AlertTriangle : n.type === "reminder" ? Clock : Bell;
        const Icon = icon;
        return (
          <div key={n.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", bg)}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: n.severity === "red" ? "#DC2626" : n.severity === "amber" ? "#F59E0B" : "#3B82F6" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              {n.ruleName && (
                <span className="inline-block mt-1.5 text-[9px] font-bold bg-white px-2 py-0.5 rounded-full border">
                  Auto · {n.ruleName}
                </span>
              )}
            </div>
            <button
              onClick={() => n.taskId ? onClickTask(n.taskId) : {}}
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Xem task
            </button>
            <button onClick={() => onDismiss(n.id)} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </section>
  );
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────

function KpiCards() {
  const active = ENG_TASKS.filter((t) => t.status === "In Progress").length;
  const thisWeek = ENG_TASKS.reduce((s, t) => s + t.timesheetEntries.filter((e) => e.date >= "2026-03-17").reduce((sum, e) => sum + e.hours, 0), 0);
  const notifs = ENG_NOTIFICATIONS.filter((n) => !n.read).length;
  const done = ENG_TASKS.filter((t) => t.status === "Done").length;

  const items = [
    { label: "Active Tasks", value: active, color: "#3B82F6" },
    { label: "Giờ tuần này", value: `${thisWeek}h`, color: "#10B981" },
    { label: "Thông báo", value: notifs, color: "#F59E0B" },
    { label: "Hoàn thành", value: done, color: "#8B5CF6" },
  ];

  return (
    <section className="grid grid-cols-4 gap-4">
      {items.map((kpi) => (
        <div key={kpi.label} className="bg-white border rounded-lg p-4 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{kpi.label}</p>
          <p className="text-2xl font-extrabold" style={{ color: kpi.color }}>{kpi.value}</p>
        </div>
      ))}
    </section>
  );
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({
  task, runningId, onToggle, onClick, timerElapsed,
}: {
  task: EngTask; runningId: string | null; onToggle: (id: string) => void; onClick: (id: string) => void; timerElapsed: number;
}) {
  const isRunning = runningId === task.id;
  const overdue = engIsOverdue(task.dueDate);
  const progress = Math.round((task.loggedHours / task.plannedHours) * 100);

  return (
    <div role="listitem" className="flex items-center gap-3 py-2 border-b last:border-b-0 hover:bg-slate-50 transition-colors group">
      <button
        onClick={() => onToggle(task.id)}
        disabled={task.status === "Waiting for Review" || task.status === "Done"}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
          isRunning ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600",
          (task.status === "Waiting for Review" || task.status === "Done") && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRunning ? "Pause" : "Play"}
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick(task.id)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-bold text-foreground">{task.title}</p>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{task.status}</span>
          {task.subtasks.length > 0 && (
            <span className="text-[9px] font-mono text-muted-foreground">
              {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtasks
            </span>
          )}
          {task.status === "Rejected" && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">REJECTED</span>
          )}
        </div>
      </div>
      {isRunning && (
        <span className="text-xs font-mono text-green-600 font-bold shrink-0">{formatTimer(timerElapsed)}</span>
      )}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{task.loggedHours}h/{task.plannedHours}h</span>
      </div>
    </div>
  );
}

// ─── Meeting Card ────────────────────────────────────────────────────────────

function MeetingCard({ meeting }: { meeting: typeof ENG_MEETINGS[0] }) {
  return (
    <div className="flex items-start gap-2 p-2 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: MEETING_TYPE_COLORS[meeting.type] }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">{meeting.title}</p>
        <p className="text-[10px] text-muted-foreground">{meeting.date} · {meeting.time} · {meeting.location}</p>
      </div>
    </div>
  );
}

// ─── Deadline Card ──────────────────────────────────────────────────────────

function DeadlineCard({ task }: { task: EngTask }) {
  const days = engDaysUntil(task.dueDate);
  const overdue = days < 0;
  const color = overdue ? "#DC2626" : days <= 7 ? "#F59E0B" : "#10B981";

  return (
    <div className="flex items-start gap-2 p-2 border rounded-lg">
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">{task.title}</p>
        <p className="text-[10px] text-muted-foreground">{task.dueDate} — {overdue ? "Quá hạn" : `Còn ${days} ngày`}</p>
      </div>
    </div>
  );
}

// ─── Recent Timesheet ────────────────────────────────────────────────────────

function RecentTimesheet() {
  const recent = ENG_TASKS.flatMap((t) => t.timesheetEntries).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <section className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">Timesheet gần đây</h2>
        <button className="text-xs font-semibold text-primary hover:underline">Xem tất cả</button>
      </div>
      <div className="space-y-2">
        {recent.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">{entry.date}</span>
            <span className="flex-1 truncate text-foreground">{entry.taskTitle}</span>
            <span className="font-mono font-bold text-green-600">{entry.hours}h</span>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", entry.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
              {entry.approved ? "Approved" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Engineer Dashboard ──────────────────────────────────────────────────────

const ACTIVE_TASKS_SCROLL_AFTER = 4;

export function EngineerDashboard({
  onDismissNotif, onTaskClick, runningTaskId, onToggleTimer, timerElapsed, onViewAllTasks,
}: {
  onDismissNotif: (id: string) => void;
  onTaskClick: (id: string) => void;
  runningTaskId: string | null;
  onToggleTimer: (id: string) => void;
  timerElapsed: number;
  /** Mở tab Công việc khi danh sách dài hoặc người dùng muốn xem đầy đủ */
  onViewAllTasks?: () => void;
}) {
  const activeTasks = ENG_TASKS.filter((t) => t.status === "In Progress" || t.status === "Waiting for Review");
  const upcomingMeetings = ENG_MEETINGS.slice(0, 2);
  const nearestDeadlines = ENG_TASKS.filter((t) => t.status !== "Done").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Profile Strip */}
      <section className="bg-white border rounded-lg p-4 flex items-center gap-4 flex-wrap">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#E36C25" }}>
          {ENG_PROFILE.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{ENG_PROFILE.name}</p>
          <p className="text-xs text-muted-foreground">{ENG_PROFILE.role} · {ENG_PROFILE.projects.length} projects · {activeTasks.length} active</p>
        </div>
        {ENG_PROFILE.projects.map((p) => (
          <span key={p.id} className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {p.id}
          </span>
        ))}
      </section>

      {/* Reminder Banners */}
      <ReminderBanners onDismiss={onDismissNotif} onClickTask={onTaskClick} />

      {/* KPI Cards */}
      <KpiCards />

      {/* Active Tasks — cuộn nội bộ khi nhiều dòng; liên kết tới tab Công việc đầy đủ */}
      <section className="bg-white border rounded-lg p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-foreground">Active Tasks</h2>
          {activeTasks.length > 0 && (
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
              {activeTasks.length}
            </span>
          )}
        </div>
        {activeTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">Không có công việc đang xử lý hoặc chờ duyệt.</p>
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 -mx-1 px-1",
                activeTasks.length > ACTIVE_TASKS_SCROLL_AFTER &&
                  "max-h-[min(45vh,18rem)] overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth pr-1 [scrollbar-gutter:stable]"
              )}
              role="list"
              aria-label="Công việc đang hoạt động"
            >
              {activeTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  runningId={runningTaskId}
                  onToggle={onToggleTimer}
                  onClick={onTaskClick}
                  timerElapsed={timerElapsed}
                />
              ))}
            </div>
            {onViewAllTasks && (
              <div className="mt-3 pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-muted-foreground">
                  {activeTasks.length > ACTIVE_TASKS_SCROLL_AFTER
                    ? "Danh sách có thể cuộn; mở Công việc để lọc, sắp xếp và xem toàn bộ."
                    : "Xem đầy đủ trên tab Công việc (lọc, sắp xếp)."}
                </p>
                <button
                  type="button"
                  onClick={onViewAllTasks}
                  className="text-xs font-semibold shrink-0 rounded-md px-2 py-1.5 text-[#063986] hover:bg-[#063986]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#063986] focus-visible:ring-offset-2"
                >
                  Tất cả công việc →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Split Grid: Meetings + Deadlines */}
      <div className="grid grid-cols-2 gap-4">
        <section className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">Lịch họp sắp tới</h2>
          <div className="space-y-2">
            {upcomingMeetings.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </section>
        <section className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">Deadline gần nhất</h2>
          <div className="space-y-2">
            {nearestDeadlines.map((t) => <DeadlineCard key={t.id} task={t} />)}
          </div>
        </section>
      </div>

      {/* Recent Timesheet */}
      <RecentTimesheet />
    </div>
  );
}
