/**
 * ArangoDB client singleton
 */

import { Database } from 'arangojs';
import { logger } from './logger.js';

let db: Database | null = null;

export function getArangoConfig(): { host: string; password: string } {
  return {
    host: process.env.ARANGO_HOST || 'http://localhost:8529',
    password: process.env.ARANGO_PASSWORD || '',
  };
}

export function createClient(): Database {
  const config = getArangoConfig();
  
  if (db) {
    return db;
  }

  const url = config.host.replace(/^http/, 'http');
  const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  logger.info('Creating ArangoDB client', { url: normalizedUrl });

  db = new Database({
    url: normalizedUrl,
    databaseName: '_system',
    arangoVersion: 31200,
    auth: config.password ? { username: 'root', password: config.password } : undefined,
  });

  return db;
}

export function getClient(): Database {
  if (!db) {
    return createClient();
  }
  return db;
}

export function closeClient(): void {
  db = null;
  logger.info('ArangoDB client closed');
}

export { db as arangoClient };
