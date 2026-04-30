import { Database } from 'arangojs';

const ARANGO_URL = process.env.ARANGO_URL;
const ARANGO_DB = process.env.ARANGO_DB;
const ARANGO_USER = process.env.ARANGO_USER;
const ARANGO_PASS = process.env.ARANGO_ROOT_PASSWORD;

if (!ARANGO_URL || !ARANGO_DB || !ARANGO_USER || !ARANGO_PASS) {
  throw new Error('Missing required ArangoDB environment variables: ARANGO_URL, ARANGO_DB, ARANGO_USER, or ARANGO_ROOT_PASSWORD');
}

const db = new Database({
  url: ARANGO_URL,
  databaseName: ARANGO_DB,
  auth: {
    username: ARANGO_USER,
    password: ARANGO_PASS,
  }
});

export { db };

export async function ensureCollections() {
  const tasks = db.collection('tasks');
  if (!await tasks.exists()) {
    await db.createCollection('tasks');
  }
  
  const edges = db.collection('task_edges');
  if (!await edges.exists()) {
    await db.createCollection('task_edges', { type: 'edge' });
  }
}
