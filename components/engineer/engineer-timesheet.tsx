"use client";

import { cn } from "@/lib/utils";
import { ENG_TASKS } from "@/lib/engineer-mock-data";

export function EngineerTimesheet() {
  const entries = ENG_TASKS.flatMap((t) => t.timesheetEntries).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h2 className="text-sm font-bold text-foreground">Chấm công</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Lịch sử ghi nhận giờ làm việc</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ngày</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Task</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mô tả</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Giờ</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Tiến độ</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.id} className={cn("border-b last:border-b-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">{entry.date}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-foreground">{entry.taskId}</p>
                  <p className="text-muted-foreground line-clamp-1">{entry.taskTitle}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">
                  <p className="line-clamp-2">{entry.description}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-green-600">{entry.hours}h</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${entry.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-mono text-muted-foreground">{entry.progressPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    entry.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {entry.approved ? "Approved" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
