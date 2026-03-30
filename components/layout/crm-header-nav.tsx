"use client";

import {
  ChevronLeft, LayoutDashboard, Users, CalendarRange, Archive,
  ShieldCheck, AlertTriangle, Lock, Folder, ClipboardList,
  Layers, LayoutGrid, Clock, Bell, UserCircle, Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PMProject, getAllTasks,
} from "@/lib/pm-mock-data";

type ViewRole = "CEO" | "CTO" | "PM" | "Engineer";
type L1Tab = "portfolio" | "people" | "meetings" | "archive" | "quality" | "risk" | "permissions";
type PMHomeView = "projects" | "workspace" | "notifications";
type PMProjectTab = "phases" | "kanban" | "resource" | "timesheets" | "reminders";

function NavPill({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-colors whitespace-nowrap",
        active
          ? "bg-[#E36C25] text-white shadow-sm"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-white/25 px-1.5 py-0 text-[9px] font-bold font-mono">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export interface CrmHeaderNavProps {
  role: ViewRole;
  l1Tab: L1Tab;
  setL1Tab: (t: L1Tab) => void;
  pmHomeView: PMHomeView;
  setPmHomeView: (v: PMHomeView) => void;
  pmProject: PMProject | null;
  pmTab: PMProjectTab;
  setPmTab: (t: PMProjectTab) => void;
  onPmBack: () => void;
  engTab: string;
  setEngTab: (t: string) => void;
}

/** Primary navigation moved from sidebar into the top bar (LinkSafe CRM pattern). */
export function CrmHeaderNav({
  role,
  l1Tab,
  setL1Tab,
  pmHomeView,
  setPmHomeView,
  pmProject,
  pmTab,
  setPmTab,
  onPmBack,
  engTab,
  setEngTab,
}: CrmHeaderNavProps) {
  if (role === "CEO") {
    return (
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5" aria-label="Điều hướng chính">
        <NavPill icon={LayoutDashboard} label="Dashboard" active onClick={() => {}} />
      </nav>
    );
  }

  if (role === "CTO") {
    const items: { icon: React.ElementType; label: string; tab: L1Tab }[] = [
      { icon: LayoutDashboard, label: "Danh mục dự án", tab: "portfolio" },
      { icon: Users, label: "Nhân sự", tab: "people" },
      { icon: CalendarRange, label: "Lịch họp", tab: "meetings" },
      { icon: ShieldCheck, label: "Chất lượng", tab: "quality" },
      { icon: AlertTriangle, label: "Rủi ro", tab: "risk" },
      { icon: Archive, label: "Lưu trữ", tab: "archive" },
      { icon: Lock, label: "Phân quyền", tab: "permissions" },
    ];
    return (
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5" aria-label="Điều hướng chính">
        {items.map(({ icon, label, tab }) => (
          <NavPill
            key={tab}
            icon={icon}
            label={label}
            active={l1Tab === tab}
            onClick={() => setL1Tab(tab)}
          />
        ))}
      </nav>
    );
  }

  if (pmProject) {
    const allTasks = getAllTasks(pmProject);
    const reviewBadge = allTasks.filter((t) => t.status === "Waiting for Review").length;
    const projectItems: { icon: React.ElementType; label: string; tab: PMProjectTab; badge?: number }[] = [
      { icon: Layers, label: "Phase Plan", tab: "phases" },
      { icon: LayoutGrid, label: "Task Kanban", tab: "kanban", badge: reviewBadge },
      { icon: Users, label: "Resource", tab: "resource" },
      { icon: Clock, label: "Timesheets", tab: "timesheets", badge: pmProject.pendingTimesheetCount },
      { icon: Bell, label: "Nhắc việc", tab: "reminders" },
    ];
    return (
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5" aria-label="Điều hướng dự án">
        <button
          type="button"
          onClick={onPmBack}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </button>
        <div className="mx-1 h-6 w-px shrink-0 bg-white/20" aria-hidden />
        {projectItems.map(({ icon, label, tab, badge }) => (
          <NavPill
            key={tab}
            icon={icon}
            label={label}
            active={pmTab === tab}
            onClick={() => setPmTab(tab)}
            badge={badge}
          />
        ))}
      </nav>
    );
  }

  if (role === "PM") {
    const homeItems: { icon: React.ElementType; label: string; view: PMHomeView }[] = [
      { icon: Folder, label: "Dự án của tôi", view: "projects" },
      { icon: ClipboardList, label: "Workspace", view: "workspace" },
      { icon: Bell, label: "Nhắc việc", view: "notifications" },
    ];
    return (
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5" aria-label="Điều hướng chính">
        {homeItems.map(({ icon, label, view }) => (
          <NavPill
            key={view}
            icon={icon}
            label={label}
            active={pmHomeView === view}
            onClick={() => setPmHomeView(view)}
          />
        ))}
      </nav>
    );
  }

  const engItems: { icon: React.ElementType; label: string; tab: string }[] = [
    { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
    { icon: ClipboardList, label: "Công việc", tab: "tasks" },
    { icon: Clock, label: "Chấm công", tab: "timesheet" },
    { icon: CalendarRange, label: "Lịch & Họp", tab: "calendar" },
    { icon: UserCircle, label: "Hồ sơ & Cài đặt", tab: "profile" },
  ];
  return (
    <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5" aria-label="Điều hướng kỹ sư">
      {engItems.map(({ icon, label, tab }) => (
        <NavPill
          key={tab}
          icon={icon}
          label={label}
          active={engTab === tab}
          onClick={() => setEngTab(tab)}
        />
      ))}
    </nav>
  );
}

export function CrmHeaderBrand() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
        <Network className="h-4 w-4 text-white" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-extrabold tracking-tight text-white">LinkSafe CRM</p>
        <p className="text-[9px] font-semibold uppercase tracking-widest text-white/55">
          Lancs Strategic
        </p>
      </div>
    </div>
  );
}
