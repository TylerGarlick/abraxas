import { createHash } from "node:crypto";
import type { Collection, Doc, Store } from "../../storage/types.ts";

export interface SessionTranscript {
  turns?: Array<{ turn: number; timestamp: string; role: "user" | "assistant"; content: string; labels_used?: string[] }>;
  [key: string]: unknown;
}

export interface SessionArtifactLinks {
  janus?: string[];
  mnemon?: string[];
  logos?: string[];
  kairos?: string[];
  other?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface MnemosyneSession {
  session_id: string;
  name: string;
  description?: string;
  schema_version: "1.0";
  status: "active" | "closed" | "archived";
  version: number;
  turn_count?: number;
  tags?: string[];
  transcript?: SessionTranscript;
  artifacts?: SessionArtifactLinks;
  metadata?: Record<string, unknown>;
  content_hash: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  archived_at?: string;
  archive_reason?: string;
}

export interface SaveSessionInput {
  session_id?: string;
  name?: string;
  description?: string;
  transcript?: SessionTranscript;
  artifacts?: SessionArtifactLinks;
  tags?: string[];
  metadata?: Record<string, unknown>;
  status?: "active" | "closed";
  mode?: "create" | "append" | "replace";
  expected_version?: number;
  force?: boolean;
}

export class MnemosyneConflictError extends Error {
  constructor(message: string, public readonly existing?: MnemosyneSession) {
    super(message);
    this.name = "MnemosyneConflictError";
  }
}

function hashSession(parts: {
  name: string;
  description?: string;
  transcript?: SessionTranscript;
  artifacts?: SessionArtifactLinks;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): string {
  const payload = {
    name: parts.name,
    description: parts.description ?? null,
    transcript: parts.transcript ?? null,
    artifacts: parts.artifacts ?? null,
    tags: parts.tags ?? null,
    metadata: parts.metadata ?? null,
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function now(): string {
  return new Date().toISOString();
}

function generateSessionId(): string {
  const stamp = now().slice(0, 7);
  return `mnemo-${stamp}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function toSession(doc: Doc): MnemosyneSession {
  return {
    session_id: String(doc._id),
    name: String(doc.name ?? ""),
    description: doc.description as string | undefined,
    schema_version: (doc.schema_version as "1.0") ?? "1.0",
    status: (doc.status as MnemosyneSession["status"]) ?? "active",
    version: Number(doc.version ?? 1),
    turn_count: typeof doc.turn_count === "number" ? doc.turn_count : undefined,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : undefined,
    transcript: (doc.transcript as SessionTranscript | undefined) ?? undefined,
    artifacts: (doc.artifacts as SessionArtifactLinks | undefined) ?? undefined,
    metadata: (doc.metadata as Record<string, unknown> | undefined) ?? undefined,
    content_hash: String(doc.content_hash ?? ""),
    created_at: String(doc.createdAt ?? doc.created_at ?? now()),
    updated_at: String(doc.updatedAt ?? doc.updated_at ?? now()),
    closed_at: doc.closed_at as string | undefined,
    archived_at: doc.archived_at as string | undefined,
    archive_reason: doc.archive_reason as string | undefined,
  };
}

export function sessionCollection(store: Store): Collection {
  return store.collection("mnemosyne/sessions");
}

export async function saveSession(store: Store, input: SaveSessionInput): Promise<MnemosyneSession> {
  const collection = sessionCollection(store);
  const id = input.session_id ?? undefined;

  let existing: MnemosyneSession | null = null;
  if (id) {
    const doc = await collection.get(id);
    if (doc) existing = toSession(doc);
  }

  const mode = input.mode ?? "create";
  if (existing && mode === "create") {
    throw new MnemosyneConflictError(`Session already exists: ${id}`, existing);
  }

  const name = (input.name ?? existing?.name ?? "").trim();
  if (!name) throw new Error("name is required");

  if (existing && input.expected_version !== undefined && input.expected_version !== existing.version) {
    throw new MnemosyneConflictError(
      `Version conflict for ${existing.session_id}: expected ${input.expected_version}, found ${existing.version}`,
      existing,
    );
  }

  const transcript = input.transcript ?? existing?.transcript;
  const artifacts = input.artifacts ?? existing?.artifacts;
  const tags = input.tags ?? existing?.tags;
  const description = input.description ?? existing?.description;
  const metadata = input.metadata ?? existing?.metadata;

  let mergedTranscript = transcript;
  if (mode === "append" && input.transcript?.turns && existing?.transcript?.turns) {
    const seen = new Set(existing.transcript.turns.map((t) => `${t.turn}:${t.timestamp}:${t.role}`));
    const additions = input.transcript.turns.filter((t) => !seen.has(`${t.turn}:${t.timestamp}:${t.role}`));
    mergedTranscript = { ...existing.transcript, ...input.transcript, turns: [...existing.transcript.turns, ...additions] };
  }

  const nextStatus = input.status ?? existing?.status ?? "active";
  const changed = Boolean(input.transcript || input.artifacts || input.tags || input.description || input.metadata);
  const version = existing ? existing.version + (mode === "append" ? 1 : (changed ? 1 : 0)) : 1;
  const hash = hashSession({ name, description, transcript: mergedTranscript, artifacts, tags, metadata });
  const timestamp = now();
  const sessionId = existing?.session_id ?? id ?? generateSessionId();

  if (existing && existing.content_hash === hash && version === existing.version) {
    return existing;
  }

  if (existing && mode !== "replace" && existing.status === "archived" && !input.force) {
    throw new MnemosyneConflictError(`Session ${existing.session_id} is archived; use force=true to overwrite`, existing);
  }

  const document: Record<string, unknown> = {
    _id: sessionId,
    session_id: sessionId,
    name,
    description: description ?? null,
    schema_version: "1.0",
    status: nextStatus,
    version,
    turn_count: mergedTranscript?.turns?.length ?? existing?.turn_count ?? null,
    tags: tags ?? null,
    transcript: mergedTranscript ?? null,
    artifacts: artifacts ?? null,
    metadata: metadata ?? null,
    content_hash: hash,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
    closed_at: nextStatus === "closed" ? (existing?.closed_at ?? timestamp) : existing?.closed_at,
  };

  const saved = existing ? await collection.upsert(document as any) : await collection.insert(document as any);
  return toSession(saved);
}

export async function restoreSession(store: Store, id: string): Promise<MnemosyneSession> {
  const collection = sessionCollection(store);
  const doc = await collection.get(id);
  if (!doc) throw new Error(`Session not found: ${id}`);
  const session = toSession(doc);
  const expected = hashSession({
    name: session.name,
    description: session.description,
    transcript: session.transcript,
    artifacts: session.artifacts,
    tags: session.tags,
    metadata: session.metadata,
  });
  if (expected !== session.content_hash) {
    throw new Error(`Session integrity check failed for ${id}: restored content does not match stored hash`);
  }
  return session;
}

export async function listSessions(store: Store, opts: { status?: string; tag?: string; limit?: number } = {}): Promise<MnemosyneSession[]> {
  const collection = sessionCollection(store);
  const query: Record<string, unknown> = {};
  if (opts.status) query.status = opts.status;
  if (opts.tag) query.tags = { $in: [opts.tag] };
  const docs = await collection.find(query, { sort: { updatedAt: -1 }, limit: opts.limit ?? 50 });
  return docs.map(toSession);
}

export async function archiveSession(store: Store, id: string, reason?: string): Promise<MnemosyneSession> {
  const collection = sessionCollection(store);
  const doc = await collection.get(id);
  if (!doc) throw new Error(`Session not found: ${id}`);
  const patched = await collection.update(id, {
    status: "archived",
    archived_at: now(),
    archive_reason: reason ?? null,
    updated_at: now(),
  });
  if (!patched) throw new Error(`Failed to archive session: ${id}`);
  return toSession(patched);
}

export async function verifySession(store: Store, id: string): Promise<{ valid: boolean; reason?: string; session?: MnemosyneSession }> {
  try {
    const session = await restoreSession(store, id);
    return { valid: true, session };
  } catch (err) {
    return { valid: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export { sessionCollection as mnemosyneCollection };
