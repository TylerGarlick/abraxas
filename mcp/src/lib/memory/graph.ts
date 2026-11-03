// Minimal in-memory memory graph (set-of-sets K/U) + import/export
export type TrustLevel = "KNOWN" | "UNKNOWN" | "ANY";

export interface MemoryRecord {
  id: string;
  world: string;
  label: string;
  level: TrustLevel;
  provenance?: string[];
}

export class MemoryGraph {
  private records: Map<string, MemoryRecord> = new Map();
  private worlds: Map<string, Set<string>> = new Map();

  createWorld(name: string): this {
    if (!name) throw new Error("world name required");
    if (!this.worlds.has(name)) this.worlds.set(name, new Set());
    return this;
  }

  add(world: string, label: string, level: TrustLevel = "KNOWN", provenance: string[] = []): MemoryRecord {
    this.createWorld(world);
    const id = `${world}::${label}`;
    const rec: MemoryRecord = { id, world, label, level, provenance };
    this.records.set(id, rec);
    this.worlds.get(world)!.add(id);
    return rec;
  }

  markUnknown(world: string, label: string, provenance: string[] = []): MemoryRecord {
    return this.add(world, label, "UNKNOWN", provenance);
  }

  recordsIn(world: string): MemoryRecord[] {
    const ids = this.worlds.get(world);
    if (!ids) return [];
    return [...ids].map((id) => this.records.get(id)!);
  }

  exportJSON(): string {
    return JSON.stringify({
      worlds: Object.fromEntries([...this.worlds.entries()].map(([k, v]) => [k, [...v]])),
      records: [...this.records.values()],
    }, null, 2);
  }

  importJSON(raw: string): void {
    const data = JSON.parse(raw);
    this.worlds.clear();
    this.records.clear();
    for (const [world, ids] of Object.entries(data.worlds ?? {})) {
      this.worlds.set(world, new Set(ids as string[]));
    }
    for (const rec of (data.records ?? []) as MemoryRecord[]) {
      this.records.set(rec.id, rec);
    }
  }

  drop(world: string, label: string): boolean {
    const id = `${world}::${label}`;
    const ids = this.worlds.get(world);
    if (!ids || !ids.has(id)) return false;
    ids.delete(id);
    this.records.delete(id);
    return true;
  }
}
