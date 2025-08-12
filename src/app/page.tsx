"use client";
import Uploader from "@/components/Uploader";
import DataGrid from "@/components/DataGrid";
import ValidationPanel from "@/components/ValidationPanel";
import RulesBuilder from "@/components/RulesBuilder";
import PrioritiesPanel from "@/components/PrioritiesPanel";
import ExportPanel from "@/components/ExportPanel";
import NLSearch from "@/components/NLSearch";
import NLRuleInput from "@/components/NLRuleInput";
import { useDataStore } from "@/store/useDataStore";
import { ColDef } from "ag-grid-community";

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="bg-neutral-900 rounded-xl ring-1 ring-white/10 shadow-lg p-4">
      {title && <h2 className="text-lg font-semibold mb-3 text-white/90">{title}</h2>}
      {children}
    </section>
  );
}

export default function Home() {
  const clients = useDataStore((s) => s.clients);
  const workers = useDataStore((s) => s.workers);
  const tasks = useDataStore((s) => s.tasks);
  const upsertClient = useDataStore((s) => s.upsertClient);
  const upsertWorker = useDataStore((s) => s.upsertWorker);
  const upsertTask = useDataStore((s) => s.upsertTask);

  const clientCols: ColDef[] = [
    { field: "ClientID" },
    { field: "ClientName" },
    { field: "PriorityLevel", cellDataType: "number" },
    { field: "RequestedTaskIDs", valueFormatter: (p) => Array.isArray(p.value) ? p.value.join(",") : p.value },
    { field: "GroupTag" },
  ];
  const workerCols: ColDef[] = [
    { field: "WorkerID" },
    { field: "WorkerName" },
    { field: "Skills", valueFormatter: (p) => Array.isArray(p.value) ? p.value.join(",") : p.value },
    { field: "AvailableSlots", valueFormatter: (p) => Array.isArray(p.value) ? p.value.join(",") : p.value },
    { field: "MaxLoadPerPhase", cellDataType: "number" },
    { field: "WorkerGroup" },
  ];
  const taskCols: ColDef[] = [
    { field: "TaskID" },
    { field: "TaskName" },
    { field: "Category" },
    { field: "Duration", cellDataType: "number" },
    { field: "RequiredSkills", valueFormatter: (p) => Array.isArray(p.value) ? p.value.join(",") : p.value },
    { field: "PreferredPhases", valueFormatter: (p) => Array.isArray(p.value) ? p.value.join(",") : p.value },
    { field: "MaxConcurrent", cellDataType: "number" },
  ];

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Data Alchemist</h1>
        <p className="text-white/60">Upload, validate, rule-build, prioritize, and export</p>
      </div>

      <SectionCard>
        <Uploader />
      </SectionCard>

      <SectionCard>
        <ValidationPanel />
      </SectionCard>

      <div className="grid grid-cols-1 gap-6">
        <SectionCard title="Clients">
          <DataGrid rows={clients} setRow={upsertClient} columnDefs={clientCols} height={420} />
        </SectionCard>
        <SectionCard title="Workers">
          <DataGrid rows={workers} setRow={upsertWorker} columnDefs={workerCols} height={420} />
        </SectionCard>
        <SectionCard title="Tasks">
          <DataGrid rows={tasks} setRow={upsertTask} columnDefs={taskCols} height={420} />
        </SectionCard>
      </div>

      <SectionCard>
        <RulesBuilder />
      </SectionCard>

      <SectionCard>
        <NLRuleInput />
      </SectionCard>

      <SectionCard>
        <NLSearch />
      </SectionCard>

      <SectionCard>
        <PrioritiesPanel />
      </SectionCard>

      <SectionCard>
        <ExportPanel />
      </SectionCard>
    </main>
  );
}
