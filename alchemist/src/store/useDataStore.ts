import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Client, Worker, Task, RulesBundle, Rule, PrioritiesConfig } from "@/types";
import { validateCore, ValidationSummary } from "@/utils/validators";

export interface DataState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validation: ValidationSummary;
  rules: Rule[];
  priorities: PrioritiesConfig;
  setClients: (rows: Client[]) => void;
  setWorkers: (rows: Worker[]) => void;
  setTasks: (rows: Task[]) => void;
  upsertClient: (index: number, row: Partial<Client>) => void;
  upsertWorker: (index: number, row: Partial<Worker>) => void;
  upsertTask: (index: number, row: Partial<Task>) => void;
  revalidate: () => void;
  addRule: (rule: Rule) => void;
  removeRule: (ruleId: string) => void;
  reorderRules: (orderedIds: string[]) => void;
  setPriorities: (p: PrioritiesConfig) => void;
  exportBundle: () => { clients: Client[]; workers: Worker[]; tasks: Task[]; rulesBundle: RulesBundle };
}

const defaultPriorities: PrioritiesConfig = {
  profile: "custom",
  weights: {
    clientPriorityWeight: 0.3,
    requestedTasksFulfillmentWeight: 0.3,
    fairnessWeight: 0.2,
    workloadBalanceWeight: 0.1,
    durationWeight: 0.05,
    skillMatchWeight: 0.05,
  },
};

export const useDataStore = create<DataState>()(
  immer((set, get) => ({
    clients: [],
    workers: [],
    tasks: [],
    validation: { issues: [], counts: { error: 0, warning: 0, info: 0 } },
    rules: [],
    priorities: defaultPriorities,
    setClients: (rows) => {
      set((s) => {
        s.clients = rows;
      });
    },
    setWorkers: (rows) => {
      set((s) => {
        s.workers = rows;
      });
    },
    setTasks: (rows) => {
      set((s) => {
        s.tasks = rows;
      });
    },
    upsertClient: (index, row) => {
      set((s) => {
        if (!s.clients[index]) return;
        s.clients[index] = { ...s.clients[index], ...row } as Client;
      });
    },
    upsertWorker: (index, row) => {
      set((s) => {
        if (!s.workers[index]) return;
        s.workers[index] = { ...s.workers[index], ...row } as Worker;
      });
    },
    upsertTask: (index, row) => {
      set((s) => {
        if (!s.tasks[index]) return;
        s.tasks[index] = { ...s.tasks[index], ...row } as Task;
      });
    },
    revalidate: () => {
      const { clients, workers, tasks } = get();
      const summary = validateCore(clients, workers, tasks);
      set((s) => {
        s.validation = summary;
      });
    },
    addRule: (rule) => set((s) => {
      s.rules.push(rule);
    }),
    removeRule: (ruleId) => set((s) => {
      s.rules = s.rules.filter((r) => r.id !== ruleId);
    }),
    reorderRules: (orderedIds) => set((s) => {
      const map = new Map(s.rules.map((r) => [r.id, r] as const));
      s.rules = orderedIds.map((id, idx) => ({ ...map.get(id)!, priority: idx + 1 }));
    }),
    setPriorities: (p) => set((s) => {
      s.priorities = p;
    }),
    exportBundle: () => {
      const { clients, workers, tasks, rules, priorities } = get();
      const bundle = { rules, priorities };
      return { clients, workers, tasks, rulesBundle: bundle };
    },
  }))
);




