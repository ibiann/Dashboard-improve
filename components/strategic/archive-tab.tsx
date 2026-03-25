"use client";

import { Archive, FileDown, Eye } from "lucide-react";
import { L1Project } from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";

interface ArchiveTabProps {
  projects: L1Project[];
}

export function ArchiveTab({ projects }: ArchiveTabProps) {
  const closed = projects.filter((p) => p.closed);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Lưu trữ</h2>
        <p className="text-xs text-muted-foreground">{closed.length} dự án đã hoàn thành</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {closed.map((p) => {
          const budgetPct = Math.round((p.budget.spent / p.budget.total) * 100);
          return (
            <div
              key={p.id}
              className="bg-card rounded-xl border border-border p-5 space-y-4 hover:border-emerald-400/50 hover:shadow-sm transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground">{p.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-0.5 leading-tight">{p.name}</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold shrink-0">
                  Hoàn thành
                </span>
              </div>

              {/* PM + Dates */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">PM</span>
                  <span className="font-medium text-foreground">{p.pm}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Loại</span>
                  <span className="font-medium text-secondary">{p.category}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Ngày kết thúc</span>
                  <span className="font-medium text-foreground">{p.endDate}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Ngân sách</span>
                  <span className="font-mono font-semibold text-foreground">
                    {(p.budget.spent / 1000).toFixed(0)}k / {(p.budget.total / 1000).toFixed(0)}k ({budgetPct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-mono font-semibold text-emerald-600">100%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Chi tiết
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  <FileDown className="w-3.5 h-3.5" />
                  Xuất báo cáo
                </button>
              </div>
            </div>
          );
        })}

        {closed.length === 0 && (
          <div className="col-span-3 text-center py-16 text-sm text-muted-foreground">
            Chưa có dự án nào được lưu trữ
          </div>
        )}
      </div>
    </div>
  );
}
