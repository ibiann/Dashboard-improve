"use client";

import { useState } from "react";
import { Bell, Plus, Pencil, Trash2, X, AlertCircle, Check } from "lucide-react";
import {
  PM_NOTIFICATION_RULES, PM_NOTIFICATION_LOG,
  PMNotificationRule, PMNotificationLog,
} from "@/lib/pm-mock-data";

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const ALL_DAYS: PMNotificationRule["days"][number][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" };

const ALL_TRIGGERS = [
  { id: "overdue",           label: "Tre han" },
  { id: "near_due",          label: "Sap den han (trong 3 ngay)" },
  { id: "blocked",           label: "Vuong mac / Blocked" },
  { id: "no_log",            label: "Chua log du 8h trong ngay" },
  { id: "pending_timesheet", label: "Timesheet chua duyet > 2 ngay" },
];

const TRIGGER_LABELS: Record<string, string> = Object.fromEntries(ALL_TRIGGERS.map((t) => [t.id, t.label]));

const CHANNEL_OPTIONS = [
  { id: "workspace", label: "Workspace (web)" },
  { id: "email",     label: "Email" },
  { id: "telegram",  label: "Telegram" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Preview formatter
// ──────────────────────────────────────────────────────────────────────────────

function buildPreview(template: string): string {
  return template
    .replace(/{task_name}/g, "FPGA synthesis timing closure")
    .replace(/{assignee}/g, "James Hart")
    .replace(/{project_name}/g, "NavComm FPGA Core")
    .replace(/{due_date}/g, "2026-03-19")
    .replace(/{overdue_days}/g, "5")
    .replace(/{progress}/g, "65")
    .replace(/{count}/g, "3");
}

// ──────────────────────────────────────────────────────────────────────────────
// Rule Modal
// ──────────────────────────────────────────────────────────────────────────────

interface RuleModalProps {
  rule?: PMNotificationRule;
  onClose: () => void;
  onSave: (rule: PMNotificationRule) => void;
}

function RuleModal({ rule, onClose, onSave }: RuleModalProps) {
  const [form, setForm] = useState<PMNotificationRule>(
    rule ?? {
      id: `rule-${Date.now()}`,
      name: "",
      enabled: true,
      time: "09:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      triggers: [],
      recipients: "assignee",
      channels: ["workspace"],
      messageTemplate: "[LANCSNETWORKS] Thong bao\n{task_name}\nNguoi phu trach: {assignee}\nDu an: {project_name}",
    }
  );

  const showTelegram = form.channels.includes("telegram");
  const preview = buildPreview(form.messageTemplate);

  function toggleDay(day: PMNotificationRule["days"][number]) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }

  function toggleTrigger(id: string) {
    setForm((f) => ({
      ...f,
      triggers: f.triggers.includes(id) ? f.triggers.filter((t) => t !== id) : [...f.triggers, id],
    }));
  }

  function toggleChannel(id: "workspace" | "email" | "telegram") {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(id) ? f.channels.filter((c) => c !== id) : [...f.channels, id],
    }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: "#063986" }}>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white">{rule ? "Sua lich nhac" : "Tao lich nhac moi"}</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name + toggle */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-foreground block mb-1">Ten lich nhac *</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ten lich nhac..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex-shrink-0 pt-5">
              <button
                onClick={() => setForm({ ...form, enabled: !form.enabled })}
                className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.enabled ? "bg-success" : "bg-muted-foreground/30"}`}
                role="switch"
                aria-checked={form.enabled}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Thoi gian gui *</label>
            <input
              type="time"
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>

          {/* Days */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Ngay gui *</label>
            <div className="flex gap-1.5 flex-wrap">
              {ALL_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border-2 transition-colors ${form.days.includes(d) ? "text-white border-primary" : "text-muted-foreground border-border hover:border-primary/40"}`}
                  style={form.days.includes(d) ? { backgroundColor: "#063986" } : {}}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Dieu kien trigger *</label>
            <div className="space-y-1.5">
              {ALL_TRIGGERS.map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleTrigger(t.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${form.triggers.includes(t.id) ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary"}`}
                  >
                    {form.triggers.includes(t.id) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-xs text-foreground">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Gui den *</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value as PMNotificationRule["recipients"] })}
            >
              <option value="assignee">Nguoi phu trach</option>
              <option value="pm">PM</option>
              <option value="all">Tat ca thanh vien</option>
              <option value="custom">Chon cu the</option>
            </select>
          </div>

          {/* Channels */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Kenh gui *</label>
            <div className="space-y-1.5">
              {CHANNEL_OPTIONS.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleChannel(c.id as "workspace" | "email" | "telegram")}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${form.channels.includes(c.id as any) ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary"}`}
                  >
                    {form.channels.includes(c.id as any) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-xs text-foreground">{c.label}</span>
                </label>
              ))}
            </div>

            {/* Telegram config */}
            {showTelegram && (
              <div className="mt-3 p-3 border border-border rounded-xl bg-muted space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Telegram Config</p>
                <div>
                  <label className="text-xs text-foreground block mb-1">Group ID</label>
                  <input
                    className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="-5131795020"
                    value={form.telegramGroupId ?? ""}
                    onChange={(e) => setForm({ ...form, telegramGroupId: e.target.value })}
                  />
                </div>
                <button className="text-xs font-semibold text-primary hover:underline">
                  Gui thu Test
                </button>
              </div>
            )}
          </div>

          {/* Message template */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Noi dung tin nhan</label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-xs resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              value={form.messageTemplate}
              onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
            />
            <p className="text-[9px] text-muted-foreground mt-1">
              Variables: {"{task_name}"}, {"{assignee}"}, {"{project_name}"}, {"{due_date}"}, {"{overdue_days}"}, {"{progress}"}, {"{count}"}
            </p>
          </div>

          {/* Live preview */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-2">Preview (live)</label>
            <div className="bg-slate-900 text-green-400 rounded-xl p-3 text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
              {preview}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2 bg-muted border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-white transition-colors">
            Huy
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: "#E36C25" }}
          >
            Luu rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Rule Card
// ──────────────────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onEdit,
  onDelete,
}: {
  rule: PMNotificationRule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm transition-opacity ${rule.enabled ? "border-border" : "border-border opacity-60"}`}>
      <div className="flex items-start gap-3">
        {/* Toggle */}
        <button
          onClick={onToggle}
          className={`mt-0.5 relative inline-flex w-9 h-5 rounded-full transition-colors flex-shrink-0 ${rule.enabled ? "bg-success" : "bg-muted-foreground/30"}`}
          role="switch"
          aria-checked={rule.enabled}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">{rule.name}</p>
          <div className="space-y-0.5 mt-1.5 text-[10px] text-muted-foreground">
            <p>{rule.time} · {rule.days.map((d) => DAY_LABELS[d]).join(", ")}</p>
            <p>{rule.triggers.map((t) => TRIGGER_LABELS[t] ?? t).join(", ") || "Chua chon dieu kien"}</p>
            <p>
              {rule.recipients === "assignee" ? "Nguoi phu trach" : rule.recipients === "pm" ? "PM" : rule.recipients === "all" ? "Tat ca" : "Tuy chinh"}
              {" · "}
              {rule.channels.join(", ")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            aria-label="Edit rule"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-muted-foreground hover:text-danger hover:bg-muted rounded-lg transition-colors"
              aria-label="Delete rule"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={onDelete} className="px-2 py-1 text-[9px] font-bold text-white bg-danger rounded-lg hover:opacity-90">Xoa</button>
              <button onClick={() => setShowConfirm(false)} className="px-2 py-1 text-[9px] font-bold text-muted-foreground border border-border rounded-lg hover:bg-muted">Huy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Notifications Tab
// ──────────────────────────────────────────────────────────────────────────────

export function NotificationsTab() {
  const [rules, setRules] = useState<PMNotificationRule[]>(PM_NOTIFICATION_RULES);
  const [logs] = useState<PMNotificationLog[]>(PM_NOTIFICATION_LOG);
  const [editingRule, setEditingRule] = useState<PMNotificationRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function toggleRule(id: string) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  function saveRule(rule: PMNotificationRule) {
    setRules((prev) => {
      const idx = prev.findIndex((r) => r.id === rule.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rule;
        return next;
      }
      return [...prev, rule];
    });
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  // Live preview always uses the first rule's template as example
  const previewTemplate = rules[0]?.messageTemplate ?? "[LANCSNETWORKS] Thong bao\n{task_name}\nNguoi phu trach: {assignee}";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left — Rules list */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Quy tac thong bao</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg"
            style={{ backgroundColor: "#E36C25" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Them lich nhac
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => toggleRule(rule.id)}
              onEdit={() => setEditingRule(rule)}
              onDelete={() => deleteRule(rule.id)}
            />
          ))}
        </div>
      </div>

      {/* Right — Preview + Log */}
      <div className="lg:col-span-2 space-y-4">
        {/* Preview */}
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">Notification Preview</h3>
          <div className="bg-slate-900 text-green-400 rounded-xl p-3 text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
            {buildPreview(previewTemplate)}
          </div>
        </div>

        {/* Log */}
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">Lich su thong bao</h3>
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-success" : "bg-danger"}`} />
                <span className="text-muted-foreground font-mono flex-shrink-0 w-32">{log.time}</span>
                <span className="text-muted-foreground flex-shrink-0">{log.type}</span>
                <span className="text-foreground font-medium truncate">{log.recipient}</span>
                <span className="text-muted-foreground flex-shrink-0">{log.channel}</span>
                <span className={`flex-shrink-0 font-semibold ${log.status === "sent" ? "text-success" : "text-danger"}`}>
                  {log.status === "sent" ? "Sent" : "Error"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <RuleModal
          onClose={() => setShowCreateModal(false)}
          onSave={saveRule}
        />
      )}
      {editingRule && (
        <RuleModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSave={saveRule}
        />
      )}
    </div>
  );
}
