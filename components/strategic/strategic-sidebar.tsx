"use client";

import {
  Network, LayoutDashboard, Users, CalendarRange, Archive,
  ShieldCheck, AlertTriangle, Lock, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StrategicTab =
  | "portfolio"
  | "people"
  | "meetings"
  | "archive"
  | "quality"
  | "risk"
  | "permissions";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  tab: StrategicTab;
  roleOnly?: "CTO";
}

const CEO_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Danh mục dự án", tab: "portfolio" },
  { icon: Users,           label: "Nhân sự",         tab: "people" },
  { icon: CalendarRange,   label: "Lịch họp",         tab: "meetings" },
  { icon: Archive,         label: "Lưu trữ",          tab: "archive" },
];

const CTO_ONLY_ITEMS: NavItem[] = [
  { icon: ShieldCheck,   label: "Chất lượng",  tab: "quality",      roleOnly: "CTO" },
  { icon: AlertTriangle, label: "Rủi ro",      tab: "risk",         roleOnly: "CTO" },
  { icon: Lock,          label: "Phân quyền",  tab: "permissions",  roleOnly: "CTO" },
];

interface StrategicSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  role: "CEO" | "CTO";
  activeTab: StrategicTab;
  onNavigate: (tab: StrategicTab) => void;
}

export function StrategicSidebar({
  collapsed,
  setCollapsed,
  role,
  activeTab,
  onNavigate,
}: StrategicSidebarProps) {
  const items = role === "CTO" ? [...CEO_ITEMS, ...CTO_ONLY_ITEMS] : CEO_ITEMS;
  const roleLabel = role === "CEO" ? "Tổng Giám Đốc" : "CTO · Strategic";

  return (
    <aside
      className={cn(
        "flex flex-col bg-primary text-primary-foreground transition-all duration-300 min-h-screen shrink-0",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 shrink-0">
          <Network className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-sm text-white tracking-wide truncate">
            Lancsnetworks
          </span>
        )}
      </div>

      {/* Role label */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            {roleLabel}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-1 space-y-0.5 px-2" aria-label="Strategic navigation">
        {items.map(({ icon: Icon, label, tab }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className={cn(
                "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {/* Active dot */}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <ChevronRight
            className={cn("w-4 h-4 transition-transform", !collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
