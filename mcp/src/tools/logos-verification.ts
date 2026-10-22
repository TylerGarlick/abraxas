import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { verificationHistory, verifyAtoms } from "../lib/logos-verification/logic.ts";
export const logosVerificationTools: ToolModule = { name: "logos-verification", register(server, ctx) {
  const history = ctx.store.collection("reasoning/logos-verification");
  defineTool(server, ctx, "logos_verify_atoms", "Classify atoms and record verification state without claiming unsupported external checks.", { atoms: z.array(z.string()).min(1) }, ({ atoms }) => verifyAtoms(atoms, history));
  defineTool(server, ctx, "logos_verification_history", "Return recent atom-verification runs.", { limit: z.number().int().min(1).max(100).optional() }, ({ limit }) => verificationHistory(history, limit), { readOnly: true });
} };
