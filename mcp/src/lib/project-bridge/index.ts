import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type { Store } from "../../storage/types.ts";

const stamp = () => new Date().toISOString();
const SKIP = new Set([".git", "node_modules", ".abraxas", ".venv", "__pycache__"]);

async function filesUnder(dir: string, pattern: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (path: string) => {
    let entries;
    try { entries = await readdir(path, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.isDirectory()) { if (!SKIP.has(entry.name)) await walk(join(path, entry.name)); }
      else if (pattern === "*" || entry.name.endsWith(pattern.replace(/^\*/, ""))) out.push(join(path, entry.name));
    }
  };
  await walk(dir);
  return out;
}

export async function crossProjectSearch(root: string, query: string, projects: string[] | undefined, filePattern = "*", caseSensitive = false, maxResults = 20) {
  const projectRoots = new Map<string, string>([["abraxas", root]]);
  const parent = resolve(root, "..");
  try { for (const e of await readdir(join(parent, "projects"), { withFileTypes: true })) if (e.isDirectory()) projectRoots.set(e.name, join(parent, "projects", e.name)); } catch { /* optional projects directory */ }
  const targets = projects?.length ? projects : [...projectRoots.keys()];
  const needle = caseSensitive ? query : query.toLowerCase();
  const results: { project: string; matchCount: number; matches: { file: string; content: string }[] }[] = [];
  for (const project of targets) {
    const dir = projectRoots.get(project);
    if (!dir) continue;
    const matches: { file: string; content: string }[] = [];
    for (const path of await filesUnder(dir, filePattern)) {
      if (matches.length >= maxResults) break;
      let body: string;
      try { body = await readFile(path, "utf8"); } catch { continue; }
      for (const line of body.split(/\r?\n/)) {
        const content = caseSensitive ? line : line.toLowerCase();
        if (content.includes(needle)) matches.push({ file: relative(dir, path), content: line.trim() });
        if (matches.length >= maxResults) break;
      }
    }
    if (matches.length) results.push({ project, matchCount: matches.length, matches });
  }
  return { success: true, query, projectsSearched: targets, totalMatches: results.reduce((n, r) => n + r.matchCount, 0), results, timestamp: stamp() };
}

export async function manageProjectMapping(store: Store, action: string, source?: string, target?: string, relationshipType?: string, metadata: Record<string, unknown> = {}) {
  const collection = store.collection("project-bridge/mappings");
  const mappings = await collection.find({});
  if (action === "list") return { success: true, action, mappings: { projects: {}, relationships: mappings.map((m) => ({ ...m, id: m._id })) }, timestamp: stamp() };
  if (action === "get") {
    if (!source) throw new Error("sourceProject is required for get action");
    return { success: true, action, project: source, relationships: mappings.filter((m) => m.source === source || m.target === source).map((m) => ({ ...m, id: m._id })), timestamp: stamp() };
  }
  if (!source || !target) throw new Error("sourceProject and targetProject are required");
  const found = mappings.find((m) => m.source === source && m.target === target);
  if (action === "create") {
    if (!relationshipType) throw new Error("relationshipType is required for create action");
    const doc = await collection.insert({ source, target, type: relationshipType, metadata, createdAt: stamp() });
    return { success: true, action, relationship: { ...doc, id: doc._id }, timestamp: stamp() };
  }
  if (action === "update") {
    if (!found) throw new Error("Relationship not found");
    const doc = await collection.update(found._id, { ...(relationshipType ? { type: relationshipType } : {}), metadata: { ...(found.metadata as Record<string, unknown> ?? {}), ...metadata } });
    return { success: true, action, relationship: { ...doc, id: doc!._id }, timestamp: stamp() };
  }
  if (action === "delete") {
    if (!found) throw new Error("Relationship not found");
    await collection.remove(found._id);
    return { success: true, action, deleted: { source, target }, timestamp: stamp() };
  }
  throw new Error(`Unknown action: ${action}`);
}

export async function projectBridgeHealth(root: string, detailed = false) {
  const report: Record<string, unknown> = { status: "healthy", timestamp: stamp(), version: "1.0.0" };
  if (detailed) {
    const workspace = resolve(root, "..");
    let projects: string[] = [];
    try { projects = (await readdir(join(workspace, "projects"), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name); } catch { /* unavailable */ }
    report.workspace = { path: workspace, accessible: (await stat(workspace).then(() => true).catch(() => false)) };
    report.projects = Object.fromEntries([["abraxas", { status: "available", path: root }], ...projects.map((p) => [p, { status: "available", path: join(workspace, "projects", p) }])]);
    report.tools = { cross_project_search: "operational", project_mapping: "operational", health_check: "operational" };
  }
  return report;
}
