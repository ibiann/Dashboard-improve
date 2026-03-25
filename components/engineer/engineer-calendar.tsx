"use client";

import { cn } from "@/lib/utils";
import { ENG_TASKS, ENG_MEETINGS, MEETING_TYPE_COLORS, engDaysUntil, engIsOverdue } from "@/lib/engineer-mock-data";

const MEETING_TYPE_LABELS: Record<string, string> = {
  review: "Review", standup: "Standup", other: "Other", board: "Board",
};

export function EngineerCalendar() {
  const deadlines = ENG_TASKS
    .filter((t) => t.status !== "Done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Meetings */}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-bold text-foreground">Lịch họp</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{ENG_MEETINGS.length} cuộc họp sắp tới</p>
        </div>
        <div className="p-4 space-y-3">
          {ENG_MEETINGS.map((m) => (
            <div key={m.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div
                className="w-1.5 h-12 rounded-full shrink-0"
                style={{ backgroundColor: MEETING_TYPE_COLORS[m.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{m.title}</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: MEETING_TYPE_COLORS[m.type] }}
                  >
                    {MEETING_TYPE_LABELS[m.type]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {m.date} · {m.time}
                </p>
                <p className="text-[11px] text-muted-foreground">{m.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-bold text-foreground">Deadline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sắp xếp theo mức độ cấp bách</p>
        </div>
        <div className="p-4 space-y-3">
          {deadlines.map((task) => {
            const days = engDaysUntil(task.dueDate);
            const overdue = days < 0;
            const urgent = !overdue && days <= 7;
            const color = overdue ? "#DC2626" : urgent ? "#F59E0B" : "#10B981";
            const label = overdue ? `Quá hạn ${Math.abs(days)} ngày` : days === 0 ? "Hôm nay" : `Còn ${days} ngày`;

            return (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{task.title}</p>
                    <span className="text-[10px] font-mono font-bold" style={{ color }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {task.projectId} · Due {task.dueDate}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${task.progressPercent}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{task.progressPercent}%</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      task.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
                    )}>{task.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
