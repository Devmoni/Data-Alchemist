"use client";
import React from "react";
import { useDataStore } from "@/store/useDataStore";
import { Rule } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function RulesBuilder() {
  const rules = useDataStore((s) => s.rules);
  const addRule = useDataStore((s) => s.addRule);
  const removeRule = useDataStore((s) => s.removeRule);
  const reorderRules = useDataStore((s) => s.reorderRules);
  const tasks = useDataStore((s) => s.tasks);
  const workers = useDataStore((s) => s.workers);

  const addCoRun = () => {
    const firstTwoTasks = tasks.slice(0, 2).map((t) => t.TaskID);
    const rule: Rule = { id: uuidv4(), type: "coRun", tasks: firstTwoTasks, description: "Sample co-run" } as Rule;
    addRule(rule);
  };

  const addLoadLimit = () => {
    const group = workers.find((w) => !!w.WorkerGroup)?.WorkerGroup || "default";
    addRule({ id: uuidv4(), type: "loadLimit", workerGroup: group!, maxSlotsPerPhase: 2, description: `Limit ${group} to 2/phase` });
  };

  const addPhaseWindow = () => {
    const t = tasks[0];
    if (!t) return;
    addRule({ id: uuidv4(), type: "phaseWindow", taskId: t.TaskID, allowedPhases: t.PreferredPhases, description: `Phase window for ${t.TaskID}` });
  };

  const moveUp = (idx: number) => {
    const ids = rules.map((r) => r.id);
    if (idx <= 0) return;
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorderRules(ids);
  };
  const moveDown = (idx: number) => {
    const ids = rules.map((r) => r.id);
    if (idx >= ids.length - 1) return;
    [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
    reorderRules(ids);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white/90">Rules</div>
        <div className="flex gap-2">
          <button onClick={addCoRun} className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">+ Co-run</button>
          <button onClick={addLoadLimit} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600">+ Load-limit</button>
          <button onClick={addPhaseWindow} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600">+ Phase-window</button>
        </div>
      </div>
      <ul className="space-y-2">
        {rules.map((r, idx) => (
          <li key={r.id} className="p-3 border border-white/10 rounded-md bg-neutral-900 flex items-center justify-between">
            <div className="text-sm text-white/80">
              <div className="font-medium text-white">{r.type}</div>
              <div className="text-white/70">{r.description || JSON.stringify(r)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => moveUp(idx)} className="px-2 py-1 border border-white/20 text-white rounded hover:bg-neutral-800">↑</button>
              <button onClick={() => moveDown(idx)} className="px-2 py-1 border border-white/20 text-white rounded hover:bg-neutral-800">↓</button>
              <button onClick={() => removeRule(r.id)} className="px-2 py-1 border rounded bg-red-600 text-white hover:bg-red-500">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}




