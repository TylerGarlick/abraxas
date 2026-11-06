import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import {
  archiveSession,
  listSessions,
  restoreSession,
  saveSession,
  verifySession,
  type SessionArtifactLinks,
  type SessionTranscript,
} from "../lib/mnemosyne/index.ts";

function parseJson<T>(value: string | undefined, fallback: T | undefined): T | undefined {
  if (value === undefined || value === null || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const mnemosyneTools: ToolModule = {
  name: "mnemosyne",
  register(server, ctx) {
    const store = ctx.store;

    defineTool(
      server,
      ctx,
      "mnemosyne_session_save",
      "Persist an Abraxas session into the configured .abraxas/data store with integrity hash.",
      {
        session_id: z.string().optional(),
        name: z.string().min(1),
        description: z.string().optional(),
        transcript_json: z.string().optional(),
        artifacts_json: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata_json: z.string().optional(),
        status: z.enum(["active", "closed"]).optional(),
        mode: z.enum(["create", "append", "replace"]).optional(),
        expected_version: z.number().int().min(0).optional(),
        force: z.boolean().optional(),
      },
      async (args) => {
        const transcript = parseJson<SessionTranscript>(args.transcript_json, undefined);
        const artifacts = parseJson<SessionArtifactLinks>(args.artifacts_json, undefined);
        const metadata = parseJson<Record<string, unknown>>(args.metadata_json, undefined);
        return await saveSession(store, {
          session_id: args.session_id,
          name: args.name,
          description: args.description,
          transcript,
          artifacts,
          tags: args.tags,
          metadata,
          status: args.status,
          mode: args.mode,
          expected_version: args.expected_version,
          force: args.force,
        });
      },
      { destructive: true, idempotent: false },
    );

    defineTool(
      server,
      ctx,
      "mnemosyne_session_restore",
      "Restore a session from .abraxas/data and verify its content hash.",
      { session_id: z.string().min(1) },
      async ({ session_id }) => await restoreSession(store, session_id),
      { readOnly: true },
    );

    defineTool(
      server,
      ctx,
      "mnemosyne_session_list",
      "List persisted Abraxas sessions from .abraxas/data.",
      {
        status: z.enum(["active", "closed", "archived"]).optional(),
        tag: z.string().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
      async (args) => await listSessions(store, args),
      { readOnly: true },
    );

    defineTool(
      server,
      ctx,
      "mnemosyne_session_archive",
      "Archive a session without deleting its stored history.",
      {
        session_id: z.string().min(1),
        reason: z.string().optional(),
      },
      async ({ session_id, reason }) => await archiveSession(store, session_id, reason),
      { destructive: true, idempotent: true },
    );

    defineTool(
      server,
      ctx,
      "mnemosyne_session_verify",
      "Verify that a stored session's hash still matches its content.",
      { session_id: z.string().min(1) },
      async ({ session_id }) => await verifySession(store, session_id),
      { readOnly: true },
    );
  },
};