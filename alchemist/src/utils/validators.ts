import { Client, Worker, Task, ValidationIssue } from "@/types";

export interface ValidationSummary {
  issues: ValidationIssue[];
  counts: { error: number; warning: number; info: number };
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function validateCore(clients: Client[], workers: Worker[], tasks: Task[]): ValidationSummary {
  const issues: ValidationIssue[] = [];

  // Helper maps
  const clientIdSet = new Set<string>();
  const workerIdSet = new Set<string>();
  const taskIdSet = new Set<string>();
  const workerSkills = new Set<string>();

  // Missing required columns handled during normalization minimally

  // Duplicate IDs
  clients.forEach((c, idx) => {
    if (clientIdSet.has(c.ClientID)) {
      issues.push({ id: `dup-client:${c.ClientID}:${idx}` , entity: "clients", rowId: c.ClientID, level: "error", message: "Duplicate ClientID" });
    }
    clientIdSet.add(c.ClientID);
  });

  workers.forEach((w, idx) => {
    if (workerIdSet.has(w.WorkerID)) {
      issues.push({ id: `dup-worker:${w.WorkerID}:${idx}` , entity: "workers", rowId: w.WorkerID, level: "error", message: "Duplicate WorkerID" });
    }
    workerIdSet.add(w.WorkerID);
    w.Skills.forEach((s) => workerSkills.add(s.toLowerCase()));
  });

  tasks.forEach((t, idx) => {
    if (taskIdSet.has(t.TaskID)) {
      issues.push({ id: `dup-task:${t.TaskID}:${idx}` , entity: "tasks", rowId: t.TaskID, level: "error", message: "Duplicate TaskID" });
    }
    taskIdSet.add(t.TaskID);
  });

  // Out-of-range values, malformed lists, JSON etc.
  clients.forEach((c) => {
    if (c.PriorityLevel < 1 || c.PriorityLevel > 5) {
      issues.push({ id: `client-priority:${c.ClientID}`, entity: "clients", rowId: c.ClientID, column: "PriorityLevel", level: "error", message: "PriorityLevel must be between 1 and 5" });
    }
    if (c.AttributesJSON === null && c.AttributesJSON !== undefined) {
      issues.push({ id: `client-attr:${c.ClientID}`, entity: "clients", rowId: c.ClientID, column: "AttributesJSON", level: "error", message: "AttributesJSON contains invalid JSON" });
    }
  });

  workers.forEach((w) => {
    const nonNumericSlots = w.AvailableSlots.filter((v) => !Number.isFinite(v));
    if (nonNumericSlots.length > 0) {
      issues.push({ id: `worker-slots:${w.WorkerID}`, entity: "workers", rowId: w.WorkerID, column: "AvailableSlots", level: "error", message: "AvailableSlots contains non-numeric entries" });
    }
    if (w.MaxLoadPerPhase < 0) {
      issues.push({ id: `worker-maxload:${w.WorkerID}`, entity: "workers", rowId: w.WorkerID, column: "MaxLoadPerPhase", level: "error", message: "MaxLoadPerPhase must be >= 0" });
    }
  });

  tasks.forEach((t) => {
    if (t.Duration < 1) {
      issues.push({ id: `task-duration:${t.TaskID}`, entity: "tasks", rowId: t.TaskID, column: "Duration", level: "error", message: "Duration must be >= 1" });
    }
    if (t.MaxConcurrent < 1) {
      issues.push({ id: `task-concurrent:${t.TaskID}`, entity: "tasks", rowId: t.TaskID, column: "MaxConcurrent", level: "error", message: "MaxConcurrent must be >= 1" });
    }
  });

  // Unknown references: Clients.RequestedTaskIDs must exist in tasks
  clients.forEach((c) => {
    const unknown = c.RequestedTaskIDs.filter((id) => !taskIdSet.has(id));
    if (unknown.length) {
      issues.push({ id: `client-unknown-tasks:${c.ClientID}`, entity: "clients", rowId: c.ClientID, column: "RequestedTaskIDs", level: "error", message: `Unknown RequestedTaskIDs: ${unknown.join(", ")}` });
    }
  });

  // Skill coverage matrix: each RequiredSkill must map to >=1 worker
  const missingSkills = uniq(
    tasks.flatMap((t) => t.RequiredSkills.map((s) => s.toLowerCase()))
  ).filter((s) => !workerSkills.has(s));
  if (missingSkills.length) {
    issues.push({ id: `skill-coverage`, entity: "tasks", level: "error", message: `No workers possess required skills: ${missingSkills.join(", ")}` });
  }

  // Additional feasibility checks can be expanded later

  const counts = {
    error: issues.filter((i) => i.level === "error").length,
    warning: issues.filter((i) => i.level === "warning").length,
    info: issues.filter((i) => i.level === "info").length,
  };
  return { issues, counts };
}




