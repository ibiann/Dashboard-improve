"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import {
  L1Project,
  L1RAGStatus,
  calculateSPI,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";
import { MeetingContext, MeetingDrawer } from "@/components/strategic/meeting-drawer";

const LANCS_BLUE = "#063986";
const STRATEGIC_ORANGE = "#E36C25";

const DOT_BG = `
  radial-gradient(circle, rgba(6, 57, 134, 0.12) 1px, transparent 1px)
`;

function ragLabel(s: L1RAGStatus): string {
  switch (s) {
    case "green":
      return "Đúng tiến độ";
    case "amber":
      return "Rủi ro";
    case "red":
      return "Chậm";
    default:
      return s;
  }
}

function ragDotClass(s: L1RAGStatus): string {
  switch (s) {
    case "green":
      return "bg-emerald-500";
    case "amber":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
}

function nextRag(s: L1RAGStatus): L1RAGStatus {
  const order: L1RAGStatus[] = ["green", "amber", "red"];
  const i = order.indexOf(s);
  return order[(i + 1) % order.length];
}

interface WorkflowCanvasProps {
  projects: L1Project[];
  onSelectProject: (p: L1Project) => void;
  onUpdateProject?: (id: string, patch: Partial<L1Project>) => void;
}

export function WorkflowCanvas({
  projects,
  onSelectProject,
  onUpdateProject,
}: WorkflowCanvasProps) {
  const active = useMemo(() => projects.filter((p) => !p.closed), [projects]);

  const grouped = useMemo(() => {
    const critical = active.filter((p) => calculateSPI(p.progress, p.plannedProgress) < 0.8);
    const warning = active.filter((p) => {
      const spi = calculateSPI(p.progress, p.plannedProgress);
      return spi >= 0.8 && spi <= 1.0;
    });
    const stable = active.filter((p) => calculateSPI(p.progress, p.plannedProgress) > 1.0);
    return [
      { key: "critical" as const, label: "Nghiêm trọng (SPI < 0.8)", rows: critical },
      { key: "warning" as const, label: "Cảnh báo (SPI 0.8–1.0)", rows: warning },
      { key: "stable" as const, label: "Ổn định (SPI > 1.0)", rows: stable },
    ];
  }, [active]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    critical: true,
    warning: true,
    stable: true,
  });

  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number } | null>(
    null
  );
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setZoom((z) => Math.min(2, Math.max(0.45, z + delta)));
    }
  }, []);

  const onPointerDownCanvas = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-canvas-node]")) return;
    dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, [pan.x, pan.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    setPan({
      x: d.px + (e.clientX - d.sx),
      y: d.py + (e.clientY - d.sy),
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  function openMeeting(project: L1Project) {
    const spi = calculateSPI(project.progress, project.plannedProgress);
    setMeetingContext({
      projectId: project.id,
      projectName: project.name,
      reason:
        spi < 0.8 ? "Cảnh báo tiến độ nghiêm trọng" : "Cập nhật giải trình kỹ thuật",
      earnedValue: project.progress,
      plannedValue: project.plannedProgress,
    });
  }

  function cycleRag(e: React.MouseEvent, project: L1Project) {
    e.stopPropagation();
    onUpdateProject?.(project.id, { ragStatus: nextRag(project.ragStatus) });
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[560px]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <p className="text-[11px] text-muted-foreground font-sans">
          <span className="font-semibold text-foreground">Workflow Canvas</span>
          · Kéo nền để pan ·{" "}
          <span className="font-mono">Ctrl</span>+ cuộn để zoom
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md border border-border bg-card p-1.5 hover:bg-muted"
            aria-label="Thu nhỏ"
            onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[3rem] text-center font-mono text-[10px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="rounded-md border border-border bg-card p-1.5 hover:bg-muted"
            aria-label="Phóng to"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="ml-1 rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 min-h-[480px] overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDownCanvas}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.65]"
          style={{
            backgroundImage: DOT_BG,
            backgroundSize: "14px 14px",
          }}
        />

        <div
          className="relative h-full w-full min-h-[480px]"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div className="flex flex-col items-center gap-8 px-8 py-10 pb-16">
            {/* Root */}
            <div
              data-canvas-node
              className="rounded-lg border-2 px-5 py-3 shadow-sm bg-white"
              style={{ borderColor: LANCS_BLUE }}
            >
              <p className="text-xs font-bold text-foreground font-sans tracking-tight">
                Danh mục dự án
              </p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {active.length} dự án hoạt động
              </p>
            </div>

            {/* Connectors */}
            <div className="h-px w-[min(92vw,720px)] bg-[#063986]/25" />

            <div className="grid w-full max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
              {grouped.map((g) => {
                const atRisk = g.key === "critical";
                const borderColor = atRisk ? STRATEGIC_ORANGE : LANCS_BLUE;
                return (
                  <div key={g.key} className="flex flex-col items-stretch gap-3">
                    <button
                      type="button"
                      data-canvas-node
                      onClick={() =>
                        setExpanded((s) => ({ ...s, [g.key]: !s[g.key] }))
                      }
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left bg-white/90 shadow-sm backdrop-blur-sm"
                      style={{ borderColor }}
                    >
                      <span className="text-[11px] font-bold font-sans text-foreground leading-tight">
                        {g.label}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {g.rows.length}
                        </span>
                        {expanded[g.key] ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                    </button>

                    <div
                      className="min-h-[2px] flex-1 border-l-2 pl-3 ml-3 space-y-2"
                      style={{ borderColor: `${borderColor}40` }}
                    >
                      {expanded[g.key] &&
                        g.rows.map((p) => {
                          const spi = calculateSPI(p.progress, p.plannedProgress);
                          const highRisk = p.ragStatus === "red" || spi < 0.8;
                          const accent = highRisk ? STRATEGIC_ORANGE : LANCS_BLUE;
                          return (
                            <div
                              key={p.id}
                              data-canvas-node
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onSelectProject(p);
                                }
                              }}
                              onClick={() => onSelectProject(p)}
                              className={cn(
                                "cursor-pointer rounded-md border bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow-md",
                                highRisk && "ring-1 ring-[#E36C25]/35"
                              )}
                              style={{ borderColor: accent }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[11px] font-semibold font-sans text-foreground">
                                    {p.name}
                                  </p>
                                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                                    {p.id}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => cycleRag(e, p)}
                                  className={cn(
                                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white font-sans",
                                    ragDotClass(p.ragStatus),
                                  )}
                                  title="Click để xoay vòng RAG (demo)"
                                >
                                  {ragLabel(p.ragStatus)}
                                </button>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground font-sans">
                                <span>
                                  Owner:{" "}
                                  <span className="font-medium text-foreground">{p.pm}</span>
                                </span>
                                <span className="font-mono">
                                  SPI {spi.toFixed(2)}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-end gap-1 border-t border-border/60 pt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMeeting(p);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md p-1 text-[10px] font-semibold text-[#063986] hover:bg-muted"
                                >
                                  <Calendar className="h-3 w-3" />
                                  Lịch họp
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <MeetingDrawer open={!!meetingContext} context={meetingContext} onClose={() => setMeetingContext(null)} />
    </div>
  );
}
