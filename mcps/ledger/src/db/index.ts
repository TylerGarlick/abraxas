import { Database } from 'arangojs';

const db = new Database({
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  databaseName: process.env.ARANGO_DB || 'abraxas_db',
  auth: {
    username: process.env.ARANGO_USER || 'root',
    password: process.env.ARANGO_ROOT_PASSWORD || '5orange5',
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
