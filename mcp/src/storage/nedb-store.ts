import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import Datastore from "@seald-io/nedb";
import type { Logger } from "../logger.ts";
import { applyOptions, matches } from "./query.ts";
import { assertCollectionName, newId, now } from "./util.ts";
import type { Collection, Doc, FindOptions, NewDoc, Query, Store } from "./types.ts";

/**
 * Embedded NeDB backend (`@seald-io/nedb`, the maintained fork) — append-only `<collection>.db`
 * files. Queries are evaluated with the shared matcher so behaviour is identical to JsonStore.
 */
export class NedbStore implements Store {
  readonly backend = "nedb";
  private dbs = new Map<string, Datastore>();

  constructor(private dir: string, private log: Logger) {}

  private async db(name: string): Promise<Datastore> {
    let db = this.dbs.get(name);
    if (!db) {
      const filename = join(this.dir, `${name}.db`);
      await mkdir(join(filename, ".."), { recursive: true });
      db = new Datastore({ filename, autoload: false });
      await db.loadDatabaseAsync();
      this.dbs.set(name, db);
      this.log.debug("nedb collection loaded", { name });
    }
    return db;
  }

  collection(name: string): Collection {
    assertCollectionName(name);
    const self = this;
    const all = async (): Promise<Doc[]> => (await (await self.db(name)).findAsync({})) as Doc[];
    return {
      name,
      async insert(input: NewDoc) {
        const ts = now();
        const doc = { ...input, _id: input._id ?? newId(), createdAt: ts, updatedAt: ts } as Doc;
        await (await self.db(name)).insertAsync(doc);
        return doc;
      },
      async get(id) {
        return ((await (await self.db(name)).findOneAsync({ _id: id })) as Doc | null) ?? null;
      },
      async find(query?: Query, opts?: FindOptions) {
        return applyOptions((await all()).filter((d) => matches(d, query)), opts);
      },
      async update(id, patch) {
        const db = await self.db(name);
        const cur = (await db.findOneAsync({ _id: id })) as Doc | null;
        if (!cur) return null;
        const next: Doc = { ...cur, ...patch, _id: id, createdAt: cur.createdAt, updatedAt: now() };
        await db.updateAsync({ _id: id }, next, {});
        return next;
      },
      async upsert(input) {
        const db = await self.db(name);
        const cur = (await db.findOneAsync({ _id: input._id })) as Doc | null;
        const ts = now();
        const doc: Doc = { ...input, createdAt: cur?.createdAt ?? ts, updatedAt: ts };
        await db.updateAsync({ _id: input._id }, doc, { upsert: true });
        return doc;
      },
      async remove(id) {
        return (await (await self.db(name)).removeAsync({ _id: id }, {})) > 0;
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
        else if (e.name.endsWith(".db")) out.push(prefix + e.name.slice(0, -3));
      }
    };
    await walk(this.dir, "");
    return out.sort();
  }

  async dropCollection(name: string): Promise<boolean> {
    assertCollectionName(name);
    this.dbs.delete(name);
    const f = join(this.dir, `${name}.db`);
    if (!existsSync(f)) return false;
    await rm(f);
    return true;
  }

  async close(): Promise<void> {
    this.dbs.clear();
  }
}
