/**
 * Shared TypeScript types for MCP ArangoDB server
 */

// Collection types
export type CollectionType = 'document' | 'edge';

export interface CollectionInfo {
  id: string;
  name: string;
  type: CollectionType;
  status: number;
  isSystem: boolean;
}

export interface CreateCollectionOptions {
  name: string;
  type?: CollectionType;
}

export interface IndexInfo {
  id: string;
  type: string;
  fields: string[];
  unique?: boolean;
  sparse?: boolean;
}

// Document types
export interface DocumentData {
  [key: string]: unknown;
}

export interface DocumentResponse {
  _id: string;
  _key: string;
  _rev: string;
  [key: string]: unknown;
}

export interface CreateDocumentOptions {
  collection: string;
  data: DocumentData;
}

export interface GetDocumentOptions {
  collection: string;
  id: string;
}

export interface UpdateDocumentOptions {
  collection: string;
  id: string;
  data: Partial<DocumentData>;
}

export interface DeleteDocumentOptions {
  collection: string;
  id: string;
}

// Query types
export interface QueryByExampleOptions {
  collection: string;
  example: DocumentData;
}

export interface QueryByRangeOptions {
  collection: string;
  attribute: string;
  low: unknown;
  high: unknown;
}

export interface CountDocumentsOptions {
  collection: string;
}

export interface CountResponse {
  count: number;
}

// AQL types
export interface ExecuteAQLOptions {
  query: string;
  bindVars?: Record<string, unknown>;
}

export interface GenerateAQLOptions {
  description: string;
}

export interface AQLResponse {
  result: unknown;
  stats?: Record<string, unknown>;
  warnings?: Array<{ code: number; message: string }>;
}

export interface GenerateAQLResponse {
  aql: string;
  explanation: string;
}

// Graph types
export interface EdgeDefinition {
  collection: string;
  from: string[];
  to: string[];
}

export interface CreateGraphOptions {
  name: string;
  edgeDefinitions: EdgeDefinition[];
}

export interface GraphInfo {
  _id: string;
  _key: string;
  _rev: string;
  name: string;
  edgeDefinitions: EdgeDefinition[];
  orphanCollections: string[];
}

export interface TraverseOptions {
  graphName: string;
  startVertex: string;
  direction?: 'outbound' | 'inbound' | 'any';
  maxDepth?: number;
}

export interface TraverseResponse {
  vertices: DocumentData[];
  edges: DocumentData[];
}

export interface CreateEdgeOptions {
  collection: string;
  from: string;
  to: string;
  data?: DocumentData;
}

export interface GetEdgeOptions {
  collection: string;
  id: string;
}

// MCP Server types
export interface ServerConfig {
  arangoHost: string;
  arangoPassword: string;
  transport?: 'stdio' | 'http';
  port?: number;
}
