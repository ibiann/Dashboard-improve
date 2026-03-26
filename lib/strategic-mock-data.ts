// ─── Strategic Level 1 Mock Data ─────────────────────────────────────────────
// 22 projects (19 active, 3 closed), 55 employees, 8 meetings, permissions

// ──────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────────────────────────────────────

export type L1RAGStatus = "green" | "amber" | "red";
export type L1Category = "SW" | "HW" | "FPGA";

export interface L1PhaseProgress {
  name: string;
  progress: number;
  color: string;
}

export interface L1OverdueTask {
  id: string;
  title: string;
  assignee: string;
  dueSince: string;
}

export interface L1Project {
  id: string;
  name: string;
  pm: string;
  category: L1Category;
  ragStatus: L1RAGStatus;
  progress: number;
  plannedProgress: number;
  efficiency: number; // resource efficiency %
  spi: number;
  phases: L1PhaseProgress[];
  budget: { total: number; spent: number };
  overdueTasks: L1OverdueTask[];
  closed: boolean;
  endDate: string;
}

export const L1_PROJECTS: L1Project[] = [
  {
    id: "P-001", name: "NavComm FPGA Core", pm: "Alice Morgan", category: "FPGA",
    ragStatus: "green", progress: 65, plannedProgress: 60, efficiency: 88, spi: 1.08,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 90, color: "#4CABEB" },
      { name: "Test", progress: 60, color: "#E36C25" },
      { name: "Release", progress: 10, color: "#d1d5db" },
    ],
    budget: { total: 420000, spent: 265000 },
    overdueTasks: [
      { id: "T-012", title: "FPGA synthesis timing closure", assignee: "J. Hart", dueSince: "5 ngày" },
      { id: "T-019", title: "Signal integrity report", assignee: "M. Russo", dueSince: "2 ngày" },
    ],
    closed: false, endDate: "2026-06-30",
  },
  {
    id: "P-002", name: "Sentinel Gateway v3", pm: "Bob Chen", category: "SW",
    ragStatus: "amber", progress: 51, plannedProgress: 65, efficiency: 74, spi: 0.78,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 75, color: "#4CABEB" },
      { name: "Test", progress: 30, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 380000, spent: 210000 },
    overdueTasks: [
      { id: "T-031", title: "API gateway auth module review", assignee: "L. Tan", dueSince: "8 ngày" },
      { id: "T-038", title: "Load test environment setup", assignee: "S. Brooks", dueSince: "4 ngày" },
    ],
    closed: false, endDate: "2026-04-15",
  },
  {
    id: "P-003", name: "Sigma Hardware Backplane", pm: "Carol Davies", category: "HW",
    ragStatus: "red", progress: 41, plannedProgress: 70, efficiency: 55, spi: 0.59,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 55, color: "#4CABEB" },
      { name: "Test", progress: 10, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 560000, spent: 390000 },
    overdueTasks: [
      { id: "T-055", title: "PCB layout sign-off", assignee: "C. Davies", dueSince: "12 ngày" },
      { id: "T-062", title: "Thermal analysis review", assignee: "P. Newton", dueSince: "9 ngày" },
      { id: "T-067", title: "BOM finalisation", assignee: "A. Obi", dueSince: "6 ngày" },
    ],
    closed: false, endDate: "2026-03-01",
  },
  {
    id: "P-004", name: "ProtoLink Middleware", pm: "Dan Osei", category: "SW",
    ragStatus: "green", progress: 81, plannedProgress: 78, efficiency: 92, spi: 1.04,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 85, color: "#E36C25" },
      { name: "Release", progress: 40, color: "#d1d5db" },
    ],
    budget: { total: 290000, spent: 198000 },
    overdueTasks: [
      { id: "T-088", title: "Release candidate smoke test", assignee: "D. Osei", dueSince: "1 ngày" },
    ],
    closed: false, endDate: "2026-07-31",
  },
  {
    id: "P-005", name: "TerraEdge IoT Platform", pm: "Eve Nkosi", category: "SW",
    ragStatus: "amber", progress: 57, plannedProgress: 68, efficiency: 68, spi: 0.84,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 80, color: "#4CABEB" },
      { name: "Test", progress: 45, color: "#E36C25" },
      { name: "Release", progress: 5, color: "#d1d5db" },
    ],
    budget: { total: 475000, spent: 290000 },
    overdueTasks: [
      { id: "T-101", title: "Device driver regression suite", assignee: "E. Müller", dueSince: "7 ngày" },
      { id: "T-108", title: "Cloud connector integration test", assignee: "R. Kaur", dueSince: "4 ngày" },
    ],
    closed: false, endDate: "2026-09-30",
  },
  {
    id: "P-006", name: "Quantum Radar Module", pm: "Frank Liu", category: "FPGA",
    ragStatus: "green", progress: 72, plannedProgress: 70, efficiency: 85, spi: 1.03,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 95, color: "#4CABEB" },
      { name: "Test", progress: 55, color: "#E36C25" },
      { name: "Release", progress: 15, color: "#d1d5db" },
    ],
    budget: { total: 610000, spent: 395000 },
    overdueTasks: [],
    closed: false, endDate: "2026-08-15",
  },
  {
    id: "P-007", name: "Helios Power Supply Unit", pm: "Grace Kim", category: "HW",
    ragStatus: "amber", progress: 44, plannedProgress: 58, efficiency: 62, spi: 0.76,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 70, color: "#4CABEB" },
      { name: "Test", progress: 20, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 340000, spent: 215000 },
    overdueTasks: [
      { id: "T-120", title: "Power regulation test", assignee: "G. Kim", dueSince: "5 ngày" },
    ],
    closed: false, endDate: "2026-05-20",
  },
  {
    id: "P-008", name: "Vortex Firmware Suite", pm: "Helen Li", category: "SW",
    ragStatus: "red", progress: 46, plannedProgress: 72, efficiency: 48, spi: 0.64,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 65, color: "#4CABEB" },
      { name: "Test", progress: 20, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 390000, spent: 290000 },
    overdueTasks: [
      { id: "T-142", title: "Bootloader security patch", assignee: "H. Patel", dueSince: "14 ngày" },
      { id: "T-148", title: "Memory map validation", assignee: "O. Mensah", dueSince: "10 ngày" },
      { id: "T-153", title: "Code coverage report", assignee: "H. Patel", dueSince: "6 ngày" },
    ],
    closed: false, endDate: "2026-02-28",
  },
  {
    id: "P-009", name: "CloudEdge API Fabric", pm: "Ivan Torres", category: "SW",
    ragStatus: "green", progress: 88, plannedProgress: 85, efficiency: 94, spi: 1.04,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 95, color: "#E36C25" },
      { name: "Release", progress: 60, color: "#d1d5db" },
    ],
    budget: { total: 280000, spent: 215000 },
    overdueTasks: [],
    closed: false, endDate: "2026-05-31",
  },
  {
    id: "P-010", name: "Nexus RF Transceiver", pm: "Julia Pham", category: "FPGA",
    ragStatus: "amber", progress: 38, plannedProgress: 50, efficiency: 70, spi: 0.76,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 55, color: "#4CABEB" },
      { name: "Test", progress: 15, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 520000, spent: 310000 },
    overdueTasks: [
      { id: "T-160", title: "RF calibration procedure", assignee: "J. Pham", dueSince: "3 ngày" },
    ],
    closed: false, endDate: "2026-11-30",
  },
  {
    id: "P-011", name: "Atlas CAN Bus Controller", pm: "Kevin Brown", category: "HW",
    ragStatus: "green", progress: 76, plannedProgress: 72, efficiency: 89, spi: 1.06,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 75, color: "#E36C25" },
      { name: "Release", progress: 20, color: "#d1d5db" },
    ],
    budget: { total: 230000, spent: 155000 },
    overdueTasks: [],
    closed: false, endDate: "2026-06-15",
  },
  {
    id: "P-012", name: "Photon Image Pipeline", pm: "Laura Nguyen", category: "FPGA",
    ragStatus: "green", progress: 60, plannedProgress: 55, efficiency: 91, spi: 1.09,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 88, color: "#4CABEB" },
      { name: "Test", progress: 40, color: "#E36C25" },
      { name: "Release", progress: 5, color: "#d1d5db" },
    ],
    budget: { total: 445000, spent: 255000 },
    overdueTasks: [],
    closed: false, endDate: "2026-10-31",
  },
  {
    id: "P-013", name: "Mercury Data Logger", pm: "Mike Santos", category: "SW",
    ragStatus: "amber", progress: 49, plannedProgress: 60, efficiency: 67, spi: 0.82,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 72, color: "#4CABEB" },
      { name: "Test", progress: 25, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 195000, spent: 130000 },
    overdueTasks: [
      { id: "T-175", title: "Data compression module", assignee: "M. Santos", dueSince: "4 ngày" },
    ],
    closed: false, endDate: "2026-08-31",
  },
  {
    id: "P-014", name: "Titan Embedded OS", pm: "Nina Kovács", category: "SW",
    ragStatus: "red", progress: 33, plannedProgress: 55, efficiency: 52, spi: 0.60,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 48, color: "#4CABEB" },
      { name: "Test", progress: 5, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 620000, spent: 480000 },
    overdueTasks: [
      { id: "T-188", title: "Kernel scheduler rewrite", assignee: "N. Kovács", dueSince: "18 ngày" },
      { id: "T-193", title: "Driver compatibility matrix", assignee: "P. Vogel", dueSince: "11 ngày" },
    ],
    closed: false, endDate: "2026-12-31",
  },
  {
    id: "P-015", name: "Orion Sensor Fusion", pm: "Oscar Fernandez", category: "FPGA",
    ragStatus: "green", progress: 68, plannedProgress: 65, efficiency: 87, spi: 1.05,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 92, color: "#4CABEB" },
      { name: "Test", progress: 50, color: "#E36C25" },
      { name: "Release", progress: 8, color: "#d1d5db" },
    ],
    budget: { total: 395000, spent: 238000 },
    overdueTasks: [],
    closed: false, endDate: "2026-07-31",
  },
  {
    id: "P-016", name: "Solar Motor Drive", pm: "Paula Adeyemi", category: "HW",
    ragStatus: "amber", progress: 53, plannedProgress: 62, efficiency: 72, spi: 0.85,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 78, color: "#4CABEB" },
      { name: "Test", progress: 35, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 275000, spent: 178000 },
    overdueTasks: [
      { id: "T-205", title: "Thermal stress test", assignee: "P. Adeyemi", dueSince: "3 ngày" },
    ],
    closed: false, endDate: "2026-09-15",
  },
  {
    id: "P-017", name: "Eclipse Network Switch", pm: "Quinn Zhang", category: "HW",
    ragStatus: "green", progress: 79, plannedProgress: 75, efficiency: 90, spi: 1.05,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 80, color: "#E36C25" },
      { name: "Release", progress: 25, color: "#d1d5db" },
    ],
    budget: { total: 315000, spent: 218000 },
    overdueTasks: [],
    closed: false, endDate: "2026-06-30",
  },
  {
    id: "P-018", name: "Prism Vision Accelerator", pm: "Rachel Kim", category: "FPGA",
    ragStatus: "green", progress: 55, plannedProgress: 50, efficiency: 93, spi: 1.10,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 82, color: "#4CABEB" },
      { name: "Test", progress: 30, color: "#E36C25" },
      { name: "Release", progress: 0, color: "#d1d5db" },
    ],
    budget: { total: 550000, spent: 295000 },
    overdueTasks: [],
    closed: false, endDate: "2026-11-30",
  },
  {
    id: "P-019", name: "Comet Avionics Suite", pm: "Samuel Obi", category: "SW",
    ragStatus: "amber", progress: 62, plannedProgress: 70, efficiency: 75, spi: 0.89,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 85, color: "#4CABEB" },
      { name: "Test", progress: 50, color: "#E36C25" },
      { name: "Release", progress: 12, color: "#d1d5db" },
    ],
    budget: { total: 480000, spent: 315000 },
    overdueTasks: [
      { id: "T-220", title: "DO-178C compliance review", assignee: "S. Obi", dueSince: "6 ngày" },
    ],
    closed: false, endDate: "2026-10-31",
  },
  // ── 3 Closed Projects ──
  {
    id: "P-020", name: "Xenon Signal Processor", pm: "Fatima Hassan", category: "FPGA",
    ragStatus: "green", progress: 100, plannedProgress: 100, efficiency: 96, spi: 1.00,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 100, color: "#E36C25" },
      { name: "Release", progress: 100, color: "#d1d5db" },
    ],
    budget: { total: 800000, spent: 768000 },
    overdueTasks: [],
    closed: true, endDate: "2025-12-31",
  },
  {
    id: "P-021", name: "Vortex Firmware Suite v1", pm: "George Ikoro", category: "SW",
    ragStatus: "green", progress: 100, plannedProgress: 100, efficiency: 91, spi: 1.00,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 100, color: "#E36C25" },
      { name: "Release", progress: 100, color: "#d1d5db" },
    ],
    budget: { total: 920000, spent: 895000 },
    overdueTasks: [],
    closed: true, endDate: "2025-10-31",
  },
  {
    id: "P-022", name: "Delta Analog Frontend", pm: "Tina Reyes", category: "HW",
    ragStatus: "green", progress: 100, plannedProgress: 100, efficiency: 88, spi: 1.00,
    phases: [
      { name: "Survey", progress: 100, color: "#063986" },
      { name: "R&D", progress: 100, color: "#4CABEB" },
      { name: "Test", progress: 100, color: "#E36C25" },
      { name: "Release", progress: 100, color: "#d1d5db" },
    ],
    budget: { total: 450000, spent: 437000 },
    overdueTasks: [],
    closed: true, endDate: "2025-09-30",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// EMPLOYEES (55 people)
// ──────────────────────────────────────────────────────────────────────────────

export type Dept = "Engineering" | "Product" | "QA" | "DevOps" | "Management";
export type Gender = "male" | "female";
export type EmpStatus = "active" | "inactive";

export interface KPIDetail {
  completion: number;   // Hoàn thành công việc
  quality: number;      // Chất lượng
  onTime: number;       // Đúng hạn
  teamwork: number;     // Phối hợp nhóm
  growth: number;       // Học hỏi & phát triển
}

export interface AssignedProject {
  id: string;
  name: string;
  role: "PM" | "Lead" | "Developer" | "Tester" | "Reviewer";
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: Dept;
  managerId: string | null;
  level: number; // 0=CEO,1=CTO,2=VP/Dir,3=Senior,4=Junior
  email: string;
  phone: string;
  joinDate: string;
  status: EmpStatus;
  gender: Gender;
  kpi: KPIDetail;
  assignedProjects: AssignedProject[];
}

function avgKPI(k: KPIDetail) {
  return Math.round((k.completion + k.quality + k.onTime + k.teamwork + k.growth) / 5);
}

export function kpiLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Xuất sắc", color: "#22c55e" };
  if (score >= 75) return { label: "Tốt", color: "#4CABEB" };
  if (score >= 60) return { label: "Đạt", color: "#f59e0b" };
  return { label: "Cần cải thiện", color: "#ef4444" };
}

export { avgKPI };

export const EMPLOYEES: Employee[] = [
  // Level 0 — CEO
  {
    id: "E-001", name: "Nguyễn Văn An", role: "CEO", dept: "Management", managerId: null, level: 0,
    email: "ceo@lancsnetworks.com", phone: "0901 234 567", joinDate: "2015-01-10",
    status: "active", gender: "male",
    kpi: { completion: 95, quality: 93, onTime: 91, teamwork: 96, growth: 88 },
    assignedProjects: [],
  },
  // Level 1 — CTO
  {
    id: "E-002", name: "Trần Thị Bích", role: "CTO", dept: "Engineering", managerId: "E-001", level: 1,
    email: "cto@lancsnetworks.com", phone: "0901 234 568", joinDate: "2016-03-15",
    status: "active", gender: "female",
    kpi: { completion: 92, quality: 94, onTime: 90, teamwork: 95, growth: 91 },
    assignedProjects: [],
  },
  // Level 2 — VP / Director
  {
    id: "E-003", name: "Lê Minh Cường", role: "VP Engineering", dept: "Engineering", managerId: "E-002", level: 2,
    email: "le.minh.cuong@lancsnetworks.com", phone: "0902 111 001", joinDate: "2017-06-20",
    status: "active", gender: "male",
    kpi: { completion: 88, quality: 90, onTime: 87, teamwork: 92, growth: 85 },
    assignedProjects: [{ id: "P-001", name: "NavComm FPGA Core", role: "Lead" }],
  },
  {
    id: "E-004", name: "Phạm Thu Hà", role: "VP Product", dept: "Product", managerId: "E-002", level: 2,
    email: "pham.thu.ha@lancsnetworks.com", phone: "0902 111 002", joinDate: "2018-02-12",
    status: "active", gender: "female",
    kpi: { completion: 85, quality: 88, onTime: 83, teamwork: 90, growth: 87 },
    assignedProjects: [{ id: "P-004", name: "ProtoLink Middleware", role: "PM" }],
  },
  {
    id: "E-005", name: "Hoàng Đức Dũng", role: "Director QA", dept: "QA", managerId: "E-002", level: 2,
    email: "hoang.duc.dung@lancsnetworks.com", phone: "0902 111 003", joinDate: "2017-09-01",
    status: "active", gender: "male",
    kpi: { completion: 90, quality: 95, onTime: 89, teamwork: 88, growth: 84 },
    assignedProjects: [{ id: "P-002", name: "Sentinel Gateway v3", role: "Reviewer" }],
  },
  {
    id: "E-006", name: "Vũ Thanh Liên", role: "Director DevOps", dept: "DevOps", managerId: "E-002", level: 2,
    email: "vu.thanh.lien@lancsnetworks.com", phone: "0902 111 004", joinDate: "2019-05-15",
    status: "active", gender: "female",
    kpi: { completion: 87, quality: 86, onTime: 88, teamwork: 91, growth: 89 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "Lead" }],
  },
  // Level 3 — Seniors
  {
    id: "E-007", name: "Alice Morgan", role: "Senior PM", dept: "Management", managerId: "E-003", level: 3,
    email: "alice.morgan@lancsnetworks.com", phone: "0903 222 001", joinDate: "2019-07-20",
    status: "active", gender: "female",
    kpi: { completion: 91, quality: 87, onTime: 93, teamwork: 88, growth: 82 },
    assignedProjects: [{ id: "P-001", name: "NavComm FPGA Core", role: "PM" }],
  },
  {
    id: "E-008", name: "Bob Chen", role: "Senior PM", dept: "Management", managerId: "E-004", level: 3,
    email: "bob.chen@lancsnetworks.com", phone: "0903 222 002", joinDate: "2020-01-10",
    status: "active", gender: "male",
    kpi: { completion: 78, quality: 80, onTime: 75, teamwork: 82, growth: 79 },
    assignedProjects: [{ id: "P-002", name: "Sentinel Gateway v3", role: "PM" }],
  },
  {
    id: "E-009", name: "Carol Davies", role: "Senior PM", dept: "Management", managerId: "E-003", level: 3,
    email: "carol.davies@lancsnetworks.com", phone: "0903 222 003", joinDate: "2018-11-05",
    status: "active", gender: "female",
    kpi: { completion: 72, quality: 70, onTime: 65, teamwork: 75, growth: 73 },
    assignedProjects: [{ id: "P-003", name: "Sigma Hardware Backplane", role: "PM" }],
  },
  {
    id: "E-010", name: "Dan Osei", role: "Senior PM", dept: "Management", managerId: "E-004", level: 3,
    email: "dan.osei@lancsnetworks.com", phone: "0903 222 004", joinDate: "2021-03-18",
    status: "active", gender: "male",
    kpi: { completion: 89, quality: 91, onTime: 88, teamwork: 90, growth: 86 },
    assignedProjects: [{ id: "P-004", name: "ProtoLink Middleware", role: "PM" }],
  },
  {
    id: "E-011", name: "Eve Nkosi", role: "Senior PM", dept: "Management", managerId: "E-004", level: 3,
    email: "eve.nkosi@lancsnetworks.com", phone: "0903 222 005", joinDate: "2020-08-22",
    status: "active", gender: "female",
    kpi: { completion: 82, quality: 84, onTime: 80, teamwork: 85, growth: 83 },
    assignedProjects: [{ id: "P-005", name: "TerraEdge IoT Platform", role: "PM" }],
  },
  {
    id: "E-012", name: "Frank Liu", role: "FPGA Lead Engineer", dept: "Engineering", managerId: "E-003", level: 3,
    email: "frank.liu@lancsnetworks.com", phone: "0903 222 006", joinDate: "2019-02-14",
    status: "active", gender: "male",
    kpi: { completion: 86, quality: 88, onTime: 84, teamwork: 87, growth: 90 },
    assignedProjects: [{ id: "P-006", name: "Quantum Radar Module", role: "Lead" }],
  },
  {
    id: "E-013", name: "Grace Kim", role: "HW Lead Engineer", dept: "Engineering", managerId: "E-003", level: 3,
    email: "grace.kim@lancsnetworks.com", phone: "0903 222 007", joinDate: "2020-04-01",
    status: "active", gender: "female",
    kpi: { completion: 79, quality: 77, onTime: 74, teamwork: 80, growth: 76 },
    assignedProjects: [{ id: "P-007", name: "Helios Power Supply Unit", role: "PM" }],
  },
  {
    id: "E-014", name: "Helen Li", role: "SW Lead Engineer", dept: "Engineering", managerId: "E-003", level: 3,
    email: "helen.li@lancsnetworks.com", phone: "0903 222 008", joinDate: "2019-10-30",
    status: "active", gender: "female",
    kpi: { completion: 67, quality: 65, onTime: 62, teamwork: 70, growth: 68 },
    assignedProjects: [{ id: "P-008", name: "Vortex Firmware Suite", role: "PM" }],
  },
  {
    id: "E-015", name: "Ivan Torres", role: "SW Lead Engineer", dept: "Engineering", managerId: "E-003", level: 3,
    email: "ivan.torres@lancsnetworks.com", phone: "0903 222 009", joinDate: "2021-06-07",
    status: "active", gender: "male",
    kpi: { completion: 93, quality: 92, onTime: 94, teamwork: 91, growth: 95 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "PM" }],
  },
  {
    id: "E-016", name: "Julia Pham", role: "FPGA Engineer", dept: "Engineering", managerId: "E-012", level: 3,
    email: "julia.pham@lancsnetworks.com", phone: "0903 222 010", joinDate: "2022-01-20",
    status: "active", gender: "female",
    kpi: { completion: 80, quality: 82, onTime: 78, teamwork: 83, growth: 85 },
    assignedProjects: [{ id: "P-010", name: "Nexus RF Transceiver", role: "PM" }],
  },
  {
    id: "E-017", name: "Kevin Brown", role: "HW Senior Engineer", dept: "Engineering", managerId: "E-003", level: 3,
    email: "kevin.brown@lancsnetworks.com", phone: "0903 222 011", joinDate: "2020-09-15",
    status: "active", gender: "male",
    kpi: { completion: 88, quality: 87, onTime: 90, teamwork: 86, growth: 84 },
    assignedProjects: [{ id: "P-011", name: "Atlas CAN Bus Controller", role: "PM" }],
  },
  {
    id: "E-018", name: "Laura Nguyen", role: "FPGA Engineer", dept: "Engineering", managerId: "E-012", level: 3,
    email: "laura.nguyen@lancsnetworks.com", phone: "0903 222 012", joinDate: "2021-11-03",
    status: "active", gender: "female",
    kpi: { completion: 91, quality: 93, onTime: 89, teamwork: 90, growth: 92 },
    assignedProjects: [{ id: "P-012", name: "Photon Image Pipeline", role: "PM" }],
  },
  // Level 4 — Junior engineers
  {
    id: "E-019", name: "Marcus Johnson", role: "SW Developer", dept: "Engineering", managerId: "E-014", level: 4,
    email: "marcus.johnson@lancsnetworks.com", phone: "0904 333 001", joinDate: "2022-03-01",
    status: "active", gender: "male",
    kpi: { completion: 74, quality: 72, onTime: 70, teamwork: 76, growth: 80 },
    assignedProjects: [
      { id: "P-008", name: "Vortex Firmware Suite", role: "Developer" },
      { id: "P-005", name: "TerraEdge IoT Platform", role: "Developer" },
    ],
  },
  {
    id: "E-020", name: "Naomi Clark", role: "QA Engineer", dept: "QA", managerId: "E-005", level: 4,
    email: "naomi.clark@lancsnetworks.com", phone: "0904 333 002", joinDate: "2022-05-16",
    status: "active", gender: "female",
    kpi: { completion: 85, quality: 90, onTime: 83, teamwork: 87, growth: 82 },
    assignedProjects: [{ id: "P-002", name: "Sentinel Gateway v3", role: "Tester" }],
  },
  {
    id: "E-021", name: "Oliver Green", role: "FPGA Developer", dept: "Engineering", managerId: "E-012", level: 4,
    email: "oliver.green@lancsnetworks.com", phone: "0904 333 003", joinDate: "2022-07-01",
    status: "active", gender: "male",
    kpi: { completion: 77, quality: 79, onTime: 75, teamwork: 78, growth: 82 },
    assignedProjects: [{ id: "P-001", name: "NavComm FPGA Core", role: "Developer" }],
  },
  {
    id: "E-022", name: "Priya Shah", role: "SW Developer", dept: "Engineering", managerId: "E-015", level: 4,
    email: "priya.shah@lancsnetworks.com", phone: "0904 333 004", joinDate: "2022-09-20",
    status: "active", gender: "female",
    kpi: { completion: 83, quality: 85, onTime: 81, teamwork: 84, growth: 88 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "Developer" }],
  },
  {
    id: "E-023", name: "Rafael Costa", role: "DevOps Engineer", dept: "DevOps", managerId: "E-006", level: 4,
    email: "rafael.costa@lancsnetworks.com", phone: "0904 333 005", joinDate: "2021-12-01",
    status: "active", gender: "male",
    kpi: { completion: 88, quality: 86, onTime: 89, teamwork: 90, growth: 87 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "Developer" }],
  },
  {
    id: "E-024", name: "Sophia Wilson", role: "QA Engineer", dept: "QA", managerId: "E-005", level: 4,
    email: "sophia.wilson@lancsnetworks.com", phone: "0904 333 006", joinDate: "2023-01-10",
    status: "active", gender: "female",
    kpi: { completion: 80, quality: 84, onTime: 78, teamwork: 82, growth: 79 },
    assignedProjects: [{ id: "P-004", name: "ProtoLink Middleware", role: "Tester" }],
  },
  {
    id: "E-025", name: "Thomas Adler", role: "HW Developer", dept: "Engineering", managerId: "E-013", level: 4,
    email: "thomas.adler@lancsnetworks.com", phone: "0904 333 007", joinDate: "2022-04-18",
    status: "active", gender: "male",
    kpi: { completion: 72, quality: 70, onTime: 68, teamwork: 74, growth: 76 },
    assignedProjects: [{ id: "P-003", name: "Sigma Hardware Backplane", role: "Developer" }],
  },
  {
    id: "E-026", name: "Uma Patel", role: "SW Developer", dept: "Engineering", managerId: "E-014", level: 4,
    email: "uma.patel@lancsnetworks.com", phone: "0904 333 008", joinDate: "2023-02-15",
    status: "active", gender: "female",
    kpi: { completion: 76, quality: 78, onTime: 74, teamwork: 77, growth: 81 },
    assignedProjects: [{ id: "P-008", name: "Vortex Firmware Suite", role: "Developer" }],
  },
  {
    id: "E-027", name: "Victor Singh", role: "FPGA Developer", dept: "Engineering", managerId: "E-012", level: 4,
    email: "victor.singh@lancsnetworks.com", phone: "0904 333 009", joinDate: "2022-10-03",
    status: "active", gender: "male",
    kpi: { completion: 79, quality: 81, onTime: 77, teamwork: 80, growth: 83 },
    assignedProjects: [
      { id: "P-006", name: "Quantum Radar Module", role: "Developer" },
      { id: "P-010", name: "Nexus RF Transceiver", role: "Developer" },
    ],
  },
  {
    id: "E-028", name: "Wendy Brooks", role: "QA Lead", dept: "QA", managerId: "E-005", level: 3,
    email: "wendy.brooks@lancsnetworks.com", phone: "0903 222 013", joinDate: "2020-06-10",
    status: "active", gender: "female",
    kpi: { completion: 87, quality: 91, onTime: 85, teamwork: 89, growth: 86 },
    assignedProjects: [
      { id: "P-005", name: "TerraEdge IoT Platform", role: "Tester" },
      { id: "P-013", name: "Mercury Data Logger", role: "Reviewer" },
    ],
  },
  {
    id: "E-029", name: "Xiang Wu", role: "DevOps Engineer", dept: "DevOps", managerId: "E-006", level: 4,
    email: "xiang.wu@lancsnetworks.com", phone: "0904 333 010", joinDate: "2022-08-22",
    status: "active", gender: "male",
    kpi: { completion: 82, quality: 80, onTime: 83, teamwork: 85, growth: 84 },
    assignedProjects: [{ id: "P-002", name: "Sentinel Gateway v3", role: "Developer" }],
  },
  {
    id: "E-030", name: "Yara Hassan", role: "Product Manager", dept: "Product", managerId: "E-004", level: 3,
    email: "yara.hassan@lancsnetworks.com", phone: "0903 222 014", joinDate: "2021-04-20",
    status: "active", gender: "female",
    kpi: { completion: 86, quality: 85, onTime: 87, teamwork: 88, growth: 83 },
    assignedProjects: [
      { id: "P-005", name: "TerraEdge IoT Platform", role: "Reviewer" },
      { id: "P-013", name: "Mercury Data Logger", role: "PM" },
    ],
  },
  {
    id: "E-031", name: "Zach Miller", role: "SW Developer", dept: "Engineering", managerId: "E-015", level: 4,
    email: "zach.miller@lancsnetworks.com", phone: "0904 333 011", joinDate: "2023-03-01",
    status: "active", gender: "male",
    kpi: { completion: 70, quality: 68, onTime: 66, teamwork: 72, growth: 75 },
    assignedProjects: [{ id: "P-004", name: "ProtoLink Middleware", role: "Developer" }],
  },
  {
    id: "E-032", name: "Ana Martínez", role: "FPGA Developer", dept: "Engineering", managerId: "E-016", level: 4,
    email: "ana.martinez@lancsnetworks.com", phone: "0904 333 012", joinDate: "2022-11-14",
    status: "active", gender: "female",
    kpi: { completion: 78, quality: 80, onTime: 76, teamwork: 79, growth: 82 },
    assignedProjects: [{ id: "P-010", name: "Nexus RF Transceiver", role: "Developer" }],
  },
  {
    id: "E-033", name: "Ben Taylor", role: "HW Developer", dept: "Engineering", managerId: "E-017", level: 4,
    email: "ben.taylor@lancsnetworks.com", phone: "0904 333 013", joinDate: "2023-04-05",
    status: "active", gender: "male",
    kpi: { completion: 75, quality: 73, onTime: 71, teamwork: 76, growth: 78 },
    assignedProjects: [{ id: "P-011", name: "Atlas CAN Bus Controller", role: "Developer" }],
  },
  {
    id: "E-034", name: "Cleo Fontaine", role: "SW Developer", dept: "Engineering", managerId: "E-014", level: 4,
    email: "cleo.fontaine@lancsnetworks.com", phone: "0904 333 014", joinDate: "2021-09-07",
    status: "active", gender: "female",
    kpi: { completion: 84, quality: 86, onTime: 82, teamwork: 85, growth: 87 },
    assignedProjects: [
      { id: "P-008", name: "Vortex Firmware Suite", role: "Reviewer" },
      { id: "P-019", name: "Comet Avionics Suite", role: "Developer" },
    ],
  },
  {
    id: "E-035", name: "Diego Ramos", role: "QA Engineer", dept: "QA", managerId: "E-028", level: 4,
    email: "diego.ramos@lancsnetworks.com", phone: "0904 333 015", joinDate: "2022-06-01",
    status: "active", gender: "male",
    kpi: { completion: 79, quality: 82, onTime: 77, teamwork: 80, growth: 78 },
    assignedProjects: [{ id: "P-001", name: "NavComm FPGA Core", role: "Tester" }],
  },
  {
    id: "E-036", name: "Elena Popova", role: "SW Developer", dept: "Engineering", managerId: "E-015", level: 4,
    email: "elena.popova@lancsnetworks.com", phone: "0904 333 016", joinDate: "2022-12-01",
    status: "active", gender: "female",
    kpi: { completion: 81, quality: 83, onTime: 79, teamwork: 82, growth: 85 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "Developer" }],
  },
  {
    id: "E-037", name: "Finn McCarthy", role: "FPGA Developer", dept: "Engineering", managerId: "E-018", level: 4,
    email: "finn.mccarthy@lancsnetworks.com", phone: "0904 333 017", joinDate: "2023-05-15",
    status: "active", gender: "male",
    kpi: { completion: 73, quality: 75, onTime: 71, teamwork: 74, growth: 77 },
    assignedProjects: [{ id: "P-012", name: "Photon Image Pipeline", role: "Developer" }],
  },
  {
    id: "E-038", name: "Gina Reeves", role: "Product Manager", dept: "Product", managerId: "E-004", level: 3,
    email: "gina.reeves@lancsnetworks.com", phone: "0903 222 015", joinDate: "2020-10-01",
    status: "active", gender: "female",
    kpi: { completion: 88, quality: 87, onTime: 86, teamwork: 89, growth: 84 },
    assignedProjects: [
      { id: "P-015", name: "Orion Sensor Fusion", role: "PM" },
      { id: "P-018", name: "Prism Vision Accelerator", role: "Reviewer" },
    ],
  },
  {
    id: "E-039", name: "Hiro Tanaka", role: "DevOps Engineer", dept: "DevOps", managerId: "E-006", level: 4,
    email: "hiro.tanaka@lancsnetworks.com", phone: "0904 333 018", joinDate: "2022-02-14",
    status: "active", gender: "male",
    kpi: { completion: 85, quality: 83, onTime: 87, teamwork: 86, growth: 88 },
    assignedProjects: [{ id: "P-004", name: "ProtoLink Middleware", role: "Developer" }],
  },
  {
    id: "E-040", name: "Iris Johansson", role: "QA Engineer", dept: "QA", managerId: "E-028", level: 4,
    email: "iris.johansson@lancsnetworks.com", phone: "0904 333 019", joinDate: "2023-01-23",
    status: "active", gender: "female",
    kpi: { completion: 77, quality: 81, onTime: 75, teamwork: 79, growth: 76 },
    assignedProjects: [{ id: "P-007", name: "Helios Power Supply Unit", role: "Tester" }],
  },
  {
    id: "E-041", name: "Jack Okafor", role: "SW Developer", dept: "Engineering", managerId: "E-015", level: 4,
    email: "jack.okafor@lancsnetworks.com", phone: "0904 333 020", joinDate: "2022-07-18",
    status: "active", gender: "male",
    kpi: { completion: 76, quality: 78, onTime: 74, teamwork: 77, growth: 80 },
    assignedProjects: [{ id: "P-019", name: "Comet Avionics Suite", role: "Developer" }],
  },
  {
    id: "E-042", name: "Karen Lee", role: "QA Lead", dept: "QA", managerId: "E-005", level: 3,
    email: "karen.lee@lancsnetworks.com", phone: "0903 222 016", joinDate: "2019-08-30",
    status: "active", gender: "female",
    kpi: { completion: 90, quality: 92, onTime: 88, teamwork: 91, growth: 87 },
    assignedProjects: [
      { id: "P-014", name: "Titan Embedded OS", role: "Reviewer" },
      { id: "P-016", name: "Solar Motor Drive", role: "Tester" },
    ],
  },
  {
    id: "E-043", name: "Leo Moreau", role: "HW Developer", dept: "Engineering", managerId: "E-017", level: 4,
    email: "leo.moreau@lancsnetworks.com", phone: "0904 333 021", joinDate: "2022-09-01",
    status: "active", gender: "male",
    kpi: { completion: 74, quality: 72, onTime: 70, teamwork: 75, growth: 77 },
    assignedProjects: [
      { id: "P-003", name: "Sigma Hardware Backplane", role: "Developer" },
      { id: "P-016", name: "Solar Motor Drive", role: "Developer" },
    ],
  },
  {
    id: "E-044", name: "Mia Nakamura", role: "Product Manager", dept: "Product", managerId: "E-004", level: 3,
    email: "mia.nakamura@lancsnetworks.com", phone: "0903 222 017", joinDate: "2021-02-08",
    status: "active", gender: "female",
    kpi: { completion: 83, quality: 85, onTime: 81, teamwork: 86, growth: 84 },
    assignedProjects: [{ id: "P-017", name: "Eclipse Network Switch", role: "PM" }],
  },
  {
    id: "E-045", name: "Noah Bergmann", role: "FPGA Developer", dept: "Engineering", managerId: "E-016", level: 4,
    email: "noah.bergmann@lancsnetworks.com", phone: "0904 333 022", joinDate: "2023-06-01",
    status: "active", gender: "male",
    kpi: { completion: 71, quality: 73, onTime: 69, teamwork: 72, growth: 75 },
    assignedProjects: [{ id: "P-015", name: "Orion Sensor Fusion", role: "Developer" }],
  },
  {
    id: "E-046", name: "Olivia Scott", role: "DevOps Engineer", dept: "DevOps", managerId: "E-006", level: 4,
    email: "olivia.scott@lancsnetworks.com", phone: "0904 333 023", joinDate: "2022-03-28",
    status: "active", gender: "female",
    kpi: { completion: 84, quality: 82, onTime: 85, teamwork: 87, growth: 86 },
    assignedProjects: [{ id: "P-009", name: "CloudEdge API Fabric", role: "Developer" }],
  },
  {
    id: "E-047", name: "Pedro Alves", role: "SW Developer", dept: "Engineering", managerId: "E-014", level: 4,
    email: "pedro.alves@lancsnetworks.com", phone: "0904 333 024", joinDate: "2022-10-10",
    status: "active", gender: "male",
    kpi: { completion: 77, quality: 79, onTime: 75, teamwork: 78, growth: 81 },
    assignedProjects: [{ id: "P-014", name: "Titan Embedded OS", role: "Developer" }],
  },
  {
    id: "E-048", name: "Quinn Walsh", role: "HW Developer", dept: "Engineering", managerId: "E-013", level: 4,
    email: "quinn.walsh@lancsnetworks.com", phone: "0904 333 025", joinDate: "2021-08-05",
    status: "active", gender: "male",
    kpi: { completion: 82, quality: 80, onTime: 83, teamwork: 84, growth: 79 },
    assignedProjects: [{ id: "P-007", name: "Helios Power Supply Unit", role: "Developer" }],
  },
  {
    id: "E-049", name: "Rosa Garcia", role: "QA Engineer", dept: "QA", managerId: "E-042", level: 4,
    email: "rosa.garcia@lancsnetworks.com", phone: "0904 333 026", joinDate: "2023-02-20",
    status: "active", gender: "female",
    kpi: { completion: 76, quality: 79, onTime: 74, teamwork: 77, growth: 73 },
    assignedProjects: [{ id: "P-019", name: "Comet Avionics Suite", role: "Tester" }],
  },
  {
    id: "E-050", name: "Samuel Obi", role: "Senior PM", dept: "Management", managerId: "E-004", level: 3,
    email: "samuel.obi@lancsnetworks.com", phone: "0903 222 018", joinDate: "2020-07-01",
    status: "active", gender: "male",
    kpi: { completion: 84, quality: 82, onTime: 85, teamwork: 83, growth: 81 },
    assignedProjects: [{ id: "P-019", name: "Comet Avionics Suite", role: "PM" }],
  },
  {
    id: "E-051", name: "Tina Reyes", role: "Senior PM", dept: "Management", managerId: "E-003", level: 3,
    email: "tina.reyes@lancsnetworks.com", phone: "0903 222 019", joinDate: "2018-05-14",
    status: "active", gender: "female",
    kpi: { completion: 89, quality: 88, onTime: 90, teamwork: 87, growth: 85 },
    assignedProjects: [],
  },
  {
    id: "E-052", name: "Umar Hassan", role: "SW Developer", dept: "Engineering", managerId: "E-015", level: 4,
    email: "umar.hassan@lancsnetworks.com", phone: "0904 333 027", joinDate: "2023-07-03",
    status: "active", gender: "male",
    kpi: { completion: 68, quality: 70, onTime: 66, teamwork: 69, growth: 72 },
    assignedProjects: [{ id: "P-019", name: "Comet Avionics Suite", role: "Developer" }],
  },
  {
    id: "E-053", name: "Vera Müller", role: "FPGA Developer", dept: "Engineering", managerId: "E-018", level: 4,
    email: "vera.muller@lancsnetworks.com", phone: "0904 333 028", joinDate: "2022-05-02",
    status: "active", gender: "female",
    kpi: { completion: 80, quality: 82, onTime: 78, teamwork: 81, growth: 84 },
    assignedProjects: [
      { id: "P-012", name: "Photon Image Pipeline", role: "Developer" },
      { id: "P-018", name: "Prism Vision Accelerator", role: "Developer" },
    ],
  },
  {
    id: "E-054", name: "Will Chen", role: "DevOps Engineer", dept: "DevOps", managerId: "E-006", level: 4,
    email: "will.chen@lancsnetworks.com", phone: "0904 333 029", joinDate: "2021-10-15",
    status: "active", gender: "male",
    kpi: { completion: 86, quality: 84, onTime: 88, teamwork: 87, growth: 89 },
    assignedProjects: [{ id: "P-002", name: "Sentinel Gateway v3", role: "Developer" }],
  },
  {
    id: "E-055", name: "Xena Park", role: "QA Engineer", dept: "QA", managerId: "E-042", level: 4,
    email: "xena.park@lancsnetworks.com", phone: "0904 333 030", joinDate: "2023-04-18",
    status: "inactive", gender: "female",
    kpi: { completion: 65, quality: 67, onTime: 63, teamwork: 68, growth: 70 },
    assignedProjects: [],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MEETINGS (8 meetings)
// ──────────────────────────────────────────────────────────────────────────────

export type MeetingType = "review" | "standup" | "board" | "other";

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  location: string;
  project?: string;
  attendees: string[];
}

export const MEETING_COLORS: Record<MeetingType, string> = {
  review: "#4CABEB",
  standup: "#22c55e",
  board: "#E36C25",
  other: "#9b7b94",
};

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  review: "Review",
  standup: "Standup",
  board: "Board",
  other: "Khác",
};

// Spread across today + next 20 days (relative to 2026-03-24)
export const MEETINGS: Meeting[] = [
  {
    id: "M-001", title: "Sprint Review — NavComm FPGA", type: "review",
    date: "2026-03-24", time: "09:00", duration: 60, location: "Phòng họp A2",
    project: "P-001",
    attendees: ["Alice Morgan", "Frank Liu", "Oliver Green", "Diego Ramos"],
  },
  {
    id: "M-002", title: "Daily Standup Engineering", type: "standup",
    date: "2026-03-24", time: "08:15", duration: 15, location: "Online (Teams)",
    attendees: ["Trần Thị Bích", "Lê Minh Cường", "Helen Li", "Ivan Torres"],
  },
  {
    id: "M-003", title: "Board — Q1 Portfolio Health Review", type: "board",
    date: "2026-03-25", time: "14:00", duration: 120, location: "Phòng họp Board",
    attendees: ["Nguyễn Văn An", "Trần Thị Bích", "Phạm Thu Hà", "Hoàng Đức Dũng"],
  },
  {
    id: "M-004", title: "Sentinel Gateway Risk Sync", type: "review",
    date: "2026-03-26", time: "10:30", duration: 45, location: "Phòng họp B1",
    project: "P-002",
    attendees: ["Bob Chen", "Naomi Clark", "Wendy Brooks", "Xiang Wu", "Will Chen"],
  },
  {
    id: "M-005", title: "TerraEdge IoT Phase Planning", type: "other",
    date: "2026-03-28", time: "15:00", duration: 90, location: "Phòng họp A1",
    project: "P-005",
    attendees: ["Eve Nkosi", "Yara Hassan", "Marcus Johnson", "Wendy Brooks"],
  },
  {
    id: "M-006", title: "Weekly Standup — DevOps", type: "standup",
    date: "2026-03-31", time: "08:00", duration: 20, location: "Online (Teams)",
    attendees: ["Vũ Thanh Liên", "Rafael Costa", "Xiang Wu", "Olivia Scott", "Will Chen", "Hiro Tanaka"],
  },
  {
    id: "M-007", title: "Titan OS Escalation Meeting", type: "board",
    date: "2026-04-03", time: "13:00", duration: 60, location: "Phòng họp C1",
    project: "P-014",
    attendees: ["Nguyễn Văn An", "Trần Thị Bích", "Nina Kovács", "Karen Lee", "Pedro Alves"],
  },
  {
    id: "M-008", title: "QA Review — Vortex & Sigma", type: "review",
    date: "2026-04-07", time: "11:00", duration: 75, location: "Phòng họp B2",
    attendees: ["Hoàng Đức Dũng", "Karen Lee", "Wendy Brooks", "Naomi Clark", "Diego Ramos", "Sophia Wilson"],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// PERMISSIONS MATRIX
// ──────────────────────────────────────────────────────────────────────────────

export interface PermModule {
  id: string;
  label: string;
  group: string;
}

export const PERM_GROUPS: { label: string; modules: string[] }[] = [
  { label: "Dự án", modules: ["proj_view", "proj_create", "proj_edit", "proj_phase"] },
  { label: "Công việc", modules: ["task_create", "task_assign", "task_status", "task_logwork", "task_timesheet"] },
  { label: "Báo cáo", modules: ["report_view", "report_export", "report_quality"] },
  { label: "Rủi ro", modules: ["risk_manage", "risk_view"] },
  { label: "Nguồn lực", modules: ["resource_view"] },
  { label: "Lịch họp", modules: ["meeting_create", "meeting_view"] },
  { label: "Hệ thống", modules: ["user_manage", "permission_manage"] },
];

export const PERM_MODULES: PermModule[] = [
  { id: "proj_view",           label: "Xem dự án",         group: "Dự án" },
  { id: "proj_create",         label: "Tạo dự án",         group: "Dự án" },
  { id: "proj_edit",           label: "Sửa dự án",         group: "Dự án" },
  { id: "proj_phase",          label: "Quản lý phase",     group: "Dự án" },
  { id: "task_create",         label: "Tạo task",          group: "Công việc" },
  { id: "task_assign",         label: "Giao việc",         group: "Công việc" },
  { id: "task_status",         label: "Đổi trạng thái",    group: "Công việc" },
  { id: "task_logwork",        label: "Log work",          group: "Công việc" },
  { id: "task_timesheet",      label: "Duyệt timesheet",   group: "Công việc" },
  { id: "report_view",         label: "Xem báo cáo",       group: "Báo cáo" },
  { id: "report_export",       label: "Xuất báo cáo",      group: "Báo cáo" },
  { id: "report_quality",      label: "Chất lượng",        group: "Báo cáo" },
  { id: "risk_manage",         label: "Quản lý rủi ro",    group: "Rủi ro" },
  { id: "risk_view",           label: "Xem rủi ro",        group: "Rủi ro" },
  { id: "resource_view",       label: "Nguồn lực",         group: "Nguồn lực" },
  { id: "meeting_create",      label: "Tạo lịch họp",      group: "Lịch họp" },
  { id: "meeting_view",        label: "Xem lịch họp",      group: "Lịch họp" },
  { id: "user_manage",         label: "Quản lý user",      group: "Hệ thống" },
  { id: "permission_manage",   label: "Phân quyền",        group: "Hệ thống" },
];

export type PermissionMap = Record<string, boolean>; // moduleId -> granted

export interface RolePermission {
  id: string;
  name: string;
  isDefault: boolean;
  permissions: PermissionMap;
}

const ALL_MODULE_IDS = PERM_MODULES.map((m) => m.id);

function makePerms(allowed: string[]): PermissionMap {
  return Object.fromEntries(ALL_MODULE_IDS.map((id) => [id, allowed.includes(id)]));
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
  {
    id: "role-ceo", name: "CEO", isDefault: true,
    permissions: makePerms(["proj_view", "report_view", "report_export", "risk_view", "resource_view", "meeting_create", "meeting_view"]),
  },
  {
    id: "role-cto", name: "CTO", isDefault: true,
    permissions: makePerms([
      "proj_view", "proj_create", "proj_edit", "proj_phase",
      "task_create", "task_assign", "task_status", "task_timesheet",
      "report_view", "report_export", "report_quality",
      "risk_manage", "risk_view", "resource_view",
      "meeting_create", "meeting_view",
      "user_manage", "permission_manage",
    ]),
  },
  {
    id: "role-pm", name: "PM", isDefault: true,
    permissions: makePerms([
      "proj_view", "proj_edit", "proj_phase",
      "task_create", "task_assign", "task_status", "task_timesheet",
      "report_view", "report_export", "report_quality",
      "risk_view", "resource_view",
      "meeting_create", "meeting_view",
    ]),
  },
  {
    id: "role-engineer", name: "Engineer", isDefault: true,
    permissions: makePerms(["proj_view", "task_status", "task_logwork", "meeting_view", "report_view"]),
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// DERIVED KPIs
// ──────────────────────────────────────────────────────────────────────────────

export function l1GetPortfolioHealth(projects: L1Project[]): number {
  const active = projects.filter((p) => !p.closed);
  if (!active.length) return 0;
  const avg = active.reduce((s, p) => s + p.progress / p.plannedProgress, 0) / active.length;
  return Math.min(Math.round(avg * 100), 100);
}

export function l1GetGlobalSPI(projects: L1Project[]): number {
  const active = projects.filter((p) => !p.closed);
  if (!active.length) return 0;
  const spi = active.reduce((s, p) => s + p.spi, 0) / active.length;
  return Math.round(spi * 100) / 100;
}

export function l1GetResourceEfficiency(projects: L1Project[]): number {
  const active = projects.filter((p) => !p.closed);
  if (!active.length) return 0;
  return Math.round(active.reduce((s, p) => s + p.efficiency, 0) / active.length);
}

export function l1GetTotalBudget(projects: L1Project[]) {
  return projects.filter((p) => !p.closed).reduce(
    (acc, p) => ({ total: acc.total + p.budget.total, spent: acc.spent + p.budget.spent }),
    { total: 0, spent: 0 }
  );
}
