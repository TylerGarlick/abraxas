import type { Store } from "../../storage/index.ts";
import { createHash } from "node:crypto";
export async function anchorTruth(store: Store, content: string, metadata: Record<string, unknown> = {}) {
  if (!content.trim()) throw new Error("content must not be empty");
  const digest = createHash("sha256").update(content).digest("hex");
  const collection = store.collection("epistemic/anchors");
  const existing = (await collection.find({ digest }))[0];
  if (existing) return existing._id;
  return (await collection.insert({ content, metadata, digest, immutable: true, anchoredAt: new Date().toISOString() }))._id;
}
export async function verifyAnchor(store: Store, id: string) {
  const row = await store.collection("epistemic/anchors").get(id);
  if (!row) return { valid: false, exists: false };
  const digest = createHash("sha256").update(String(row.content ?? "")).digest("hex");
  return { valid: digest === row.digest, exists: true, digest, id: row._id };
}
