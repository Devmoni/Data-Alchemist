import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Client, Worker, Task, ValidationIssue, ColumnMapResult } from "@/types";

type HeaderAlias = Record<string, string[]>;

// Canonical headers and their common aliases to support AI-like forgiving mapping
const CLIENT_HEADER_ALIASES: HeaderAlias = {
  ClientID: ["clientid", "client_id", "id"],
  ClientName: ["clientname", "client_name", "name"],
  PriorityLevel: ["priority", "priority_level"],
  RequestedTaskIDs: ["requestedtasks", "requested_task_ids", "taskids", "tasks"],
  GroupTag: ["group", "group_tag", "clientgroup"],
  AttributesJSON: ["attributes", "meta", "attributes_json", "metadata"],
};

const WORKER_HEADER_ALIASES: HeaderAlias = {
  WorkerID: ["workerid", "worker_id", "id"],
  WorkerName: ["workername", "worker_name", "name"],
  Skills: ["skill", "tags"],
  AvailableSlots: ["availableslots", "slots", "availability"],
  MaxLoadPerPhase: ["maxloadperphase", "max_load", "max_load_per_phase"],
  WorkerGroup: ["group", "group_tag", "workergroup"],
  QualificationLevel: ["qualification", "qualification_level", "level"],
};

const TASK_HEADER_ALIASES: HeaderAlias = {
  TaskID: ["taskid", "task_id", "id"],
  TaskName: ["taskname", "task_name", "name"],
  Category: ["category", "type"],
  Duration: ["duration", "phases"],
  RequiredSkills: ["requiredskills", "skills", "req_skills"],
  PreferredPhases: ["preferredphases", "phases_pref", "preferred"],
  MaxConcurrent: ["maxconcurrent", "concurrency", "max_parallel"],
};

function buildHeaderMap(headers: string[], aliases: HeaderAlias): Record<string, string> {
  const map: Record<string, string> = {};
  headers.forEach((raw) => {
    const key = raw.trim();
    const lower = key.toLowerCase();
    const match = Object.entries(aliases).find(([canonical, list]) =>
      [canonical.toLowerCase(), ...list.map((a) => a.toLowerCase())].includes(lower)
    );
    if (match) {
      map[key] = match[0];
    } else {
      map[key] = key; // keep unknowns as-is
    }
  });
  return map;
}

function mapRow(row: Record<string, unknown>, headerMap: Record<string, string>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  Object.entries(row).forEach(([k, v]) => {
    const canonical = headerMap[k] ?? k;
    mapped[canonical] = v;
  });
  return mapped;
}

function parseJSONSafe(value: unknown): Record<string, unknown> | null {
  if (value == null || value === "") return null;
  try {
    if (typeof value === "object") return value as Record<string, unknown>;
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (value == null) return [];
  const text = String(value).trim();
  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // fallthrough to CSV split
    }
  }
  return text
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeClient(row: Record<string, unknown>): Client {
  return {
    ClientID: String(row.ClientID ?? "").trim(),
    ClientName: String(row.ClientName ?? "").trim(),
    PriorityLevel: parseNumber(row.PriorityLevel) ?? 0,
    RequestedTaskIDs: parseList(row.RequestedTaskIDs),
    GroupTag: row.GroupTag ? String(row.GroupTag).trim() : undefined,
    AttributesJSON: parseJSONSafe(row.AttributesJSON),
  };
}

export function normalizeWorker(row: Record<string, unknown>): Worker {
  const slotsRaw = row.AvailableSlots;
  let slots: number[] = [];
  if (Array.isArray(slotsRaw)) {
    slots = (slotsRaw as unknown[]).map((v) => Number(v)).filter((n) => Number.isFinite(n));
  } else if (typeof slotsRaw === "string") {
    try {
      const maybeArr = JSON.parse(slotsRaw);
      if (Array.isArray(maybeArr)) {
        slots = maybeArr.map((v) => Number(v)).filter((n) => Number.isFinite(n));
      }
    } catch {
      slots = slotsRaw
        .split(/[,;|]/)
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
    }
  }
  return {
    WorkerID: String(row.WorkerID ?? "").trim(),
    WorkerName: String(row.WorkerName ?? "").trim(),
    Skills: parseList(row.Skills),
    AvailableSlots: slots,
    MaxLoadPerPhase: parseNumber(row.MaxLoadPerPhase) ?? 0,
    WorkerGroup: row.WorkerGroup ? String(row.WorkerGroup).trim() : undefined,
    QualificationLevel: row.QualificationLevel as string | number | undefined,
  };
}

function expandPhaseRange(text: string): number[] {
  const match = text.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function parsePhases(value: unknown): number[] {
  if (Array.isArray(value)) return (value as unknown[]).map((v) => Number(v)).filter(Number.isFinite);
  if (value == null) return [];
  const text = String(value).trim();
  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr.map((v) => Number(v)).filter(Number.isFinite);
    } catch {
      // fallthrough
    }
  }
  const range = expandPhaseRange(text);
  if (range.length) return range;
  return text
    .split(/[,;|]/)
    .map((s) => Number(s.trim()))
    .filter(Number.isFinite);
}

export function normalizeTask(row: Record<string, unknown>): Task {
  return {
    TaskID: String(row.TaskID ?? "").trim(),
    TaskName: String(row.TaskName ?? "").trim(),
    Category: row.Category ? String(row.Category).trim() : undefined,
    Duration: parseNumber(row.Duration) ?? 0,
    RequiredSkills: parseList(row.RequiredSkills),
    PreferredPhases: parsePhases(row.PreferredPhases),
    MaxConcurrent: parseNumber(row.MaxConcurrent) ?? 0,
  };
}

export function parseCSV(file: File): Promise<{ rows: Record<string, unknown>[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as Record<string, unknown>[];
        const headers = (result.meta.fields || []) as string[];
        resolve({ rows: data, headers });
      },
      error: (err) => reject(err),
    });
  });
}

export function parseXLSX(file: File): Promise<{ rows: Record<string, unknown>[]; headers: string[] }> {
  return file.arrayBuffer().then((buf) => {
    const workbook = XLSX.read(buf, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
    return { rows: json, headers };
  });
}

export function mapAndNormalizeClients(rows: Record<string, unknown>[], headers: string[]): ColumnMapResult<Client> {
  const headerMap = buildHeaderMap(headers, CLIENT_HEADER_ALIASES);
  const mapped: Client[] = [];
  const issues: ValidationIssue[] = [];
  rows.forEach((row, idx) => {
    const canonical = mapRow(row, headerMap);
    const c = normalizeClient(canonical);
    if (!c.ClientID) {
      issues.push({ id: `clients:${idx}:ClientID`, entity: "clients", level: "error", message: "Missing ClientID", column: "ClientID" });
    }
    mapped.push(c);
  });
  return { mapped, issues, headerMap };
}

export function mapAndNormalizeWorkers(rows: Record<string, unknown>[], headers: string[]): ColumnMapResult<Worker> {
  const headerMap = buildHeaderMap(headers, WORKER_HEADER_ALIASES);
  const mapped: Worker[] = [];
  const issues: ValidationIssue[] = [];
  rows.forEach((row, idx) => {
    const canonical = mapRow(row, headerMap);
    const w = normalizeWorker(canonical);
    if (!w.WorkerID) {
      issues.push({ id: `workers:${idx}:WorkerID`, entity: "workers", level: "error", message: "Missing WorkerID", column: "WorkerID" });
    }
    mapped.push(w);
  });
  return { mapped, issues, headerMap };
}

export function mapAndNormalizeTasks(rows: Record<string, unknown>[], headers: string[]): ColumnMapResult<Task> {
  const headerMap = buildHeaderMap(headers, TASK_HEADER_ALIASES);
  const mapped: Task[] = [];
  const issues: ValidationIssue[] = [];
  rows.forEach((row, idx) => {
    const canonical = mapRow(row, headerMap);
    const t = normalizeTask(canonical);
    if (!t.TaskID) {
      issues.push({ id: `tasks:${idx}:TaskID`, entity: "tasks", level: "error", message: "Missing TaskID", column: "TaskID" });
    }
    mapped.push(t);
  });
  return { mapped, issues, headerMap };
}




