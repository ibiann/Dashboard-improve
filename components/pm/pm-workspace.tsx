"use client";

import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Check, X,
  Calendar, Bell, Clock, MapPin, Users,
} from "lucide-react";
import {
  PM_MEETINGS, PM_TODOS, PMTodoItem, PMMeeting, MEETING_COLORS,
} from "@/lib/pm-mock-data";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function pad(n: number) { return n.toString().padStart(2, "0"); }

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date("2026-03-24T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Hom nay";
  if (diff === 1) return "Ngay mai";
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const SOURCE_LABELS: Record<string, string> = {
  review: "Can review",
  timesheet: "Timesheet",
  overdue: "Qua han",
  manual: "Thu cong",
};

// ──────────────────────────────────────────────────────────────────────────────
// Create Meeting Modal
// ──────────────────────────────────────────────────────────────────────────────

interface CreateMeetingModalProps {
  initialDate?: string;
  onClose: () => void;
  onSave: (meeting: Omit<PMMeeting, "id">) => void;
}

function CreateMeetingModal({ initialDate, onClose, onSave }: CreateMeetingModalProps) {
  const [form, setForm] = useState({
    title: "",
    date: initialDate || "2026-03-24",
    time: "09:00",
    duration: 60,
    type: "review" as PMMeeting["type"],
    location: "",
    attendees: "",
  });

  function handleSave() {
    if (!form.title.trim()) return;
    onSave({
      title: form.title,
      date: form.date,
      time: form.time,
      duration: form.duration,
      type: form.type,
      location: form.location,
      attendees: form.attendees.split(",").map((s) => s.trim()).filter(Boolean),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#063986" }}>
          <h3 className="text-sm font-bold text-white">Tao lich hop moi</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Tieu de *</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Tieu de cuoc hop..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Ngay *</label>
              <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Gio *</label>
              <input type="time" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Thoi luong (phut)</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={15} step={15} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Loai</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PMMeeting["type"] })}>
                <option value="review">Review</option>
                <option value="standup">Standup</option>
                <option value="board">Board</option>
                <option value="other">Khac</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Dia diem</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Phong hop / Online..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Thanh vien (phan cach bang dau phay)</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Alice Morgan, James Hart..." value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
          </div>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2 bg-muted border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-white transition-colors">Huy</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: "#E36C25" }}>Luu lich hop</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Mini Calendar
// ──────────────────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_NAMES = ["Thang 1","Thang 2","Thang 3","Thang 4","Thang 5","Thang 6","Thang 7","Thang 8","Thang 9","Thang 10","Thang 11","Thang 12"];

function getMeetingDates(meetings: PMMeeting[]): Set<string> {
  return new Set(meetings.map((m) => m.date));
}

interface MiniCalendarProps {
  meetings: PMMeeting[];
  onDayClick: (dateStr: string) => void;
}

function MiniCalendar({ meetings, onDayClick }: MiniCalendarProps) {
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(2); // 0-indexed, March = 2

  const meetingDates = getMeetingDates(meetings);
  const today = "2026-03-24";

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Mon-based: Mon=0 ... Sun=6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prev() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 hover:bg-muted rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
        <span className="text-xs font-bold text-foreground">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={next} className="p-1 hover:bg-muted rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_SHORT.map((d) => (
          <span key={d} className="text-center text-[9px] font-semibold text-muted-foreground py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const isToday = dateStr === today;
          const hasMeeting = meetingDates.has(dateStr);
          return (
            <button
              key={i}
              onClick={() => onDayClick(dateStr)}
              className={`
                relative flex flex-col items-center justify-center rounded-lg py-1.5 text-[11px] font-medium transition-colors
                ${isToday ? "text-white font-bold" : "text-foreground hover:bg-muted"}
              `}
              style={isToday ? { backgroundColor: "#063986" } : {}}
            >
              {day}
              {hasMeeting && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isToday ? "white" : "#E36C25" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Agenda
// ──────────────────────────────────────────────────────────────────────────────

function AgendaView({ meetings, onDelete }: { meetings: PMMeeting[]; onDelete: (id: string) => void }) {
  const sorted = [...meetings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const grouped: Record<string, PMMeeting[]> = {};
  for (const m of sorted) {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  }
  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-3 mt-4">
      {dates.map((date) => (
        <div key={date}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {formatDateLabel(date)}
          </p>
          <div className="space-y-2">
            {grouped[date].map((m) => {
              const color = MEETING_COLORS[m.type] ?? "#9b7b94";
              return (
                <div
                  key={m.id}
                  className="flex items-stretch gap-2 group bg-white rounded-lg border border-border hover:shadow-sm transition-shadow overflow-hidden"
                >
                  <div className="w-1 rounded-l-lg flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 py-2 pr-3 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{m.time} ({m.duration}p)</span>
                      {m.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{m.location}</span>}
                    </div>
                    {m.attendees.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground truncate">{m.attendees.slice(0, 3).join(", ")}{m.attendees.length > 3 ? ` +${m.attendees.length - 3}` : ""}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-2 self-center text-muted-foreground hover:text-red-500 transition-all"
                    aria-label="Delete meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {dates.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Chua co lich hop nao</p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Todo List
// ──────────────────────────────────────────────────────────────────────────────

function TodoSection({ label, items, onToggle }: { label: string; items: PMTodoItem[]; onToggle: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${item.done ? "bg-muted/40 border-transparent opacity-60" : "bg-white border-border hover:border-primary/30"}`}
          >
            <button
              onClick={() => onToggle(item.id)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? "border-success bg-success" : "border-muted-foreground/40 hover:border-primary"}`}
            >
              {item.done && <Check className="w-2.5 h-2.5 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {item.projectName && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#063986" + "15", color: "#063986" }}>
                    {item.projectName}
                  </span>
                )}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {SOURCE_LABELS[item.source]}
                </span>
                <span className="text-[9px] text-muted-foreground">{item.dueDate}</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Workspace
// ──────────────────────────────────────────────────────────────────────────────

interface AddTodoForm {
  title: string;
  priority: "low" | "medium" | "high";
}

export function PMWorkspace() {
  const [todos, setTodos] = useState<PMTodoItem[]>(PM_TODOS);
  const [meetings, setMeetings] = useState<PMMeeting[]>(PM_MEETINGS);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [createMeetingDate, setCreateMeetingDate] = useState<string | undefined>();
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [addForm, setAddForm] = useState<AddTodoForm>({ title: "", priority: "medium" });

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function addTodo() {
    if (!addForm.title.trim()) return;
    const newItem: PMTodoItem = {
      id: `todo-${Date.now()}`,
      title: addForm.title,
      dueDate: "2026-03-24",
      priority: addForm.priority,
      done: false,
      section: "today",
      source: "manual",
    };
    setTodos((prev) => [newItem, ...prev]);
    setAddForm({ title: "", priority: "medium" });
    setShowAddTodo(false);
  }

  function handleCalendarDayClick(dateStr: string) {
    setCreateMeetingDate(dateStr);
    setShowCreateMeeting(true);
  }

  function handleSaveMeeting(m: Omit<PMMeeting, "id">) {
    setMeetings((prev) => [...prev, { ...m, id: `pm-m-${Date.now()}` }]);
  }

  function deleteMeeting(id: string) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }

  const todayItems  = todos.filter((t) => t.section === "today");
  const weekItems   = todos.filter((t) => t.section === "week");
  const upcomingItems = todos.filter((t) => t.section === "upcoming");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left — Todo list (60%) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground">Viec can lam</h2>
          <button
            onClick={() => setShowAddTodo(!showAddTodo)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "#E36C25" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Them
          </button>
        </div>

        {/* Inline add form */}
        {showAddTodo && (
          <div className="mb-4 p-3 bg-muted rounded-lg border border-border space-y-2">
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ten cong viec..."
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <select
                className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                value={addForm.priority}
                onChange={(e) => setAddForm({ ...addForm, priority: e.target.value as "low" | "medium" | "high" })}
              >
                <option value="low">Thap</option>
                <option value="medium">Trung binh</option>
                <option value="high">Cao</option>
              </select>
              <button onClick={addTodo} className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: "#063986" }}>Them</button>
              <button onClick={() => setShowAddTodo(false)} className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-white transition-colors">Huy</button>
            </div>
          </div>
        )}

        <TodoSection label="Hom nay" items={todayItems} onToggle={toggleTodo} />
        <TodoSection label="Tuan nay" items={weekItems} onToggle={toggleTodo} />
        <TodoSection label="Sap toi" items={upcomingItems} onToggle={toggleTodo} />
      </div>

      {/* Right — Calendar + Agenda (40%) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Lich hop
            </h2>
            <button
              onClick={() => { setCreateMeetingDate(undefined); setShowCreateMeeting(true); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: "#E36C25" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tao lich hop
            </button>
          </div>
          <MiniCalendar meetings={meetings} onDayClick={handleCalendarDayClick} />
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-primary" />
            Lich hop sap toi
          </h3>
          <AgendaView meetings={meetings} onDelete={deleteMeeting} />
        </div>
      </div>

      {/* Create meeting modal */}
      {showCreateMeeting && (
        <CreateMeetingModal
          initialDate={createMeetingDate}
          onClose={() => setShowCreateMeeting(false)}
          onSave={handleSaveMeeting}
        />
      )}
    </div>
  );
}
