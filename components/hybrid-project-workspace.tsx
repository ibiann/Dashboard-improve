"use client";

import { useState } from "react";
import {
  List, GitBranch, LayoutGrid, ChevronRight, X,
  Clock, User, AlertTriangle, CheckCircle2, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

type TaskStatus = "Cần làm" | "Đang xử lý" | "Hoàn thành";
type RAGStatus  = "Green" | "Amber" | "Red";

interface MockTask {
  id: string;
  name: string;
  assignee: string;
  initials: string;
  progressPercent: number;
  spi: number;
  status: TaskStatus;
  phase: string;
}

interface MockPhase {
  id: string;
  name: string;
  color: string;
  tasks: MockTask[];
}

const PHASES: MockPhase[] = [
  {
    id: "PH-1", name: "Thu thập yêu cầu", color: "#063986",
    tasks: [
      { id: "T-001", name: "Phân tích nghiệp vụ hiện tại",    assignee: "Nguyễn Văn A", initials: "NA", progressPercent: 100, spi: 1.05, status: "Hoàn thành", phase: "Thu thập yêu cầu" },
      { id: "T-002", name: "Workshop lấy yêu cầu từ BU",      assignee: "Trần Thị B",   initials: "TB", progressPercent: 85,  spi: 0.92, status: "Đang xử lý",  phase: "Thu thập yêu cầu" },
      { id: "T-003", name: "Lập tài liệu BRD",                assignee: "Lê Văn C",     initials: "LC", progressPercent: 60,  spi: 0.75, status: "Đang xử lý",  phase: "Thu thập yêu cầu" },
    ],
  },
  {
    id: "PH-2", name: "Thiết kế hệ thống", color: "#4CABEB",
    tasks: [
      { id: "T-004", name: "Thiết kế kiến trúc microservices", assignee: "Phạm Minh D",  initials: "PD", progressPercent: 90,  spi: 1.10, status: "Đang xử lý",  phase: "Thiết kế hệ thống" },
      { id: "T-005", name: "Thiết kế database schema",        assignee: "Nguyễn Văn A", initials: "NA", progressPercent: 45,  spi: 0.88, status: "Đang xử lý",  phase: "Thiết kế hệ thống" },
      { id: "T-006", name: "Thiết kế API Gateway",            assignee: "Hoàng Anh E",  initials: "HE", progressPercent: 20,  spi: 0.68, status: "Cần làm",      phase: "Thiết kế hệ thống" },
    ],
  },
  {
    id: "PH-3", name: "Phát triển core modules", color: "#E36C25",
    tasks: [
      { id: "T-007", name: "Module xác thực & phân quyền",    assignee: "Trần Thị B",   initials: "TB", progressPercent: 55,  spi: 0.95, status: "Đang xử lý",  phase: "Phát triển core modules" },
      { id: "T-008", name: "Module quản lý người dùng",       assignee: "Lê Văn C",     initials: "LC", progressPercent: 30,  spi: 0.82, status: "Đang xử lý",  phase: "Phát triển core modules" },
      { id: "T-009", name: "Tích hợp thanh toán VNPay",       assignee: "Vũ Thanh F",   initials: "VF", progressPercent: 0,   spi: 0.00, status: "Cần làm",      phase: "Phát triển core modules" },
      { id: "T-010", name: "Module báo cáo & dashboard",      assignee: "Phạm Minh D",  initials: "PD", progressPercent: 100, spi: 1.02, status: "Hoàn thành",  phase: "Phát triển core modules" },
    ],
  },
  {
    id: "PH-4", name: "Kiểm thử & triển khai", color: "#22c55e",
    tasks: [
      { id: "T-011", name: "Viết test cases & UAT plan",       assignee: "Hoàng Anh E",  initials: "HE", progressPercent: 10,  spi: 0.90, status: "Cần làm",      phase: "Kiểm thử & triển khai" },
      { id: "T-012", name: "Triển khai staging environment",   assignee: "Vũ Thanh F",   initials: "VF", progressPercent: 0,   spi: 0.00, status: "Cần làm",      phase: "Kiểm thử & triển khai" },
    ],
  },
];

const ALL_TASKS: MockTask[] = PHASES.flatMap((p) => p.tasks);

const RAG_STATUS: RAGStatus = "Amber";

const USERS = [
  "Nguyễn Văn A", "Trần Thị B", "Lê Văn C",
  "Phạm Minh D",  "Hoàng Anh E", "Vũ Thanh F",
];

// ─────────────────────────────────────────────────────────────────────────────
// Small helper components
// ─────────────────────────────────────────────────────────────────────────────

function RAGBadge({ rag }: { rag: RAGStatus }) {
  const map: Record<RAGStatus, { bg: string; label: string }> = {
    Green: { bg: "bg-green-500",  label: "Đúng tiến độ" },
    Amber: { bg: "bg-[#E36C25]", label: "Có rủi ro" },
    Red:   { bg: "bg-red-500",   label: "Chậm tiến độ" },
  };
  const { bg, label } = map[rag];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white", bg)}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
      {label}
    </span>
  );
}

function Avatar({ initials, color = "#063986" }: { initials: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

function StatusDot({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, string> = {
    "Cần làm":     "bg-slate-400",
    "Đang xử lý":  "bg-[#4CABEB]",
    "Hoàn thành":  "bg-green-500",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0", map[status])} />;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, string> = {
    "Cần làm":     "bg-slate-100 text-slate-600",
    "Đang xử lý":  "bg-blue-100  text-blue-700",
    "Hoàn thành":  "bg-green-100 text-green-700",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", map[status])}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View 1: Danh sách (List)
// ─────────────────────────────────────────────────────────────────────────────

function ListView({ onSelect }: { onSelect: (task: MockTask) => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <th className="px-4 py-2.5 text-left w-24">Mã task</th>
            <th className="px-3 py-2.5 text-left">Tên công việc</th>
            <th className="px-3 py-2.5 text-left w-28">Phụ trách</th>
            <th className="px-3 py-2.5 text-left w-40">Tiến độ</th>
            <th className="px-3 py-2.5 text-left w-16">SPI</th>
            <th className="px-3 py-2.5 text-left w-32">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {ALL_TASKS.map((task, i) => {
            const spiRed = task.spi > 0 && task.spi < 0.8;
            return (
              <tr
                key={task.id}
                className={cn(
                  "h-9 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-[#063986]/5",
                  i % 2 === 0 ? "bg-card" : "bg-muted/20"
                )}
                onClick={() => onSelect(task)}
              >
                <td className="px-4 py-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{task.id}</span>
                </td>
                <td className="px-3 py-0">
                  <span className="font-medium text-foreground text-xs">{task.name}</span>
                </td>
                <td className="px-3 py-0">
                  <div className="flex items-center gap-1.5">
                    <Avatar initials={task.initials} />
                    <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">{task.assignee.split(" ").pop()}</span>
                  </div>
                </td>
                <td className="px-3 py-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#063986]"
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground w-8 text-right">{task.progressPercent}%</span>
                  </div>
                </td>
                <td className="px-3 py-0">
                  {task.spi === 0 ? (
                    <span className="font-mono text-[11px] text-muted-foreground">—</span>
                  ) : (
                    <span className={cn("font-mono text-[11px] font-bold", spiRed ? "text-red-600" : "text-foreground")}>
                      {task.spi.toFixed(2)}
                      {spiRed && <AlertTriangle className="inline ml-1 w-3 h-3 text-red-500" />}
                    </span>
                  )}
                </td>
                <td className="px-3 py-0">
                  <StatusBadge status={task.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View 2: Luồng (Workflow)
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowView({ onSelect }: { onSelect: (task: MockTask) => void }) {
  return (
    <div className="space-y-5">
      {PHASES.map((phase, phaseIdx) => (
        <div key={phase.id} className="relative">
          {/* Phase header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-t-xl text-white text-xs font-bold"
            style={{ backgroundColor: phase.color }}
          >
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{phase.id}</span>
            <span>{phase.name}</span>
            <span className="ml-auto font-mono bg-white/20 px-2 py-0.5 rounded text-[10px]">
              {phase.tasks.filter((t) => t.status === "Hoàn thành").length}/{phase.tasks.length} hoàn thành
            </span>
          </div>

          {/* Task nodes */}
          <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-card">
            <div className="flex items-stretch overflow-x-auto p-4 gap-0">
              {phase.tasks.map((task, taskIdx) => {
                const isLast = taskIdx === phase.tasks.length - 1;
                const isDone = task.status === "Hoàn thành";
                const isActive = task.status === "Đang xử lý";
                return (
                  <div key={task.id} className="flex items-center gap-0 flex-shrink-0">
                    {/* Node */}
                    <button
                      onClick={() => onSelect(task)}
                      className={cn(
                        "relative flex flex-col gap-1.5 px-4 py-3 rounded-xl border-2 text-left w-44 transition-all hover:shadow-md hover:-translate-y-0.5",
                        isDone  ? "border-green-400 bg-green-50" :
                        isActive ? "border-[#063986] bg-[#063986]/5" :
                                   "border-border bg-card"
                      )}
                    >
                      {/* Status icon */}
                      <div className="absolute -top-2.5 -right-2.5">
                        {isDone  ? <CheckCircle2 className="w-5 h-5 text-green-500 bg-white rounded-full" /> :
                         isActive ? <Circle className="w-5 h-5 text-[#063986] bg-white rounded-full fill-[#063986]/20" /> :
                                    <Circle className="w-5 h-5 text-slate-300 bg-white rounded-full" />}
                      </div>

                      <span className="font-mono text-[10px] text-muted-foreground">{task.id}</span>
                      <span className="text-[11px] font-semibold text-foreground leading-tight">{task.name}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar initials={task.initials} color={phase.color} />
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${task.progressPercent}%`, backgroundColor: phase.color }}
                          />
                        </div>
                        <span className="font-mono text-[10px]" style={{ color: phase.color }}>
                          {task.progressPercent}%
                        </span>
                      </div>
                    </button>

                    {/* Connector arrow */}
                    {!isLast && (
                      <div className="flex items-center mx-1 text-muted-foreground flex-shrink-0">
                        <div className="h-px w-5 bg-border" />
                        <ChevronRight className="w-3.5 h-3.5 -ml-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase connector */}
          {phaseIdx < PHASES.length - 1 && (
            <div className="flex items-center justify-center py-1 text-muted-foreground">
              <div className="h-4 w-px bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View 3: Kanban
// ─────────────────────────────────────────────────────────────────────────────

const KANBAN_COLS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "Cần làm",    label: "Cần làm",    color: "#6b7280" },
  { status: "Đang xử lý", label: "Đang xử lý", color: "#063986" },
  { status: "Hoàn thành", label: "Hoàn thành", color: "#22c55e" },
];

function KanbanView({ onSelect }: { onSelect: (task: MockTask) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {KANBAN_COLS.map(({ status, label, color }) => {
        const tasks = ALL_TASKS.filter((t) => t.status === status);
        return (
          <div key={status} className="rounded-xl border border-border bg-muted/30 overflow-hidden">
            {/* Column header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 text-white text-xs font-bold"
              style={{ backgroundColor: color }}
            >
              <span>{label}</span>
              <span className="font-mono bg-white/25 px-2 py-0.5 rounded-full text-[10px]">{tasks.length}</span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2.5 min-h-[200px]">
              {tasks.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8">Trống</p>
              )}
              {tasks.map((task) => (
                <button
                  key={task.id}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={() => onSelect(task)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{task.id}</span>
                    <Avatar initials={task.initials} />
                  </div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight mb-2">{task.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${task.progressPercent}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{task.progressPercent}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{task.phase}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Drawer: Chi tiết & Log Work
// ─────────────────────────────────────────────────────────────────────────────

interface LogEntry {
  hours: string;
  date: string;
  content: string;
}

function TaskDrawer({
  task,
  onClose,
}: {
  task: MockTask | null;
  onClose: () => void;
}) {
  const [assignee, setAssignee] = useState(task?.assignee ?? USERS[0]);
  const [hours, setHours]   = useState("");
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [logs, setLogs]     = useState<LogEntry[]>([]);
  const [saved, setSaved]   = useState(false);

  if (!task) return null;

  function addHours(h: number) {
    setHours((prev) => {
      const current = parseFloat(prev) || 0;
      return String(current + h);
    });
  }

  function handleSave() {
    if (!hours) return;
    setLogs((prev) => [{ hours, date, content }, ...prev]);
    setHours("");
    setContent("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl overflow-hidden"
        style={{ animation: "slideInRight 0.22s ease-out" }}
        role="dialog"
        aria-label={`Chi tiết: ${task.name}`}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-4 text-white" style={{ backgroundColor: "#063986" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[11px] bg-white/15 px-2 py-0.5 rounded text-white/80">
                {task.id}
              </span>
              <h2 className="text-sm font-extrabold mt-2 leading-snug">{task.name}</h2>
              <p className="text-[11px] text-white/60 mt-0.5">{task.phase}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white flex-shrink-0"
              aria-label="Dong"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Tien do */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tien do</p>
              <span className="font-mono text-xs font-bold text-[#063986]">{task.progressPercent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#063986] transition-all"
                style={{ width: `${task.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Phan cong */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <User className="w-3.5 h-3.5" />
              Phan cong
            </div>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#063986]/50"
            >
              {USERS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Nhat ky cong viec */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              Nhat ky cong viec (Log Work)
            </div>

            {/* Quick add buttons */}
            <div className="flex gap-2">
              {[1, 2, 4].map((h) => (
                <button
                  key={h}
                  onClick={() => addHours(h)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-xs font-bold text-foreground bg-card transition-colors hover:border-[#E36C25] hover:bg-[#E36C25]/5 hover:text-[#E36C25]"
                >
                  +{h}h
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  So gio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#063986]/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Ngay
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#063986]/50"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                Noi dung
              </label>
              <textarea
                rows={2}
                placeholder="Mo ta cong viec da lam..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#063986]/50"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!hours}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors",
                !hours ? "bg-muted text-muted-foreground cursor-not-allowed" :
                saved  ? "bg-green-500" :
                         "bg-[#063986] hover:bg-[#063986]/90"
              )}
            >
              {saved ? "Da luu!" : "Luu cap nhat"}
            </button>
          </div>

          {/* Log history */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Lich su log ({logs.length})
              </p>
              {logs.map((log, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#063986]">{log.hours}h</span>
                    <span className="text-muted-foreground font-mono">{log.date}</span>
                  </div>
                  {log.content && <p className="text-muted-foreground">{log.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: HybridProjectWorkspace
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "workflow" | "kanban";

const VIEW_TABS: { key: ViewMode; label: string; icon: React.ElementType }[] = [
  { key: "list",     label: "Danh sach",  icon: List      },
  { key: "workflow", label: "Luong",      icon: GitBranch },
  { key: "kanban",   label: "Kanban",     icon: LayoutGrid },
];

export function HybridProjectWorkspace() {
  const [view, setView]               = useState<ViewMode>("list");
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">He thong</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#063986]">Du an chuyen doi so Alpha</span>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-extrabold text-foreground tracking-tight text-balance">
              Du an chuyen doi so Alpha
            </h1>
            <RAGBadge rag={RAG_STATUS} />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
            <span>
              <span className="font-mono font-bold text-foreground">{ALL_TASKS.filter((t) => t.status === "Hoàn thành").length}</span>
              /{ALL_TASKS.length} tasks hoan thanh
            </span>
            <span>
              SPI TB:{" "}
              <span className={cn("font-mono font-bold",
                (() => { const avg = ALL_TASKS.filter((t) => t.spi > 0).reduce((s, t) => s + t.spi, 0) / ALL_TASKS.filter((t) => t.spi > 0).length; return avg < 0.8 ? "text-red-600" : "text-foreground"; })()
              )}>
                {(ALL_TASKS.filter((t) => t.spi > 0).reduce((s, t) => s + t.spi, 0) / ALL_TASKS.filter((t) => t.spi > 0).length).toFixed(2)}
              </span>
            </span>
            <span>
              <span className="font-mono font-bold text-foreground">
                {Math.round(ALL_TASKS.reduce((s, t) => s + t.progressPercent, 0) / ALL_TASKS.length)}%
              </span>
              {" "}tong tien do
            </span>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit">
            {VIEW_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  view === key
                    ? "bg-[#063986] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        {view === "list"     && <ListView     onSelect={setSelectedTask} />}
        {view === "workflow" && <WorkflowView onSelect={setSelectedTask} />}
        {view === "kanban"   && <KanbanView   onSelect={setSelectedTask} />}
      </div>

      {/* ── Side Drawer ─────────────────────────────────────────────── */}
      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
