import type { PermissionMap, PermResource } from "@/lib/strategic-mock-data";

export type FrappePermType = "read" | "write" | "create" | "delete" | "submit";

export type FrappeEffectivePerms = Record<
  PermResource,
  Record<FrappePermType, boolean>
>;

function has(map: PermissionMap, key: string) {
  return Boolean(map[key]);
}

// Maps our demo keys (resource.action.allow) into Frappe-style permission types:
// - view -> read
// - create -> create
// - edit/manage/assign/logwork/approve/export -> write (best-effort for UI summary)
export function getFrappeEffectivePerms(map: PermissionMap): FrappeEffectivePerms {
  const empty: FrappeEffectivePerms = {
    project: { read: false, write: false, create: false, delete: false, submit: false },
    task: { read: false, write: false, create: false, delete: false, submit: false },
    report: { read: false, write: false, create: false, delete: false, submit: false },
    risk: { read: false, write: false, create: false, delete: false, submit: false },
    resource: { read: false, write: false, create: false, delete: false, submit: false },
    meeting: { read: false, write: false, create: false, delete: false, submit: false },
    user: { read: false, write: false, create: false, delete: false, submit: false },
    permission: { read: false, write: false, create: false, delete: false, submit: false },
  };

  empty.project.read = has(map, "project.view.allow");
  empty.project.create = has(map, "project.create.allow");
  empty.project.write = has(map, "project.edit.allow") || has(map, "project.manage.allow");

  empty.task.read = has(map, "task.view.allow");
  empty.task.create = has(map, "task.create.allow");
  empty.task.write =
    has(map, "task.edit.allow") ||
    has(map, "task.assign.allow") ||
    has(map, "task.logwork.allow") ||
    has(map, "task.approve.allow");

  empty.report.read = has(map, "report.view.allow");
  empty.report.write = has(map, "report.export.allow") || has(map, "report.manage.allow");

  empty.risk.read = has(map, "risk.view.allow");
  empty.risk.write = has(map, "risk.manage.allow");

  empty.resource.read = has(map, "resource.view.allow");
  empty.resource.write = has(map, "resource.manage.allow");

  empty.meeting.read = has(map, "meeting.view.allow");
  empty.meeting.create = has(map, "meeting.create.allow");
  empty.meeting.write = has(map, "meeting.manage.allow");

  empty.user.write = has(map, "user.manage.allow");
  empty.permission.write = has(map, "permission.manage.allow");

  return empty;
}

