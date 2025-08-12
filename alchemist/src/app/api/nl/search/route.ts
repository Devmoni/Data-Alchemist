import { NextRequest, NextResponse } from "next/server";
import { Task } from "@/types";

// Simple heuristic NL to filter converter for tasks only (no external AI call required)
// Supports comparisons on Duration and inclusion of phases in PreferredPhases.

export async function POST(req: NextRequest) {
  const { query, tasks } = (await req.json()) as { query: string; tasks: Task[] };
  const q = String(query || "").toLowerCase();

  let minDuration: number | null = null;
  let phaseIn: number | null = null;

  const durationMatch = q.match(/duration\s*(>|>=|=>|<|<=|=|==)\s*(\d+)/);
  const moreThanMatch = q.match(/duration\s*(more than|greater than|over)\s*(\d+)/);
  if (durationMatch) {
    const op = durationMatch[1];
    const val = Number(durationMatch[2]);
    minDuration = op.includes(">") ? val + (op === ">" ? 1 : 0) : null; // very naive
  } else if (moreThanMatch) {
    minDuration = Number(moreThanMatch[2]) + 1;
  }

  const phaseMatch = q.match(/phase\s*(\d+)/);
  if (phaseMatch) phaseIn = Number(phaseMatch[1]);

  let results = tasks;
  if (minDuration != null) results = results.filter((t) => Number(t.Duration) >= minDuration!);
  if (phaseIn != null) results = results.filter((t) => Array.isArray(t.PreferredPhases) && t.PreferredPhases.includes(phaseIn));

  return NextResponse.json({ results });
}




