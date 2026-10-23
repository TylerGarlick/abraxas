import type { Collection } from "../../storage/index.ts";
type Step = { id: string; skill?: string; tool?: string; depends_on?: string | string[] | null };
export async function composeWorkflow(id: string, sequence: Step[], workflows: Collection) {
  if (!sequence.length) throw new Error("sequence must contain at least one step");
  const ids = new Set<string>(); for (const step of sequence) { if (!step.id || ids.has(step.id)) throw new Error(`missing or duplicate step id: ${step.id}`); ids.add(step.id); }
  for (const step of sequence) for (const dep of Array.isArray(step.depends_on) ? step.depends_on : step.depends_on ? [step.depends_on] : []) if (!ids.has(dep)) throw new Error(`unknown dependency ${dep} for ${step.id}`);
  const cycle = (id: string, active = new Set<string>(), done = new Set<string>()): boolean => { if (active.has(id)) return true; if (done.has(id)) return false; active.add(id); const s = sequence.find(x => x.id === id)!; for (const d of Array.isArray(s.depends_on) ? s.depends_on : s.depends_on ? [s.depends_on] : []) if (cycle(d, active, done)) return true; active.delete(id); done.add(id); return false; };
  if (sequence.some(s => cycle(s.id))) throw new Error("workflow contains a dependency cycle");
  const doc = await workflows.upsert({ _id: id, sequence, version: "1.0", status: "ACTIVE" });
  return { success: true, action: "compose_workflow", workflow_id: id, steps_count: sequence.length, status: "ACTIVE", created_at: doc.createdAt };
}
export async function executeSequence(id: string, inputs: Record<string, unknown>, workflows: Collection) {
  const workflow = await workflows.get(id); if (!workflow) throw new Error(`Workflow ${id} not found`);
  const state = { ...inputs }; const trace = (workflow.sequence as Step[]).map((s) => { const output = `Result from ${s.skill ?? "unknown"}:${s.tool ?? "unknown"}`; state[`${s.skill}_${s.tool}_out`] = output; return { step_id: s.id, skill: s.skill, tool: s.tool, output, timestamp: new Date().toISOString() }; });
  return { success: true, action: "execute_sequence", workflow_id: id, final_state: state, trace };
}
export async function checkConflict(id: string, workflows: Collection) { const w = await workflows.get(id); if (!w) throw new Error(`Workflow ${id} not found`); const seq = w.sequence as Step[]; const produced = new Set<string>(); const conflicts = []; for (const s of seq) { for (const d of Array.isArray(s.depends_on) ? s.depends_on : s.depends_on ? [s.depends_on] : []) if (!produced.has(d) && !seq.some(x => x.id === d)) conflicts.push({ step_id: s.id, missing_dependency: d, severity: "CRITICAL" }); produced.add(s.id); } return { success: true, workflow_id: id, conflicts, conflict_count: conflicts.length }; }
