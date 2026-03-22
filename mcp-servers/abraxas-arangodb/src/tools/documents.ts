/**
 * Document CRUD MCP tools
 */

import { getClient } from '../client.js';
import { logger } from '../logger.js';
import type { DocumentData, DocumentResponse } from '../types.js';

/**
 * Create a document in a collection
 */
export async function createDocument(
  collection: string,
  data: DocumentData
): Promise<DocumentResponse> {
  logger.debug('Creating document', { collection });
  const db = getClient();
  
  const col = db.collection(collection);
  const result = await col.save(data);
  
  logger.info('Document created', { collection, id: result._id });
  
  return result as DocumentResponse;
}

/**
 * Get a document by ID
 */
export async function getDocument(
  collection: string,
  id: string
): Promise<DocumentResponse | null> {
  logger.debug('Getting document', { collection, id });
  const db = getClient();
  
  try {
    const col = db.collection(collection);
    const doc = await col.document(id);
    return doc as DocumentResponse;
  } catch {
    logger.warn('Document not found', { collection, id });
    return null;
  }
}

/**
 * Update a document (patch)
 */
export async function updateDocument(
  collection: string,
  id: string,
  data: Partial<DocumentData>
): Promise<DocumentResponse | null> {
  logger.debug('Updating document', { collection, id });
  const db = getClient();
  
  try {
    const col = db.collection(collection);
    const result = await col.update(id, data);
    logger.info('Document updated', { collection, id });
    return result as DocumentResponse;
  } catch (error) {
    logger.error('Failed to update document', { collection, id, error });
    return null;
  }
}

/**
 * Replace a document (put)
 */
export async function replaceDocument(
  collection: string,
  id: string,
  data: DocumentData
): Promise<DocumentResponse | null> {
  logger.debug('Replacing document', { collection, id });
  const db = getClient();
  
  try {
    const col = db.collection(collection);
    const result = await col.replace(id, data);
    logger.info('Document replaced', { collection, id });
    return result as DocumentResponse;
  } catch (error) {
    logger.error('Failed to replace document', { collection, id, error });
    return null;
  }
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(
  collection: string,
  id: string
): Promise<{ deleted: boolean }> {
  logger.debug('Deleting document', { collection, id });
  const db = getClient();
  
  try {
    const col = db.collection(collection);
    await col.remove(id);
    logger.info('Document deleted', { collection, id });
    return { deleted: true };
  } catch (error) {
    logger.error('Failed to delete document', { collection, id, error });
    return { deleted: false };
  }
}
