/**
 * Simple query and AQL execution MCP tools
 */

import { getClient } from '../client.js';
import { logger } from '../logger.js';
import { generateAQL, validateAQL } from './aql.js';
import type { DocumentData, AQLResponse, GenerateAQLResponse } from '../types.js';

/**
 * Execute AQL query
 */
export async function executeAQL(
  query: string,
  bindVars?: Record<string, unknown>
): Promise<AQLResponse> {
  logger.debug('Executing AQL', { query: query.substring(0, 100) });
  
  const validation = validateAQL(query);
  if (!validation.valid) {
    throw new Error(`Invalid AQL: ${validation.error}`);
  }
  
  const db = getClient();
  
  try {
    const cursor = await db.query(query, bindVars);
    const result = await cursor.all();
    const extra = cursor.extra;
    
    logger.info('AQL executed successfully', { resultCount: Array.isArray(result) ? result.length : 1 });
    
    return {
      result,
      stats: extra as unknown as Record<string, unknown>,
      warnings: extra?.warnings as Array<{ code: number; message: string }> | undefined,
    };
  } catch (error) {
    logger.error('AQL execution failed', { error });
    throw error;
  }
}

/**
 * Generate AQL from natural language description
 */
export async function generateAQLFromDescription(
  description: string
): Promise<GenerateAQLResponse> {
  logger.debug('Generating AQL', { description });
  
  const { aql, explanation } = generateAQL(description);
  
  return {
    aql,
    explanation,
  };
}

/**
 * Query by example
 */
export async function queryByExample(
  collection: string,
  example: DocumentData
): Promise<unknown[]> {
  logger.debug('Querying by example', { collection, example });
  const db = getClient();
  
  const col = db.collection(collection);
  const cursor = await col.byExample(example);
  const results = await cursor.all();
  
  logger.info('Query by example completed', { collection, count: results.length });
  
  return results;
}

/**
 * Query by range
 */
export async function queryByRange(
  collection: string,
  attribute: string,
  low: unknown,
  high: unknown
): Promise<unknown[]> {
  logger.debug('Querying by range', { collection, attribute, low, high });
  const db = getClient();
  
  const query = `FOR doc IN ${collection} FILTER doc.${attribute} >= @low && doc.${attribute} <= @high RETURN doc`;
  const cursor = await db.query(query, { low, high });
  const results = await cursor.all();
  
  logger.info('Query by range completed', { collection, attribute, count: results.length });
  
  return results;
}

/**
 * Count documents in collection
 */
export async function countDocuments(collection: string): Promise<{ count: number }> {
  logger.debug('Counting documents', { collection });
  const db = getClient();
  
  const col = db.collection(collection);
  const countResponse = await col.count();
  const count = countResponse.count ?? 0;
  
  logger.info('Document count', { collection, count });
  
  return { count };
}
