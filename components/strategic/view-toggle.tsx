"use client";

import { List, Network } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type WorkspaceViewMode = "list" | "workflow";

interface ViewToggleProps {
  value: WorkspaceViewMode;
  onChange: (v: WorkspaceViewMode) => void;
  className?: string;
  /** `dark`: controls on Lancs blue header bar. `light`: default card/toolbar. */
  variant?: "light" | "dark";
}

export function ViewToggle({ value, onChange, className, variant = "light" }: ViewToggleProps) {
  const dark = variant === "dark";

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === "list" || v === "workflow") onChange(v);
      }}
      variant="outline"
      size="sm"
      className={cn(
        "rounded-lg p-0.5 shadow-sm",
        dark
          ? "border border-white/25 bg-white/10"
          : "border border-border bg-muted/40",
        className
      )}
      aria-label="Chế độ xem workspace"
    >
      <ToggleGroupItem
        value="list"
        aria-label="Danh sách"
        className={cn(
          "gap-1.5 px-3 py-1.5 text-[11px] font-semibold font-sans",
          dark
            ? "border-0 text-white/90 data-[state=on]:bg-[#E36C25] data-[state=on]:text-white data-[state=on]:shadow-none"
            : "data-[state=on]:bg-white data-[state=on]:text-[#063986] data-[state=on]:shadow-sm"
        )}
      >
        <List className="h-3.5 w-3.5 shrink-0 opacity-80" />
        Danh sách
      </ToggleGroupItem>
      <ToggleGroupItem
        value="workflow"
        aria-label="Workflow Canvas"
        className={cn(
          "gap-1.5 px-3 py-1.5 text-[11px] font-semibold font-sans",
          dark
            ? "border-0 text-white/90 data-[state=on]:bg-[#E36C25] data-[state=on]:text-white data-[state=on]:shadow-none"
            : "data-[state=on]:bg-white data-[state=on]:text-[#063986] data-[state=on]:shadow-sm"
        )}
      >
        <Network className="h-3.5 w-3.5 shrink-0 opacity-80" />
        Workflow Canvas
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
