import type { Collection, Doc, NewDoc, Query } from "../src/storage/index.ts";
export function fakeCollection(): Collection {
  const docs = new Map<string, Doc>();
  const matches = (doc: Doc, query: Query = {}) => Object.entries(query).every(([k, v]) => doc[k] === v);
  return {
    name: "test",
    async insert(input: NewDoc) { const now = new Date().toISOString(); const id = String(input._id ?? crypto.randomUUID()); if (docs.has(id)) throw new Error("duplicate"); const d = { ...input, _id: id, createdAt: now, updatedAt: now } as Doc; docs.set(id, d); return d; },
    async upsert(input) { const old = docs.get(input._id); const now = new Date().toISOString(); const d = { ...old, ...input, _id: input._id, createdAt: old?.createdAt ?? now, updatedAt: now } as Doc; docs.set(d._id, d); return d; },
    async get(id) { return docs.get(id) ?? null; },
    async find(query = {}, opts = {}) { let out = [...docs.values()].filter(d => matches(d, query)); if (opts.sort) { const entry = Object.entries(opts.sort)[0]; if (entry) { const [key, direction] = entry; out.sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? "")) * direction); } } return out.slice(opts.skip ?? 0, (opts.skip ?? 0) + (opts.limit ?? out.length)); },
    async update(id, patch) { const old = docs.get(id); if (!old) return null; const d = { ...old, ...patch, updatedAt: new Date().toISOString() }; docs.set(id, d); return d; },
    async remove(id) { return docs.delete(id); },
    async count(query = {}) { return [...docs.values()].filter(d => matches(d, query)).length; },
  };
}
