"use client";

import { useState } from "react";
import { Check, X, CheckCheck } from "lucide-react";
import { PMProject, PMTimesheetEntry, getAllTasks } from "@/lib/pm-mock-data";

interface TimesheetEntryWithMeta extends PMTimesheetEntry {
  taskId: string;
  taskTitle: string;
  phase: string;
}

function collectTimesheets(project: PMProject): TimesheetEntryWithMeta[] {
  const out: TimesheetEntryWithMeta[] = [];
  for (const task of getAllTasks(project)) {
    for (const ts of task.timesheets) {
      out.push({ ...ts, taskId: task.id, taskTitle: task.title, phase: task.phase });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

interface TimesheetApprovalTabProps {
  project: PMProject;
}

export function TimesheetApprovalTab({ project }: TimesheetApprovalTabProps) {
  const [entries, setEntries] = useState<TimesheetEntryWithMeta[]>(collectTimesheets(project));

  function approve(id: string) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, approved: true } : e));
  }

  function reject(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function approveAll() {
    setEntries((prev) => prev.map((e) => ({ ...e, approved: true })));
  }

  const pending = entries.filter((e) => !e.approved);
  const approved = entries.filter((e) => e.approved);

  function EntryRow({ entry, showActions }: { entry: TimesheetEntryWithMeta; showActions: boolean }) {
    return (
      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border hover:shadow-sm transition-shadow">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: "#063986" }}>
          {entry.memberInitials}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground">{entry.member}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{entry.phase}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{entry.taskTitle}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
            <span>{entry.date}</span>
            <span className="font-mono font-semibold text-foreground">{entry.hours}h</span>
            <span>Progress: <span className="font-semibold text-foreground">{entry.progressPercent}%</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground">{entry.description}</p>
        </div>
        {showActions ? (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => approve(entry.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-white rounded-lg bg-success hover:opacity-90 transition-opacity"
            >
              <Check className="w-3 h-3" />
              Duyet
            </button>
            <button
              onClick={() => reject(entry.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-white rounded-lg bg-danger hover:opacity-90 transition-opacity"
            >
              <X className="w-3 h-3" />
              Tu choi
            </button>
          </div>
        ) : (
          <span className="flex-shrink-0 text-[10px] font-semibold text-success flex items-center gap-1">
            <Check className="w-3 h-3" />
            Duyet
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Cho duyet</h3>
            {pending.length > 0 && (
              <span className="text-[10px] font-bold text-white bg-warning px-2 py-0.5 rounded-full font-mono">
                {pending.length}
              </span>
            )}
          </div>
          {pending.length > 0 && (
            <button
              onClick={approveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg bg-success hover:opacity-90 transition-opacity"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Duyet tat ca ({pending.length})
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground bg-white rounded-xl border border-border">
            Khong co timesheet nao cho duyet
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((e) => <EntryRow key={e.id} entry={e} showActions />)}
          </div>
        )}
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            Da duyet ({approved.length})
          </h3>
          <div className="space-y-2">
            {approved.map((e) => <EntryRow key={e.id} entry={e} showActions={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}
