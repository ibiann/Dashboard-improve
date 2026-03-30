"use client";

import { GitBranch } from "lucide-react";

/** Shown when Workflow mode is on but the current tab has no dedicated canvas yet. */
export function WorkflowTabPlaceholder({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#063986]/30 bg-[#063986]/[0.03] px-6 py-16 text-center">
      <GitBranch className="h-10 w-10 text-[#063986]/40" />
      <h2 className="text-sm font-bold text-foreground font-sans">{title}</h2>
      <p className="max-w-md text-xs text-muted-foreground font-sans">
        {hint ??
          "Chế độ Workflow / Tree cho mục này sẽ được mở rộng. Tạm thời hãy chuyển sang Danh sách để làm việc đầy đủ."}
      </p>
    </div>
  );
}
