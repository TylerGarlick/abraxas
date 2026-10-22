import type { Collection } from "../../storage/index.ts";
type Schema = { type?: string; required?: string[]; properties?: Record<string, { type?: string }> };
function typeMatches(value: unknown, type?: string) { return !type || type === "object" ? !type || (typeof value === "object" && value !== null && !Array.isArray(value)) : type === "array" ? Array.isArray(value) : type === "null" ? value === null : typeof value === type || (type === "integer" && Number.isInteger(value)); }
export async function validateOutput(tool: string, output: unknown, schema: Schema, history: Collection) {
  const errors: string[] = []; const obj = typeof output === "object" && output !== null ? output as Record<string, unknown> : {};
  for (const key of schema.required ?? []) if (!(key in obj)) errors.push(`Missing required field: ${key}`);
  for (const [key, spec] of Object.entries(schema.properties ?? {})) if (key in obj && !typeMatches(obj[key], spec.type)) errors.push(`Field '${key}' expected ${spec.type}, got ${Array.isArray(obj[key]) ? "array" : typeof obj[key]}`);
  const result = { tool_name: tool, status: errors.length ? "invalid" : "valid", output_data: output, errors, warnings: [], confidence: errors.length ? 0 : 1, timestamp: new Date().toISOString() };
  await history.insert({ kind: "validation", ...result }); return result;
}
export async function detectFailure(tool: string, message: string, input: unknown, history: Collection) {
  const failure_type = /timeout/i.test(message) ? "timeout" : /network|connection/i.test(message) ? "network_error" : /invalid|validation/i.test(message) ? "invalid_input" : "exception";
  const result = { tool_name: tool, failure_type, message, input, status: "UNKNOWN", confidence: 0, timestamp: new Date().toISOString(), suggestions: ["Review the failure details and retry only after the cause is understood."] };
  await history.insert({ kind: "failure", ...result }); return result;
}
