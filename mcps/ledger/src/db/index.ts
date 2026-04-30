import { Database } from 'arangojs';

const dbConfig = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  databaseName: process.env.ARANGO_DB || 'abraxas_db',
  auth: {
    password: process.env.ARANGO_ROOT_PASSWORD || '5orange5',
  }
};

export const db = new Database(dbConfig);

export async function ensureCollections() {
  const tasks = await db.collection('tasks');
  if (!await tasks.exists()) {
    await db.createCollection('tasks');
  }
  
  const edges = await db.collection('task_edges');
  if (!await edges.exists()) {
    await db.createCollection('task_edges', { type: 'edge' });
  }
}
