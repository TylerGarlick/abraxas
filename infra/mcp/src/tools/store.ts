import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";

const collection = z.string().describe('Collection name, e.g. "memory/fragments" (letters, digits, - _ and / only)');
const query = z.record(z.unknown()).optional()
  .describe("Mongo-style filter: equality, $eq $ne $gt $gte $lt $lte $in $nin $exists $regex, $and/$or/$not, dotted paths");

/** Generic, schema-less persistence so any skill can store and query any shape of data. */
export const storeTools: ToolModule = {
  name: "store",
  register(server, ctx) {
    const col = (name: string) => ctx.store.collection(name);

    defineTool(server, ctx, "store_put",
      "Insert a document into a collection (created on demand). Pass `_id` to choose the id; fails if it exists. Use store_upsert to overwrite.",
      { collection, doc: z.record(z.unknown()).describe("Any JSON object") },
      ({ collection, doc }) => col(collection).insert(doc));

    defineTool(server, ctx, "store_upsert",
      "Insert or fully replace the document with the given id.",
      { collection, id: z.string(), doc: z.record(z.unknown()) },
      ({ collection, id, doc }) => col(collection).upsert({ ...doc, _id: id }), { idempotent: true });

    defineTool(server, ctx, "store_get", "Fetch one document by id (null if missing).",
      { collection, id: z.string() }, ({ collection, id }) => col(collection).get(id), { readOnly: true });

    defineTool(server, ctx, "store_find", "Query documents in a collection with optional sort and paging.",
      {
        collection, query,
        sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional().describe('e.g. {"createdAt": -1}'),
        skip: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      },
      ({ collection, query, sort, skip, limit }) => col(collection).find(query, { sort, skip, limit }),
      { readOnly: true });

    defineTool(server, ctx, "store_update", "Shallow-merge a patch into an existing document.",
      { collection, id: z.string(), patch: z.record(z.unknown()) },
      async ({ collection, id, patch }) => {
        const doc = await col(collection).update(id, patch);
        if (!doc) throw new Error(`No document ${id} in ${collection}`);
        return doc;
      }, { idempotent: true });

    defineTool(server, ctx, "store_delete", "Delete a document by id.",
      { collection, id: z.string() },
      async ({ collection, id }) => ({ deleted: await col(collection).remove(id) }), { destructive: true });

    defineTool(server, ctx, "store_count", "Count documents matching a query.",
      { collection, query }, async ({ collection, query }) => ({ count: await col(collection).count(query) }),
      { readOnly: true });

    defineTool(server, ctx, "store_list_collections", "List every collection that exists in the data store.",
      {}, async () => ({ backend: ctx.store.backend, collections: await ctx.store.listCollections() }),
      { readOnly: true });

    defineTool(server, ctx, "store_drop_collection", "Delete an entire collection. Irreversible.",
      { collection }, async ({ collection }) => ({ dropped: await ctx.store.dropCollection(collection) }),
      { destructive: true });
  },
};
