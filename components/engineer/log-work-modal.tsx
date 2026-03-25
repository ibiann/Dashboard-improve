"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EngTask, ENG_TODAY } from "@/lib/engineer-mock-data";

export interface LogWorkPayload {
  date: string;
  hours: number;
  description: string;
  progressPercent: number;
  isFinalSubmit: boolean;
}

export function LogWorkModal({
  task,
  isFinalSubmit,
  timerSeconds,
  onClose,
  onSave,
}: {
  task: EngTask;
  isFinalSubmit: boolean;
  timerSeconds: number;
  onClose: () => void;
  onSave: (payload: LogWorkPayload) => void;
}) {
  const autoHours = timerSeconds > 0 ? parseFloat((timerSeconds / 3600).toFixed(2)) : 0;

  const [date, setDate]           = useState(ENG_TODAY);
  const [hours, setHours]         = useState(autoHours > 0 ? autoHours : 1);
  const [description, setDesc]    = useState("");
  const [progress, setProgress]   = useState(
    isFinalSubmit ? 100 : Math.max(task.progressPercent, 0)
  );

  const descValid = description.trim().length >= 20;
  const canSave   = descValid && hours > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({ date, hours, description, progressPercent: isFinalSubmit ? 100 : progress, isFinalSubmit });
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-label="Log Work Modal"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: isFinalSubmit ? "#10B981" : "#3B82F6" }}
          >
            <div>
              <h2 className="text-sm font-extrabold text-white">
                {isFinalSubmit ? "Hoan thanh & Gui duyet" : "Ghi nhan cong viec"}
              </h2>
              <p className="text-[11px] text-white/80 mt-0.5">{task.id} · {task.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Final submit warning */}
            {isFinalSubmit && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <AlertTriangle className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 font-semibold">
                  Task se bi khoa va gui PM duyet. Trang thai se chuyen sang "Waiting for Review".
                </p>
              </div>
            )}

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="log-date">Ngay</label>
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="log-hours">
                Gio thuc te
                {autoHours > 0 && (
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                    (auto: {autoHours}h tu timer)
                  </span>
                )}
              </label>
              <input
                id="log-hours"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="log-desc">
                Mo ta <span className="text-destructive">*</span>
                <span className="ml-2 text-[10px] font-normal text-muted-foreground">(min 20 ky tu)</span>
              </label>
              <textarea
                id="log-desc"
                rows={3}
                placeholder="Nhap mo ta cong viec da thuc hien..."
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className={cn("text-[10px]", descValid ? "text-green-600" : "text-muted-foreground")}>
                {description.trim().length} / 20 ky tu toi thieu
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="log-progress">
                Tien do %
                {isFinalSubmit && <span className="ml-2 text-[10px] text-muted-foreground">(khoa 100% cho final submit)</span>}
              </label>
              <input
                id="log-progress"
                type="number"
                min={0}
                max={100}
                step={5}
                value={isFinalSubmit ? 100 : progress}
                onChange={(e) => !isFinalSubmit && setProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                disabled={isFinalSubmit}
                className={cn(
                  "w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
                  isFinalSubmit && "opacity-60 cursor-not-allowed"
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border text-foreground hover:bg-muted transition-colors"
            >
              Huy
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors",
                canSave
                  ? isFinalSubmit ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isFinalSubmit ? "Hoan thanh & Gui" : "Luu"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
