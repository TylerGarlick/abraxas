/**
 * Graph management and traversal MCP tools
 */

import { getClient } from '../client.js';
import { logger } from '../logger.js';
import type { 
  EdgeDefinition, 
  GraphInfo, 
  DocumentData, 
} from '../types.js';

/**
 * Create a graph with edge definitions
 */
export async function createGraph(
  name: string,
  edgeDefinitions: EdgeDefinition[]
): Promise<GraphInfo> {
  logger.debug('Creating graph', { name, edgeDefinitions });
  const db = getClient();
  
  const graph = db.graph(name);
  const result = await graph.create(edgeDefinitions);
  
  logger.info('Graph created', { name });
  
  return {
    _id: result._id,
    _key: result._key,
    _rev: result._rev,
    name: result.name,
    edgeDefinitions: result.edgeDefinitions,
    orphanCollections: result.orphanCollections,
  };
}

/**
 * List all graphs
 */
export async function listGraphs(): Promise<GraphInfo[]> {
  logger.debug('Listing graphs');
  const db = getClient();
  
  const graphs = await db.graphs();
  
  const result: GraphInfo[] = [];
  for (const g of graphs) {
    const info = await g.get();
    result.push({
      _id: info._id,
      _key: info._key,
      _rev: info._rev,
      name: info.name,
      edgeDefinitions: info.edgeDefinitions,
      orphanCollections: info.orphanCollections,
    });
  }
  
  return result;
}

/**
 * Get graph info
 */
export async function getGraph(name: string): Promise<GraphInfo | null> {
  logger.debug('Getting graph', { name });
  const db = getClient();
  
  try {
    const graph = db.graph(name);
    const info = await graph.get();
    
    return {
      _id: info._id,
      _key: info._key,
      _rev: info._rev,
      name: info.name,
      edgeDefinitions: info.edgeDefinitions,
      orphanCollections: info.orphanCollections,
    };
  } catch {
    logger.warn('Graph not found', { name });
    return null;
  }
}

/**
 * Delete a graph
 */
export async function deleteGraph(name: string): Promise<{ deleted: boolean }> {
  logger.debug('Deleting graph', { name });
  const db = getClient();
  
  try {
    const graph = db.graph(name);
    await graph.drop();
    logger.info('Graph deleted', { name });
    return { deleted: true };
  } catch (error) {
    logger.error('Failed to delete graph', { name, error });
    return { deleted: false };
  }
}

/**
 * Traverse a graph from a start vertex
 */
export async function traverseGraph(
  graphName: string,
  startVertex: string,
  direction: 'outbound' | 'inbound' | 'any' = 'outbound',
  maxDepth: number = 3
): Promise<{ vertices: DocumentData[]; edges: DocumentData[] }> {
  logger.debug('Traversing graph', { graphName, startVertex, direction, maxDepth });
  
  const db = getClient();
  
  // Use AQL traversal instead of graph.traverse
  const query = `
    FOR vertex, edge IN 1..${maxDepth} ${direction.toUpperCase()} "${startVertex}"
    GRAPH "${graphName}"
    RETURN { vertex, edge }
  `;
  
  const cursor = await db.query(query);
  const results = await cursor.all();
  
  logger.info('Graph traversal completed', { graphName, startVertex });
  
  // Extract vertices and edges from traversal result
  const vertices: DocumentData[] = [];
  const edges: DocumentData[] = [];
  
  for (const item of results) {
    if (item && typeof item === 'object') {
      const res = item as { vertex?: DocumentData; edge?: DocumentData };
      if (res.vertex) {
        vertices.push(res.vertex);
      }
      if (res.edge) {
        edges.push(res.edge);
      }
    }
  }
  
  return { vertices, edges };
}

/**
 * Create an edge collection
 */
export async function createEdgeCollection(name: string): Promise<{ name: string; type: string }> {
  logger.debug('Creating edge collection', { name });
  const db = getClient();
  
  const result = await db.createCollection(name, { type: 3 }); // 3 = edge collection
  
  logger.info('Edge collection created', { name });
  
  return { name: result.name, type: 'edge' };
}

/**
 * Create an edge document
 */
export async function createEdge(
  collection: string,
  from: string,
  to: string,
  data: DocumentData = {}
): Promise<DocumentData> {
  logger.debug('Creating edge', { collection, from, to });
  const db = getClient();
  
  const col = db.collection(collection);
  const edgeData = {
    _from: from,
    _to: to,
    ...data,
  };
  
  const result = await col.save(edgeData);
  
  logger.info('Edge created', { collection, from, to });
  
  return result;
}

/**
 * Get an edge by ID
 */
export async function getEdge(
  collection: string,
  id: string
): Promise<DocumentData | null> {
  logger.debug('Getting edge', { collection, id });
  const db = getClient();
  
  try {
    const col = db.collection(collection);
    const edge = await (col as any).edge(id);
    return edge as DocumentData;
  } catch {
    logger.warn('Edge not found', { collection, id });
    return null;
  }
}
