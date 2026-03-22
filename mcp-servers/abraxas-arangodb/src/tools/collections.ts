/**
 * Collection management MCP tools
 */

import { getClient } from '../client.js';
import { logger } from '../logger.js';
import type { CollectionInfo, CollectionType } from '../types.js';

/**
 * List all collections
 */
export async function listCollections(): Promise<CollectionInfo[]> {
  logger.debug('Listing collections');
  const db = getClient();
  const collections = await db.listCollections();
  
  return collections.map((col) => ({
    id: col.name,
    name: col.name,
    type: col.type === 3 ? 'edge' as CollectionType : 'document' as CollectionType,
    status: col.status,
    isSystem: col.isSystem,
  }));
}

/**
 * Create a new collection
 */
export async function createCollection(
  name: string,
  type: CollectionType = 'document'
): Promise<CollectionInfo> {
  logger.debug('Creating collection', { name, type });
  const db = getClient();
  
  let result;
  if (type === 'edge') {
    result = await db.createCollection(name, { type: 3 });
  } else {
    result = await db.createCollection(name);
  }
  
  logger.info('Collection created', { name, type });
  
  return {
    id: result.name,
    name: result.name,
    type,
    status: 0,
    isSystem: false,
  };
}

/**
 * Get collection information
 */
export async function getCollection(name: string): Promise<CollectionInfo | null> {
  logger.debug('Getting collection', { name });
  const db = getClient();
  
  try {
    const collection = db.collection(name);
    const info = await collection.get();
    
    return {
      id: name,
      name: collection.name,
      type: info.type === 3 ? 'edge' as CollectionType : 'document' as CollectionType,
      status: info.status,
      isSystem: info.isSystem,
    };
  } catch {
    logger.warn('Collection not found', { name });
    return null;
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(name: string): Promise<{ deleted: boolean }> {
  logger.debug('Deleting collection', { name });
  const db = getClient();
  
  try {
    const collection = db.collection(name);
    await collection.drop();
    logger.info('Collection deleted', { name });
    return { deleted: true };
  } catch (error) {
    logger.error('Failed to delete collection', { name, error });
    return { deleted: false };
  }
}

/**
 * Get indexes for a collection
 */
export async function getCollectionIndexes(
  name: string
): Promise<Array<{ id: string; type: string; fields: string[]; unique?: boolean; sparse?: boolean }>> {
  logger.debug('Getting collection indexes', { name });
  const db = getClient();
  
  const collection = db.collection(name);
  const indexes = await collection.indexes();
  
  return indexes
    .filter((idx) => idx.type !== 'inverted') // filter out inverted indexes
    .map((idx) => ({
      id: idx.id,
      type: idx.type,
      fields: Array.isArray(idx.fields) ? (idx.fields as string[]) : [],
      unique: idx.unique,
      sparse: idx.sparse,
    }));
}
