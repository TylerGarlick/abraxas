import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Logger } from "../logger.ts";
import { applyOptions, matches } from "./query.ts";
import { assertCollectionName, newId, now } from "./util.ts";
import type { Collection, Doc, FindOptions, NewDoc, Query, Store } from "./types.ts";

/**
 * Human-readable store: one pretty-printed `<collection>.json` file per collection
 * (a JSON array of documents). Writes are atomic (temp file + rename) and serialized
 * per collection. Collections may be nested with `/` (e.g. `epistemic/claims`).
 */
export class JsonStore implements Store {
  readonly backend = "json";
  private cache = new Map<string, Promise<Map<string, Doc>>>();
  private locks = new Map<string, Promise<unknown>>();

  constructor(private dir: string, private log: Logger) {}

  private file(name: string): string {
    return join(this.dir, `${name}.json`);
  }

  private load(name: string): Promise<Map<string, Doc>> {
    let p = this.cache.get(name);
    if (!p) {
      p = (async () => {
        const f = this.file(name);
        if (!existsSync(f)) return new Map<string, Doc>();
        const docs = JSON.parse(await readFile(f, "utf8")) as Doc[];
        this.log.debug("collection loaded", { name, count: docs.length });
        return new Map(docs.map((d) => [d._id, d]));
      })();
      this.cache.set(name, p);
    }
    return p;
  }

  private async persist(name: string, docs: Map<string, Doc>): Promise<void> {
    const f = this.file(name);
    await mkdir(join(f, ".."), { recursive: true });
    const tmp = `${f}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify([...docs.values()], null, 2) + "\n");
    await rename(tmp, f);
  }

  /** Serialize read-modify-write cycles on one collection. */
  private async mutate<T>(name: string, fn: (docs: Map<string, Doc>) => T): Promise<T> {
    const prev = this.locks.get(name) ?? Promise.resolve();
    const run = prev.then(async () => {
      const docs = await this.load(name);
      const result = fn(docs);
      await this.persist(name, docs);
      return result;
    });
    this.locks.set(name, run.catch(() => undefined));
    return run;
  }

  collection(name: string): Collection {
    assertCollectionName(name);
    const self = this;
    return {
      name,
      async insert(input: NewDoc) {
        return self.mutate(name, (docs) => {
          const id = input._id ?? newId();
          if (docs.has(id)) throw new Error(`Document ${id} already exists in ${name}`);
          const ts = now();
          const doc: Doc = { ...input, _id: id, createdAt: ts, updatedAt: ts };
          docs.set(id, doc);
          return doc;
        });
      },
      async get(id) {
        return (await self.load(name)).get(id) ?? null;
      },
      async find(query?: Query, opts?: FindOptions) {
        const all = [...(await self.load(name)).values()].filter((d) => matches(d, query));
        return applyOptions(all, opts);
      },
      async update(id, patch) {
        return self.mutate(name, (docs) => {
          const cur = docs.get(id);
          if (!cur) return null;
          const next: Doc = { ...cur, ...patch, _id: id, createdAt: cur.createdAt, updatedAt: now() };
          docs.set(id, next);
          return next;
        });
      },
      async upsert(input) {
        return self.mutate(name, (docs) => {
          const cur = docs.get(input._id);
          const ts = now();
          const doc: Doc = { ...input, createdAt: cur?.createdAt ?? ts, updatedAt: ts };
          docs.set(input._id, doc);
          return doc;
        });
      },
      async remove(id) {
        return self.mutate(name, (docs) => docs.delete(id));
      },
      async count(query?: Query) {
        return (await this.find(query)).length;
      },
    };
  }

  async listCollections(): Promise<string[]> {
    const out: string[] = [];
    const walk = async (dir: string, prefix: string) => {
      if (!existsSync(dir)) return;
      for (const e of await readdir(dir, { withFileTypes: true })) {
        if (e.isDirectory()) await walk(join(dir, e.name), `${prefix}${e.name}/`);
        else if (e.name.endsWith(".json")) out.push(prefix + e.name.slice(0, -5));
      }
    };
    await walk(this.dir, "");
    return out.sort();
  }

  async dropCollection(name: string): Promise<boolean> {
    assertCollectionName(name);
    this.cache.delete(name);
    const f = this.file(name);
    if (!existsSync(f)) return false;
    await rm(f);
    return true;
  }

  async close(): Promise<void> {
    await Promise.all(this.locks.values());
  }
}
