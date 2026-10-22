/** A stored document. `_id` is assigned on insert; timestamps are maintained by the store. */
export interface Doc {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export type NewDoc = Record<string, unknown> & { _id?: string };

/**
 * Mongo-style query subset shared by every backend:
 * equality, `$eq $ne $gt $gte $lt $lte $in $nin $exists $regex`, and `$and $or $not`.
 * Dotted paths (`meta.source`) address nested fields.
 */
export type Query = Record<string, unknown>;

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
}

/** One named collection of documents. */
export interface Collection {
  readonly name: string;
  insert(doc: NewDoc): Promise<Doc>;
  get(id: string): Promise<Doc | null>;
  find(query?: Query, opts?: FindOptions): Promise<Doc[]>;
  /** Shallow-merges `patch` into the document; returns null when it does not exist. */
  update(id: string, patch: Record<string, unknown>): Promise<Doc | null>;
  /** Insert or replace by `_id`. */
  upsert(doc: NewDoc & { _id: string }): Promise<Doc>;
  remove(id: string): Promise<boolean>;
  count(query?: Query): Promise<number>;
}

/** Pluggable persistence layer. All data lives below `Config.dataDir`. */
export interface Store {
  readonly backend: string;
  collection(name: string): Collection;
  listCollections(): Promise<string[]>;
  dropCollection(name: string): Promise<boolean>;
  close(): Promise<void>;
}
