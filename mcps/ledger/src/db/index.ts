import { Database } from 'arangojs';

let dbInstance: Database | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const ARANGO_URL = process.env.ARANGO_URL;
  const ARANGO_DB = process.env.ARANGO_DB;
  const ARANGO_USER = process.env.ARANGO_USER;
  const ARANGO_PASS = process.env.ARANGO_ROOT_PASSWORD;

  if (!ARANGO_URL || !ARANGO_DB || !ARANGO_USER || !ARANGO_PASS) {
    throw new Error(`Missing required ArangoDB environment variables. URL: ${!!ARANGO_URL}, DB: ${!!ARANGO_DB}, User: ${!!ARANGO_USER}, Pass: ${!!ARANGO_PASS}`);
  }

  console.error(`Initializing ArangoDB connection to database: ${ARANGO_DB}`);
  dbInstance = new Database({
    url: ARANGO_URL,
    databaseName: ARANGO_DB,
    auth: {
      username: ARANGO_USER,
      password: ARANGO_PASS,
    }
  });

  return dbInstance;
}

export function resetDb() {
  dbInstance = null;
}

export async function ensureCollections() {
  const db = getDb();
  const tasks = db.collection('tasks');
  if (!await tasks.exists()) {
    await db.createCollection('tasks');
  }
  
  const edges = db.collection('task_edges');
  if (!await edges.exists()) {
    await db.createCollection('task_edges', { type: 'edge' });
  }
}
