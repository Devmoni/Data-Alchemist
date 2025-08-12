"use client";
import React, { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { Rule } from "@/types";

export default function NLRuleInput() {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<Rule[] | null>(null);
  const [loading, setLoading] = useState(false);
  const addRule = useDataStore((s) => s.addRule);

  const analyze = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch("/api/nl/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setPreview(data.rules as Rule[]);
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!input) return;
    const res = await fetch("/api/nl/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    (data.rules as Rule[]).forEach((r) => addRule(r));
    setInput("");
    setPreview(null);
  };

  return (
    <div className="p-4 rounded-lg ring-1 ring-white/10 bg-neutral-900 space-y-2">
      <div className="font-semibold text-white/90">Natural language to rules</div>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., co-run T12 T14 or phase window T3 phases 1-3" className="w-full bg-neutral-800 text-white/90 placeholder-white/40 border border-white/10 rounded px-3 py-2" />
      <div className="flex gap-2">
        <button disabled={!input || loading} onClick={analyze} className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50 disabled:bg-slate-800 disabled:text-white/30 hover:bg-slate-600">{loading ? "Analyzing..." : "Preview"}</button>
        <button disabled={!input} onClick={apply} className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">Add rule</button>
      </div>
      {preview && preview.length > 0 && (
        <div className="text-sm">
          <div className="font-medium text-white/80">Preview:</div>
          <pre className="bg-neutral-800 text-white/80 p-2 rounded overflow-auto max-h-40">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}




