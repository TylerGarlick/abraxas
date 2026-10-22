import type { Doc, FindOptions, Query } from "./types.ts";

function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

const isOperatorObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v) &&
  Object.keys(v).length > 0 && Object.keys(v).every((k) => k.startsWith("$"));

function equals(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && !Array.isArray(b)) return a.some((x) => equals(x, b));
  return JSON.stringify(a) === JSON.stringify(b);
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

function matchOperators(value: unknown, ops: Record<string, unknown>): boolean {
  return Object.entries(ops).every(([op, arg]) => {
    switch (op) {
      case "$eq": return equals(value, arg);
      case "$ne": return !equals(value, arg);
      case "$gt": return value !== undefined && compare(value, arg) > 0;
      case "$gte": return value !== undefined && compare(value, arg) >= 0;
      case "$lt": return value !== undefined && compare(value, arg) < 0;
      case "$lte": return value !== undefined && compare(value, arg) <= 0;
      case "$in": return Array.isArray(arg) && arg.some((x) => equals(value, x));
      case "$nin": return Array.isArray(arg) && !arg.some((x) => equals(value, x));
      case "$exists": return (value !== undefined) === Boolean(arg);
      case "$regex": return typeof value === "string" && new RegExp(String(arg), "i").test(value);
      case "$not": return !(isOperatorObject(arg) ? matchOperators(value, arg) : equals(value, arg));
      default: throw new Error(`Unsupported query operator: ${op}`);
    }
  });
}

export function matches(doc: Doc, query: Query = {}): boolean {
  return Object.entries(query).every(([key, cond]) => {
    if (key === "$and") return (cond as Query[]).every((q) => matches(doc, q));
    if (key === "$or") return (cond as Query[]).some((q) => matches(doc, q));
    if (key === "$not") return !matches(doc, cond as Query);
    const value = getPath(doc, key);
    return isOperatorObject(cond) ? matchOperators(value, cond) : equals(value, cond);
  });
}

export function applyOptions(docs: Doc[], opts: FindOptions = {}): Doc[] {
  let out = docs;
  if (opts.sort) {
    const keys = Object.entries(opts.sort);
    out = [...out].sort((a, b) => {
      for (const [k, dir] of keys) {
        const c = compare(getPath(a, k), getPath(b, k));
        if (c !== 0) return c * dir;
      }
      return 0;
    });
  }
  const skip = opts.skip ?? 0;
  return opts.limit === undefined ? out.slice(skip) : out.slice(skip, skip + opts.limit);
}
