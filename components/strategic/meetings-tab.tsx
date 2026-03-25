"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, MapPin, Users, Trash2,
} from "lucide-react";
import {
  MEETINGS, MEETING_COLORS, MEETING_TYPE_LABELS,
  Meeting, MeetingType, L1_PROJECTS,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, "0"); }

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === tomorrow.toDateString()) return "Ngày mai";
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
}

function isToday(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return d.toDateString() === t.toDateString();
}

// ── Toast Notification ────────────────────────────────────────────────────────
function MeetingToast({
  meeting,
  onClose,
  onViewDetails,
}: {
  meeting: Meeting;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 2500);
    const hide = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 10500);
    timerRef.current = hide;
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100] w-80 bg-card rounded-xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-accent to-secondary" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: MEETING_COLORS[meeting.type] + "22" }}
          >
            <Calendar className="w-4 h-4" style={{ color: MEETING_COLORS[meeting.type] }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-foreground">Cuộc họp sắp tới</div>
            <div className="text-xs font-semibold text-foreground mt-0.5 truncate">{meeting.title}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {meeting.time} · {meeting.duration} phút · {meeting.location}
            </div>
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
            className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Bỏ qua"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                onClose();
                onViewDetails();
              }, 300);
            }}
            className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[10px] font-semibold hover:bg-primary/90 transition-colors"
          >
            Xem chi tiết
          </button>
          <button
            onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
            className="flex-1 px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-[10px] font-semibold hover:bg-muted/80 transition-colors"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Meeting Modal ──────────────────────────────────────────────────────
interface CreateForm {
  title: string; date: string; hour: string; minute: string;
  type: MeetingType; project: string; location: string; members: string;
}

const DEFAULT_FORM: CreateForm = {
  title: "", date: "", hour: "09", minute: "00",
  type: "review", project: "", location: "", members: "",
};

function CreateMeetingModal({
  initialDate,
  onClose,
  onCreate,
}: {
  initialDate?: string;
  onClose: () => void;
  onCreate: (m: Meeting) => void;
}) {
  const [form, setForm] = useState<CreateForm>({ ...DEFAULT_FORM, date: initialDate ?? "" });

  const set = (k: keyof CreateForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    const newMeeting: Meeting = {
      id: `M-${Date.now()}`,
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      time: `${form.hour}:${form.minute}`,
      duration: 60,
      location: form.location || "TBD",
      project: form.project || undefined,
      attendees: form.members.split(",").map((m) => m.trim()).filter(Boolean),
    };
    onCreate(newMeeting);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden"
        role="dialog" aria-modal="true" aria-label="Tạo lịch họp"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-accent text-accent-foreground">
          <h2 className="font-bold text-sm">Tạo lịch họp</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Đóng">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Tiêu đề <span className="text-destructive">*</span>
            </label>
            <input
              required value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Nhập tiêu đề cuộc họp"
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Ngày <span className="text-destructive">*</span>
              </label>
              <input
                required type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Giờ</label>
              <select value={form.hour} onChange={(e) => set("hour", e.target.value)}
                className="w-full px-2 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                {Array.from({ length: 24 }, (_, i) => pad(i)).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Phút</label>
              <select value={form.minute} onChange={(e) => set("minute", e.target.value)}
                className="w-full px-2 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Loại</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value as MeetingType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring">
              {(Object.entries(MEETING_TYPE_LABELS) as [MeetingType, string][]).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Dự án</label>
            <select value={form.project} onChange={(e) => set("project", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- Không liên kết --</option>
              {L1_PROJECTS.filter((p) => !p.closed).map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Địa điểm</label>
            <input
              value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="Phòng họp A1 / Online..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Thành viên</label>
            <input
              value={form.members} onChange={(e) => set("members", e.target.value)}
              placeholder="Nguyễn Văn A, Trần Thị B,..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Tạo
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Meeting Details Modal ────────────────────────────────────────────────────
function MeetingDetailsModal({
  meeting,
  onClose,
}: {
  meeting: Meeting;
  onClose: () => void;
}) {
  const projectName = meeting.project ? L1_PROJECTS.find((p) => p.id === meeting.project)?.name : undefined;
  const dateLabel = new Date(meeting.date + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết cuộc họp"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-accent text-accent-foreground">
          <h2 className="font-bold text-sm">Chi tiết cuộc họp</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-bold text-foreground">{meeting.title}</div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: MEETING_COLORS[meeting.type] }}
              >
                {MEETING_TYPE_LABELS[meeting.type]}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {dateLabel} · {meeting.time} · {meeting.duration} phút
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-muted-foreground">Địa điểm</div>
            <div className="text-sm text-foreground">{meeting.location}</div>
          </div>

          {projectName && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-muted-foreground">Dự án</div>
              <div className="text-sm text-foreground">
                {meeting.project} — {projectName}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground">Thành viên tham dự</div>
            {meeting.attendees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-border bg-background"
                    title={a}
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Chưa có thành viên</div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Meetings Tab ──────────────────────────────────────────────────────────────
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function MeetingsTab() {
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>();
  const [toastDismissed, setToastDismissed] = useState(false);
  const [detailsMeeting, setDetailsMeeting] = useState<Meeting | null>(null);

  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2); // 0-indexed: March = 2

  // Toast: nearest upcoming meeting from today
  const upcomingMeeting = meetings.find((m) => {
    const d = new Date(m.date + "T" + m.time);
    return d >= new Date();
  });

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0

  const meetingDates = new Set(meetings.map((m) => m.date));
  const meetingsByDate = meetings.reduce<Record<string, Meeting[]>>((acc, m) => {
    (acc[m.date] = acc[m.date] ?? []).push(m);
    return acc;
  }, {});

  const calDays: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function monthName(m: number) {
    return new Date(calYear, m, 1).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  }

  // Upcoming meetings sorted
  const upcoming = [...meetings].sort((a, b) => {
    const da = new Date(a.date + "T" + a.time).getTime();
    const db = new Date(b.date + "T" + b.time).getTime();
    return da - db;
  });

  // Group by date
  const grouped: { date: string; items: Meeting[] }[] = [];
  for (const m of upcoming) {
    const last = grouped[grouped.length - 1];
    if (last && last.date === m.date) last.items.push(m);
    else grouped.push({ date: m.date, items: [m] });
  }

  function handleDelete(id: string) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }

  function handleCreate(m: Meeting) {
    setMeetings((prev) => [...prev, m]);
    queueCeoReminder(m, 10);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Lịch họp</h2>
          <p className="text-xs text-muted-foreground">{meetings.length} cuộc họp</p>
        </div>
        <button
          onClick={() => { setCreateDate(undefined); setShowCreate(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo lịch họp
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* ── Mini Calendar ── */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3 h-fit">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                else setCalMonth((m) => m - 1);
              }}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-foreground capitalize">{monthName(calMonth)}</span>
            <button
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                else setCalMonth((m) => m + 1);
              }}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Tháng sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {calDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
              const hasMeeting = meetingDates.has(dateStr);
              const dayMeetings = meetingsByDate[dateStr] ?? [];
              const isCurrentDay = dateStr === todayStr;
              return (
                <button
                  key={day}
                  onClick={() => { setCreateDate(dateStr); setShowCreate(true); }}
                  className={cn(
                    "flex flex-col items-center py-1 rounded-md text-[11px] font-medium hover:bg-muted transition-colors relative",
                    isCurrentDay && "bg-blue-100 text-primary font-bold"
                  )}
                  title={hasMeeting ? `${dayMeetings.length} cuộc họp` : "Tạo lịch họp"}
                >
                  {day}
                  {hasMeeting && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayMeetings.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: MEETING_COLORS[m.type] }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {(Object.entries(MEETING_COLORS) as [MeetingType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {MEETING_TYPE_LABELS[type]}
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="space-y-4">
          {grouped.map(({ date, items }) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-xs font-semibold",
                  isToday(date) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {formatDateLabel(date)}
                </span>
                {isToday(date) && (
                  <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-[10px] font-semibold">
                    Hôm nay
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="flex gap-3 bg-card rounded-xl border border-border px-4 py-3 hover:border-primary/30 transition-colors group relative"
                  >
                    {/* Color bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: MEETING_COLORS[m.type] }}
                    />
                    <div className="flex-1 pl-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{m.title}</span>
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                          style={{ backgroundColor: MEETING_COLORS[m.type] }}
                        >
                          {MEETING_TYPE_LABELS[m.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.time} · {m.duration} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {m.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <div className="flex items-center">
                            {m.attendees.slice(0, 4).map((a, i) => (
                              <span
                                key={i}
                                className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center -ml-1 first:ml-0 border border-card"
                                title={a}
                              >
                                {a.split(" ").pop()?.[0] ?? "?"}
                              </span>
                            ))}
                            {m.attendees.length > 4 && (
                              <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[8px] font-semibold flex items-center justify-center -ml-1 border border-card">
                                +{m.attendees.length - 4}
                              </span>
                            )}
                          </div>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="Xóa cuộc họp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Không có cuộc họp nào
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateMeetingModal
          initialDate={createDate}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Details modal */}
      {detailsMeeting && (
        <MeetingDetailsModal meeting={detailsMeeting} onClose={() => setDetailsMeeting(null)} />
      )}

      {/* Toast */}
      {!toastDismissed && upcomingMeeting && (
        <MeetingToast
          meeting={upcomingMeeting}
          onClose={() => setToastDismissed(true)}
          onViewDetails={() => setDetailsMeeting(upcomingMeeting)}
        />
      )}
    </div>
  );
}

function queueCeoReminder(meeting: Meeting, leadMinutes: number) {
  try {
    const meetingAt = new Date(meeting.date + "T" + meeting.time).getTime();
    const fireAt = meetingAt - leadMinutes * 60_000;
    if (!Number.isFinite(fireAt)) return;
    if (fireAt <= Date.now()) return;

    const key = "meeting_reminders_v1";
    const raw = window.localStorage.getItem(key);
    const items = (raw ? (JSON.parse(raw) as unknown) : []) as any[];
    const safeItems = Array.isArray(items) ? items : [];

    safeItems.push({
      id: `rem_${meeting.id}_${fireAt}`,
      targetRole: "CEO",
      fireAt,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        date: meeting.date,
        time: meeting.time,
        location: meeting.location,
        duration: meeting.duration,
      },
    });

    window.localStorage.setItem(key, JSON.stringify(safeItems));
  } catch {
    // ignore
  }
}
