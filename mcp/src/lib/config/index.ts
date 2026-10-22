import type { Collection, Doc } from "../../storage/types.ts";

function assignPath(root: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".").filter(Boolean);
  let cursor = root;
  for (const part of parts.slice(0, -1)) {
    const next = cursor[part];
    cursor = (next && typeof next === "object" && !Array.isArray(next) ? next : (cursor[part] = {})) as Record<string, unknown>;
  }
  if (parts.length) cursor[parts.at(-1)!] = value;
}
export function maskSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskSecrets);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /secret|password|token|api.?key|credential/i.test(key) ? "********" : maskSecrets(item)]));
}
export async function getConfig(col: Collection) {
  const rows = await col.find({}, { limit: 1000 });
  const config: Record<string, unknown> = {};
  for (const row of rows) if (typeof row.path === "string") assignPath(config, row.path, row.value);
  return config;
}
export async function getValue(col: Collection, path: string) {
  const row = (await col.find({ path }, { limit: 1 }))[0];
  if (row) return row.value;
  let value: unknown = await getConfig(col);
  for (const key of path.split(".")) value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  if (value === undefined) throw new Error(`Configuration path not found: ${path}`);
  return value;
}
export async function getSection(col: Collection, section: string) { return (await getConfig(col))[section] ?? {}; }
export async function configVersion(col: Collection) { return (await col.find({ kind: "meta", key: "version" }, { limit: 1 }))[0]?.value ?? "1.0.0"; }
export async function setConfigValue(col: Collection, path: string, value: unknown): Promise<Doc> {
  const row = (await col.find({ path }, { limit: 1 }))[0];
  return row ? (await col.update(row._id, { value }))! : col.insert({ path, value });
}
