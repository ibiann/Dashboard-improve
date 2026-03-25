"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StrategicKpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  icon: ReactNode;
  highlight?: boolean;
}

export function StrategicKpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  highlight,
}: StrategicKpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <div
      className={cn(
        "relative bg-card rounded-xl border border-border p-4 space-y-2 overflow-hidden",
        highlight && "border-primary/30"
      )}
    >
      {highlight && (
        <div className="absolute inset-0 bg-primary/3 pointer-events-none rounded-xl" />
      )}

      {/* Title + icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>

      {/* Value */}
      <div className="font-mono text-2xl font-extrabold text-foreground leading-none">
        {value}
      </div>

      {/* Subtitle */}
      <div className="text-[10px] text-muted-foreground leading-snug">{subtitle}</div>

      {/* Trend */}
      <div className={cn("flex items-center gap-1 text-[10px] font-medium", trendColor)}>
        <TrendIcon className="w-3 h-3" />
        {trendLabel}
      </div>
    </div>
  );
}
