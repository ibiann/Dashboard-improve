"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { ENG_TASKS, EngTask, EngTaskStatus } from "@/lib/engineer-mock-data";
import { cn } from "@/lib/utils";

const LANCS_BLUE = "#063986";
const STRATEGIC_ORANGE = "#E36C25";
const DOT_BG = `radial-gradient(circle, rgba(6, 57, 134, 0.12) 1px, transparent 1px)`;

const ORDER: EngTaskStatus[] = [
  "New",
  "In Progress",
  "Waiting for Review",
  "Rejected",
  "Done",
];

function priorityHot(p: EngTask["priority"]): boolean {
  return p === "Critical" || p === "High";
}

interface EngineerWorkflowCanvasProps {
  onTaskClick: (taskId: string) => void;
}

export function EngineerWorkflowCanvas({ onTaskClick }: EngineerWorkflowCanvasProps) {
  const grouped = useMemo(() => {
    const map = new Map<EngTaskStatus, EngTask[]>();
    ORDER.forEach((s) => map.set(s, []));
    ENG_TASKS.forEach((t) => {
      const list = map.get(t.status) ?? [];
      list.push(t);
      map.set(t.status, list);
    });
    return ORDER.map((status) => ({
      key: status,
      label: status,
      rows: map.get(status) ?? [],
    }));
  }, []);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ORDER.forEach((s) => {
      init[s] = true;
    });
    return init;
  });

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

  const onPointerDownCanvas = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const t = e.target as HTMLElement;
      if (t.closest("[data-canvas-node]")) return;
      dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [pan.x, pan.y]
  );

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

  return (
    <div className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
        <p className="font-sans text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Workflow · Công việc</span>
          · Kéo nền để pan · <span className="font-mono">Ctrl</span>+ cuộn để zoom
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md border border-border bg-card p-1.5 hover:bg-muted"
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
        className="relative min-h-[480px] flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDownCanvas}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.65]"
          style={{
            backgroundImage: DOT_BG,
            backgroundSize: "14px 14px",
          }}
        />

        <div
          className="relative min-h-[480px]"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div className="flex flex-col items-center gap-8 px-8 py-10 pb-20">
            <div
              data-canvas-node
              className="rounded-lg border-2 bg-white px-5 py-3 text-center shadow-sm"
              style={{ borderColor: LANCS_BLUE }}
            >
              <p className="font-sans text-xs font-bold text-foreground">Công việc được giao</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {ENG_TASKS.length} task · Engineer
              </p>
            </div>

            <div className="h-px w-[min(92vw,800px)] bg-[#063986]/25" />

            <div className="grid w-full max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {grouped.map((g) => {
                const atRisk = g.key === "Rejected" || g.key === "Waiting for Review";
                const borderColor = atRisk ? STRATEGIC_ORANGE : LANCS_BLUE;
                return (
                  <div key={g.key} className="flex flex-col gap-3">
                    <button
                      type="button"
                      data-canvas-node
                      onClick={() =>
                        setExpanded((s) => ({ ...s, [g.key]: !s[g.key] }))
                      }
                      className="flex items-center justify-between gap-2 rounded-md border bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur-sm"
                      style={{ borderColor }}
                    >
                      <span className="font-sans text-[11px] font-bold text-foreground">{g.label}</span>
                      <span className="flex shrink-0 items-center gap-1">
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
                      className="ml-3 min-h-[2px] flex-1 space-y-2 border-l-2 pl-3"
                      style={{ borderColor: `${borderColor}40` }}
                    >
                      {expanded[g.key] &&
                        g.rows.map((t) => {
                          const hot = priorityHot(t.priority);
                          return (
                            <div
                              key={t.id}
                              data-canvas-node
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onTaskClick(t.id);
                                }
                              }}
                              onClick={() => onTaskClick(t.id)}
                              className={cn(
                                "cursor-pointer rounded-md border bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow-md",
                                hot && "ring-1 ring-[#E36C25]/35"
                              )}
                              style={{ borderColor: hot ? STRATEGIC_ORANGE : LANCS_BLUE }}
                            >
                              <p className="truncate font-sans text-[11px] font-semibold text-foreground">
                                {t.title}
                              </p>
                              <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                                {t.id} · {t.projectName}
                              </p>
                              <p className="mt-1.5 font-sans text-[9px] text-muted-foreground">
                                Owner: <span className="font-medium text-foreground">You</span>

                                <span className="ml-2 font-mono">{t.priority}</span>
                              </p>
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
    </div>
  );
}
