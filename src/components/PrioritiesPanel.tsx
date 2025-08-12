"use client";
import React from "react";
import { useDataStore } from "@/store/useDataStore";

const presets = {
  maximizeFulfillment: {
    clientPriorityWeight: 0.4,
    requestedTasksFulfillmentWeight: 0.4,
    fairnessWeight: 0.1,
    workloadBalanceWeight: 0.05,
    durationWeight: 0.025,
    skillMatchWeight: 0.025,
  },
  fairDistribution: {
    clientPriorityWeight: 0.2,
    requestedTasksFulfillmentWeight: 0.25,
    fairnessWeight: 0.3,
    workloadBalanceWeight: 0.15,
    durationWeight: 0.05,
    skillMatchWeight: 0.05,
  },
  minimizeWorkload: {
    clientPriorityWeight: 0.2,
    requestedTasksFulfillmentWeight: 0.25,
    fairnessWeight: 0.15,
    workloadBalanceWeight: 0.3,
    durationWeight: 0.05,
    skillMatchWeight: 0.05,
  },
};

export default function PrioritiesPanel() {
  const priorities = useDataStore((s) => s.priorities);
  const setPriorities = useDataStore((s) => s.setPriorities);

  const updateWeight = (key: keyof typeof priorities.weights, value: number) => {
    const v = Math.max(0, Math.min(1, value));
    setPriorities({ ...priorities, weights: { ...priorities.weights, [key]: v } });
  };

  const applyPreset = (name: keyof typeof presets) => {
    setPriorities({ ...priorities, profile: name, weights: { ...presets[name] } as any });
  };

  const equalize = () => {
    const keys = Object.keys(priorities.weights) as (keyof typeof priorities.weights)[];
    const each = 1 / keys.length;
    const next: typeof priorities.weights = { ...priorities.weights };
    keys.forEach((k) => (next[k] = Number(each.toFixed(2))));
    setPriorities({ ...priorities, profile: "custom", weights: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-semibold text-white/90 mr-2">Prioritization & Weights</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyPreset("maximizeFulfillment")} className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Maximize Fulfillment</button>
          <button onClick={() => applyPreset("fairDistribution")} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600">Fair Distribution</button>
          <button onClick={() => applyPreset("minimizeWorkload")} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600">Minimize Workload</button>
          <button onClick={equalize} className="px-3 py-1 rounded-md bg-neutral-800 text-white/90 ring-1 ring-white/10 hover:bg-neutral-700">Equalize</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(priorities.weights).map(([k, v]) => (
          <div key={k} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="text-white/80 capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</label>
              <div className="flex items-center gap-2">
                <span className="inline-flex min-w-[3rem] justify-end text-white/60 font-mono">{v.toFixed(2)}</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={v}
                  onChange={(e) => updateWeight(k as keyof typeof priorities.weights, Number(e.target.value))}
                  className="w-20 bg-neutral-800 text-white/90 border border-white/10 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={v}
              onChange={(e) => updateWeight(k as keyof typeof priorities.weights, Number(e.target.value))}
              className="w-full accent-indigo-500 slider-modern"
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-white/50">Tip: Adjust sliders or type values; export will include these weights.</div>
    </div>
  );
}




