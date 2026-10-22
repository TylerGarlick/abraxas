import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { crosscheck, logMathOperation, scoreConfidence, verifyArithmetic, verifyMath, verifyMathClaim } from "../lib/logos-math/logic.ts";
export const logosMathTools: ToolModule = { name: "logos-math", register(server, ctx) {
  const logs = ctx.store.collection("reasoning/logos-math/logs");
  defineTool(server, ctx, "logos_math_verify", "Check whether a mathematical claim includes a derivation.", { expression: z.string(), derivation: z.string().optional() }, ({ expression, derivation }) => verifyMath(expression, derivation), { readOnly: true });
  defineTool(server, ctx, "logos_math_verify_claim", "Check a mathematical statement for mathematical content and a visible derivation.", { claim: z.string() }, ({ claim }) => verifyMathClaim(claim), { readOnly: true });
  defineTool(server, ctx, "logos_math_calculate", "Safely evaluate numeric arithmetic expressions and compare claims without dynamic code execution.", { expression: z.string(), claimed_result: z.number().optional() }, ({ expression, claimed_result }) => verifyArithmetic(expression, claimed_result), { readOnly: true });
  defineTool(server, ctx, "logos_math_log", "Persist an auditable mathematics operation in the Store.", { type: z.enum(["verify", "confidence", "crosscheck"]), claim: z.string(), result: z.unknown() }, ({ type, claim, result }) => logMathOperation(type, claim, result, logs));
  defineTool(server, ctx, "logos_math_crosscheck", "Cross-check a basic arithmetic expression against a proposed result.", { expression: z.string(), result: z.number() }, ({ expression, result }) => crosscheck(expression, result), { readOnly: true });
  defineTool(server, ctx, "logos_math_confidence", "Score confidence from a verification status and derivation context.", { status: z.string(), has_derivation: z.boolean().optional() }, ({ status, has_derivation }) => scoreConfidence(status, has_derivation), { readOnly: true });
} };
