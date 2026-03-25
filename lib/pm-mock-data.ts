// ─── Level 2 PM Workspace Mock Data ──────────────────────────────────────────
// PM: Alice Morgan — assigned to 3 projects
// Today = 2026-03-24

export const TODAY = "2026-03-24";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

export type PMRAGStatus = "green" | "amber" | "red";
export type TaskStatus = "New" | "In Progress" | "Waiting for Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";
export type SubtaskStatus = "New" | "In Progress" | "Done";

export interface PMSubtask {
  id: string;
  title: string;
  assigneeInitials: string;
  assigneeName: string;
  estimatedHours: number;
  status: SubtaskStatus;
  done: boolean;
}

export interface PMTimesheetEntry {
  id: string;
  date: string;
  member: string;
  memberInitials: string;
  hours: number;
  description: string;
  progressPercent: number;
  approved: boolean;
}

export interface PMChatterMessage {
  id: string;
  author: string;
  authorInitials: string;
  time: string;
  message: string;
  isRejection?: boolean;
}

export interface PMTask {
  id: string;
  projectId: string;
  title: string;
  phase: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assigneeInitials: string;
  dueDate: string;
  createdDate: string;
  lastUpdated: string;
  plannedHours: number;
  approvedHours: number;
  pendingHours: number;
  progressPercent: number;
  description: string;
  definitionOfDone: string[];
  subtasks: PMSubtask[];
  timesheets: PMTimesheetEntry[];
  chatter: PMChatterMessage[];
}

export interface PMPhase {
  id: string;
  name: string;
  weight: number; // % out of 100
  startDate: string;
  endDate: string;
  tasks: PMTask[];
}

export interface PMTeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  activeTasks: number;
  plannedHours: number;
  loggedHours: number;
  avatar?: string;
}

export interface PMProject {
  id: string;
  name: string;
  category: string;
  ragStatus: PMRAGStatus;
  spi: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  phases: PMPhase[];
  team: PMTeamMember[];
  pendingReviewCount: number;
  pendingTimesheetCount: number;
  totalPlannedHours: number;
  totalLoggedHours: number;
}

export interface PMMeeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  location: string;
  type: "review" | "standup" | "board" | "other";
  projectId?: string;
  attendees: string[];
}

export interface PMTodoItem {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  section: "today" | "week" | "upcoming";
  source: "review" | "timesheet" | "overdue" | "manual";
}

export interface PMNotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  time: string; // HH:mm
  days: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  triggers: string[];
  recipients: "assignee" | "pm" | "all" | "custom";
  channels: ("workspace" | "email" | "telegram")[];
  telegramGroupId?: string;
  messageTemplate: string;
}

export interface PMNotificationLog {
  id: string;
  time: string;
  type: string;
  recipient: string;
  channel: string;
  status: "sent" | "error";
}

// ──────────────────────────────────────────────────────────────────────────────
// TASKS for PRJ-001
// ──────────────────────────────────────────────────────────────────────────────

const PRJ001_TASKS: PMTask[] = [
  {
    id: "T-001",
    projectId: "PRJ-001",
    title: "Survey requirements with customer",
    phase: "Survey",
    status: "Done",
    priority: "High",
    assignee: "James Hart",
    assigneeInitials: "JH",
    dueDate: "2026-01-15",
    createdDate: "2026-01-02",
    lastUpdated: "2026-01-15",
    plannedHours: 20,
    approvedHours: 18,
    pendingHours: 0,
    progressPercent: 100,
    description: "Gather and document all functional and non-functional requirements from the customer for the FPGA NavComm Core project.",
    definitionOfDone: ["Requirements document signed off", "Stakeholder approval received", "Document stored in project repo"],
    subtasks: [],
    timesheets: [
      { id: "TS-001", date: "2026-01-10", member: "James Hart", memberInitials: "JH", hours: 8, description: "Customer interview sessions", progressPercent: 50, approved: true },
      { id: "TS-002", date: "2026-01-14", member: "James Hart", memberInitials: "JH", hours: 10, description: "Requirements documentation", progressPercent: 100, approved: true },
    ],
    chatter: [
      { id: "C-001", author: "Alice Morgan", authorInitials: "AM", time: "2026-01-15 09:00", message: "Requirements doc approved. Great work James!" },
    ],
  },
  {
    id: "T-002",
    projectId: "PRJ-001",
    title: "FPGA architecture design",
    phase: "R&D",
    status: "Done",
    priority: "Critical",
    assignee: "James Hart",
    assigneeInitials: "JH",
    dueDate: "2026-02-10",
    createdDate: "2026-01-16",
    lastUpdated: "2026-02-10",
    plannedHours: 40,
    approvedHours: 38,
    pendingHours: 0,
    progressPercent: 100,
    description: "Design the complete FPGA architecture including block diagrams, pin assignments, and interface definitions.",
    definitionOfDone: ["Block diagram reviewed", "Pin assignment document approved", "Interface specs complete"],
    subtasks: [],
    timesheets: [
      { id: "TS-003", date: "2026-02-05", member: "James Hart", memberInitials: "JH", hours: 20, description: "Architecture design phase 1", progressPercent: 50, approved: true },
      { id: "TS-004", date: "2026-02-10", member: "James Hart", memberInitials: "JH", hours: 18, description: "Architecture design phase 2", progressPercent: 100, approved: true },
    ],
    chatter: [],
  },
  {
    id: "T-003",
    projectId: "PRJ-001",
    title: "FPGA synthesis timing closure",
    phase: "R&D",
    status: "Waiting for Review",
    priority: "Critical",
    assignee: "James Hart",
    assigneeInitials: "JH",
    dueDate: "2026-03-19",
    createdDate: "2026-02-11",
    lastUpdated: "2026-03-22",
    plannedHours: 80,
    approvedHours: 8,
    pendingHours: 6,
    progressPercent: 65,
    description: "Complete FPGA synthesis with full timing closure. All critical paths must meet timing constraints. Run synthesis, fix violations, and verify final results.",
    definitionOfDone: [
      "All timing constraints met",
      "Zero critical path violations",
      "Synthesis report reviewed by lead",
      "Final bitfile generated and tested",
    ],
    subtasks: [
      { id: "ST-001", title: "Viết test case cho timing constraints", assigneeInitials: "JH", assigneeName: "James Hart", estimatedHours: 2, status: "Done", done: true },
      { id: "ST-002", title: "Chạy synthesis lần 1", assigneeInitials: "JH", assigneeName: "James Hart", estimatedHours: 4, status: "Done", done: true },
      { id: "ST-003", title: "Fix violation path A→B", assigneeInitials: "JH", assigneeName: "James Hart", estimatedHours: 3, status: "Done", done: true },
      { id: "ST-004", title: "Fix violation path C→D", assigneeInitials: "JH", assigneeName: "James Hart", estimatedHours: 2, status: "In Progress", done: false },
      { id: "ST-005", title: "Final synthesis verification", assigneeInitials: "JH", assigneeName: "James Hart", estimatedHours: 3, status: "New", done: false },
    ],
    timesheets: [
      { id: "TS-005", date: "2026-03-10", member: "James Hart", memberInitials: "JH", hours: 4, description: "Ran initial synthesis, identified 3 violations", progressPercent: 30, approved: true },
      { id: "TS-006", date: "2026-03-15", member: "James Hart", memberInitials: "JH", hours: 4, description: "Fixed path A→B violation", progressPercent: 50, approved: true },
      { id: "TS-007", date: "2026-03-22", member: "James Hart", memberInitials: "JH", hours: 6, description: "Working on path C→D, 65% overall", progressPercent: 65, approved: false },
    ],
    chatter: [
      { id: "C-002", author: "Alice Morgan", authorInitials: "AM", time: "2026-03-19 10:00", message: "James, this is overdue. Please submit for review ASAP." },
      { id: "C-003", author: "James Hart", authorInitials: "JH", time: "2026-03-22 14:30", message: "Submitted for review. Path C→D fix in progress, will complete by EOD." },
      { id: "C-004", author: "Alice Morgan", authorInitials: "AM", time: "2026-03-23 09:00", message: "Reviewing now. Please make sure all test cases pass.", isRejection: false },
    ],
  },
  {
    id: "T-004",
    projectId: "PRJ-001",
    title: "Signal integrity report",
    phase: "Test",
    status: "Waiting for Review",
    priority: "High",
    assignee: "Maria Russo",
    assigneeInitials: "MR",
    dueDate: "2026-03-22",
    createdDate: "2026-03-01",
    lastUpdated: "2026-03-22",
    plannedHours: 30,
    approvedHours: 12,
    pendingHours: 8,
    progressPercent: 70,
    description: "Complete signal integrity analysis for all high-speed interfaces. Document results and flag any issues.",
    definitionOfDone: ["All interfaces analyzed", "Report reviewed", "Issues logged"],
    subtasks: [],
    timesheets: [
      { id: "TS-008", date: "2026-03-15", member: "Maria Russo", memberInitials: "MR", hours: 8, description: "SI analysis phase 1", progressPercent: 40, approved: true },
      { id: "TS-009", date: "2026-03-20", member: "Maria Russo", memberInitials: "MR", hours: 4, description: "SI analysis phase 2", progressPercent: 60, approved: true },
      { id: "TS-010", date: "2026-03-22", member: "Maria Russo", memberInitials: "MR", hours: 8, description: "Completed report, pending review", progressPercent: 70, approved: false },
    ],
    chatter: [
      { id: "C-005", author: "Maria Russo", authorInitials: "MR", time: "2026-03-22 16:00", message: "Report submitted for review. Found 2 minor issues, documented in appendix." },
    ],
  },
  {
    id: "T-005",
    projectId: "PRJ-001",
    title: "PCB prototype review",
    phase: "Test",
    status: "In Progress",
    priority: "Medium",
    assignee: "Kwame Asante",
    assigneeInitials: "KA",
    dueDate: "2026-04-05",
    createdDate: "2026-03-05",
    lastUpdated: "2026-03-20",
    plannedHours: 24,
    approvedHours: 6,
    pendingHours: 3,
    progressPercent: 35,
    description: "Review PCB prototype against design specs and document findings.",
    definitionOfDone: ["All test points verified", "Review document complete"],
    subtasks: [],
    timesheets: [
      { id: "TS-011", date: "2026-03-18", member: "Kwame Asante", memberInitials: "KA", hours: 6, description: "Initial PCB inspection", progressPercent: 35, approved: true },
      { id: "TS-012", date: "2026-03-22", member: "Kwame Asante", memberInitials: "KA", hours: 3, description: "Continuing review", progressPercent: 35, approved: false },
    ],
    chatter: [],
  },
  {
    id: "T-006",
    projectId: "PRJ-001",
    title: "Release documentation",
    phase: "Release",
    status: "New",
    priority: "Low",
    assignee: "Priya Nair",
    assigneeInitials: "PN",
    dueDate: "2026-06-15",
    createdDate: "2026-03-10",
    lastUpdated: "2026-03-10",
    plannedHours: 16,
    approvedHours: 0,
    pendingHours: 0,
    progressPercent: 0,
    description: "Prepare all release documentation including user manual, change log, and deployment guide.",
    definitionOfDone: ["All docs complete", "Technical review done", "Published to repo"],
    subtasks: [],
    timesheets: [],
    chatter: [],
  },
];

// PRJ-002 tasks (simplified)
const PRJ002_TASKS: PMTask[] = [
  {
    id: "T-011",
    projectId: "PRJ-002",
    title: "API gateway auth module review",
    phase: "R&D",
    status: "Waiting for Review",
    priority: "Critical",
    assignee: "Leo Tan",
    assigneeInitials: "LT",
    dueDate: "2026-03-16",
    createdDate: "2026-02-20",
    lastUpdated: "2026-03-22",
    plannedHours: 40,
    approvedHours: 10,
    pendingHours: 12,
    progressPercent: 55,
    description: "Review and harden the API gateway authentication module for Sentinel Gateway v3.",
    definitionOfDone: ["All auth flows tested", "Security review passed", "Code reviewed"],
    subtasks: [],
    timesheets: [
      { id: "TS-020", date: "2026-03-18", member: "Leo Tan", memberInitials: "LT", hours: 8, description: "Auth flow testing", progressPercent: 40, approved: true },
      { id: "TS-021", date: "2026-03-22", member: "Leo Tan", memberInitials: "LT", hours: 12, description: "Security hardening, pending review", progressPercent: 55, approved: false },
    ],
    chatter: [],
  },
  {
    id: "T-012",
    projectId: "PRJ-002",
    title: "Load test environment setup",
    phase: "Test",
    status: "In Progress",
    priority: "High",
    assignee: "Sarah Brooks",
    assigneeInitials: "SB",
    dueDate: "2026-03-28",
    createdDate: "2026-03-01",
    lastUpdated: "2026-03-20",
    plannedHours: 20,
    approvedHours: 6,
    pendingHours: 0,
    progressPercent: 40,
    description: "Set up load testing environment and baseline test suite for the Sentinel Gateway.",
    definitionOfDone: ["Environment provisioned", "Baseline tests passing"],
    subtasks: [],
    timesheets: [
      { id: "TS-022", date: "2026-03-20", member: "Sarah Brooks", memberInitials: "SB", hours: 6, description: "Environment setup", progressPercent: 40, approved: true },
    ],
    chatter: [],
  },
];

// PRJ-003 tasks (simplified)
const PRJ003_TASKS: PMTask[] = [
  {
    id: "T-021",
    projectId: "PRJ-003",
    title: "PCB layout sign-off",
    phase: "R&D",
    status: "In Progress",
    priority: "Critical",
    assignee: "Tom Newton",
    assigneeInitials: "TN",
    dueDate: "2026-03-12",
    createdDate: "2026-02-15",
    lastUpdated: "2026-03-24",
    plannedHours: 50,
    approvedHours: 20,
    pendingHours: 8,
    progressPercent: 48,
    description: "Final PCB layout review and sign-off for Sigma Hardware Backplane.",
    definitionOfDone: ["DRC passed", "Layout reviewed by HW lead", "Gerber files approved"],
    subtasks: [],
    timesheets: [
      { id: "TS-030", date: "2026-03-10", member: "Tom Newton", memberInitials: "TN", hours: 12, description: "DRC run 1", progressPercent: 30, approved: true },
      { id: "TS-031", date: "2026-03-18", member: "Tom Newton", memberInitials: "TN", hours: 8, description: "Layout corrections", progressPercent: 45, approved: true },
      { id: "TS-032", date: "2026-03-24", member: "Tom Newton", memberInitials: "TN", hours: 8, description: "Final DRC, pending sign-off", progressPercent: 48, approved: false },
    ],
    chatter: [],
  },
  {
    id: "T-022",
    projectId: "PRJ-003",
    title: "Thermal analysis review",
    phase: "Test",
    status: "New",
    priority: "High",
    assignee: "Peter Newton",
    assigneeInitials: "PN",
    dueDate: "2026-04-15",
    createdDate: "2026-03-10",
    lastUpdated: "2026-03-10",
    plannedHours: 20,
    approvedHours: 0,
    pendingHours: 0,
    progressPercent: 0,
    description: "Perform thermal analysis simulation on the backplane design.",
    definitionOfDone: ["Simulation complete", "Hotspot report issued"],
    subtasks: [],
    timesheets: [],
    chatter: [],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// COMPUTED PROJECT PROGRESS
// ──────────────────────────────────────────────────────────────────────────────

function calcPhaseProgress(tasks: PMTask[]): number {
  if (!tasks.length) return 0;
  const totalHours = tasks.reduce((s, t) => s + t.plannedHours, 0);
  if (!totalHours) return 0;
  const weighted = tasks.reduce((s, t) => s + t.progressPercent * t.plannedHours, 0);
  return Math.round(weighted / totalHours);
}

// ──────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────────────────────────────────────

export const PM_PROJECTS: PMProject[] = [
  {
    id: "PRJ-001",
    name: "NavComm FPGA Core",
    category: "FPGA",
    ragStatus: "green",
    spi: 1.08,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    teamSize: 4,
    pendingReviewCount: 2,
    pendingTimesheetCount: 3,
    totalPlannedHours: 840,
    totalLoggedHours: 380,
    team: [
      { id: "tm-1", name: "James Hart", initials: "JH", role: "FPGA Engineer", activeTasks: 2, plannedHours: 200, loggedHours: 120 },
      { id: "tm-2", name: "Maria Russo", initials: "MR", role: "SI Engineer", activeTasks: 1, plannedHours: 160, loggedHours: 85 },
      { id: "tm-3", name: "Kwame Asante", initials: "KA", role: "HW Engineer", activeTasks: 1, plannedHours: 180, loggedHours: 90 },
      { id: "tm-4", name: "Priya Nair", initials: "PN", role: "Tech Writer", activeTasks: 0, plannedHours: 100, loggedHours: 10 },
    ],
    phases: [
      { id: "ph-1", name: "Survey", weight: 15, startDate: "2026-01-01", endDate: "2026-01-31", tasks: [PRJ001_TASKS[0]] },
      { id: "ph-2", name: "R&D", weight: 50, startDate: "2026-02-01", endDate: "2026-04-15", tasks: [PRJ001_TASKS[1], PRJ001_TASKS[2]] },
      { id: "ph-3", name: "Test", weight: 25, startDate: "2026-04-16", endDate: "2026-05-31", tasks: [PRJ001_TASKS[3], PRJ001_TASKS[4]] },
      { id: "ph-4", name: "Release", weight: 10, startDate: "2026-06-01", endDate: "2026-06-30", tasks: [PRJ001_TASKS[5]] },
    ],
  },
  {
    id: "PRJ-002",
    name: "Sentinel Gateway v3",
    category: "Software",
    ragStatus: "amber",
    spi: 0.78,
    startDate: "2025-11-01",
    endDate: "2026-04-15",
    teamSize: 5,
    pendingReviewCount: 1,
    pendingTimesheetCount: 5,
    totalPlannedHours: 680,
    totalLoggedHours: 300,
    team: [
      { id: "tm-5", name: "Leo Tan", initials: "LT", role: "Backend Dev", activeTasks: 1, plannedHours: 160, loggedHours: 90 },
      { id: "tm-6", name: "Sarah Brooks", initials: "SB", role: "QA Engineer", activeTasks: 1, plannedHours: 120, loggedHours: 55 },
      { id: "tm-7", name: "Naomi Clark", initials: "NC", role: "QA Lead", activeTasks: 0, plannedHours: 100, loggedHours: 60 },
      { id: "tm-8", name: "Xiang Wu", initials: "XW", role: "DevOps", activeTasks: 0, plannedHours: 80, loggedHours: 45 },
      { id: "tm-9", name: "Will Chen", initials: "WC", role: "Backend Dev", activeTasks: 0, plannedHours: 140, loggedHours: 70 },
    ],
    phases: [
      { id: "ph-5", name: "Survey", weight: 10, startDate: "2025-11-01", endDate: "2025-11-30", tasks: [] },
      { id: "ph-6", name: "R&D", weight: 50, startDate: "2025-12-01", endDate: "2026-02-28", tasks: [PRJ002_TASKS[0]] },
      { id: "ph-7", name: "Test", weight: 30, startDate: "2026-03-01", endDate: "2026-04-01", tasks: [PRJ002_TASKS[1]] },
      { id: "ph-8", name: "Release", weight: 10, startDate: "2026-04-02", endDate: "2026-04-15", tasks: [] },
    ],
  },
  {
    id: "PRJ-003",
    name: "Sigma Hardware Backplane",
    category: "Hardware",
    ragStatus: "red",
    spi: 0.59,
    startDate: "2025-10-01",
    endDate: "2026-03-01",
    teamSize: 4,
    pendingReviewCount: 0,
    pendingTimesheetCount: 4,
    totalPlannedHours: 920,
    totalLoggedHours: 520,
    team: [
      { id: "tm-10", name: "Tom Newton", initials: "TN", role: "HW Engineer", activeTasks: 1, plannedHours: 250, loggedHours: 160 },
      { id: "tm-11", name: "Peter Newton", initials: "PN", role: "Thermal Eng", activeTasks: 0, plannedHours: 160, loggedHours: 80 },
      { id: "tm-12", name: "Alice Obi", initials: "AO", role: "PCB Designer", activeTasks: 0, plannedHours: 200, loggedHours: 130 },
      { id: "tm-13", name: "Leo Moreau", initials: "LM", role: "HW Developer", activeTasks: 0, plannedHours: 160, loggedHours: 90 },
    ],
    phases: [
      { id: "ph-9",  name: "Survey",  weight: 10, startDate: "2025-10-01", endDate: "2025-10-31", tasks: [] },
      { id: "ph-10", name: "R&D",     weight: 50, startDate: "2025-11-01", endDate: "2026-01-31", tasks: [PRJ003_TASKS[0]] },
      { id: "ph-11", name: "Test",    weight: 30, startDate: "2026-02-01", endDate: "2026-02-28", tasks: [PRJ003_TASKS[1]] },
      { id: "ph-12", name: "Release", weight: 10, startDate: "2026-03-01", endDate: "2026-03-01", tasks: [] },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

export function getProjectProgress(project: PMProject): number {
  let overall = 0;
  for (const phase of project.phases) {
    const pp = calcPhaseProgress(phase.tasks);
    overall += pp * (phase.weight / 100);
  }
  return Math.round(overall);
}

export function getPhaseProgress(phase: PMPhase): number {
  return calcPhaseProgress(phase.tasks);
}

export function getSPIBadge(spi: number): { label: string; color: string } {
  if (spi >= 1.0)  return { label: "On Track",  color: "#22c55e" };
  if (spi >= 0.85) return { label: "At Risk",   color: "#f59e0b" };
  return              { label: "Delayed",    color: "#ef4444" };
}

export function getRAGColor(rag: PMRAGStatus): string {
  if (rag === "green") return "#22c55e";
  if (rag === "amber") return "#f59e0b";
  return "#ef4444";
}

export function getRAGLabel(rag: PMRAGStatus): string {
  if (rag === "green") return "On Track";
  if (rag === "amber") return "At Risk";
  return "Delayed";
}

export function getAllTasks(project: PMProject): PMTask[] {
  return project.phases.flatMap((ph) => ph.tasks);
}

export function calcTaskSPI(task: PMTask): number | null {
  const start = new Date("2026-01-01");
  const due = new Date(task.dueDate);
  const today = new Date(TODAY);
  const totalDays = (due.getTime() - start.getTime()) / 86400000;
  const elapsedDays = (today.getTime() - start.getTime()) / 86400000;
  if (totalDays <= 0 || elapsedDays <= 0) return null;
  const plannedPct = Math.min((elapsedDays / totalDays) * 100, 100);
  if (plannedPct <= 0) return null;
  return Math.round((task.progressPercent / plannedPct) * 100) / 100;
}

// ──────────────────────────────────────────────────────────────────────────────
// MEETINGS (5 meetings for Alice)
// ──────────────────────────────────────────────────────────────────────────────

export const PM_MEETINGS: PMMeeting[] = [
  {
    id: "PM-M001",
    title: "Sprint Review NavComm",
    date: "2026-03-24",
    time: "09:00",
    duration: 60,
    location: "Phong hop A2",
    type: "review",
    projectId: "PRJ-001",
    attendees: ["Alice Morgan", "James Hart", "Maria Russo"],
  },
  {
    id: "PM-M002",
    title: "Risk Standup Sigma",
    date: "2026-03-24",
    time: "14:00",
    duration: 30,
    location: "Online (Teams)",
    type: "standup",
    projectId: "PRJ-003",
    attendees: ["Alice Morgan", "Tom Newton", "Peter Newton"],
  },
  {
    id: "PM-M003",
    title: "Board Review Q1",
    date: "2026-03-25",
    time: "10:00",
    duration: 120,
    location: "Phong hop Board",
    type: "board",
    attendees: ["Alice Morgan", "Nguyen Van An", "Tran Thi Bich"],
  },
  {
    id: "PM-M004",
    title: "Security Audit Sentinel",
    date: "2026-03-26",
    time: "11:00",
    duration: 90,
    location: "Phong hop B2",
    type: "review",
    projectId: "PRJ-002",
    attendees: ["Alice Morgan", "Leo Tan", "Sarah Brooks", "Naomi Clark"],
  },
  {
    id: "PM-M005",
    title: "PI Planning Q2",
    date: "2026-04-01",
    time: "09:00",
    duration: 180,
    location: "Phong hop A1",
    type: "board",
    attendees: ["Alice Morgan", "James Hart", "Maria Russo", "Kwame Asante", "Priya Nair"],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// PM TODO ITEMS
// ──────────────────────────────────────────────────────────────────────────────

export const PM_TODOS: PMTodoItem[] = [
  {
    id: "todo-1",
    title: "Review task: Signal integrity report (T-004)",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    dueDate: "2026-03-24",
    priority: "high",
    done: false,
    section: "today",
    source: "review",
  },
  {
    id: "todo-2",
    title: "Approve 3 timesheets — NavComm",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    dueDate: "2026-03-24",
    priority: "medium",
    done: false,
    section: "today",
    source: "timesheet",
  },
  {
    id: "todo-3",
    title: "Review task: FPGA synthesis timing closure (T-003)",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    dueDate: "2026-03-24",
    priority: "high",
    done: false,
    section: "today",
    source: "review",
  },
  {
    id: "todo-4",
    title: "Investigate Sigma backplane PCB sign-off delay",
    projectId: "PRJ-003",
    projectName: "Sigma Hardware Backplane",
    dueDate: "2026-03-25",
    priority: "high",
    done: false,
    section: "week",
    source: "overdue",
  },
  {
    id: "todo-5",
    title: "Update project plan Q2 — Sentinel Gateway",
    projectId: "PRJ-002",
    projectName: "Sentinel Gateway v3",
    dueDate: "2026-03-28",
    priority: "medium",
    done: false,
    section: "week",
    source: "manual",
  },
  {
    id: "todo-6",
    title: "Prepare Q1 portfolio report for board",
    dueDate: "2026-04-01",
    priority: "medium",
    done: false,
    section: "upcoming",
    source: "manual",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICATION RULES (4 pre-seeded)
// ──────────────────────────────────────────────────────────────────────────────

export const PM_NOTIFICATION_RULES: PMNotificationRule[] = [
  {
    id: "rule-1",
    name: "Nhac task tre han",
    enabled: true,
    time: "08:30",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    triggers: ["overdue", "near_due"],
    recipients: "assignee",
    channels: ["workspace", "email"],
    messageTemplate: "[LANCSNETWORKS] Task tre han\n{task_name}\nNguoi phu trach: {assignee}\nQua han: {overdue_days} ngay\nTien do: {progress}%\nDu an: {project_name}",
  },
  {
    id: "rule-2",
    name: "Nhac sap den han",
    enabled: true,
    time: "09:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    triggers: ["near_due"],
    recipients: "assignee",
    channels: ["workspace"],
    messageTemplate: "[LANCSNETWORKS] Task sap den han\n{task_name}\nNguoi phu trach: {assignee}\nDen han: {due_date}\nTien do: {progress}%",
  },
  {
    id: "rule-3",
    name: "Nhac cuoi ngay log work",
    enabled: false,
    time: "17:30",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    triggers: ["no_log"],
    recipients: "assignee",
    channels: ["workspace", "telegram"],
    telegramGroupId: "-5131795020",
    messageTemplate: "[LANCSNETWORKS] Nhac log work\nBan chua log du 8h hom nay.\nDu an: {project_name}",
  },
  {
    id: "rule-4",
    name: "Nhac PM duyet timesheet",
    enabled: true,
    time: "10:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    triggers: ["pending_timesheet"],
    recipients: "pm",
    channels: ["email"],
    messageTemplate: "[LANCSNETWORKS] Timesheet cho duyet\nCo {count} timesheet cho duyet.\nDu an: {project_name}",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICATION LOG
// ──────────────────────────────────────────────────────────────────────────────

export const PM_NOTIFICATION_LOG: PMNotificationLog[] = [
  { id: "log-1", time: "2026-03-24 08:30", type: "Tre han", recipient: "James Hart", channel: "Workspace", status: "sent" },
  { id: "log-2", time: "2026-03-24 08:30", type: "Tre han", recipient: "James Hart", channel: "Email", status: "sent" },
  { id: "log-3", time: "2026-03-24 09:00", type: "Sap den han", recipient: "Kwame Asante", channel: "Workspace", status: "sent" },
  { id: "log-4", time: "2026-03-23 08:30", type: "Tre han", recipient: "Maria Russo", channel: "Workspace", status: "sent" },
  { id: "log-5", time: "2026-03-23 08:30", type: "Tre han", recipient: "Maria Russo", channel: "Email", status: "error" },
  { id: "log-6", time: "2026-03-23 10:00", type: "Duyet timesheet", recipient: "Alice Morgan", channel: "Email", status: "sent" },
  { id: "log-7", time: "2026-03-22 09:00", type: "Sap den han", recipient: "Tom Newton", channel: "Workspace", status: "sent" },
  { id: "log-8", time: "2026-03-22 08:30", type: "Tre han", recipient: "Leo Tan", channel: "Workspace", status: "sent" },
];

export const MEETING_COLORS: Record<string, string> = {
  review: "#4CABEB",
  standup: "#22c55e",
  board: "#E36C25",
  other: "#9b7b94",
};
