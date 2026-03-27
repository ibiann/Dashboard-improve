"use client";

import { useMemo, useRef, useState } from "react";
import { Calendar, Search, TriangleAlert } from "lucide-react";
import {
  L1Project,
  L1Category,
  calculateSPI,
  safePercent,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";
import { MeetingContext, MeetingDrawer } from "@/components/strategic/meeting-drawer";

type FilterRAG = "all" | "green" | "amber" | "red";
type FilterCat = "all" | L1Category;
type ViewMode = "chairman" | "cto";

interface PortfolioTabProps {
  projects: L1Project[];
  viewMode: ViewMode;
  onSelectProject?: (project: L1Project) => void;
}

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 520;
const OVERSCAN = 8;

export function PortfolioTab({ projects, viewMode, onSelectProject }: PortfolioTabProps) {
  const [search, setSearch] = useState("");
  const [ragFilter, setRagFilter] = useState<FilterRAG>("all");
  const [catFilter, setCatFilter] = useState<FilterCat>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    critical: true,
    warning: false,
    stable: false,
  });
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = projects.filter((p) => !p.closed);

  const filtered = useMemo(() => {
    let list = [...active];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.pm.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    if (ragFilter !== "all") list = list.filter((p) => p.ragStatus === ragFilter);
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);

    list.sort((a, b) => calculateSPI(a.progress, a.plannedProgress) - calculateSPI(b.progress, b.plannedProgress));
    return list;
  }, [active, search, ragFilter, catFilter]);

  const grouped = useMemo(() => {
    const critical = filtered.filter((p) => calculateSPI(p.progress, p.plannedProgress) < 0.8);
    const warning = filtered.filter((p) => {
      const spi = calculateSPI(p.progress, p.plannedProgress);
      return spi >= 0.8 && spi <= 1.0;
    });
    const stable = filtered.filter((p) => calculateSPI(p.progress, p.plannedProgress) > 1.0);
    return [
      { key: "critical", label: "Nhom 1: Nghiem trong (SPI < 0.8)", rows: critical, tone: "text-red-600" },
      { key: "warning", label: "Nhom 2: Canh bao (SPI 0.8 - 1.0)", rows: warning, tone: "text-amber-600" },
      { key: "stable", label: "Nhom 3: On dinh (SPI > 1.0)", rows: stable, tone: "text-emerald-600" },
    ] as const;
  }, [filtered]);

  const flatRows = useMemo(() => {
    const rows: Array<{ type: "group"; key: string; label: string; count: number; tone: string } | { type: "project"; group: string; project: L1Project }> = [];
    for (const g of grouped) {
      rows.push({ type: "group", key: g.key, label: g.label, count: g.rows.length, tone: g.tone });
      if (expanded[g.key]) {
        for (const p of g.rows) rows.push({ type: "project", group: g.key, project: p });
      }
    }
    return rows;
  }, [grouped, expanded]);

  const totalHeight = flatRows.length * ROW_HEIGHT;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(flatRows.length, Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN);
  const visibleRows = flatRows.slice(start, end);

  const RAG_PILL_OPTIONS: { label: string; value: FilterRAG }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Đúng tiến độ", value: "green" },
    { label: "Rủi ro", value: "amber" },
    { label: "Chậm", value: "red" },
  ];
  const CAT_OPTIONS: { label: string; value: FilterCat }[] = [
    { label: "Tất cả", value: "all" },
    { label: "SW", value: "SW" },
    { label: "HW", value: "HW" },
    { label: "FPGA", value: "FPGA" },
  ];

  function openMeeting(project: L1Project) {
    const spi = calculateSPI(project.progress, project.plannedProgress);
    setNotification(`Nudge PM: ${project.name} can hop giai trinh SPI ${spi.toFixed(2)}`);
    setMeetingContext({
      projectId: project.id,
      projectName: project.name,
      reason: spi < 0.8 ? "Canh bao tien do nghiem trong" : "Can cap nhat giai trinh ky thuat",
      earnedValue: project.progress,
      plannedValue: project.plannedProgress,
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm dự án, PM..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* RAG filter pills */}
        <div className="flex items-center gap-1">
          {RAG_PILL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRagFilter(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                ragFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1">
          {CAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCatFilter(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                catFilter === opt.value
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[11px] text-muted-foreground font-medium">
          {filtered.length} dự án
        </span>
      </div>

      {notification && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-md border border-[#E36C25]/30 bg-[#E36C25]/10 px-3 py-2 text-[11px] text-[#9a3e0f]">
          <TriangleAlert className="h-3.5 w-3.5" />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-12 border-y border-border bg-muted/20 px-4 py-2 text-[11px] font-semibold text-muted-foreground">
        <div className="col-span-3">Dự án / PM</div>
        <div className="col-span-1 text-center">SPI</div>
        <div className="col-span-2 text-center">Tiến độ</div>
        {viewMode === "chairman" ? (
          <>
            <div className="col-span-2 text-center">Trọng số dự án</div>
            <div className="col-span-2 text-center">Rủi ro tài chính</div>
            <div className="col-span-1 text-center">Mốc toàn cục</div>
          </>
        ) : (
          <>
            <div className="col-span-2 text-center">Hiệu suất nguồn lực</div>
            <div className="col-span-2 text-center">Engineering SPI</div>
            <div className="col-span-1 text-center">Giải trình kỹ thuật</div>
          </>
        )}
        <div className="col-span-1 text-center">Hành động</div>
      </div>

      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="overflow-y-auto"
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleRows.map((row, idx) => {
            const absoluteIndex = start + idx;
            const top = absoluteIndex * ROW_HEIGHT;
            if (row.type === "group") {
              return (
                <button
                  key={`${row.key}-${absoluteIndex}`}
                  style={{ top, height: ROW_HEIGHT }}
                  onClick={() => setExpanded((s) => ({ ...s, [row.key]: !s[row.key] }))}
                  className="absolute left-0 right-0 flex items-center justify-between border-b border-border px-4 text-left text-xs font-semibold bg-muted/40"
                >
                  <span className={row.tone}>{row.label}</span>
                  <span className="font-mono text-muted-foreground">{expanded[row.key] ? "An" : "Mo"} ({row.count})</span>
                </button>
              );
            }

            const p = row.project;
            const spi = calculateSPI(p.progress, p.plannedProgress);
            const budgetPct = safePercent(p.budget.spent, p.budget.total, 0);
            const projectWeight = Math.min(100, Math.round((p.budget.total / 620000) * 100));
            const globalTimeline = Math.max(0, Math.round((new Date(p.endDate).getTime() - Date.now()) / 86400000));
            const justification = spi < 0.9 ? "Can giai trinh gap" : "On dinh";

            return (
              <div
                key={`${p.id}-${absoluteIndex}`}
                style={{ top, height: ROW_HEIGHT }}
                onClick={() => onSelectProject?.(p)}
                className={cn(
                  "absolute left-0 right-0 grid cursor-pointer grid-cols-12 items-center border-b border-border px-4 text-xs hover:bg-primary/5",
                  justification === "Can giai trinh gap" && "bg-amber-50/50"
                )}
              >
                <div className="col-span-3 min-w-0">
                  <div className="truncate font-semibold text-foreground">{p.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{p.id} · {p.pm}</div>
                </div>
                <div className="col-span-1 text-center font-mono">{spi.toFixed(2)}</div>
                <div className="col-span-2 text-center font-mono">{p.progress}%/{p.plannedProgress}%</div>
                {viewMode === "chairman" ? (
                  <>
                    <div className="col-span-2 text-center font-mono">{projectWeight}%</div>
                    <div className="col-span-2 text-center font-mono">{budgetPct}%</div>
                    <div className="col-span-1 text-center font-mono">{globalTimeline}d</div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2 text-center font-mono">{p.efficiency}%</div>
                    <div className="col-span-2 text-center font-mono">{spi.toFixed(2)}</div>
                    <div className={cn("col-span-1 text-center text-[10px]", justification === "Can giai trinh gap" && "font-semibold text-[#E36C25]")}>{justification}</div>
                  </>
                )}
                <div className="col-span-1 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMeeting(p);
                    }}
                    className="rounded-md p-1.5 hover:bg-muted"
                    aria-label="Mo lich hop"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#063986]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MeetingDrawer open={!!meetingContext} context={meetingContext} onClose={() => setMeetingContext(null)} />
    </div>
  );
}
