"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft, AlertTriangle, Clock, CheckCircle2, TrendingUp, Users, DollarSign, Layers, ShieldAlert, CalendarDays, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMPLOYEES, L1_PROJECTS, L1Project, avgKPI } from "@/lib/strategic-mock-data";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

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
type StaffFilter = "top10" | "risk" | "overload";
type DashboardView = "portfolio" | "staff";

// #region agent log
function sendDebug(payload: Record<string, unknown>) {
  fetch("http://127.0.0.1:7885/ingest/716782fa-1337-4ad3-b0ee-c627486caea9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "043cf0",
    },
    body: JSON.stringify({
      sessionId: "043cf0",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
}
// #endregion

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
  const [dashboardView, setDashboardView] = useState<DashboardView>("portfolio");
  const [meetingTarget, setMeetingTarget] = useState<MeetingTarget>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [pingStatus, setPingStatus] = useState<string>("");
  const [meetingMessage, setMeetingMessage] = useState<string>("");
  const [customMeetingTime, setCustomMeetingTime] = useState<string>("");
  const meetings = MEETINGS.map((m, idx) => ({ ...m, id: `M-${idx + 1}` }));
  const [quickMode, setQuickMode] = useState<"Sáng" | "Chiều" | "Ngày mai">("Sáng");
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("top10");
  const [staffScrollTop, setStaffScrollTop] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [projectScrollTop, setProjectScrollTop] = useState(0);

  // #region agent log
  if (typeof window !== "undefined") {
    const debugWindow = window as unknown as { __ceoDebugRender043cf0?: boolean };
    if (!debugWindow.__ceoDebugRender043cf0) {
      debugWindow.__ceoDebugRender043cf0 = true;
    sendDebug({
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "components/strategic/ceo-executive-dashboard.tsx:render",
      message: "Component render reached",
      data: {
        dashboardView,
        decisionsCount: DECISIONS.length,
        projectCount: CEO_PROJECTS.length,
      },
    });
    }
  }

  useEffect(() => {
    sendDebug({
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "components/strategic/ceo-executive-dashboard.tsx:CEOExecutiveDashboard",
      message: "Render structure check for nested button in decisions cards",
      data: {
        hasDecisionOuterButton: true,
        hasDecisionInnerScheduleButton: true,
        decisionsCount: DECISIONS.length,
      },
    });

    sendDebug({
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "components/strategic/ceo-executive-dashboard.tsx:CEOExecutiveDashboard",
      message: "Render structure check for nested button in project table rows",
      data: {
        hasProjectRowOuterButton: true,
        hasProjectRowInnerCalendarButton: true,
        projectsCount: CEO_PROJECTS.length,
      },
    });

    sendDebug({
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "components/strategic/ceo-executive-dashboard.tsx:CEOExecutiveDashboard",
      message: "Control hypothesis for non-button sources",
      data: {
        usesSheetComponent: true,
        suspectedSheetNestedButtonSource: false,
        suspectedDrawerNestedButtonSource: false,
      },
    });
  }, []);
  // #endregion
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
    setCustomMeetingTime("");
    setMeetingMessage("");
    setPingStatus("");
  }

  const projectSpiMap = Object.fromEntries(L1_PROJECTS.map((p) => [p.id, p.spi]));

  const staffRows = EMPLOYEES.filter((e) => e.status === "active").map((e) => {
    const avgSpi =
      e.assignedProjects.length > 0
        ? e.assignedProjects.reduce((s, p) => s + (projectSpiMap[p.id] ?? 1), 0) / e.assignedProjects.length
        : 1;
    const reliability = avgKPI(e.kpi);
    const loadCapacity = Math.round(70 + e.assignedProjects.length * 22 + Math.max(0, 85 - reliability) * 0.45);
    const atRisk = avgSpi < 0.7 || loadCapacity > 110;
    return { id: e.id, name: e.name, dept: e.dept, role: e.role, avgSpi, reliability, loadCapacity, projects: e.assignedProjects, atRisk };
  });

  const filteredStaff = (() => {
    if (staffFilter === "risk") return staffRows.filter((s) => s.atRisk);
    if (staffFilter === "overload") return staffRows.filter((s) => s.loadCapacity > 110);
    return [...staffRows].sort((a, b) => b.reliability - a.reliability).slice(0, 10);
  })();

  const groupedStaff = filteredStaff.reduce<Record<string, typeof filteredStaff>>((acc, s) => {
    (acc[s.dept] = acc[s.dept] ?? []).push(s);
    return acc;
  }, {});

  const flatStaffRows = Object.entries(groupedStaff).flatMap(([dept, rows]) => [
    { kind: "group" as const, dept },
    ...rows.map((staff) => ({ kind: "staff" as const, staff })),
  ]);

  const STAFF_ROW_HEIGHT = 36;
  const STAFF_VIEWPORT_HEIGHT = 500;
  const staffStart = Math.max(0, Math.floor(staffScrollTop / STAFF_ROW_HEIGHT) - 8);
  const staffEnd = Math.min(flatStaffRows.length, Math.ceil((staffScrollTop + STAFF_VIEWPORT_HEIGHT) / STAFF_ROW_HEIGHT) + 8);
  const visibleStaffRows = flatStaffRows.slice(staffStart, staffEnd);
  const selectedEmployee = staffRows.find((s) => s.id === selectedEmployeeId) ?? null;

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

  const PROJECT_ROW_HEIGHT = 52;
  const PROJECT_VIEWPORT_HEIGHT = 430;
  const projectStart = Math.max(0, Math.floor(projectScrollTop / PROJECT_ROW_HEIGHT) - 8);
  const projectEnd = Math.min(
    sortedProjects.length,
    Math.ceil((projectScrollTop + PROJECT_VIEWPORT_HEIGHT) / PROJECT_ROW_HEIGHT) + 8
  );
  const visibleProjects = sortedProjects.slice(projectStart, projectEnd);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
        <h2 className="text-sm font-bold text-[#063986]">Level 1 - CEO Dashboard</h2>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setDashboardView("portfolio")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
              dashboardView === "portfolio" ? "bg-[#063986] text-white" : "text-muted-foreground hover:bg-card"
            )}
          >
            Project Portfolio
          </button>
          <button
            onClick={() => setDashboardView("staff")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
              dashboardView === "staff" ? "bg-[#063986] text-white" : "text-muted-foreground hover:bg-card"
            )}
          >
            Staff KPI View
          </button>
        </div>
      </div>

      {dashboardView === "portfolio" && (
      <>
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
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Timeline lịch họp (CEO)
            </p>
            <div className="relative pl-2">
              <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-muted" aria-hidden="true" />
              <div className="space-y-1.5">
                {meetings.map((m, idx) => {
                  const isNext = idx === 0;
                  return (
                    <div key={m.id} className={cn("flex items-start gap-2 text-xs pl-2", isNext && "bg-blue-50 rounded-lg px-2 py-1")}>
                      <span className="relative font-mono font-bold text-primary w-14 shrink-0">
                        {m.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.location}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Decisions panel */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">Cần quyết định</h3>
            <span className="ml-1 text-xs font-bold bg-destructive text-white px-1.5 py-0.5 rounded-full">
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
                <div
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDrillProjectId(d.projectId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDrillProjectId(d.projectId);
                    }
                  }}
                  className="w-full text-left px-5 py-3.5 hover:brightness-95 transition-all group cursor-pointer"
                  style={{ backgroundColor: styles.bg, borderLeft: `3px solid ${styles.border}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: styles.badgeBg, color: styles.badge }}
                        >
                          {d.badge}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">{d.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{d.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">Từ: <span className="font-semibold">{d.from}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMeetingSheet(d.projectId);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Lên lịch họp
                      </button>
                    </div>
                  </div>
                </div>
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
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-red-100 text-red-700">
                          Tự động
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {p.name} có SPI thấp ({p.spi.toFixed(2)})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Cần họp đánh giá tiến độ với PM để xử lý rủi ro lịch trình.
                      </p>
                    </div>
                    <button
                      onClick={() => openMeetingSheet(p.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
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
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">
                          CTO đề xuất
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {d.projectName} · <span className="font-mono">SPI {d.spi.toFixed(2)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Khung giờ đề xuất: <span className="font-mono">{d.proposedSlot}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => approveDraft(d)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#063986] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
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
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                {icon}
              </div>
            </div>
            <p className="text-xl font-black font-mono text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Heatmap project list ───────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Tình trạng dự án</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
        <div className="grid grid-cols-12 px-4 py-2 text-xs text-muted-foreground border-b border-border bg-muted/20">
          <div className="col-span-4">Dự án</div>
          <div className="col-span-4 text-center">Actual / Planned</div>
          <div className="col-span-2 text-center">Variance (Δ)</div>
          <div className="col-span-1 text-center">SPI</div>
          <div className="col-span-1 text-center">Action</div>
        </div>
        <div className="overflow-y-auto" style={{ height: PROJECT_VIEWPORT_HEIGHT }} onScroll={(e) => setProjectScrollTop(e.currentTarget.scrollTop)}>
          <div style={{ height: sortedProjects.length * PROJECT_ROW_HEIGHT, position: "relative" }}>
            {visibleProjects.map((p, idx) => {
              const i = projectStart + idx;
              const top = i * PROJECT_ROW_HEIGHT;
              const rc = ragColor(p.rag);
              const delta = p.progress - p.planned;
              const deltaColor = delta < 0 ? "text-red-600" : delta > 0 ? "text-green-600" : "text-gray-500";
              const plannedPos = Math.max(0, Math.min(100, p.planned));
              const actualPos = Math.max(0, Math.min(100, p.progress));
              const negGapWidth = delta < 0 ? Math.abs(delta) : 0;
              const negGapLeft = delta < 0 ? p.progress : 0;

              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDrillProjectId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDrillProjectId(p.id);
                    }
                  }}
                  className="absolute left-0 right-0 grid grid-cols-12 items-center px-4 border-b border-border hover:bg-muted/25 text-left group cursor-pointer"
                  style={{ top, height: PROJECT_ROW_HEIGHT }}
                >
                  <div className="col-span-4 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: rc }} />
                      <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.pm} · {p.cat} · {p.overdue} task trễ
                    </p>
                  </div>

                  <div className="col-span-4 px-2">
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      {delta < 0 && (
                        <div
                          className="absolute top-0 bottom-0 bg-[#E36C25]/20"
                          style={{ left: `${negGapLeft}%`, width: `${negGapWidth}%` }}
                        />
                      )}
                      <div className="absolute top-0 bottom-0 rounded-full" style={{ width: `${actualPos}%`, backgroundColor: rc }} />
                      <div className="absolute top-[-1px] bottom-[-1px] w-[1px] bg-foreground/50" style={{ left: `${plannedPos}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-mono">{p.progress}% / {p.planned}%</p>
                  </div>

                  <div className={cn("col-span-2 text-center font-mono text-xs font-semibold", deltaColor)}>
                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                  </div>

                  <div className="col-span-1 text-center">
                    <span className="font-mono font-extrabold text-sm text-foreground">{p.spi.toFixed(2)}</span>
                  </div>

                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMeetingSheet(p.id);
                      }}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      aria-label="Lên lịch họp"
                      title="Lên lịch họp"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Budget overview + Recent updates ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Budget overview */}
        <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-3">
          <h3 className="text-base font-bold text-foreground">Ngân sách tổng hợp</h3>
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Kế hoạch</p>
              <p className="font-black font-mono text-foreground">{(totalBudget / 1000).toFixed(0)}B</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đã chi</p>
              <p className="font-black font-mono text-primary">{(spentBudget / 1000).toFixed(0)}B</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Còn lại</p>
              <p className="font-black font-mono text-green-600">{((totalBudget - spentBudget) / 1000).toFixed(0)}B</p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${budgetPct}%`, backgroundColor: budgetPct > 85 ? "#ef4444" : "#063986" }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono">{budgetPct}% ngân sách đã sử dụng</p>

          {/* Top 5 projects */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top 5 dự án</p>
            {[...CEO_PROJECTS]
              .sort((a, b) => b.budgetSpent - a.budgetSpent)
              .slice(0, 5)
              .map((p) => {
                const pct = Math.round((p.budgetSpent / p.budgetTotal) * 100);
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 truncate shrink-0">{p.name.split(" ").slice(0, 1).join(" ")}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: pct > 85 ? "#ef4444" : "#063986" }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-20 text-right shrink-0">
                      {p.budgetSpent}M/{p.budgetTotal}M
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent PM updates */}
        <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-3">
          <h3 className="text-base font-bold text-foreground">Cập nhật từ PM</h3>
          <div className="space-y-3">
            {RECENT_UPDATES.map((u, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                  {i < RECENT_UPDATES.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{u.when}</span>
                    <span className="font-semibold text-foreground">{u.from}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed text-sm">{u.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}

      {dashboardView === "staff" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Avg SPI</p>
              <p className="font-mono text-lg font-bold">{(filteredStaff.reduce((s, x) => s + x.avgSpi, 0) / Math.max(filteredStaff.length, 1)).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Reliability Score</p>
              <p className="font-mono text-lg font-bold">{Math.round(filteredStaff.reduce((s, x) => s + x.reliability, 0) / Math.max(filteredStaff.length, 1))}%</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Load Capacity</p>
              <p className="font-mono text-lg font-bold">{Math.round(filteredStaff.reduce((s, x) => s + x.loadCapacity, 0) / Math.max(filteredStaff.length, 1))}%</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setStaffFilter("top10")} className={cn("rounded-md border px-2.5 py-1 text-[11px] font-semibold", staffFilter === "top10" ? "bg-[#063986] text-white border-[#063986]" : "border-border")}>Top 10 Performance</button>
            <button onClick={() => setStaffFilter("risk")} className={cn("rounded-md border px-2.5 py-1 text-[11px] font-semibold", staffFilter === "risk" ? "bg-[#063986] text-white border-[#063986]" : "border-border")}>At-Risk Staff</button>
            <button onClick={() => setStaffFilter("overload")} className={cn("rounded-md border px-2.5 py-1 text-[11px] font-semibold", staffFilter === "overload" ? "bg-[#063986] text-white border-[#063986]" : "border-border")}>Overloaded Staff</button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-card">
            <div className="grid grid-cols-12 border-b border-[#e5e7eb] bg-muted/20 px-3 text-[11px] font-semibold text-muted-foreground" style={{ height: STAFF_ROW_HEIGHT }}>
              <div className="col-span-4 flex items-center">Nhân sự</div>
              <div className="col-span-2 flex items-center justify-center">Avg SPI</div>
              <div className="col-span-3 flex items-center justify-center">Reliability</div>
              <div className="col-span-3 flex items-center justify-center">Load Capacity</div>
            </div>

            <div className="overflow-y-auto" style={{ height: STAFF_VIEWPORT_HEIGHT }} onScroll={(e) => setStaffScrollTop(e.currentTarget.scrollTop)}>
              <div style={{ height: flatStaffRows.length * STAFF_ROW_HEIGHT, position: "relative" }}>
                {visibleStaffRows.map((row, idx) => {
                  const i = staffStart + idx;
                  const top = i * STAFF_ROW_HEIGHT;
                  if (row.kind === "group") {
                    return (
                      <div key={`g-${row.dept}-${i}`} className="absolute left-0 right-0 border-b border-[#e5e7eb] bg-muted/35 px-3 text-[11px] font-semibold text-[#063986]" style={{ top, height: STAFF_ROW_HEIGHT, lineHeight: `${STAFF_ROW_HEIGHT}px` }}>
                        {row.dept}
                      </div>
                    );
                  }
                  const s = row.staff;
                  return (
                    <button
                      key={`s-${s.id}-${i}`}
                      onClick={() => setSelectedEmployeeId(s.id)}
                      className={cn(
                        "absolute left-0 right-0 grid grid-cols-12 items-center border-b border-[#e5e7eb] px-3 text-xs text-left hover:bg-muted/20",
                        (s.avgSpi < 0.7 || s.loadCapacity > 110) && "bg-[#E36C25]/10"
                      )}
                      style={{ top, height: STAFF_ROW_HEIGHT }}
                    >
                      <div className="col-span-4 truncate font-medium">{s.name}</div>
                      <div className="col-span-2 text-center font-mono">{s.avgSpi.toFixed(2)}</div>
                      <div className="col-span-3 text-center font-mono">{s.reliability}%</div>
                      <div className={cn("col-span-3 text-center font-mono", s.loadCapacity > 110 && "text-red-600 font-semibold")}>{s.loadCapacity}%</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Giờ tùy chọn</label>
                  <input
                    type="datetime-local"
                    value={customMeetingTime}
                    onChange={(e) => setCustomMeetingTime(e.target.value)}
                    className="w-full rounded-md border border-border px-2 py-1.5 text-xs font-mono"
                  />
                  <button
                    onClick={() => customMeetingTime && setSelectedSlot(customMeetingTime.replace("T", " "))}
                    className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-muted"
                  >
                    Dùng giờ này
                  </button>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-[11px] font-semibold text-foreground">Nội dung Telegram (mock)</p>
                  <p className="text-[10px] text-muted-foreground">
                    Chairman has summoned you for {meetingTarget.name} review at {selectedSlot || "khung giờ mặc định"}. Be prepared. Link: [Google Meet]
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Nội dung nhắn thêm</label>
                  <textarea
                    value={meetingMessage}
                    onChange={(e) => setMeetingMessage(e.target.value)}
                    placeholder="Nhập ghi chú hoặc yêu cầu chuẩn bị cho cuộc họp..."
                    className="min-h-[88px] w-full rounded-md border border-border px-2 py-1.5 text-xs"
                  />
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
                    const customNote = meetingMessage.trim() ? ` Ghi chú thêm: ${meetingMessage.trim()}` : "";
                    setPingStatus(
                      `Đã tạo Meet: ${meetLink}. Đã gửi Telegram cho người tham gia: "Chairman has summoned you for ${meetingTarget.name} review at ${selectedSlot || "khung giờ mặc định"}. Be prepared. Link: ${meetLink}.${customNote}"`
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

      <Sheet open={!!selectedEmployee} onOpenChange={(o) => !o && setSelectedEmployeeId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedEmployee && (
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="text-base font-bold">{selectedEmployee.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedEmployee.role} · {selectedEmployee.dept}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 overflow-auto p-4 text-xs">
                <div className="h-52 rounded-lg border border-border p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { metric: "SPI", value: Number((selectedEmployee.avgSpi * 100).toFixed(0)) },
                      { metric: "Reliability", value: selectedEmployee.reliability },
                      { metric: "Load", value: Math.min(selectedEmployee.loadCapacity, 140) },
                      { metric: "Ổn định", value: Math.max(0, 120 - selectedEmployee.loadCapacity) },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                      <Radar dataKey="value" stroke="#063986" fill="#063986" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-[11px] font-semibold">Dự án đang phụ trách</p>
                  <div className="space-y-1.5">
                    {selectedEmployee.projects.length === 0 && <p className="text-[10px] text-muted-foreground">Không có dự án được giao.</p>}
                    {selectedEmployee.projects.map((p) => (
                      <div key={`${selectedEmployee.id}-${p.id}`} className="flex items-center justify-between">
                        <span className="text-[11px]">{p.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t border-border">
                <button
                  onClick={() => {
                    const firstProjectId = selectedEmployee.projects[0]?.id ?? "P-001";
                    setSelectedEmployeeId(null);
                    openMeetingSheet(firstProjectId);
                  }}
                  className="w-full rounded-md bg-[#063986] px-3 py-2 text-xs font-semibold text-white"
                >
                  Schedule Performance Review
                </button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
