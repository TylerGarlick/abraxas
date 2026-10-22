import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape, z } from "zod";
import type { AppContext } from "../context.ts";

export type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

export interface ToolOptions {
  /** True when the tool never modifies state. */
  readOnly?: boolean;
  /** True when the tool can delete or overwrite data. */
  destructive?: boolean;
  idempotent?: boolean;
}

/** A tool module registers a related group of tools on the server. */
export interface ToolModule {
  name: string;
  register(server: McpServer, ctx: AppContext): void;
}

export const text = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

/**
 * Register a tool with uniform logging, timing and error handling.
 * Handlers return plain data (serialized to JSON text); thrown errors become `isError` results.
 */
export function defineTool<S extends ZodRawShape>(
  server: McpServer,
  ctx: AppContext,
  name: string,
  description: string,
  shape: S,
  handler: (args: z.infer<z.ZodObject<S>>) => Promise<unknown> | unknown,
  opts: ToolOptions = {},
): void {
  const log = ctx.log.child(`tool:${name}`);
  // The SDK's generic inference is exponential for dynamic shapes; the cast is a deliberate boundary.
  (server as unknown as { tool: (...a: unknown[]) => void }).tool(
    name,
    description,
    shape,
    {
      readOnlyHint: opts.readOnly ?? false,
      destructiveHint: opts.destructive ?? false,
      idempotentHint: opts.idempotent ?? opts.readOnly ?? false,
      openWorldHint: false,
    },
    (async (args: z.infer<z.ZodObject<S>>) => {
      const started = performance.now();
      try {
        const result = await handler(args);
        log.debug("ok", { ms: Math.round(performance.now() - started) });
        return text(result ?? { ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error("failed", { error: message });
        return { ...text(`Error: ${message}`), isError: true };
      }
    }),
  );
}
