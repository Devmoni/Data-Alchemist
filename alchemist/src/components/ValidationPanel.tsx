"use client";
import React from "react";
import { useDataStore } from "@/store/useDataStore";

export default function ValidationPanel() {
  const validation = useDataStore((s) => s.validation);
  const revalidate = useDataStore((s) => s.revalidate);

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-900">Validation Summary</div>
        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" onClick={revalidate}>Run Validation</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-700 px-3 py-1 border border-red-200">Errors <strong>{validation.counts.error}</strong></span>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1 border border-amber-200">Warnings <strong>{validation.counts.warning}</strong></span>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800 px-3 py-1 border border-gray-200">Info <strong>{validation.counts.info}</strong></span>
      </div>
      <div className="mt-3 max-h-64 overflow-auto">
        {validation.issues.length === 0 ? (
          <div className="text-sm text-gray-500">No issues</div>
        ) : (
          <ul className="text-sm space-y-2">
            {validation.issues.map((i) => (
              <li key={i.id} className="flex flex-wrap gap-2 bg-gray-50 rounded p-2 border">
                <span className={i.level === "error" ? "text-red-600" : i.level === "warning" ? "text-amber-600" : "text-gray-600"}>{i.level.toUpperCase()}</span>
                <span className="text-gray-800">[{i.entity}{i.rowId ? ":" + i.rowId : ""}{i.column ? "/" + i.column : ""}]</span>
                <span className="text-gray-700">{i.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




