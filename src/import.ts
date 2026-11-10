import { promises as fs } from 'fs';
import * as path from 'path';
import { buildPef } from './pef';
import { CalendarEvent, PEF } from './pef';

const MODULE_STORE = path.join(process.cwd(), '.Abraxas_modules.json');

/**
 * Load one or more PEF files and merge them into a single PEF.
 */
export async function importPef(targetDir: string, ...pefPaths: string[]): Promise<PEF> {
  const allEvents: CalendarEvent[] = [];
  for (const p of pefPaths) {
    const raw = await fs.readFile(p, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.events)) {
      allEvents.push(...data.events);
    }
  }
  if (targetDir) {
    // Ensure target dir exists for further operations, though not used here.
    await fs.mkdir(targetDir, { recursive: true });
  }
  return buildPef(allEvents);
}

/**
 * Register a module path. Persistently store the mapping.
 */
export async function registerModule(moduleName: string, modulePath: string): Promise<void> {
  let records: Record<string, string> = {};
  try {
    const data = await fs.readFile(MODULE_STORE, 'utf8');
    records = JSON.parse(data);
  } catch (e) {
    // file might not exist yet
  }
  records[moduleName] = modulePath;
  await fs.writeFile(MODULE_STORE, JSON.stringify(records, null, 2));
}

export async function getRegisteredModules(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(MODULE_STORE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export default { importPef, registerModule };
