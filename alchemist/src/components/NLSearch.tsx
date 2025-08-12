"use client";
import React, { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { Task } from "@/types";

export default function NLSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(false);
  const tasks = useDataStore((s) => s.tasks);

  const runSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/nl/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, tasks }),
      });
      const data = await res.json();
      setResults(data.results as Task[]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="font-semibold">Natural Language Search</div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., tasks with duration > 1 and phase 2 preferred" className="w-full border rounded px-3 py-2" />
      <button disabled={!query || loading} onClick={runSearch} className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50">{loading ? "Searching..." : "Search"}</button>
      <div className="text-sm text-gray-600">Results: {results ? results.length : 0}</div>
      {results && (
        <div className="max-h-48 overflow-auto text-sm">
          <ul className="list-disc pl-5">
            {results.map((t: Task) => (
              <li key={t.TaskID}>{t.TaskID} - {t.TaskName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}




