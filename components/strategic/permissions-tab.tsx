"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Trash2, Save, Search, ChevronDown, ChevronRight } from "lucide-react";
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  PERM_GROUPS,
  PermissionItem,
  PermissionMap,
  RolePermission,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";
import { getFrappeEffectivePerms } from "@/lib/permissions/frappe-style";

function setAllInMap(keys: string[], value: boolean, cur: PermissionMap): PermissionMap {
  const next = { ...cur };
  for (const k of keys) next[k] = value;
  return next;
}

function countEnabled(map: PermissionMap) {
  return Object.values(map).filter(Boolean).length;
}

export function PermissionsTab() {
  const [roles, setRoles] = useState<RolePermission[]>(DEFAULT_ROLE_PERMISSIONS);
  const [activeRoleId, setActiveRoleId] = useState<string>(DEFAULT_ROLE_PERMISSIONS[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [q, setQ] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERM_GROUPS.map((g) => [g.label, true]))
  );

  const allKeys = useMemo(() => PERMISSIONS.map((p) => p.key), []);
  const activeRole = roles.find((r) => r.id === activeRoleId) ?? roles[0];

  const filteredPerms = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return PERMISSIONS;
    return PERMISSIONS.filter((p) => {
      return (
        p.key.toLowerCase().includes(query) ||
        p.label.toLowerCase().includes(query) ||
        p.group.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [q]);

  const permsByGroup = useMemo(() => {
    return filteredPerms.reduce<Record<string, PermissionItem[]>>((acc, p) => {
      (acc[p.group] = acc[p.group] ?? []).push(p);
      return acc;
    }, {});
  }, [filteredPerms]);

  function updateRolePermissions(roleId: string, nextPerms: PermissionMap) {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, permissions: nextPerms } : r)));
    setSaved(false);
  }

  function toggleKey(roleId: string, key: string) {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    updateRolePermissions(roleId, { ...r.permissions, [key]: !r.permissions[key] });
  }

  function setAllForRole(roleId: string, value: boolean) {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    updateRolePermissions(roleId, setAllInMap(allKeys, value, r.permissions));
  }

  function setAllForGroup(roleId: string, group: string, value: boolean) {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    const keys = (permsByGroup[group] ?? []).map((p) => p.key);
    updateRolePermissions(roleId, setAllInMap(keys, value, r.permissions));
  }

  function deleteRole(roleId: string) {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (activeRoleId === roleId) {
      const next = roles.find((r) => r.id !== roleId)?.id ?? "";
      setActiveRoleId(next);
    }
    setSaved(false);
  }

  function addRole() {
    const name = newRoleName.trim();
    if (!name) return;
    const newRole: RolePermission = {
      id: `role-${Date.now()}`,
      name,
      isDefault: false,
      permissions: Object.fromEntries(allKeys.map((k) => [k, false])),
    };
    setRoles((prev) => [...prev, newRole]);
    setActiveRoleId(newRole.id);
    setNewRoleName("");
    setShowAdd(false);
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalPerms = PERMISSIONS.length;
  const enabledCount = activeRole ? countEnabled(activeRole.permissions) : 0;
  const effectivePerms = activeRole ? getFrappeEffectivePerms(activeRole.permissions) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Phân quyền</h2>
          <p className="text-xs text-muted-foreground">
            {roles.length} roles · {totalPerms} permissions
          </p>
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
              saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
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
            role="dialog"
            aria-modal="true"
            aria-label="Thêm role mới"
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

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3">
        {/* Role list */}
        <div className="bg-card rounded-xl border border-border overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Roles</div>
            {activeRole && (
              <div className="text-[10px] text-muted-foreground">
                {enabledCount}/{totalPerms}
              </div>
            )}
          </div>
          <div className="divide-y divide-border">
            {roles.map((r) => {
              const cnt = countEnabled(r.permissions);
              const active = r.id === activeRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRoleId(r.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors",
                    active && "bg-primary/5"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">{cnt}/{totalPerms} quyền</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!r.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteRole(r.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Xóa role ${r.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground", active && "text-primary")} />
                  </div>
                </button>
              );
            })}
          </div>
          {activeRole && (
            <div className="px-4 py-3 border-t border-border flex items-center gap-2">
              <button
                onClick={() => setAllForRole(activeRole.id, true)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                Bật tất cả
              </button>
              <button
                onClick={() => setAllForRole(activeRole.id, false)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Tắt tất cả
              </button>
            </div>
          )}
        </div>

        {/* Permission builder */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm permission (vd: project.view.allow)"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {activeRole && (
              <div className="text-[10px] text-muted-foreground shrink-0">
                {countEnabled(activeRole.permissions)}/{totalPerms}
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            {activeRole && effectivePerms && (
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                <div className="text-xs font-semibold text-foreground">Hiệu lực (Frappe-style)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(effectivePerms).map(([resource, perms]) => {
                    const r = resource as keyof typeof effectivePerms;
                    return (
                      <div key={resource} className="border border-border/60 rounded-lg p-2 space-y-1">
                        <div className="text-[10px] font-bold text-foreground capitalize">{resource}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(["read", "write", "create", "delete", "submit"] as const).map((t) => {
                            const on = perms[t];
                            return (
                              <span
                                key={t}
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                  on
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-card text-muted-foreground border-border"
                                )}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {!activeRole ? (
              <div className="text-xs text-muted-foreground">Chưa có role.</div>
            ) : (
              PERM_GROUPS.map((g) => {
                const items = (permsByGroup[g.label] ?? []).sort((a, b) => a.key.localeCompare(b.key));
                if (items.length === 0) return null;
                const open = openGroups[g.label] ?? true;
                const groupEnabled = items.filter((p) => activeRole.permissions[p.key]).length;

                return (
                  <div key={g.label} className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() =>
                        setOpenGroups((prev) => ({ ...prev, [g.label]: !open }))
                      }
                      className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", !open && "-rotate-90")} />
                        <div className="text-xs font-bold text-foreground">{g.label}</div>
                        <div className="text-[10px] text-muted-foreground">{groupEnabled}/{items.length}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAllForGroup(activeRole.id, g.label, true);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAllForGroup(activeRole.id, g.label, false);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          None
                        </button>
                      </div>
                    </button>

                    {open && (
                      <div className="divide-y divide-border">
                        {items.map((p) => {
                          const granted = !!activeRole.permissions[p.key];
                          return (
                            <div key={p.key} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-foreground">{p.label}</div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate" title={p.key}>
                                  {p.key}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleKey(activeRole.id, p.key)}
                                aria-label={`${granted ? "Tắt" : "Bật"} ${p.key}`}
                                aria-pressed={granted}
                                className={cn(
                                  "w-10 h-6 rounded-full border flex items-center px-0.5 transition-colors",
                                  granted ? "bg-emerald-500 border-emerald-500" : "bg-muted/40 border-border"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                                    granted ? "translate-x-4" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
