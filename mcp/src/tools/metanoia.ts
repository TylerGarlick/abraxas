import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { audit, evolve } from "../lib/metanoia/logic.ts";
export const metanoiaTools: ToolModule = { name: "metanoia", register(server, ctx) { const records = ctx.store.collection("reasoning/metanoia");
  defineTool(server, ctx, "metanoia_agon_audit", "Audit adversarial-testing parameters for possible blind spots.", {}, () => audit(records));
  defineTool(server, ctx, "metanoia_agon_evolve", "Propose a reviewed evolution of stress-test parameters.", { target: z.string() }, ({ target }) => evolve(target, records));
} };
