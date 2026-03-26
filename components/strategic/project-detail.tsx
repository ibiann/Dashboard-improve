"use client";

import { useState } from "react";
import {
  ChevronLeft, Activity, Users, DollarSign, ShieldAlert,
  Clock, AlertTriangle, CheckCircle2, Circle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { L1Project } from "@/lib/strategic-mock-data";

// ─── Mock data (fixed for PRJ-001 NavComm FPGA Core) ─────────────────────────

const DETAIL_PHASES = [
  {
    name: "Survey",
    progress: 100,
    status: "Hoàn thành",
    tasks: { done: 4, total: 4 },
    weight: 15,
    color: "#063986",
    start: "2025-01-10",
    end: "2025-03-15",
  },
  {
    name: "R&D",
    progress: 65,
    status: "Đang thực hiện",
    tasks: { done: 3, total: 6 },
    weight: 50,
    color: "#4CABEB",
    start: "2025-03-16",
    end: "2025-12-31",
  },
  {
    name: "Test",
    progress: 15,
    status: "Đang thực hiện",
    tasks: { done: 1, total: 4 },
    weight: 25,
    color: "#E36C25",
    start: "2026-01-01",
    end: "2026-04-30",
  },
  {
    name: "Release",
    progress: 0,
    status: "Chưa bắt đầu",
    tasks: { done: 0, total: 2 },
    weight: 10,
    color: "#d1d5db",
    start: "2026-05-01",
    end: "2026-06-30",
  },
];

const DETAIL_TEAM = [
  {
    initials: "JH",
    name: "James Hart",
    role: "FPGA Engineer",
    activeTasks: 3,
    loggedHours: 180,
    plannedHours: 200,
    workloadPct: 90,
    bg: "#063986",
  },
  {
    initials: "MR",
    name: "Maria Russo",
    role: "Signal Engineer",
    activeTasks: 2,
    loggedHours: 80,
    plannedHours: 140,
    workloadPct: 57,
    bg: "#4CABEB",
  },
  {
    initials: "KA",
    name: "Kwame Asante",
    role: "Verification Eng",
    activeTasks: 2,
    loggedHours: 70,
    plannedHours: 120,
    workloadPct: 58,
    bg: "#E36C25",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Test Engineer",
    activeTasks: 1,
    loggedHours: 15,
    plannedHours: 110,
    workloadPct: 14,
    bg: "#22c55e",
  },
];

const DETAIL_RISKS = [
  {
    id: "R-006",
    title: "Timing closure trễ — blocking Test phase",
    desc: "1 unresolved critical path violation in FPGA synthesis. If not resolved, Test phase entry delayed by ≥2 weeks.",
    owner: "James Hart",
    date: "2026-03-03",
    severity: "Cao" as const,
    status: "Đang xử lý" as const,
  },
  {
    id: "R-010",
    title: "Power analysis kết quả chưa đạt CLK_AUX",
    desc: "Power numbers on auxiliary clock domain exceed spec by 12%. Requires redesign of power gating logic.",
    owner: "Maria Russo",
    date: "2026-02-18",
    severity: "Trung bình" as const,
    status: "Mới" as const,
  },
];

const DETAIL_OVERDUE = [
  {
    id: "T-010",
    title: "Power analysis simulation",
    assignee: "Maria Russo",
    dueDate: "2025-11-20",
    overdueDays: 126,
  },
];

const DETAIL_ACTIVITIES = [
  {
    initials: "AM",
    bg: "#E36C25",
    user: "Alice Morgan",
    action: "Từ chối task",
    detail: '"Power analysis simulation" — lý do: Power numbers look off',
    time: "Hôm nay 14:30",
  },
  {
    initials: "JH",
    bg: "#063986",
    user: "James Hart",
    action: "Log work 8h",
    detail: "FPGA synthesis timing closure — 65%",
    time: "Hôm nay 09:00",
  },
  {
    initials: "JH",
    bg: "#063986",
    user: "James Hart",
    action: "Log work 6h",
    detail: "Resolved 2 of 3 critical path violations",
    time: "Hôm qua 16:05",
  },
  {
    initials: "AM",
    bg: "#E36C25",
    user: "Alice Morgan",
    action: "Approve timesheet",
    detail: "Kwame Asante — IP core integration — 7h",
    time: "20/03 14:30",
  },
  {
    initials: "AM",
    bg: "#E36C25",
    user: "Alice Morgan",
    action: "Giao task mới",
    detail: '"Review IoT sensor firmware" cho James Hart',
    time: "18/03 09:00",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ragColors(rag: string) {
  if (rag === "green")  return { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e", label: "On Track" };
  if (rag === "amber")  return { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b", label: "At Risk" };
  return                       { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444", label: "Delayed" };
}

function workloadColor(pct: number) {
  if (pct >= 80) return "#ef4444";
  if (pct >= 50) return "#f59e0b";
  return "#22c55e";
}

function statusIcon(status: string) {
  if (status === "Hoàn thành") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
  if (status === "Đang thực hiện") return <Loader2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  return <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon, iconBg, label, value, sub,
}: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
        style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-black font-mono text-foreground leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
      </div>
    </div>
  );
}

// ─── Tab: Tổng quan ───────────────────────────────────────────────────────────

function TabOverview({ role, project }: { role: "CEO" | "CTO"; project: L1Project }) {
  const rag = ragColors(project.ragStatus);
  const totalPlanned = 840;
  const totalLogged = 546;

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          iconBg="#063986"
          label="SPI"
          value="0.88"
          sub="Schedule Performance Index"
        />
        <KpiCard
          icon={<Loader2 className="w-4 h-4" />}
          iconBg="#4CABEB"
          label="Tiến độ"
          value={`${project.progress}%`}
          sub={`KH: ${project.plannedProgress}%`}
        />
        <KpiCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBg="#E36C25"
          label="Tasks"
          value="2/8 done"
          sub="1 chờ duyệt · 1 trễ"
        />
        <KpiCard
          icon={<Clock className="w-4 h-4" />}
          iconBg="#8b5cf6"
          label="Giờ"
          value={`${totalLogged}h`}
          sub={`KH: ${totalPlanned}h · Duyệt: 380h`}
        />
        {role === "CEO" ? (
          <KpiCard
            icon={<DollarSign className="w-4 h-4" />}
            iconBg="#16a34a"
            label="Ngân sách"
            value={`${Math.round((project.budget.spent / 1e6) * 1000)}M`}
            sub={`KH: ${Math.round((project.budget.total / 1e6) * 1000)}M (${Math.round(project.budget.spent / project.budget.total * 100)}%)`}
          />
        ) : (
          <KpiCard
            icon={<Users className="w-4 h-4" />}
            iconBg="#16a34a"
            label="Team"
            value="4 members"
            sub="1 overload"
          />
        )}
      </div>

      {/* Phase Progress + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Phase Progress */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Phase Progress</h3>
          {DETAIL_PHASES.map((ph) => (
            <div key={ph.name} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {statusIcon(ph.status)}
                  <span className="text-xs font-semibold text-foreground">{ph.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                    ph.status === "Hoàn thành" ? "bg-green-100 text-green-700" :
                    ph.status === "Đang thực hiện" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-500"
                  )}>
                    {ph.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[10px] text-muted-foreground">
                  <span>{ph.tasks.done}/{ph.tasks.total} tasks</span>
                  <span>weight {ph.weight}%</span>
                  <span className="font-mono font-bold text-foreground w-8 text-right">{ph.progress}%</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${ph.progress}%`, backgroundColor: ph.color }} />
              </div>
            </div>
          ))}
          {/* Overall */}
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Overall</span>
              <span className="font-black font-mono text-foreground">{project.progress}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: rag.dot }} />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {/* Overdue task */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-700">Task trễ hạn ({DETAIL_OVERDUE.length})</span>
            </div>
            {DETAIL_OVERDUE.map((t) => (
              <div key={t.id} className="text-[11px] text-red-700 leading-tight">
                <p className="font-semibold">{t.title}</p>
                <p className="text-red-500">{t.assignee} — <span className="font-bold">Trễ {t.overdueDays} ngày</span></p>
              </div>
            ))}
          </div>
          {/* Pending review */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-700">1 task chờ PM duyệt</span>
            </div>
            <p className="text-[10px] text-amber-600">Tiến độ chỉ cập nhật sau khi PM approve</p>
          </div>
          {/* Risks */}
          <div className="bg-white border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">Rủi ro ({DETAIL_RISKS.length})</span>
            </div>
            {DETAIL_RISKS.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-[11px]">
                <div className={cn("w-2 h-2 rounded-full mt-0.5 shrink-0",
                  r.severity === "Cao" ? "bg-red-500" : "bg-amber-400")} />
                <div>
                  <p className="font-semibold text-foreground leading-tight">{r.title}</p>
                  <p className="text-muted-foreground">{r.owner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload Mini */}
      <div className="bg-white border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Team Workload</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DETAIL_TEAM.map((m) => (
            <div key={m.initials} className={cn(
              "rounded-lg p-3 space-y-2 border",
              m.workloadPct >= 80 ? "bg-red-50 border-red-200" : "bg-slate-50 border-border"
            )}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: m.bg }}>
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{m.activeTasks} tasks</span>
                  <span className="font-mono font-bold" style={{ color: workloadColor(m.workloadPct) }}>
                    {m.workloadPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-border/50">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${m.workloadPct}%`, backgroundColor: workloadColor(m.workloadPct) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">Hoạt động gần đây</h3>
          <span className="text-[11px] text-primary font-medium cursor-pointer hover:underline">
            Xem tất cả →
          </span>
        </div>
        <div className="space-y-3">
          {DETAIL_ACTIVITIES.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                style={{ backgroundColor: a.bg }}>
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground leading-tight">
                  <span className="font-semibold">{a.user}</span> — {a.action}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">{a.detail}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Phase & Timeline ────────────────────────────────────────────────────

function TabPhaseTimeline({ project }: { project: L1Project }) {
  // Gantt config: timeline Jan 2025 → Jun 2026 = 18 months
  const START_MS = new Date("2025-01-01").getTime();
  const END_MS   = new Date("2026-07-01").getTime();
  const TOTAL_MS = END_MS - START_MS;

  function pct(dateStr: string) {
    return Math.max(0, Math.min(100, ((new Date(dateStr).getTime() - START_MS) / TOTAL_MS) * 100));
  }
  function width(startStr: string, endStr: string) {
    return Math.max(1, pct(endStr) - pct(startStr));
  }

  const todayPct = pct(new Date().toISOString().slice(0, 10));

  const MONTH_LABELS = [
    "Jan'25","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
    "Jan'26","Feb","Mar","Apr","May","Jun",
  ];

  return (
    <div className="space-y-5">
      {/* Gantt */}
      <div className="bg-white border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-4">Gantt Chart</h3>
        {/* Month headers */}
        <div className="relative mb-1 ml-24">
          <div className="flex">
            {MONTH_LABELS.map((m, i) => (
              <div key={i} className="flex-1 text-[9px] text-muted-foreground text-center border-l border-border/40 py-1">
                {m}
              </div>
            ))}
          </div>
        </div>
        {/* Phase bars */}
        <div className="relative space-y-2">
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ left: `calc(6rem + ${todayPct}% * (100% - 6rem) / 100)` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 text-[9px] text-red-500 font-bold whitespace-nowrap">Today</span>
          </div>
          {DETAIL_PHASES.map((ph) => (
            <div key={ph.name} className="flex items-center gap-2">
              <div className="w-24 shrink-0 text-[11px] font-semibold text-foreground text-right pr-2">{ph.name}</div>
              <div className="flex-1 relative h-6 bg-muted rounded-md overflow-visible">
                <div
                  className="absolute top-0 h-full rounded-md"
                  style={{
                    left: `${pct(ph.start)}%`,
                    width: `${width(ph.start, ph.end)}%`,
                    backgroundColor: ph.color + "33",
                    border: `1px solid ${ph.color}`,
                  }}
                >
                  <div
                    className="h-full rounded-md transition-all"
                    style={{ width: `${ph.progress}%`, backgroundColor: ph.color }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white mix-blend-difference pointer-events-none">
                    {ph.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase detail cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DETAIL_PHASES.map((ph) => (
          <div key={ph.name} className="bg-white border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ph.color }} />
              <span className="text-xs font-bold text-foreground">{ph.name}</span>
              <span className={cn(
                "ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                ph.status === "Hoàn thành" ? "bg-green-100 text-green-700" :
                ph.status === "Đang thực hiện" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-500"
              )}>
                {ph.status}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">{ph.start} → {ph.end}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{ph.tasks.done}/{ph.tasks.total} tasks</span>
                <span className="font-mono font-bold text-foreground">{ph.progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${ph.progress}%`, backgroundColor: ph.color }} />
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">Weight <span className="font-semibold text-foreground">{ph.weight}%</span></div>
          </div>
        ))}
      </div>

      {/* Formula explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-xs font-bold text-blue-800 mb-2">Công thức tính tiến độ</h4>
        <div className="text-[11px] text-blue-700 font-mono space-y-1 leading-relaxed">
          <p>Phase Progress = Σ(task_progress × task_planned_hours) / Σ(task_planned_hours)</p>
          <p>Overall = Σ(phase_progress × phase_weight) / 100</p>
          <p className="font-semibold">= (100×15% + 65×50% + 15×25% + 0×10%) / 100 = <span className="text-blue-900">65%</span></p>
          <p>SPI = Overall / Planned = 65% / 74% = <span className="text-blue-900 font-black">0.88</span> (At Risk)</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Nhân sự & Nguồn lực ─────────────────────────────────────────────────

function TabResource() {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-foreground">Team Members</h3>
        </div>
        <div className="divide-y divide-border">
          {DETAIL_TEAM.map((m) => (
            <div key={m.initials} className="flex items-center gap-4 px-4 py-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: m.bg }}>
                {m.initials}
              </div>
              <div className="w-40 shrink-0">
                <p className="text-xs font-bold text-foreground">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.role}</p>
              </div>
              <div className="w-16 shrink-0 text-center">
                <p className="text-xs font-semibold text-foreground">{m.activeTasks}</p>
                <p className="text-[10px] text-muted-foreground">tasks</p>
              </div>
              {/* Hours bar */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Giờ thực tế / kế hoạch</span>
                  <span className="font-mono font-semibold text-foreground">{m.loggedHours}h / {m.plannedHours}h</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (m.loggedHours / m.plannedHours) * 100)}%` }} />
                </div>
              </div>
              {/* Workload bar */}
              <div className="w-28 shrink-0">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Workload</span>
                  <span className="font-mono font-bold" style={{ color: workloadColor(m.workloadPct) }}>
                    {m.workloadPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${m.workloadPct}%`, backgroundColor: workloadColor(m.workloadPct) }} />
                </div>
              </div>
              {/* Badge */}
              <div className="w-20 shrink-0 text-center">
                {m.workloadPct >= 80 ? (
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Overload</span>
                ) : (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">OK</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Ngân sách (CEO only) ────────────────────────────────────────────────

function TabBudget({ project }: { project: L1Project }) {
  const totalM  = Math.round(project.budget.total / 1e6 * 1000);   // in M VND
  const spentM  = Math.round(project.budget.spent / 1e6 * 1000);
  const leftM   = totalM - spentM;
  const pct     = Math.round((spentM / totalM) * 100);
  const barColor = pct > 90 ? "#ef4444" : "#E36C25";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-5 text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Kế hoạch</p>
          <p className="text-2xl font-black font-mono text-foreground">{totalM}M</p>
          <p className="text-[10px] text-muted-foreground">VND</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Đã chi</p>
          <p className="text-2xl font-black font-mono" style={{ color: "#E36C25" }}>{spentM}M</p>
          <p className="text-[10px] text-muted-foreground">VND</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Còn lại</p>
          <p className="text-2xl font-black font-mono text-green-600">{leftM}M</p>
          <p className="text-[10px] text-muted-foreground">VND</p>
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Tiến độ sử dụng ngân sách</span>
          <span className="font-black font-mono text-foreground">{pct}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all flex items-center justify-center"
            style={{ width: `${pct}%`, backgroundColor: barColor }}>
            <span className="text-[10px] text-white font-bold">{pct > 20 ? `${pct}%` : ""}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">{pct}% ngân sách đã sử dụng</p>
      </div>
    </div>
  );
}

// ─── Tab: Rủi ro & Vấn đề ────────────────────────────────────────────────────

function TabRisk() {
  return (
    <div className="space-y-4">
      {/* Risks table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-foreground">Rủi ro ({DETAIL_RISKS.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {DETAIL_RISKS.map((r) => (
            <div key={r.id} className="px-4 py-3 flex items-start gap-3">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                r.severity === "Cao" ? "bg-red-500" : "bg-amber-400")} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground leading-tight">{r.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{r.owner} · {r.date}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold",
                  r.severity === "Cao" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                  {r.severity}
                </span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold",
                  r.status === "Đang xử lý" ? "bg-blue-100 text-blue-700" :
                  r.status === "Mới" ? "bg-gray-100 text-gray-600" :
                  "bg-green-100 text-green-700")}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue tasks */}
      <div className="border border-red-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-red-50 border-b border-red-200">
          <h3 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Task trễ hạn ({DETAIL_OVERDUE.length})
          </h3>
        </div>
        <div className="bg-white divide-y divide-border">
          {DETAIL_OVERDUE.map((t) => (
            <div key={t.id} className="px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{t.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.assignee} · Due: {t.dueDate}</p>
              </div>
              <span className="text-xs font-black text-red-600 shrink-0">Trễ {t.overdueDays} ngày</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Hoạt động ───────────────────────────────────────────────────────────

function TabActivity() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <h3 className="text-sm font-bold text-foreground">Hoạt động gần đây</h3>
      </div>
      <div className="divide-y divide-border">
        {DETAIL_ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: a.bg }}>
              {a.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-foreground">
                <span className="font-semibold">{a.user}</span> — {a.action}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{a.detail}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface ProjectDetailProps {
  project: L1Project;
  role: "CEO" | "CTO";
  onBack: () => void;
}

export function ProjectDetail({ project, role, onBack }: ProjectDetailProps) {
  const rag = ragColors(project.ragStatus);

  type Tab = "overview" | "phases" | "resource" | "budget" | "risk" | "activity";

  const ALL_TABS: { key: Tab; label: string; ceoOnly?: boolean }[] = [
    { key: "overview",  label: "Tổng quan" },
    { key: "phases",    label: "Phase & Timeline" },
    { key: "resource",  label: "Nhân sự & Nguồn lực" },
    { key: "budget",    label: "Ngân sách", ceoOnly: true },
    { key: "risk",      label: "Rủi ro & Vấn đề" },
    { key: "activity",  label: "Hoạt động" },
  ];

  const tabs = ALL_TABS.filter((t) => !t.ceoOnly || role === "CEO");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const overallPct = project.progress;
  const spiBg = project.spi >= 1 ? "#dcfce7" : project.spi >= 0.85 ? "#fef3c7" : "#fee2e2";
  const spiText = project.spi >= 1 ? "#16a34a" : project.spi >= 0.85 ? "#d97706" : "#dc2626";
  const spi = 0.88; // fixed for this project view

  return (
    <div className="space-y-0 -mt-5 -mx-4 md:-mx-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-border px-4 md:px-6 pt-4 pb-0">
        {/* Back + badges + title row */}
        <div className="flex items-start justify-between gap-4 pb-3">
          <div className="space-y-1.5 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Quay lại Portfolio
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {project.id}
              </span>
              <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                {project.category}
              </span>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Engineering
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground leading-tight">{project.name}</h1>
            <p className="text-[11px] text-muted-foreground">
              PM: {project.pm} · {project.id === "P-001" ? "2025-01-10 → 2026-06-30" : `→ ${project.endDate}`} · Phần cứng
            </p>
          </div>
          {/* Overall + RAG */}
          <div className="shrink-0 text-right space-y-1">
            <p className="text-3xl font-black font-mono text-foreground">{overallPct}%</p>
            <p className="text-[10px] text-muted-foreground">of {project.plannedProgress}% planned</p>
            <span
              className="inline-block text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: rag.bg, color: rag.text }}
            >
              {rag.label}
            </span>
            <div className="text-[10px] text-muted-foreground">
              SPI <span className="font-bold px-1.5 py-0.5 rounded font-mono"
                style={{ backgroundColor: spiBg, color: spiText }}>{spi}</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-0 -mx-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-colors",
                activeTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 md:px-6 pt-5 pb-8">
        {activeTab === "overview"  && <TabOverview  role={role} project={project} />}
        {activeTab === "phases"    && <TabPhaseTimeline project={project} />}
        {activeTab === "resource"  && <TabResource />}
        {activeTab === "budget"    && role === "CEO" && <TabBudget project={project} />}
        {activeTab === "risk"      && <TabRisk />}
        {activeTab === "activity"  && <TabActivity />}
      </div>

      {/* Read-only footer */}
      <div className="px-4 md:px-6 pb-4">
        <p className="text-center text-[10px] text-muted-foreground">
          Chế độ xem {role} — Chỉ đọc. Để chỉnh sửa, chuyển sang view PM.
        </p>
      </div>
    </div>
  );
}
