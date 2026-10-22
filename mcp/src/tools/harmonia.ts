import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { checkConflict, composeWorkflow, executeSequence } from "../lib/harmonia/logic.ts";
const step = z.object({ id: z.string(), skill: z.string().optional(), tool: z.string().optional(), depends_on: z.union([z.string(), z.array(z.string()), z.null()]).optional() });
export const harmoniaTools: ToolModule = { name: "harmonia", register(server, ctx) { const workflows = ctx.store.collection("reasoning/harmonia/workflows");
  defineTool(server, ctx, "compose_workflow", "Compose and validate a workflow DAG of skill/tool steps.", { workflow_id: z.string().min(1), sequence_json: z.string() }, ({ workflow_id, sequence_json }) => { const sequence = z.array(step).parse(JSON.parse(sequence_json)); return composeWorkflow(workflow_id, sequence, workflows); });
  defineTool(server, ctx, "execute_sequence", "Simulate the data handoff through a saved workflow.", { workflow_id: z.string(), inputs_json: z.string().default("{}") }, ({ workflow_id, inputs_json }) => { const inputs = JSON.parse(inputs_json) as Record<string, unknown>; return executeSequence(workflow_id, inputs, workflows); });
  defineTool(server, ctx, "check_conflict", "Check saved workflow dependencies for missing handoffs.", { workflow_id: z.string() }, ({ workflow_id }) => checkConflict(workflow_id, workflows), { readOnly: true });
} };
