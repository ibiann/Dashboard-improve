"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft, AlertTriangle, Clock, CheckCircle2, TrendingUp, Users, DollarSign, Layers, ShieldAlert, CalendarDays, Send, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { L1_PROJECTS, L1Project } from "@/lib/strategic-mock-data";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ─────────────────────────────────────────────────────────────────────────────
// CEO-specific mock data (8 featured projects per spec)
// ─────────────────────────────────────────────────────────────────────────────

const CEO_PROJECTS = [
  { id: "P-001", name: "NavComm FPGA Core",      pm: "Alice Morgan",  cat: "FPGA", progress: 65, planned: 74, spi: 0.88, rag: "amber" as const, budgetTotal: 840,  budgetSpent: 546, overdue: 1 },
  { id: "P-002", name: "Sentinel Gateway v3",    pm: "Bob Chen",      cat: "SW",   progress: 51, planned: 65, spi: 0.78, rag: "amber" as const, budgetTotal: 620,  budgetSpent: 410, overdue: 2 },
  { id: "P-003", name: "Sigma Backplane",        pm: "Carol Davies",  cat: "HW",   progress: 41, planned: 70, spi: 0.59, rag: "red"   as const, budgetTotal: 1060, budgetSpent: 580, overdue: 3 },
  { id: "P-004", name: "Vortex Firmware Suite",  pm: "Helen Li",      cat: "SW",   progress: 46, planned: 72, spi: 0.64, rag: "red"   as const, budgetTotal: 480,  budgetSpent: 320, overdue: 2 },
  { id: "P-005", name: "TerraEdge IoT Platform", pm: "Eve Nkosi",     cat: "SW",   progress: 57, planned: 68, spi: 0.84, rag: "amber" as const, budgetTotal: 720,  budgetSpent: 390, overdue: 0 },
  { id: "P-006", name: "Helios Power Supply",    pm: "Grace Kim",     cat: "HW",   progress: 44, planned: 58, spi: 0.76, rag: "amber" as const, budgetTotal: 560,  budgetSpent: 290, overdue: 1 },
  { id: "P-007", name: "Apollo Radar Module",    pm: "Dan Osei",      cat: "FPGA", progress: 78, planned: 80, spi: 0.98, rag: "green" as const, budgetTotal: 900,  budgetSpent: 680, overdue: 0 },
  { id: "P-008", name: "Mercury Comm Link",      pm: "Frank Liu",     cat: "SW",   progress: 92, planned: 90, spi: 1.02, rag: "green" as const, budgetTotal: 380,  budgetSpent: 350, overdue: 0 },
];

const DECISIONS = [
  {
    id: "D-001",
    urgency: "high" as const,
    projectId: "P-003",
    title: "Sigma Backplane trễ nghiêm trọng — SPI 0.59",
    detail: "3 tasks trễ, PM đề xuất tăng team 3→5. Cần phê duyệt ngân sách bổ sung.",
    from: "Carol Davies",
    badge: "Khẩn cấp",
  },
  {
    id: "D-002",
    urgency: "medium" as const,
    projectId: "P-004",
    title: "Vortex Firmware sắp hết hạn — 31/03/2026",
    detail: "Tiến độ 46%, cần quyết định gia hạn hoặc cắt scope phase Release.",
    from: "Helen Li",
    badge: "Cần xử lý",
  },
  {
    id: "D-003",
    urgency: "low" as const,
    projectId: "P-008",
    title: "Mercury Comm Link sẵn sàng đóng",
    detail: "92% hoàn thành, SPI 1.02. Đề xuất đóng dự án.",
    from: "Frank Liu",
    badge: "Thông tin",
  },
];

const MEETINGS = [
  { time: "09:00", title: "Board Review Q1",     location: "Phòng lớn" },
  { time: "14:00", title: "Risk Review — Sigma", location: "Online" },
];

const RECENT_UPDATES = [
  { when: "Hôm nay 08:30", from: "Carol Davies",  msg: "Báo cáo Sigma trễ 3 tasks, đề xuất tăng team" },
  { when: "Hôm qua",       from: "Frank Liu",     msg: "Mercury Comm đạt 92%, đề xuất đóng dự án" },
  { when: "20/03",         from: "Alice Morgan",  msg: "Từ chối Power analysis — yêu cầu chạy lại CLK_AUX" },
  { when: "19/03",         from: "Helen Li",      msg: "Cảnh báo Vortex Firmware sắp hết deadline" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type RAG = "red" | "amber" | "green";
type MeetingTarget = (typeof CEO_PROJECTS)[number] | null;
type MeetingItem = { id: string; title: string; time: string; location: string };
type CTODraft = { id: string; projectId: string; projectName: string; pm: string; spi: number; proposedSlot: string; status: "pending" | "approved" };

function ragColor(rag: RAG): string {
  return rag === "red" ? "#ef4444" : rag === "amber" ? "#f59e0b" : "#22c55e";
}
function ragDot(rag: RAG) {
  const c = ragColor(rag);
  return <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />;
}
function spiBadgeStyle(spi: number) {
  if (spi >= 1) return { bg: "#dcfce7", text: "#15803d" };
  if (spi >= 0.85) return { bg: "#fef9c3", text: "#92400e" };
  return { bg: "#fee2e2", text: "#b91c1c" };
}


// ─────────────────────────────────────────────────────────────────────────────
// Compact drill-down (CEO clicks a project)
// ─────────────────────────────────────────────────────────────────────────────

function CEOProjectDrillDown({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const p = CEO_PROJECTS.find((x) => x.id === projectId) ?? CEO_PROJECTS[0];
  const budgetPct = Math.round((p.budgetSpent / p.budgetTotal) * 100);
  const rc = ragColor(p.rag);
  const spiStyle = spiBadgeStyle(p.spi);
  // Find L1 project for overdue tasks list
  const l1 = L1_PROJECTS.find((x) => x.id === projectId);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Quay lại Dashboard
      </button>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">{p.id}</span>
              <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded" style={{ backgroundColor: "#4CABEB" }}>{p.cat}</span>
            </div>
            <h2 className="text-lg font-extrabold text-foreground">{p.name}</h2>
            <p className="text-xs text-muted-foreground">PM: {p.pm} · Deadline: {l1?.endDate ?? "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            {ragDot(p.rag)}
            <span className="text-xs font-bold" style={{ color: rc }}>
              {p.rag === "red" ? "Delayed" : p.rag === "amber" ? "At Risk" : "On Track"}
            </span>
            <span className="text-lg font-black font-mono" style={{ color: rc }}>{p.progress}%</span>
          </div>
        </div>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "SPI", value: p.spi.toFixed(2), style: spiBadgeStyle(p.spi) },
          { label: "Ngân sách", value: `${p.budgetSpent}M/${p.budgetTotal}M`, style: { bg: "#eff6ff", text: "#1d4ed8" } },
          { label: "Tiến độ", value: `${p.progress}%/${p.planned}%`, style: { bg: "#f0fdf4", text: "#15803d" } },
          { label: "Nhân sự", value: `${l1?.overdueTasks?.length ?? 0} tasks trễ`, style: { bg: p.overdue > 0 ? "#fee2e2" : "#f0fdf4", text: p.overdue > 0 ? "#b91c1c" : "#15803d" } },
        ].map(({ label, value, style }) => (
          <div key={label} className="rounded-lg px-4 py-3 flex flex-col gap-0.5" style={{ backgroundColor: style.bg }}>
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: style.text }}>{label}</span>
            <span className="text-sm font-black font-mono" style={{ color: style.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="flex flex-wrap gap-2">
        {p.overdue > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            {p.overdue} task trễ hạn
          </div>
        )}
        {l1?.overdueTasks?.some((t) => t.assignee === p.pm) && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5" />
            1 task chờ PM duyệt
          </div>
        )}
      </div>

      {/* Budget bar */}
      <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Ngân sách</p>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${budgetPct}%`,
              backgroundColor: budgetPct > 85 ? "#ef4444" : "#063986",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>0</span>
          <span className="font-semibold text-foreground">{budgetPct}% đã chi</span>
          <span>{p.budgetTotal}M</span>
        </div>
      </div>

      {/* Overdue tasks */}
      {l1 && l1.overdueTasks.length > 0 && (
        <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Tasks trễ hạn</p>
          <div className="space-y-1.5">
            {l1.overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.id}</span>
                <span className="flex-1 text-foreground">{t.title}</span>
                <span className="text-muted-foreground">{t.assignee}</span>
                <span className="text-red-600 font-semibold">+{t.dueSince}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground pb-4">Chế độ xem CEO — Chỉ đọc</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function CEOExecutiveDashboard() {
  const [drillProjectId, setDrillProjectId] = useState<string | null>(null);
  const [meetingTarget, setMeetingTarget] = useState<MeetingTarget>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [pingStatus, setPingStatus] = useState<string>("");
  const [meetings, setMeetings] = useState<MeetingItem[]>(MEETINGS.map((m, idx) => ({ ...m, id: `M-${idx + 1}` })));
  const [quickMode, setQuickMode] = useState<"Sáng" | "Chiều" | "Ngày mai">("Sáng");
  const [ctoDrafts, setCtoDrafts] = useState<CTODraft[]>([
    { id: "CD-01", projectId: "P-002", projectName: "Sentinel Gateway v3", pm: "Bob Chen", spi: 0.78, proposedSlot: "2026-03-28 10:30", status: "pending" },
    { id: "CD-02", projectId: "P-005", projectName: "TerraEdge IoT Platform", pm: "Eve Nkosi", spi: 0.84, proposedSlot: "2026-03-28 15:00", status: "pending" },
  ]);

  if (drillProjectId) {
    return (
      <CEOProjectDrillDown
        projectId={drillProjectId}
        onBack={() => setDrillProjectId(null)}
      />
    );
  }

  // Derived stats
  const totalBudget  = CEO_PROJECTS.reduce((s, p) => s + p.budgetTotal, 0);
  const spentBudget  = CEO_PROJECTS.reduce((s, p) => s + p.budgetSpent, 0);
  const budgetPct    = Math.round((spentBudget / totalBudget) * 100);
  const totalOverdue = CEO_PROJECTS.reduce((s, p) => s + p.overdue, 0);
  const avgSPI       = +(CEO_PROJECTS.reduce((s, p) => s + p.spi, 0) / CEO_PROJECTS.length).toFixed(2);
  const redCount     = CEO_PROJECTS.filter((p) => p.rag === "red").length;
  const amberCount   = CEO_PROJECTS.filter((p) => p.rag === "amber").length;
  const greenCount   = CEO_PROJECTS.filter((p) => p.rag === "green").length;

  const highRiskProjects = CEO_PROJECTS.filter((p) => p.spi < 0.7);
  const pendingDecisionCount = DECISIONS.length + highRiskProjects.filter((p) => !DECISIONS.some((d) => d.projectId === p.id)).length + ctoDrafts.filter((d) => d.status === "pending").length;

  function suggestedSlots(projectId: string): string[] {
    const seed = Number(projectId.replace("P-", "")) % 3;
    if (seed === 0) return ["09:00 hôm nay", "14:30 hôm nay", "09:30 ngày mai"];
    if (seed === 1) return ["10:30 hôm nay", "15:00 hôm nay", "08:30 ngày mai"];
    return ["11:00 hôm nay", "16:00 hôm nay", "10:00 ngày mai"];
  }

  function openMeetingSheet(projectId: string) {
    const target = CEO_PROJECTS.find((x) => x.id === projectId) ?? null;
    if (!target) return;
    const slots = suggestedSlots(projectId);
    setMeetingTarget(target);
    setSelectedSlot(slots[0] ?? "");
    setPingStatus("");
  }

  function postponeMeeting(minutes: number) {
    setMeetings((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      const [h, m] = first.time.split(":").map(Number);
      const dt = new Date();
      dt.setHours(h, m + minutes, 0, 0);
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return [{ ...first, time: `${hh}:${mm}` }, ...prev.slice(1)];
    });
  }

  function pushMeetingTomorrow() {
    setMeetings((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      return [{ ...first, title: `${first.title} (dời sang mai)` }, ...prev.slice(1)];
    });
  }

  function approveDraft(draft: CTODraft) {
    setCtoDrafts((prev) => prev.map((d) => (d.id === draft.id ? { ...d, status: "approved" } : d)));
    openMeetingSheet(draft.projectId);
    setSelectedSlot(draft.proposedSlot);
    setPingStatus(`Đã duyệt nhanh đề xuất của CTO cho ${draft.projectName}.`);
  }

  // Sort: red → amber → green
  const sortedProjects = [...CEO_PROJECTS].sort((a, b) => {
    const o: Record<RAG, number> = { red: 0, amber: 1, green: 2 };
    return o[a.rag] - o[b.rag];
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── ROW 1: Greeting + Decisions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Greeting card */}
        <div className="bg-card rounded-xl border border-border px-5 py-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tổng Giám Đốc</p>
            <h2 className="text-base font-extrabold text-foreground mt-0.5">Xin chào, Giám đốc</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CEO_PROJECTS.length} dự án đang chạy · {totalOverdue} tasks trễ hạn
            </p>
          </div>

          {/* RAG summary */}
          <div className="flex items-center gap-3">
            {[
              { count: greenCount, rag: "green" as RAG, label: "Đúng tiến độ" },
              { count: amberCount, rag: "amber" as RAG, label: "Rủi ro" },
              { count: redCount,   rag: "red"   as RAG, label: "Chậm" },
            ].map(({ count, rag, label }) => (
              <div key={rag} className="flex items-center gap-1.5">
                {ragDot(rag)}
                <span className="text-sm font-black font-mono" style={{ color: ragColor(rag) }}>{count}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-[#063986]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Postpone</p>
            </div>
            <p className="mt-1 text-xs font-semibold text-foreground">
              {meetings[0]?.title ?? "Chưa có lịch gần nhất"} · <span className="font-mono">{meetings[0]?.time ?? "--:--"}</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <button onClick={() => postponeMeeting(15)} className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-muted">+15m</button>
              <button onClick={() => postponeMeeting(30)} className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-muted">+30m</button>
              <button onClick={pushMeetingTomorrow} className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-muted">Dời sang mai</button>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Lịch họp hôm nay</p>
            <div className="space-y-1.5">
              {meetings.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-primary w-10 shrink-0">{m.time}</span>
                  <span className="flex-1 font-medium text-foreground">{m.title}</span>
                  <span className="text-muted-foreground text-[10px]">{m.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decisions panel */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">Cần quyết định</h3>
            <span className="ml-1 text-[10px] font-bold bg-destructive text-white px-1.5 py-0.5 rounded-full">
              {pendingDecisionCount}
            </span>
          </div>
          <div className="divide-y divide-border">
            {DECISIONS.map((d) => {
              const styles = {
                high:   { bg: "#fff5f5", border: "#fca5a5", badge: "#b91c1c", badgeBg: "#fee2e2" },
                medium: { bg: "#fffbeb", border: "#fcd34d", badge: "#92400e", badgeBg: "#fef3c7" },
                low:    { bg: "#eff6ff", border: "#93c5fd", badge: "#1e40af", badgeBg: "#dbeafe" },
              }[d.urgency];
              return (
                <button
                  key={d.id}
                  onClick={() => setDrillProjectId(d.projectId)}
                  className="w-full text-left px-5 py-3.5 hover:brightness-95 transition-all group"
                  style={{ backgroundColor: styles.bg, borderLeft: `3px solid ${styles.border}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: styles.badgeBg, color: styles.badge }}
                        >
                          {d.badge}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">{d.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{d.detail}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Từ: <span className="font-semibold">{d.from}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMeetingSheet(d.projectId);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Lên lịch họp
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
            {highRiskProjects
              .filter((p) => !DECISIONS.some((d) => d.projectId === p.id))
              .map((p) => (
                <div
                  key={`auto-${p.id}`}
                  className="w-full text-left px-5 py-3.5"
                  style={{ backgroundColor: "#fff5f5", borderLeft: "3px solid #fca5a5" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-red-100 text-red-700">
                          Tự động
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {p.name} có SPI thấp ({p.spi.toFixed(2)})
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Cần họp đánh giá tiến độ với PM để xử lý rủi ro lịch trình.
                      </p>
                    </div>
                    <button
                      onClick={() => openMeetingSheet(p.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90"
                    >
                      <CalendarDays className="w-3 h-3" />
                      Lên lịch họp
                    </button>
                  </div>
                </div>
              ))}
            {ctoDrafts
              .filter((d) => d.status === "pending")
              .map((d) => (
                <div
                  key={d.id}
                  className="w-full text-left px-5 py-3.5"
                  style={{ backgroundColor: "#eff6ff", borderLeft: "3px solid #93c5fd" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">
                          CTO đề xuất
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {d.projectName} · <span className="font-mono">SPI {d.spi.toFixed(2)}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Khung giờ đề xuất: <span className="font-mono">{d.proposedSlot}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => approveDraft(d)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90"
                    >
                      Duyệt 1 chạm
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2: KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          {
            title: "NGÂN SÁCH",
            icon: <DollarSign className="w-4 h-4" />,
            iconBg: budgetPct > 85 ? "#fee2e2" : "#dbeafe",
            iconColor: budgetPct > 85 ? "#b91c1c" : "#063986",
            value: `${(spentBudget / 1000).toFixed(0)}/${(totalBudget / 1000).toFixed(0)}B`,
            sub: `${budgetPct}% đã chi`,
          },
          {
            title: "DỰ ÁN",
            icon: <Layers className="w-4 h-4" />,
            iconBg: "#eff6ff",
            iconColor: "#063986",
            value: `${CEO_PROJECTS.length}`,
            sub: `${greenCount} ✓  ${amberCount} ⚠  ${redCount} ✕`,
          },
          {
            title: "SPI TB",
            icon: <TrendingUp className="w-4 h-4" />,
            iconBg: avgSPI >= 1 ? "#dcfce7" : avgSPI >= 0.85 ? "#fef9c3" : "#fee2e2",
            iconColor: avgSPI >= 1 ? "#15803d" : avgSPI >= 0.85 ? "#92400e" : "#b91c1c",
            value: avgSPI.toFixed(2),
            sub: avgSPI >= 1 ? "Đúng lịch" : avgSPI >= 0.85 ? "Chú ý" : "Có rủi ro",
          },
          {
            title: "TASK TRỄ",
            icon: <ShieldAlert className="w-4 h-4" />,
            iconBg: totalOverdue > 0 ? "#fee2e2" : "#dcfce7",
            iconColor: totalOverdue > 0 ? "#b91c1c" : "#15803d",
            value: `${totalOverdue}`,
            sub: `${pendingDecisionCount} mục chờ quyết định`,
          },
          {
            title: "NHÂN SỰ",
            icon: <Users className="w-4 h-4" />,
            iconBg: "#f0fdf4",
            iconColor: "#15803d",
            value: "27",
            sub: `${CEO_PROJECTS.length} dự án`,
          },
        ].map(({ title, icon, iconBg, iconColor, value, sub }) => (
          <div key={title} className="bg-card rounded-xl border border-border px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                {icon}
              </div>
            </div>
            <p className="text-xl font-black font-mono text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Heatmap project list ───────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Tình trạng dự án</h3>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {[
              { rag: "green" as RAG, label: "Đúng tiến độ" },
              { rag: "amber" as RAG, label: "Rủi ro" },
              { rag: "red"   as RAG, label: "Chậm tiến độ" },
            ].map(({ rag, label }) => (
              <span key={rag} className="flex items-center gap-1">
                {ragDot(rag)}
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {sortedProjects.map((p) => {
            const rc = ragColor(p.rag);
            const budgetPct = Math.round((p.budgetSpent / p.budgetTotal) * 100);
            const spiStyle  = spiBadgeStyle(p.spi);
            return (
              <button
                key={p.id}
                onClick={() => setDrillProjectId(p.id)}
                className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* RAG dot */}
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rc }} />

                  {/* Name + PM */}
                  <div className="w-44 shrink-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{p.pm} · {p.cat}</p>
                  </div>

                  {/* Progress bar + planned marker */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="relative h-2 bg-muted rounded-full overflow-visible">
                      <div
                        className="absolute h-full rounded-full"
                        style={{ width: `${p.progress}%`, backgroundColor: rc, opacity: 0.85 }}
                      />
                      {/* Planned marker */}
                      <div
                        className="absolute top-[-2px] bottom-[-2px] w-0.5 bg-foreground/30 rounded-full"
                        style={{ left: `${p.planned}%` }}
                        title={`Kế hoạch: ${p.planned}%`}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Thực tế: <span className="font-semibold font-mono">{p.progress}%</span>
                      <span className="mx-1 opacity-40">|</span>
                      Kế hoạch: <span className="font-mono">{p.planned}%</span>
                    </p>
                  </div>

                  {/* SPI badge */}
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 w-12 text-center"
                    style={{ backgroundColor: spiStyle.bg, color: spiStyle.text }}
                  >
                    {p.spi.toFixed(2)}
                  </span>

                  {/* Budget mini */}
                  <div className="w-16 shrink-0 flex flex-col gap-0.5">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${budgetPct}%`,
                          backgroundColor: budgetPct > 85 ? "#ef4444" : "#4CABEB",
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-mono">B:{budgetPct}%</p>
                  </div>

                  {/* Overdue badge */}
                  <div className="w-14 shrink-0 text-center">
                    {p.overdue > 0 ? (
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ef4444" }}>
                        {p.overdue} trễ
                      </span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMeetingSheet(p.id);
                    }}
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    aria-label="Lên lịch họp"
                    title="Lên lịch họp"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                  </button>

                  {/* Chevron */}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ROW 4: Budget overview + Recent updates ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Budget overview */}
        <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Ngân sách tổng hợp</h3>
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div>
              <p className="text-[10px] text-muted-foreground">Kế hoạch</p>
              <p className="font-black font-mono text-foreground">{(totalBudget / 1000).toFixed(0)}B</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Đã chi</p>
              <p className="font-black font-mono text-primary">{(spentBudget / 1000).toFixed(0)}B</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Còn lại</p>
              <p className="font-black font-mono text-green-600">{((totalBudget - spentBudget) / 1000).toFixed(0)}B</p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${budgetPct}%`, backgroundColor: budgetPct > 85 ? "#ef4444" : "#063986" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">{budgetPct}% ngân sách đã sử dụng</p>

          {/* Top 5 projects */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Top 5 dự án</p>
            {[...CEO_PROJECTS]
              .sort((a, b) => b.budgetSpent - a.budgetSpent)
              .slice(0, 5)
              .map((p) => {
                const pct = Math.round((p.budgetSpent / p.budgetTotal) * 100);
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 truncate shrink-0">{p.name.split(" ").slice(0, 1).join(" ")}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: pct > 85 ? "#ef4444" : "#063986" }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-20 text-right shrink-0">
                      {p.budgetSpent}M/{p.budgetTotal}M
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent PM updates */}
        <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Cập nhật từ PM</h3>
          <div className="space-y-3">
            {RECENT_UPDATES.map((u, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                  {i < RECENT_UPDATES.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">{u.when}</span>
                    <span className="font-semibold text-foreground">{u.from}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px]">{u.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!meetingTarget} onOpenChange={(o) => !o && setMeetingTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {meetingTarget && (
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="text-base font-bold">Lên lịch họp đánh giá</SheetTitle>
                <SheetDescription className="text-xs">
                  Giao diện rút gọn: chọn nhanh khung giờ và gửi thông báo ngay.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 overflow-auto p-4 text-xs">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Dự án</p>
                  <p className="font-semibold text-foreground">{meetingTarget.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    PM: {meetingTarget.pm} · SPI hiện tại: <span className="font-mono">{meetingTarget.spi.toFixed(2)}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">3 khung giờ gợi ý</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedSlots(meetingTarget.id).map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left font-mono transition-colors",
                          selectedSlot === slot ? "border-[#063986] bg-blue-50 text-[#063986]" : "border-border hover:bg-muted"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">Tác vụ nhanh</p>
                  <div className="flex items-center gap-2">
                    {(["Sáng", "Chiều", "Ngày mai"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setQuickMode(m);
                          const quickSlot = m === "Sáng" ? "09:00 hôm nay" : m === "Chiều" ? "15:00 hôm nay" : "09:00 ngày mai";
                          setSelectedSlot(quickSlot);
                        }}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[10px] font-semibold",
                          quickMode === m ? "border-[#063986] bg-[#063986] text-white" : "border-border hover:bg-muted"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-[11px] font-semibold text-foreground">Nội dung Telegram (mock)</p>
                  <p className="text-[10px] text-muted-foreground">
                    Chairman has summoned you for {meetingTarget.name} review at {selectedSlot || "khung giờ mặc định"}. Be prepared. Link: [Google Meet]
                  </p>
                </div>

                {pingStatus && (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                    {pingStatus}
                  </div>
                )}
              </div>

              <SheetFooter className="border-t border-border">
                <button
                  onClick={() => {
                    const meetLink = `https://meet.google.com/lancs-${meetingTarget.id.toLowerCase().replace("p-", "")}-${Date.now().toString(36).slice(-5)}`;
                    setPingStatus(
                      `Đã tạo Meet: ${meetLink}. Đã gửi Telegram cho người tham gia: "Chairman has summoned you for ${meetingTarget.name} review at ${selectedSlot || "khung giờ mặc định"}. Be prepared. Link: ${meetLink}"`
                    );
                  }}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-[#E36C25] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
                  Xác nhận & Ping Telegram
                </button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
