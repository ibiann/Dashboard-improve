"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, User, Plus, CalendarRange } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type StrategicRole = "CEO" | "CTO";

const ROLE_INFO: Record<StrategicRole, { title: string; desc: string }> = {
  CEO: { title: "CEO", desc: "Tổng Giám Đốc — Executive Overview" },
  CTO: { title: "CTO", desc: "Strategic — Full Technical Access" },
};

interface StrategicTopNavProps {
  role: StrategicRole;
  setRole: (r: StrategicRole) => void;
  breadcrumbs: { label: string; onClick?: () => void }[];
  onCreateMeeting: () => void;
}

export function StrategicTopNav({
  role,
  setRole,
  breadcrumbs,
  onCreateMeeting,
}: StrategicTopNavProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-4 py-2.5 sticky top-0 z-30">
      {/* Left: Role selector + breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0">
                <span>Xem: {role}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {(["CEO", "CTO"] as StrategicRole[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)} className="cursor-pointer flex-col items-start gap-0.5">
                  <span className="font-semibold text-xs">{ROLE_INFO[r].title}</span>
                  <span className="text-[10px] text-muted-foreground">{ROLE_INFO[r].desc}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0">
            <span>Xem: {role}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {crumb.onClick ? (
                <button onClick={crumb.onClick} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Create meeting CTA */}
        <button
          onClick={onCreateMeeting}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo lịch họp
        </button>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" aria-hidden="true" />
        </button>

        {/* Avatar */}
        <button
          className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
          aria-label="Hồ sơ người dùng"
        >
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
