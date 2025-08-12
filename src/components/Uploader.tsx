"use client";
import React, { useCallback, useState } from "react";
import { mapAndNormalizeClients, mapAndNormalizeWorkers, mapAndNormalizeTasks, parseCSV, parseXLSX } from "@/utils/parsers";
import { useDataStore } from "@/store/useDataStore";
import { ValidationIssue } from "@/types";

type Entity = "clients" | "workers" | "tasks";

interface UploadResult {
  issues: ValidationIssue[];
  headers: Record<string, string>;
}

export default function Uploader() {
  const setClients = useDataStore((s) => s.setClients);
  const setWorkers = useDataStore((s) => s.setWorkers);
  const setTasks = useDataStore((s) => s.setTasks);
  const revalidate = useDataStore((s) => s.revalidate);
  const [lastResult, setLastResult] = useState<Record<Entity, UploadResult | null>>({ clients: null, workers: null, tasks: null });

  const onSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, entity: Entity) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    const isXLSX = file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls");
    const parsed = isCSV ? await parseCSV(file) : isXLSX ? await parseXLSX(file) : null;
    if (!parsed) return;
    let issues: ValidationIssue[] = [];
    let headerMap: Record<string, string> = {};
    if (entity === "clients") {
      const { mapped, issues: i, headerMap: h } = mapAndNormalizeClients(parsed.rows, parsed.headers);
      setClients(mapped);
      issues = i; headerMap = h;
    } else if (entity === "workers") {
      const { mapped, issues: i, headerMap: h } = mapAndNormalizeWorkers(parsed.rows, parsed.headers);
      setWorkers(mapped);
      issues = i; headerMap = h;
    } else if (entity === "tasks") {
      const { mapped, issues: i, headerMap: h } = mapAndNormalizeTasks(parsed.rows, parsed.headers);
      setTasks(mapped);
      issues = i; headerMap = h;
    }
    setLastResult((s) => ({ ...s, [entity]: { issues, headers: headerMap } }));
    setTimeout(() => revalidate(), 100);
    e.target.value = "";
  }, [setClients, setWorkers, setTasks, revalidate]);

  const RenderHints = ({ entity }: { entity: Entity }) => {
    const res = lastResult[entity];
    if (!res) return null;
    return (
      <div className="text-xs text-white/70 mt-3 space-y-1">
        <div className="font-medium text-white/80">Header mapping</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(res.headers).map(([orig, canon]) => (
            <div key={orig} className="flex justify-between"><span className="text-white/50 truncate">{orig}</span><span className="text-white/80 ml-2">→ {canon}</span></div>
          ))}
        </div>
        {res.issues.length > 0 && (
          <div className="mt-2 text-red-400">{res.issues.length} ingestion issue(s) detected.</div>
        )}
      </div>
    );
  };

  const UploadBox = ({ entity, title }: { entity: Entity; title: string }) => (
    <div className="p-4 rounded-lg bg-neutral-800 ring-1 ring-white/10">
      <label className="font-semibold block mb-2 text-white/90">{title}</label>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onSelect(e, entity)} className="mt-1 w-full cursor-pointer text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
      <RenderHints entity={entity} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UploadBox entity="clients" title="Clients" />
        <UploadBox entity="workers" title="Workers" />
        <UploadBox entity="tasks" title="Tasks" />
      </div>
    </div>
  );
}




