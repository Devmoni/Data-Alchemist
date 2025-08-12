import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Rule } from "@/types";

// Minimal NL to rules converter: supports "co-run T1 T2" or "phase window T3 phases 1-3"

export async function POST(req: NextRequest) {
  const { input } = (await req.json()) as { input: string };
  const text = String(input || "").toLowerCase();
  const rules: Rule[] = [];

  const corun = text.match(/co[- ]?run\s+([a-z0-9_-]+)\s+([a-z0-9_-]+)/i);
  if (corun) {
    rules.push({ id: uuidv4(), type: "coRun", tasks: [corun[1].toUpperCase(), corun[2].toUpperCase()], description: "NL: co-run" } as Rule);
  }

  const phaseWindow = text.match(/phase\s*window\s+([a-z0-9_-]+).*?(\d+)\s*-\s*(\d+)/i);
  if (phaseWindow) {
    const start = Number(phaseWindow[2]);
    const end = Number(phaseWindow[3]);
    const arr = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    rules.push({ id: uuidv4(), type: "phaseWindow", taskId: phaseWindow[1].toUpperCase(), allowedPhases: arr, description: "NL: phase window" } as Rule);
  }

  return NextResponse.json({ rules });
}




