"use client";

// ─── Level 3 Engineer Mock Data ───────────────────────────────────────────────
// Engineer: James Hart — FPGA Engineer
// Today = 2026-03-24

export const ENG_TODAY = "2026-03-24";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EngTaskStatus = "New" | "In Progress" | "Waiting for Review" | "Done" | "Rejected";
export type EngPriority = "Low" | "Medium" | "High" | "Critical";

export interface EngSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface EngTimesheetEntry {
  id: string;
  date: string;
  taskId: string;
  taskTitle: string;
  description: string;
  hours: number;
  progressPercent: number;
  approved: boolean;
}

export interface EngChatterMessage {
  id: string;
  author: string;
  authorInitials: string;
  role: "engineer" | "pm" | "system";
  text: string;
  timestamp: string;
  isRejection?: boolean;
}

export interface EngTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  priority: EngPriority;
  status: EngTaskStatus;
  plannedHours: number;
  loggedHours: number;
  progressPercent: number;
  dueDate: string;
  description: string;
  subtasks: EngSubtask[];
  timesheetEntries: EngTimesheetEntry[];
  chatter: EngChatterMessage[];
  rejectionReason?: string;
  rejectedBy?: string;
}

export interface EngMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "review" | "standup" | "other" | "board";
}

export interface EngNotification {
  id: string;
  type: "rejected" | "reminder" | "assigned";
  severity: "red" | "amber" | "blue";
  title: string;
  body: string;
  ruleName?: string;
  taskId?: string;
  read: boolean;
}

// ─── Engineer Profile ─────────────────────────────────────────────────────────

export const ENG_PROFILE = {
  name: "James Hart",
  initials: "JH",
  role: "FPGA Engineer",
  dept: "FPGA Dept",
  projects: [
    { id: "PRJ-001", name: "NavComm FPGA Core",       progress: 62, rag: "amber" },
    { id: "PRJ-005", name: "TerraEdge IoT Platform",  progress: 55, rag: "amber" },
  ],
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const ENG_TASKS: EngTask[] = [
  {
    id: "T-003",
    title: "FPGA synthesis timing closure",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    priority: "High",
    status: "In Progress",
    plannedHours: 80,
    loggedHours: 52,
    progressPercent: 65,
    dueDate: "2026-04-05",
    description: "Complete timing closure for the FPGA synthesis build. Ensure all critical paths meet the 200 MHz target clock. Address hold violations in the CLK_AUX domain.",
    subtasks: [
      { id: "ST-001", title: "Run initial synthesis pass",           done: true },
      { id: "ST-002", title: "Identify critical path violations",    done: true },
      { id: "ST-003", title: "Apply timing constraints",             done: false },
      { id: "ST-004", title: "Re-run synthesis with constraints",    done: false },
      { id: "ST-005", title: "Verify timing report passes",          done: false },
    ],
    timesheetEntries: [
      { id: "TE-001", date: "2026-03-18", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Initial synthesis pass and baseline timing report", hours: 8, progressPercent: 20, approved: true },
      { id: "TE-002", date: "2026-03-20", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Critical path analysis and constraint authoring", hours: 8, progressPercent: 40, approved: true },
      { id: "TE-003", date: "2026-03-22", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Applied SDC constraints and partial re-synthesis", hours: 8, progressPercent: 55, approved: false },
      { id: "TE-004", date: "2026-03-24", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Hold violation fixes in CLK_AUX domain", hours: 4, progressPercent: 65, approved: false },
    ],
    chatter: [
      { id: "C-001", author: "Alice Morgan", authorInitials: "AM", role: "pm", text: "James, please make sure the CLK_AUX domain is addressed before moving to the next phase.", timestamp: "2026-03-20 09:15" },
      { id: "C-002", author: "James Hart", authorInitials: "JH", role: "engineer", text: "Understood Alice. I've started applying constraints for CLK_AUX. Will update by EOD.", timestamp: "2026-03-20 10:02" },
      { id: "C-003", author: "Alice Morgan", authorInitials: "AM", role: "pm", text: "Good. Keep me posted on the hold violations.", timestamp: "2026-03-21 08:30" },
    ],
  },
  {
    id: "T-009",
    title: "Review IoT sensor firmware",
    projectId: "PRJ-005",
    projectName: "TerraEdge IoT Platform",
    priority: "Medium",
    status: "New",
    plannedHours: 20,
    loggedHours: 0,
    progressPercent: 0,
    dueDate: "2026-03-28",
    description: "Review the IoT sensor firmware code submitted by the embedded team. Check for power optimization issues and verify sensor data protocol compliance.",
    subtasks: [],
    timesheetEntries: [],
    chatter: [
      { id: "C-010", author: "Alice Morgan", authorInitials: "AM", role: "pm", text: "James, you've been assigned to review the IoT firmware. Deadline is March 28th.", timestamp: "2026-03-24 08:00" },
    ],
  },
  {
    id: "T-010",
    title: "Power analysis simulation",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    priority: "Medium",
    status: "Rejected",
    plannedHours: 30,
    loggedHours: 30,
    progressPercent: 100,
    dueDate: "2026-03-22",
    description: "Run full power analysis simulation for the NavComm FPGA design. Generate power report for all operating scenarios.",
    rejectionReason: "Power numbers look off for CLK_AUX domain. The dynamic power figure is 40% higher than our baseline estimate. Please re-run with corrected clock activity factors and resubmit.",
    rejectedBy: "Alice Morgan (PM)",
    subtasks: [
      { id: "ST-010", title: "Configure power analysis tool", done: true },
      { id: "ST-011", title: "Run worst-case scenario",       done: true },
      { id: "ST-012", title: "Run typical scenario",          done: true },
      { id: "ST-013", title: "Generate final power report",   done: true },
    ],
    timesheetEntries: [
      { id: "TE-010", date: "2026-03-19", taskId: "T-010", taskTitle: "Power analysis simulation", description: "Setup and configuration of XPE tool", hours: 8, progressPercent: 30, approved: false },
      { id: "TE-011", date: "2026-03-21", taskId: "T-010", taskTitle: "Power analysis simulation", description: "Worst-case and typical scenario runs", hours: 12, progressPercent: 70, approved: false },
      { id: "TE-012", date: "2026-03-22", taskId: "T-010", taskTitle: "Power analysis simulation", description: "Final report generation and submission", hours: 10, progressPercent: 100, approved: false },
    ],
    chatter: [
      { id: "C-020", author: "James Hart",   authorInitials: "JH", role: "engineer",  text: "Completed full power analysis. Submitting for review.", timestamp: "2026-03-22 17:00" },
      { id: "C-021", author: "Alice Morgan", authorInitials: "AM", role: "pm", text: "Power numbers look off for CLK_AUX domain. The dynamic power figure is 40% higher than our baseline estimate. Please re-run with corrected clock activity factors and resubmit.", timestamp: "2026-03-23 10:30", isRejection: true },
    ],
  },
];

// ─── Meetings ────────────────────────────────────────────────────────────────

export const ENG_MEETINGS: EngMeeting[] = [
  { id: "M-001", title: "Sprint Review NavComm",   date: "2026-03-24", time: "09:00", location: "Phòng A",     type: "review" },
  { id: "M-002", title: "Daily Standup",            date: "2026-03-24", time: "14:00", location: "Online",      type: "standup" },
  { id: "M-003", title: "1-on-1 với PM",            date: "2026-03-25", time: "10:00", location: "Online",      type: "other" },
  { id: "M-004", title: "Demo Day Sprint 12",       date: "2026-03-29", time: "14:00", location: "Phòng lớn",   type: "board" },
];

// ─── Notifications ───────────────────────────────────────────────────────────

export const ENG_NOTIFICATIONS: EngNotification[] = [
  {
    id: "N-001", type: "rejected", severity: "red",
    title: "PM từ chối task: Power analysis simulation",
    body: "Power numbers look off for CLK_AUX domain. Re-run with corrected clock activity factors.",
    taskId: "T-010", read: false,
  },
  {
    id: "N-002", type: "reminder", severity: "amber",
    title: "Task sắp đến hạn: Review IoT firmware",
    body: "Task T-009 đến hạn vào 28/03/2026 — còn 4 ngày.",
    ruleName: "Nhắc sắp đến hạn", taskId: "T-009", read: false,
  },
  {
    id: "N-003", type: "reminder", severity: "red",
    title: "Task trễ hạn: Power analysis simulation",
    body: "Task T-010 đã quá hạn 2 ngày. Cần xử lý ngay.",
    ruleName: "Nhắc task trễ hạn", taskId: "T-010", read: false,
  },
  {
    id: "N-004", type: "reminder", severity: "amber",
    title: "Chưa log đủ giờ hôm qua",
    body: "Hôm qua bạn chỉ log 4h / 8h theo yêu cầu. Vui lòng bổ sung.",
    ruleName: "Nhắc cuối ngày", read: false,
  },
  {
    id: "N-005", type: "assigned", severity: "blue",
    title: "Task mới được giao: Review IoT sensor firmware",
    body: "Alice Morgan đã giao task T-009 cho bạn vào 24/03/2026.",
    taskId: "T-009", read: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function engDaysUntil(dateStr: string): number {
  const today = new Date(ENG_TODAY);
  const due   = new Date(dateStr);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function engIsOverdue(dateStr: string): boolean {
  return engDaysUntil(dateStr) < 0;
}

export const MEETING_TYPE_COLORS: Record<EngMeeting["type"], string> = {
  review:  "#3B82F6",
  standup: "#10B981",
  other:   "#8B5CF6",
  board:   "#F59E0B",
};
