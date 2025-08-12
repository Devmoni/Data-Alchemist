"use client";
import React from "react";
import { useDataStore } from "@/store/useDataStore";
import { Parser as Json2Csv } from "json2csv";

function download(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel() {
  const { exportBundle } = useDataStore();

  const onExport = () => {
    const { clients, workers, tasks, rulesBundle } = exportBundle();
    const csv = new Json2Csv({}).parse(clients);
    download("clients.cleaned.csv", csv, "text/csv");
    download("workers.cleaned.csv", new Json2Csv({}).parse(workers), "text/csv");
    download("tasks.cleaned.csv", new Json2Csv({}).parse(tasks), "text/csv");
    download("rules.json", JSON.stringify(rulesBundle, null, 2), "application/json");
  };

  return (
    <div className="p-4 border rounded-lg flex items-center justify-between">
      <div>
        <div className="font-semibold">Export</div>
        <div className="text-sm text-gray-600">Download cleaned CSVs and rules.json</div>
      </div>
      <button onClick={onExport} className="px-4 py-2 bg-emerald-600 text-white rounded">Export</button>
    </div>
  );
}




