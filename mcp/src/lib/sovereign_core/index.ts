import type { Store } from "../../storage/index.ts";
export async function manageConfig(store: Store, action: string, key?: string, value?: string, section = "default") {
  const collection = store.collection("system/config");
  if (action === "list") return collection.find({ section });
  if (action === "get") return key ? collection.find({ section, key }) : [];
  if (action === "set") {
    if (!key) throw new Error("key is required for set");
    const found = (await collection.find({ section, key }))[0];
    return found ? collection.update(found._id, { value }) : collection.insert({ section, key, value });
  }
  throw new Error(`Unsupported config action: ${action}`);
}
export async function systemStateAudit(store: Store, checkType = "full", verbose = false) {
  const collections = await store.listCollections();
  const counts = verbose ? Object.fromEntries(await Promise.all(collections.map(async (name) => [name, await store.collection(name).count()] as const))) : undefined;
  return { healthy: true, checkType, collections: collections.length, ...(counts ? { counts } : {}) };
}
export async function healthCheck(store: Store, detailed = false) {
  const collections = await store.listCollections();
  return { status: "healthy", backend: store.backend, ...(detailed ? { collections, collectionCount: collections.length } : {}) };
}
export async function recordToolFailure(store: Store, toolName: string) {
  const collection = store.collection("system/tool-failures");
  const found = (await collection.find({ toolName }))[0];
  return found ? collection.update(found._id, { failures: Number(found.failures ?? 0) + 1, lastFailureAt: new Date().toISOString() }) : collection.insert({ toolName, failures: 1, lastFailureAt: new Date().toISOString() });
}
export async function resetFailureTally(store: Store, toolName?: string) {
  const collection = store.collection("system/tool-failures"); const rows = await collection.find(toolName ? { toolName } : {});
  for (const row of rows) await collection.remove(row._id);
  return { reset: rows.length };
}
export function validatePatch(patchId: string) { return { valid: false, patchId, reason: "No patch source is configured; applying external patches is disabled." }; }
