// PEF utility functions for public Abraxas repository
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

export const PEF_TYPE = "pef.calendar";
export const PEF_VERSION = 1;

export interface CalendarEvent {
  id?: string;
  date: string;
  title: string;
  notes?: string;
  time?: string;
}

export interface PefDocument {
  type: typeof PEF_TYPE;
  version: number;
  exported_at: string;
  events: CalendarEvent[];
}

export function defaultPefDir(): string {
  const override = process.env.CALENDAR_PEF_DIR;
  if (override) return override;
  const home = process.env.HOME || os.homedir();
  const icloud = join(home, "Library", "Mobile Documents", "iCloud~md~obsidian", "Documents");
  if (existsSync(icloud)) return icloud;
  return join(home, "calendar-exports");
}

export function ensureDir(dir: string): string {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function buildPef(events: CalendarEvent[]): PefDocument {
  return {
    type: PEF_TYPE,
    version: PEF_VERSION,
    exported_at: new Date().toISOString(),
    events: events.map((e) => ({ ...e, id: e.id ?? crypto.randomUUID() })),
  };
}

export function isPef(input: unknown): input is PefDocument {
  if (!input || typeof input !== "object") return false;
  const o = input as Record<string, unknown>;
  return o.type === PEF_TYPE && typeof o.version === "number" && Array.isArray(o.events);
}

export function normalizeImport(input: unknown): CalendarEvent[] {
  if (Array.isArray(input)) return input as CalendarEvent[];
  if (isPef(input)) return (input as PefDocument).events;
  const o = input as Record<string, unknown> | null;
  if (o && Array.isArray(o.events)) return o.events as CalendarEvent[];
  return [];
}

export function savePef(events: CalendarEvent[], dir = defaultPefDir()): { path: string; document: PefDocument } {
  const target = ensureDir(dir);
  const document = buildPef(events);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(target, `calendar-${stamp}.pef`);
  writeFileSync(path, JSON.stringify(document, null, 2), "utf8");
  return { path, document };
}

export function listPefFiles(dir = defaultPefDir()): string[] {
  const target = existsSync(dir) ? dir : null;
  if (!target) return [];
  return readdirSync(target).filter((f) => f.toLowerCase().endsWith(".pef")).sort();
}

export function readPefFile(name: string, dir = defaultPefDir()): PefDocument | null {
  try {
    const safe = name.replace(/[^a-zA-Z0-9._-]/g, "");
    const content = readFileSync(join(dir, safe), "utf8");
    const parsed = JSON.parse(content);
    return isPef(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
