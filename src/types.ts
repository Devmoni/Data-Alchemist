export type PhaseNumber = number;

export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; // 1-5
  RequestedTaskIDs: string[]; // normalized to array
  GroupTag?: string;
  AttributesJSON?: Record<string, unknown> | null;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[]; // normalized tags
  AvailableSlots: PhaseNumber[]; // normalized
  MaxLoadPerPhase: number;
  WorkerGroup?: string;
  QualificationLevel?: string | number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category?: string;
  Duration: number; // >=1
  RequiredSkills: string[];
  PreferredPhases: PhaseNumber[]; // normalized explicit list
  MaxConcurrent: number; // >=1
}

export type EntityKind = "clients" | "workers" | "tasks";

export interface ValidationIssue {
  id: string; // unique id for the issue
  entity: EntityKind;
  rowId?: string; // e.g., ClientID/WorkerID/TaskID
  column?: string;
  level: "error" | "warning" | "info";
  message: string;
}

// Rule types
export type RuleType =
  | "coRun"
  | "slotRestriction"
  | "loadLimit"
  | "phaseWindow"
  | "patternMatch"
  | "precedenceOverride";

export interface BaseRule {
  id: string;
  type: RuleType;
  description?: string;
  priority?: number; // used for precedence ordering
}

export interface CoRunRule extends BaseRule {
  type: "coRun";
  tasks: string[]; // TaskIDs
}

export interface SlotRestrictionRule extends BaseRule {
  type: "slotRestriction";
  targetGroup: { kind: "client" | "worker"; tag: string };
  minCommonSlots: number;
}

export interface LoadLimitRule extends BaseRule {
  type: "loadLimit";
  workerGroup: string; // WorkerGroup tag
  maxSlotsPerPhase: number;
}

export interface PhaseWindowRule extends BaseRule {
  type: "phaseWindow";
  taskId: string;
  allowedPhases: PhaseNumber[];
}

export interface PatternMatchRule extends BaseRule {
  type: "patternMatch";
  regex: string;
  template: string;
  params?: Record<string, unknown>;
}

export interface PrecedenceOverrideRule extends BaseRule {
  type: "precedenceOverride";
  globalPriority?: number;
  specificPriorities?: Array<{ id: string; priority: number }>;
}

export type Rule =
  | CoRunRule
  | SlotRestrictionRule
  | LoadLimitRule
  | PhaseWindowRule
  | PatternMatchRule
  | PrecedenceOverrideRule;

export interface PrioritiesConfig {
  profile: "custom" | "maximizeFulfillment" | "fairDistribution" | "minimizeWorkload";
  weights: {
    clientPriorityWeight: number; // 0-1
    requestedTasksFulfillmentWeight: number; // 0-1
    fairnessWeight: number; // 0-1
    workloadBalanceWeight: number; // 0-1
    durationWeight: number; // 0-1
    skillMatchWeight: number; // 0-1
  };
  ranking?: string[]; // ordered criteria names
  pairwiseMatrix?: number[][]; // optional AHP matrix
}

export interface RulesBundle {
  rules: Rule[];
  priorities: PrioritiesConfig;
}

export interface ColumnMapResult<T> {
  mapped: T[];
  issues: ValidationIssue[];
  headerMap: Record<string, string>; // original header -> canonical
}




