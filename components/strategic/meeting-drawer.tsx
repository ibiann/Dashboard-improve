"use client";

import { useMemo } from "react";
import { Calendar, Link2, Send, X } from "lucide-react";
import { calculateSPI } from "@/lib/strategic-mock-data";

export interface MeetingContext {
  projectId: string;
  projectName: string;
  reason: string;
  plannedValue: number;
  earnedValue: number;
}

interface MeetingDrawerProps {
  open: boolean;
  context: MeetingContext | null;
  onClose: () => void;
}

function buildMeetLink(projectId: string) {
  return `https://meet.google.com/${projectId.toLowerCase().replace("p-", "spi-")}-${Date.now().toString(36).slice(-6)}`;
}

export function MeetingDrawer({ open, context, onClose }: MeetingDrawerProps) {
  const payload = useMemo(() => {
    if (!context) return null;
    const spi = calculateSPI(context.earnedValue, context.plannedValue);
    const meetLink = buildMeetLink(context.projectId);
    return {
      meetLink,
      telegramPayload: {
        type: "PM_NUDGE",
        projectName: context.projectName,
        spi,
        reason: context.reason,
        link: meetLink,
      },
    };
  }, [context]);

  if (!open || !context || !payload) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35" onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#063986]" />
            <h3 className="text-sm font-semibold text-foreground">Tạo họp xử lý ngoại lệ</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4 text-xs">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-muted-foreground">Dự án</p>
            <p className="mt-1 font-semibold text-foreground">{context.projectName}</p>
            <p className="mt-1 font-mono text-muted-foreground">{context.projectId}</p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="font-semibold text-foreground">Google Meet (mock API)</p>
            <p className="mt-2 flex items-center gap-1 text-[#063986]">
              <Link2 className="h-3.5 w-3.5" />
              <span className="truncate font-mono">{payload.meetLink}</span>
            </p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 flex items-center gap-1 font-semibold text-foreground">
              <Send className="h-3.5 w-3.5 text-[#E36C25]" />
              Payload Telegram Bot
            </p>
            <pre className="overflow-auto rounded-md bg-slate-950 p-2 text-[10px] text-slate-100">
              {JSON.stringify(payload.telegramPayload, null, 2)}
            </pre>
          </div>
        </div>
      </aside>
    </>
  );
}
