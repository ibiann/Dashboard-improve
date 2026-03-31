"use client";

import { useState } from "react";
import { X, Clock, CheckCircle, AlertTriangle, MessageSquare, FileText, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PMTask, PMTimesheetEntry, PMSubtask,
} from "@/lib/pm-mock-data";
import type { WorkspaceRole } from "@/components/workspace/workspace-types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PMTask["status"], string> = {
  "New": "#9ca3af",
  "In Progress": "#4CABEB",
  "Waiting for Review": "#E36C25",
  "Done": "#22c55e",
};

const PRIORITY_COLORS: Record<PMTask["priority"], string> = {
  Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444",
};

type DrawerTab = "overview" | "log" | "history" | "subtasks" | "notes";

const TABS: { id: DrawerTab; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "Tổng quan",      icon: FileText },
  { id: "log",       label: "Log công việc",  icon: Clock },
  { id: "history",   label: "Lịch sử",        icon: CheckCircle },
  { id: "subtasks",  label: "Sub-tasks",      icon: Plus },
  { id: "notes",     label: "Chatter",        icon: MessageSquare },
];

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ task }: { task: PMTask }) {
  return (
    <div className="space-y-4 py-3">
      {/* Description */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Mô tả</p>
        <p className="text-xs text-foreground leading-relaxed">{task.description}</p>
      </div>

      {/* Definition of done */}
      {task.definitionOfDone.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Definition of Done</p>
          <ul className="space-y-1">
            {task.definitionOfDone.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Giờ kế hoạch",  value: `${task.plannedHours}h`,   color: "text-foreground" },
          { label: "Đã duyệt",      value: `${task.approvedHours}h`,  color: "text-success" },
          { label: "Chờ duyệt",     value: `${task.pendingHours}h`,   color: task.pendingHours > 0 ? "text-warning font-bold" : "text-muted-foreground" },
          { label: "Tiến độ",       value: `${task.progressPercent}%`, color: "text-primary font-bold" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
            <p className={cn("text-sm font-mono font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>Bắt đầu: <span className="font-mono text-foreground">{task.createdDate}</span></span>
        <span>Hạn: <span className={cn("font-mono font-semibold", task.dueDate < "2026-03-24" && task.progressPercent < 100 ? "text-destructive" : "text-foreground")}>{task.dueDate}</span></span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Log Work Tab
// ─────────────────────────────────────────────────────────────────────────────

function LogWorkTab({ task }: { task: PMTask }) {
  const [hours, setHours] = useState("");
  const [progress, setProgress] = useState(task.progressPercent);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-03-24");
  const [submitted, setSubmitted] = useState(false);

  function addHours(h: number) {
    setHours((prev) => String((parseFloat(prev) || 0) + h));
  }

  function handleSubmit() {
    if (!hours || !description) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setHours("");
    setDescription("");
  }

  return (
    <div className="space-y-4 py-3">
      {/* Current progress display */}
      <div className="bg-muted/40 rounded-lg px-3 py-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tiến độ hiện tại</span>
          <span className="text-sm font-mono font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">
          Ngày log
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-xs border border-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-foreground"
        />
      </div>

      {/* Hours quick-add */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-1.5">
          Số giờ
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0"
            className="flex-1 text-sm font-mono border border-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
          {[1, 2, 4].map((h) => (
            <button
              key={h}
              onClick={() => addHours(h)}
              className="px-3 py-2 text-xs font-bold rounded-md border border-accent text-accent hover:bg-accent hover:text-white transition-colors font-mono"
            >
              +{h}h
            </button>
          ))}
        </div>
      </div>

      {/* Progress update */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Cập nhật tiến độ
          </label>
          <span className="text-xs font-mono font-bold text-primary">{progress}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5 font-mono">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">
          Mô tả công việc đã làm
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả công việc..."
          rows={3}
          className="w-full text-xs border border-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground leading-relaxed"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!hours || !description}
        className={cn(
          "w-full py-2.5 text-xs font-bold rounded-lg transition-all",
          submitted
            ? "bg-success text-white"
            : "bg-primary text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {submitted ? "Da luu thanh cong!" : "Luu log cong viec"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History Tab
// ─────────────────────────────────────────────────────────────────────────────

function HistoryTab({ task }: { task: PMTask }) {
  return (
    <div className="py-3 space-y-2">
      {task.timesheets.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">Chua co log work nao</p>
      )}
      {task.timesheets.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "bg-white rounded-lg border px-3 py-2.5 shadow-sm",
            entry.approved ? "border-success/30" : "border-warning/40"
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#063986" }}
              >
                {entry.memberInitials}
              </span>
              <span className="text-xs font-semibold text-foreground">{entry.member}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-xs font-bold text-foreground">{entry.hours}h</span>
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white",
                  entry.approved ? "bg-success" : "bg-warning"
                )}
              >
                {entry.approved ? "Đã duyệt" : "Chờ duyệt"}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1 font-mono">{entry.date}</p>
          <p className="text-xs text-foreground">{entry.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${entry.progressPercent}%` }} />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{entry.progressPercent}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subtasks Tab
// ─────────────────────────────────────────────────────────────────────────────

const SUBTASK_STATUS_COLORS: Record<PMSubtask["status"], string> = {
  "New": "#9ca3af", "In Progress": "#4CABEB", "Done": "#22c55e",
};

function SubtasksTab({ task }: { task: PMTask }) {
  return (
    <div className="py-3 space-y-2">
      {task.subtasks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">Chua co sub-task nao</p>
      )}
      {task.subtasks.map((st) => (
        <div key={st.id} className="flex items-center gap-2.5 bg-white rounded-lg border border-border px-3 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SUBTASK_STATUS_COLORS[st.status] }} />
          <span className="flex-1 text-xs text-foreground font-medium">{st.title}</span>
          <span className="text-[9px] text-muted-foreground font-mono shrink-0">{st.assigneeInitials}</span>
          <span className="text-[9px] font-mono text-muted-foreground shrink-0">{st.estimatedHours}h</span>
          <span
            className="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: SUBTASK_STATUS_COLORS[st.status] }}
          >
            {st.status}
          </span>
        </div>
      ))}

      <button className="flex items-center gap-1.5 w-full px-3 py-2.5 text-xs font-semibold text-primary border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 hover:bg-muted/30 transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Them sub-task moi
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chatter / Notes Tab
// ─────────────────────────────────────────────────────────────────────────────

function ChatterTab({ task }: { task: PMTask }) {
  const [msg, setMsg] = useState("");

  return (
    <div className="py-3 flex flex-col gap-3">
      {task.chatter.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Chua co binh luan nao</p>
      )}
      <div className="space-y-2">
        {task.chatter.map((c) => (
          <div
            key={c.id}
            className={cn(
              "rounded-lg border px-3 py-2.5",
              c.isRejection ? "border-destructive/30 bg-destructive/5" : "border-border bg-white"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#063986" }}
              >
                {c.authorInitials}
              </span>
              <span className="text-xs font-semibold text-foreground">{c.author}</span>
              <span className="text-[9px] text-muted-foreground ml-auto font-mono">{c.time}</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{c.message}</p>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="flex gap-2 pt-1">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Viet binh luan..."
          rows={2}
          className="flex-1 text-xs border border-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground"
        />
        <button
          disabled={!msg.trim()}
          className="px-3 py-2 text-xs font-bold bg-primary text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed self-end"
        >
          Gui
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Task Drawer
// ─────────────────────────────────────────────────────────────────────────────

interface TaskDrawerProps {
  task: PMTask | null;
  role: WorkspaceRole;
  onClose: () => void;
}

export function TaskDrawer({ task, role, onClose }: TaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  if (!task) return null;

  const isOverdue = task.progressPercent < 100 && task.dueDate < "2026-03-24";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="fixed top-0 right-0 h-full w-96 bg-white border-l border-border shadow-2xl z-50 flex flex-col"
        style={{ animation: "slideInRight 0.2s ease-out" }}
        aria-label="Task detail drawer"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {task.id}
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: "#063986" }}
                >
                  {task.phase}
                </span>
                {isOverdue && (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    Quá hạn
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-foreground leading-snug">{task.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground shrink-0"
              aria-label="Dong drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status + Priority + Assignee row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[task.status] }}
            >
              {task.status}
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: PRIORITY_COLORS[task.priority], backgroundColor: PRIORITY_COLORS[task.priority] + "18" }}
            >
              {task.priority}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <span
                className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#063986" }}
              >
                {task.assigneeInitials}
              </span>
              {task.assignee}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex overflow-x-auto border-b border-border bg-muted/20">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                activeTab === id
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/60"
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4">
          {activeTab === "overview"  && <OverviewTab  task={task} />}
          {activeTab === "log"       && <LogWorkTab   task={task} />}
          {activeTab === "history"   && <HistoryTab   task={task} />}
          {activeTab === "subtasks"  && <SubtasksTab  task={task} />}
          {activeTab === "notes"     && <ChatterTab   task={task} />}
        </div>
      </aside>
    </>
  );
}
