"use client";

import { useState, useEffect } from "react";
import { EngineerDashboard } from "@/components/engineer/engineer-dashboard";
import { EngineerTasks } from "@/components/engineer/engineer-tasks";
import { EngineerTimesheet } from "@/components/engineer/engineer-timesheet";
import { EngineerCalendar } from "@/components/engineer/engineer-calendar";
import { EngineerProfileSettings } from "@/components/engineer/engineer-profile-settings";
import { EngineerTaskDrawer } from "@/components/engineer/engineer-task-drawer";
import { LogWorkModal, LogWorkPayload } from "@/components/engineer/log-work-modal";
import { ENG_TASKS, EngTask } from "@/lib/engineer-mock-data";
import { EngineerWorkflowCanvas } from "@/components/engineer/engineer-workflow-canvas";
import type { WorkspaceViewMode } from "@/components/strategic/view-toggle";

/**
 * EngineerContent — top-level stateful wrapper for all Level 3 engineer views.
 * Accepts activeTab from the unified dashboard header nav and renders the correct view.
 */
export function EngineerContent({
  activeTab,
  onNavigate,
  workspaceViewMode = "list",
}: {
  activeTab: string;
  /** Chuyển tab kỹ sư (vd. từ dashboard → công việc) */
  onNavigate?: (tab: string) => void;
  workspaceViewMode?: WorkspaceViewMode;
}) {
  // Shared state across all engineer tabs
  const [runningTaskId, setRunningTaskId]   = useState<string | null>(null);
  const [timerElapsed, setTimerElapsed]     = useState(0);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  // Drawer
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);

  // Log work modal
  const [logModal, setLogModal] = useState<{ task: EngTask; isFinal: boolean } | null>(null);

  // Timer tick
  useEffect(() => {
    if (!runningTaskId) return;
    const interval = setInterval(() => setTimerElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [runningTaskId]);

  function handleToggleTimer(taskId: string) {
    if (runningTaskId === taskId) {
      setRunningTaskId(null);
    } else {
      setRunningTaskId(taskId);
      setTimerElapsed(0);
    }
  }

  function handleDismissNotif(id: string) {
    setDismissedNotifs((prev) => new Set([...prev, id]));
  }

  function handleTaskClick(taskId: string) {
    setDrawerTaskId(taskId);
  }

  function handleCloseDrawer() {
    setDrawerTaskId(null);
  }

  function handleLogWork(task: EngTask) {
    setLogModal({ task, isFinal: false });
  }

  function handleSubmit(task: EngTask) {
    setLogModal({ task, isFinal: true });
  }

  function handleSaveLog(payload: LogWorkPayload) {
    // In a real app this would POST to the API
    // For mock: just close, state update is cosmetic
    setLogModal(null);
    if (payload.isFinalSubmit) {
      // If final submit, close the drawer too
      setDrawerTaskId(null);
    }
  }

  const drawerTask = drawerTaskId ? ENG_TASKS.find((t) => t.id === drawerTaskId) ?? null : null;

  if (workspaceViewMode === "workflow") {
    return (
      <>
        <EngineerWorkflowCanvas onTaskClick={handleTaskClick} />
        {drawerTask && (
          <EngineerTaskDrawer
            task={drawerTask}
            runningId={runningTaskId}
            onToggle={handleToggleTimer}
            timerElapsed={timerElapsed}
            onClose={handleCloseDrawer}
            onLogWork={handleLogWork}
            onSubmit={handleSubmit}
          />
        )}
        {logModal && (
          <LogWorkModal
            task={logModal.task}
            isFinalSubmit={logModal.isFinal}
            timerSeconds={runningTaskId === logModal.task.id ? timerElapsed : 0}
            onClose={() => setLogModal(null)}
            onSave={handleSaveLog}
          />
        )}
      </>
    );
  }

  return (
    <>
      {activeTab === "dashboard" && (
        <EngineerDashboard
          onDismissNotif={handleDismissNotif}
          onTaskClick={handleTaskClick}
          runningTaskId={runningTaskId}
          onToggleTimer={handleToggleTimer}
          timerElapsed={timerElapsed}
          onViewAllTasks={() => onNavigate?.("tasks")}
        />
      )}

      {activeTab === "tasks" && (
        <EngineerTasks
          runningId={runningTaskId}
          onToggle={handleToggleTimer}
          onTaskClick={handleTaskClick}
          timerElapsed={timerElapsed}
        />
      )}

      {activeTab === "timesheet" && <EngineerTimesheet />}

      {activeTab === "calendar" && <EngineerCalendar />}

      {activeTab === "profile" && <EngineerProfileSettings />}

      {/* Task Drawer — rendered above all content */}
      {drawerTask && (
        <EngineerTaskDrawer
          task={drawerTask}
          runningId={runningTaskId}
          onToggle={handleToggleTimer}
          timerElapsed={timerElapsed}
          onClose={handleCloseDrawer}
          onLogWork={handleLogWork}
          onSubmit={handleSubmit}
        />
      )}

      {/* Log Work Modal */}
      {logModal && (
        <LogWorkModal
          task={logModal.task}
          isFinalSubmit={logModal.isFinal}
          timerSeconds={runningTaskId === logModal.task.id ? timerElapsed : 0}
          onClose={() => setLogModal(null)}
          onSave={handleSaveLog}
        />
      )}
    </>
  );
}
