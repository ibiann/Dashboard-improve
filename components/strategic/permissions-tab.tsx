"use client";

import { useState } from "react";
import { Plus, Check, Trash2, Save } from "lucide-react";
import {
  PERM_MODULES, PERM_GROUPS, DEFAULT_ROLE_PERMISSIONS,
  RolePermission, PermissionMap,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";

export function PermissionsTab() {
  const [roles, setRoles] = useState<RolePermission[]>(DEFAULT_ROLE_PERMISSIONS);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const ALL_IDS = PERM_MODULES.map((m) => m.id);

  function toggle(roleId: string, moduleId: string) {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: { ...r.permissions, [moduleId]: !r.permissions[moduleId] } }
          : r
      )
    );
    setSaved(false);
  }

  function setAll(roleId: string, value: boolean) {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: Object.fromEntries(ALL_IDS.map((id) => [id, value])) }
          : r
      )
    );
    setSaved(false);
  }

  function deleteRole(roleId: string) {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setSaved(false);
  }

  function addRole() {
    const name = newRoleName.trim();
    if (!name) return;
    setRoles((prev) => [
      ...prev,
      {
        id: `role-${Date.now()}`,
        name,
        isDefault: false,
        permissions: Object.fromEntries(ALL_IDS.map((id) => [id, false])),
      },
    ]);
    setNewRoleName("");
    setShowAdd(false);
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalModules = PERM_MODULES.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Phân quyền</h2>
          <p className="text-xs text-muted-foreground">{roles.length} roles · {totalModules} modules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Role
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              saved
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Đã lưu" : "Lưu"}
          </button>
        </div>
      </div>

      {/* Add role modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowAdd(false)} aria-hidden="true" />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card rounded-xl border border-border shadow-xl p-5 space-y-4"
            role="dialog" aria-modal="true" aria-label="Thêm role mới"
          >
            <h3 className="text-sm font-bold text-foreground">Thêm Role mới</h3>
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRole()}
              placeholder="Tên role (vd: Designer)"
              autoFocus
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={addRole}
                disabled={!newRoleName.trim()}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Thêm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Permission Matrix Table */}
      <div className="bg-card rounded-xl border border-border overflow-auto">
        <table className="text-xs border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            {/* Role name column */}
            <col style={{ width: "160px", minWidth: "160px" }} />
            {/* Module columns */}
            {PERM_MODULES.map((m) => (
              <col key={m.id} style={{ width: "36px", minWidth: "36px" }} />
            ))}
          </colgroup>

          <thead>
            {/* Group header row */}
            <tr>
              <th className="sticky left-0 bg-muted/50 z-10 border-b border-r border-border px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground" />
              {PERM_GROUPS.map((g) => (
                <th
                  key={g.label}
                  colSpan={g.modules.length}
                  className="border-b border-r border-border px-1 py-1.5 text-center text-[10px] font-semibold text-primary bg-primary/5"
                >
                  {g.label}
                </th>
              ))}
            </tr>

            {/* Module headers with vertical text */}
            <tr>
              <th className="sticky left-0 bg-muted/50 z-10 border-b border-r border-border px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground">
                Role
              </th>
              {PERM_MODULES.map((mod) => (
                <th
                  key={mod.id}
                  className="border-b border-r border-border"
                  style={{ height: "120px", verticalAlign: "bottom", padding: "8px 2px" }}
                  title={mod.label}
                >
                  <div
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      fontSize: "9px",
                      fontWeight: 500,
                      color: "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                      lineHeight: "1",
                    }}
                  >
                    {mod.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {roles.map((role) => {
              const enabledCount = ALL_IDS.filter((id) => role.permissions[id]).length;
              return (
                <tr key={role.id} className="hover:bg-muted/10 transition-colors">
                  {/* Role name cell (sticky) */}
                  <td className="sticky left-0 bg-card z-10 border-r border-border px-3 py-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <div>
                        <div className="font-semibold text-foreground text-[11px]">{role.name}</div>
                        <div className="text-[9px] text-muted-foreground">{enabledCount}/{totalModules} quyền</div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => setAll(role.id, true)}
                          title="Bật tất cả"
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                          All
                        </button>
                        <button
                          onClick={() => setAll(role.id, false)}
                          title="Tắt tất cả"
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          None
                        </button>
                        {!role.isDefault && (
                          <button
                            onClick={() => deleteRole(role.id)}
                            title="Xóa role"
                            className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label={`Xóa role ${role.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Permission checkboxes */}
                  {PERM_MODULES.map((mod) => {
                    const granted = !!role.permissions[mod.id];
                    return (
                      <td key={mod.id} className="border-r border-border text-center py-2 px-1">
                        <button
                          onClick={() => toggle(role.id, mod.id)}
                          aria-label={`${granted ? "Tắt" : "Bật"} ${mod.label} cho ${role.name}`}
                          aria-pressed={granted}
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center mx-auto transition-all border",
                            granted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-card border-slate-300 hover:border-primary"
                          )}
                        >
                          {granted && <Check className="w-3 h-3" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-4 py-2">
        <span>{roles.length} roles · {totalModules} modules</span>
        <div className="flex items-center gap-3">
          {roles.map((r) => {
            const cnt = ALL_IDS.filter((id) => r.permissions[id]).length;
            return (
              <span key={r.id}>
                <strong className="text-foreground">{r.name}</strong>: {cnt} quyền
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
