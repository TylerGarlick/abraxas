import { randomUUID } from "node:crypto";

export const newId = (): string => randomUUID();
export const now = (): string => new Date().toISOString();

const NAME_RE = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*$/i;

/** Collection names become file paths, so only safe, relative segments are allowed. */
export function assertCollectionName(name: string): void {
  if (!NAME_RE.test(name)) {
    throw new Error(`Invalid collection name "${name}": use letters, digits, "-", "_" and "/" separators`);
  }
}
