"use client";
import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useDataStore } from "@/store/useDataStore";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props<T> {
  rows: T[];
  setRow: (index: number, partial: Partial<T>) => void;
  columnDefs: ColDef[];
  height?: number;
}

export default function DataGrid<T>({ rows, setRow, columnDefs, height = 400 }: Props<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const revalidate = useDataStore((s) => s.revalidate);
  const defaultColDef = useMemo<ColDef>(() => ({ editable: true, sortable: true, filter: true, resizable: true, floatingFilter: true, cellDataType: true }), []);

  return (
    <div className="ag-theme-quartz dark-grid rounded-md" style={{ height }}>
      <AgGridReact<T>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme="legacy"
        animateRows
        onCellValueChanged={(e) => {
          setRow(e.rowIndex ?? 0, { [e.colDef.field as string]: e.newValue } as Partial<T>);
          // Trigger validation after edit
          setTimeout(() => revalidate(), 100);
        }}
      />
      <style jsx global>{`
        /* Scoped dark palette for AG Grid inside this component only */
        .dark-grid {
          --ag-foreground-color: #e5e7eb;
          --ag-background-color: #111827;
          --ag-header-foreground-color: #e5e7eb;
          --ag-header-background-color: #1f2937;
          --ag-odd-row-background-color: #0f172a;
          --ag-even-row-background-color: #111827;
          --ag-borders: #374151;
          --ag-secondary-border-color: #374151;
          --ag-input-border-color: #374151;
          --ag-control-panel-background-color: #111827;
        }
        .dark-grid .ag-input-field-input,
        .dark-grid .ag-header-cell-text,
        .dark-grid .ag-icon {
          color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
}




