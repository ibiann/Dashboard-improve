"use client";

import { useState } from "react";
import {
  X, Check, ChevronRight, Pencil, Trash2, Plus, Send,
  Clock, AlertTriangle, CheckCircle2, Circle, Loader2,
} from "lucide-react";
import {
  PMTask, PMSubtask, PMProject, getAllTasks,
  calcTaskSPI, getSPIBadge,
} from "@/lib/pm-mock-data";

// ──────────────────────────────────────────────────────────────────────────────
// Shared badge components
// ──────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "New": "#9ca3af",
  "In Progress": "#4CABEB",
  "Waiting for Review": "#f59e0b",
  "Done": "#22c55e",
};
const PRIORITY_COLORS: Record<string, string> = {
  Low: "#9ca3af", Medium: "#4CABEB", High: "#f59e0b", Critical: "#ef4444",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: STATUS_COLORS[status] ?? "#9ca3af" }}>
      {status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  return <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[priority] ?? "#9ca3af" }} />;
}

// ──────────────────────────────────────────────────────────────────────────────
// Task Detail Drawer (5 sub-tabs)
// ──────────────────────────────────────────────────────────────────────────────

type DrawerTab = "overview" | "subtasks" | "timesheets" | "chatter" | "description";

interface TaskDrawerProps {
  task: PMTask;
  project: PMProject;
  onClose: () => void;
  onTaskUpdate: (updated: PMTask) => void;
}

export function TaskDrawer({ task: initialTask, project, onClose, onTaskUpdate }: TaskDrawerProps) {
  const [task, setTask] = useState<PMTask>(initialTask);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [chatterInput, setChatterInput] = useState("");

  // Subtask state
  const [subtasks, setSubtasks] = useState<PMSubtask[]>(task.subtasks);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ title: "", assigneeName: "", assigneeInitials: "", estimatedHours: 1 });

  const taskSPI = calcTaskSPI(task);

  function handleApprove() {
    const updated = { ...task, status: "Done" as const };
    setTask(updated);
    onTaskUpdate(updated);
  }

  function handleReject() {
    if (!rejectReason.trim()) return;
    const newMsg = {
      id: `c-${Date.now()}`,
      author: "Alice Morgan",
      authorInitials: "AM",
      time: new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16),
      message: `Rejected: ${rejectReason}`,
      isRejection: true,
    };
    const updated = {
      ...task,
      status: "In Progress" as const,
      chatter: [...task.chatter, newMsg],
    };
    setTask(updated);
    onTaskUpdate(updated);
    setRejectReason("");
    setShowRejectForm(false);
  }

  function toggleSubtask(id: string) {
    const updated = subtasks.map((s) =>
      s.id === id ? { ...s, done: !s.done, status: (!s.done ? "Done" : "In Progress") as PMSubtask["status"] } : s
    );
    setSubtasks(updated);
  }

  function addSubtask() {
    if (!newSubtask.title.trim()) return;
    const st: PMSubtask = {
      id: `st-${Date.now()}`,
      title: newSubtask.title,
      assigneeName: newSubtask.assigneeName || "Chua phan cong",
      assigneeInitials: newSubtask.assigneeInitials || "??",
      estimatedHours: newSubtask.estimatedHours,
      status: "New",
      done: false,
    };
    setSubtasks((prev) => [...prev, st]);
    setNewSubtask({ title: "", assigneeName: "", assigneeInitials: "", estimatedHours: 1 });
    setShowAddSubtask(false);
  }

  function deleteSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  function sendChatter() {
    if (!chatterInput.trim()) return;
    const newMsg = {
      id: `c-${Date.now()}`,
      author: "Alice Morgan",
      authorInitials: "AM",
      time: new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16),
      message: chatterInput,
    };
    setTask((prev) => ({ ...prev, chatter: [...prev.chatter, newMsg] }));
    setChatterInput("");
  }

  const doneCount = subtasks.filter((s) => s.done).length;
  const totalSubtasks = subtasks.length;
  const subtaskPct = totalSubtasks > 0 ? Math.round((doneCount / totalSubtasks) * 100) : 0;

  const TABS: { key: DrawerTab; label: string }[] = [
    { key: "overview", label: "Tong quan" },
    { key: "subtasks", label: `Sub-tasks (${doneCount}/${totalSubtasks})` },
    { key: "timesheets", label: "Timesheets" },
    { key: "chatter", label: "Chatter" },
    { key: "description", label: "Mo ta" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div
        className="w-full max-w-lg bg-white flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.22s ease-out" }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ backgroundColor: "#063986" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/60 font-mono">
              {project.name} &rsaquo; Nhiem vu &rsaquo; {task.id}
            </p>
            <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-white mt-1 leading-tight text-balance">{task.title}</h2>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border bg-white flex-shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TAB: OVERVIEW ─────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="p-5 space-y-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                {[
                  ["Task ID", task.id],
                  ["Assignee", task.assignee],
                  ["Phase", task.phase],
                  ["Due Date", task.dueDate],
                  ["Priority", null],
                  ["Status", null],
                  ["Created", task.createdDate],
                  ["Last Updated", task.lastUpdated],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                    {label === "Priority" ? <PriorityDot priority={task.priority} /> :
                     label === "Status" ? <StatusBadge status={task.status} /> :
                     <p className="font-medium text-foreground">{val as string}</p>}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${task.progressPercent}%` }} />
                  </div>
                  <span className="text-sm font-extrabold font-mono text-primary">{task.progressPercent}%</span>
                </div>
                {/* Hours bar */}
                <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
                  <div style={{ width: `${(task.approvedHours / task.plannedHours) * 100}%`, backgroundColor: "#22c55e" }} />
                  <div style={{ width: `${(task.pendingHours / task.plannedHours) * 100}%`, backgroundColor: "#f59e0b" }} />
                </div>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" />{task.approvedHours}h approved</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" />{task.pendingHours}h pending</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />{task.plannedHours - task.approvedHours - task.pendingHours}h remaining</span>
                </div>
                {task.approvedHours + task.pendingHours > task.plannedHours && (
                  <div className="flex items-center gap-1.5 text-[10px] text-danger font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Vuot ngan sach gio
                  </div>
                )}
              </div>

              {/* Task SPI */}
              {taskSPI !== null && (
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Task SPI</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: getSPIBadge(taskSPI).color }}
                  >
                    SPI {taskSPI.toFixed(2)} — {getSPIBadge(taskSPI).label}
                  </span>
                </div>
              )}

              {/* Subtask preview */}
              {subtasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sub-tasks</p>
                    <button onClick={() => setActiveTab("subtasks")} className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline">
                      Xem tat ca <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-success" style={{ width: `${subtaskPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-success font-semibold">{doneCount}/{totalSubtasks} ({subtaskPct}%)</span>
                  </div>
                  <div className="space-y-1">
                    {subtasks.slice(0, 3).map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span className={s.done ? "line-through" : ""}>{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PM Actions */}
              {task.status === "Waiting for Review" && (
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Task dang cho review
                  </p>
                  {!showRejectForm ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white rounded-lg bg-success hover:opacity-90 transition-opacity"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Mark Done
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white rounded-lg bg-danger hover:opacity-90 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        className="w-full border border-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                        rows={3}
                        placeholder="Ly do reject (bat buoc)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 py-2 text-xs font-semibold text-white rounded-lg bg-danger hover:opacity-90 disabled:opacity-40 transition-opacity">
                          Gui reject
                        </button>
                        <button onClick={() => setShowRejectForm(false)} className="flex-1 py-2 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
                          Huy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick links */}
              <div className="flex gap-3 text-[10px]">
                <button onClick={() => setActiveTab("timesheets")} className="text-primary font-semibold flex items-center gap-0.5 hover:underline">
                  Xem timesheet logs <ChevronRight className="w-3 h-3" />
                </button>
                <button onClick={() => setActiveTab("chatter")} className="text-primary font-semibold flex items-center gap-0.5 hover:underline">
                  Xem chatter <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: SUBTASKS ─────────────────────────────────────────── */}
          {activeTab === "subtasks" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Sub-tasks</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{doneCount}/{totalSubtasks} hoan thanh ({subtaskPct}%)</p>
                </div>
                <button
                  onClick={() => setShowAddSubtask(!showAddSubtask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg"
                  style={{ backgroundColor: "#E36C25" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Them sub-task
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-success transition-all" style={{ width: `${subtaskPct}%` }} />
              </div>

              {/* Inline add form */}
              {showAddSubtask && (
                <div className="p-3 bg-muted rounded-lg border border-border space-y-2">
                  <input
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ten sub-task..."
                    value={newSubtask.title}
                    onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="border border-border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Ten assignee"
                      value={newSubtask.assigneeName}
                      onChange={(e) => setNewSubtask({ ...newSubtask, assigneeName: e.target.value, assigneeInitials: e.target.value.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) })}
                    />
                    <input
                      type="number"
                      className="border border-border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Gio uoc tinh"
                      value={newSubtask.estimatedHours}
                      min={0.5}
                      step={0.5}
                      onChange={(e) => setNewSubtask({ ...newSubtask, estimatedHours: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addSubtask} className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: "#063986" }}>Them</button>
                    <button onClick={() => setShowAddSubtask(false)} className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-white transition-colors">Huy</button>
                  </div>
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors group ${s.done ? "bg-muted/30 border-transparent" : "bg-white border-border hover:border-primary/30"}`}
                  >
                    <button
                      onClick={() => toggleSubtask(s.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${s.done ? "border-success bg-success" : "border-muted-foreground/40 hover:border-primary"}`}
                    >
                      {s.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${s.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.title}</p>
                    </div>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: "#4CABEB" }}>
                      {s.assigneeInitials}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{s.estimatedHours}h</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#9ca3af" }}
                    >
                      {s.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteSubtask(s.id)} className="p-1 text-muted-foreground hover:text-danger transition-colors" aria-label="Delete subtask">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {subtasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Chua co sub-task nao</p>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: TIMESHEETS ───────────────────────────────────────── */}
          {activeTab === "timesheets" && (
            <div className="p-5 space-y-3">
              <p className="text-xs font-bold text-foreground">Timesheet Logs</p>
              {task.timesheets.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Chua co log nao</p>
              )}
              {task.timesheets.map((ts) => (
                <div key={ts.id} className="bg-white rounded-lg border border-border p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: "#063986" }}>
                        {ts.memberInitials}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{ts.member}</span>
                    </div>
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: ts.approved ? "#22c55e" : "#f59e0b" }}
                    >
                      {ts.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{ts.date}</span>
                    <span className="font-mono font-semibold text-foreground">{ts.hours}h</span>
                    <span>Progress: <span className="font-semibold text-foreground">{ts.progressPercent}%</span></span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{ts.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: CHATTER ──────────────────────────────────────────── */}
          {activeTab === "chatter" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {task.chatter.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 p-3 rounded-lg ${msg.isRejection ? "bg-red-50 border border-red-200" : "bg-white border border-border"}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${msg.isRejection ? "bg-danger" : "bg-primary"}`}>
                      {msg.authorInitials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{msg.author}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${msg.isRejection ? "text-danger font-medium" : "text-foreground"}`}>{msg.message}</p>
                    </div>
                  </div>
                ))}
                {task.chatter.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Chua co tin nhan nao</p>
                )}
              </div>
              <div className="p-4 border-t border-border bg-white flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Viet tin nhan..."
                    value={chatterInput}
                    onChange={(e) => setChatterInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatter()}
                  />
                  <button onClick={sendChatter} className="px-3 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: "#063986" }} aria-label="Send">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: DESCRIPTION ──────────────────────────────────────── */}
          {activeTab === "description" && (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Mo ta</p>
                <p className="text-xs text-foreground leading-relaxed">{task.description}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Definition of Done</p>
                <ul className="space-y-1.5">
                  {task.definitionOfDone.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Attachments</p>
                <div className="border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
                  <Plus className="w-6 h-6" />
                  <p className="text-xs font-medium">Keo & tha file vao day</p>
                  <p className="text-[10px]">Hoac click de chon file</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Kanban Board
// ──────────────────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: { status: PMTask["status"]; label: string; color: string }[] = [
  { status: "New",                label: "New",               color: "#9ca3af" },
  { status: "In Progress",        label: "In Progress",        color: "#4CABEB" },
  { status: "Waiting for Review", label: "Waiting for Review", color: "#f59e0b" },
  { status: "Done",               label: "Done",               color: "#22c55e" },
];

function KanbanCard({ task, onClick }: { task: PMTask; onClick: () => void }) {
  const isReview = task.status === "Waiting for Review";
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border-2 p-3 shadow-sm hover:shadow-md transition-all space-y-2 ${isReview ? "animate-pulse-border border-amber-300" : "border-border hover:border-primary/30"}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-snug text-balance">{task.title}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.phase}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ color: PRIORITY_COLORS[task.priority], backgroundColor: PRIORITY_COLORS[task.priority] + "18" }}>
              {task.priority}
            </span>
          </div>
        </div>
        <PriorityDot priority={task.priority} />
      </div>

      {/* Hours mini-bar */}
      <div className="space-y-0.5">
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>{task.approvedHours + task.pendingHours}h / {task.plannedHours}h</span>
          <span>{task.progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
          <div style={{ width: `${(task.approvedHours / task.plannedHours) * 100}%`, backgroundColor: "#22c55e" }} />
          <div style={{ width: `${(task.pendingHours / task.plannedHours) * 100}%`, backgroundColor: "#f59e0b" }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: "#063986" }}>
            {task.assigneeInitials}
          </span>
          <span className="text-[9px] text-muted-foreground">{task.dueDate}</span>
        </div>
        {totalSubtasks > 0 && (
          <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {doneSubtasks}/{totalSubtasks} subtasks
          </span>
        )}
      </div>
    </button>
  );
}

interface KanbanTabProps {
  project: PMProject;
  onTaskUpdate: (updated: PMTask) => void;
}

export function KanbanTab({ project, onTaskUpdate }: KanbanTabProps) {
  const [allTasks, setAllTasks] = useState<PMTask[]>(getAllTasks(project));
  const [selectedTask, setSelectedTask] = useState<PMTask | null>(null);

  function handleTaskUpdate(updated: PMTask) {
    setAllTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    onTaskUpdate(updated);
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 overflow-x-auto">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = allTasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-bold text-foreground">{col.label}</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-mono">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-24">
                {colTasks.map((t) => (
                  <KanbanCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}
