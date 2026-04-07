/**
 * MCP ArangoDB Server - StdIO Transport
 * 
 * This is the main entry point for the stdio transport.
 * All JSON-RPC communication happens via stdin/stdout.
 * Logging goes to stderr.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from './logger.js';
import * as collections from './tools/collections.js';
import * as documents from './tools/documents.js';
import * as queries from './tools/queries.js';
import * as graphs from './tools/graphs.js';
import type { CollectionType } from './types.js';

// Initialize the server
const server = new Server(
  {
    name: 'mcp-arangodb',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions for MCP
const tools = [
  // Collections
  {
    name: 'list_collections',
    description: 'List all collections in the database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_collection',
    description: 'Create a new collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
        type: { 
          type: 'string', 
          enum: ['document', 'edge'],
          description: 'Collection type (default: document)' 
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_collection',
    description: 'Get information about a specific collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_collection',
    description: 'Delete a collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_collection_indexes',
    description: 'Get all indexes for a collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
      },
      required: ['name'],
    },
  },

  // Documents
  {
    name: 'create_document',
    description: 'Create a new document in a collection',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        data: { type: 'object', description: 'Document data' },
      },
      required: ['collection', 'data'],
    },
  },
  {
    name: 'get_document',
    description: 'Get a document by ID',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        id: { type: 'string', description: 'Document ID (_id value)' },
      },
      required: ['collection', 'id'],
    },
  },
  {
    name: 'update_document',
    description: 'Update a document (partial update)',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        id: { type: 'string', description: 'Document ID' },
        data: { type: 'object', description: 'Partial document data to update' },
      },
      required: ['collection', 'id', 'data'],
    },
  },
  {
    name: 'replace_document',
    description: 'Replace a document entirely',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        id: { type: 'string', description: 'Document ID' },
        data: { type: 'object', description: 'Full document data to replace' },
      },
      required: ['collection', 'id', 'data'],
    },
  },
  {
    name: 'delete_document',
    description: 'Delete a document by ID',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        id: { type: 'string', description: 'Document ID' },
      },
      required: ['collection', 'id'],
    },
  },

  // Queries
  {
    name: 'query_by_example',
    description: 'Find documents matching an example object',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        example: { type: 'object', description: 'Example object to match' },
      },
      required: ['collection', 'example'],
    },
  },
  {
    name: 'query_by_range',
    description: 'Find documents within a range of values for an attribute',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        attribute: { type: 'string', description: 'Attribute to query' },
        low: { description: 'Low value of range' },
        high: { description: 'High value of range' },
      },
      required: ['collection', 'attribute', 'low', 'high'],
    },
  },
  {
    name: 'count_documents',
    description: 'Count documents in a collection',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
      },
      required: ['collection'],
    },
  },
  {
    name: 'execute_aql',
    description: 'Execute an AQL query string',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'AQL query string' },
        bindVars: { 
          type: 'object', 
          description: 'Bind variables for the query',
          additionalProperties: true,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'generate_aql',
    description: 'Generate AQL from a natural language description (does not execute)',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Natural language description of the desired query' },
      },
      required: ['description'],
    },
  },

  // Graphs
  {
    name: 'create_graph',
    description: 'Create a named graph with edge definitions',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Graph name' },
        edgeDefinitions: {
          type: 'array',
          description: 'Edge definitions specifying collections and vertex collections',
          items: {
            type: 'object',
            properties: {
              collection: { type: 'string' },
              from: { type: 'array', items: { type: 'string' } },
              to: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      required: ['name', 'edgeDefinitions'],
    },
  },
  {
    name: 'list_graphs',
    description: 'List all graphs',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_graph',
    description: 'Get information about a specific graph',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Graph name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_graph',
    description: 'Delete a graph',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Graph name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'traverse_graph',
    description: 'Execute a graph traversal from a start vertex',
    inputSchema: {
      type: 'object',
      properties: {
        graphName: { type: 'string', description: 'Graph name' },
        startVertex: { type: 'string', description: 'Start vertex ID' },
        direction: {
          type: 'string',
          enum: ['outbound', 'inbound', 'any'],
          description: 'Traversal direction (default: outbound)',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum traversal depth (default: 3)',
        },
      },
      required: ['graphName', 'startVertex'],
    },
  },
  {
    name: 'create_edge_collection',
    description: 'Create an edge collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Edge collection name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_edge',
    description: 'Create an edge document',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Edge collection name' },
        from: { type: 'string', description: 'Source vertex ID (_id)' },
        to: { type: 'string', description: 'Target vertex ID (_id)' },
        data: { type: 'object', description: 'Additional edge data' },
      },
      required: ['collection', 'from', 'to'],
    },
  },
  {
    name: 'get_edge',
    description: 'Get an edge by ID',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Edge collection name' },
        id: { type: 'string', description: 'Edge ID' },
      },
      required: ['collection', 'id'],
    },
  },
];

// Register the list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Listing tools');
  return { tools };
});

// Register the call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params as { name: string; arguments: Record<string, unknown> };
  
  logger.info('Tool called', { name, args: JSON.stringify(args).substring(0, 200) });
  
  try {
    let result: unknown;
    
    switch (name) {
      // Collections
      case 'list_collections':
        result = await collections.listCollections();
        break;
      case 'create_collection':
        result = await collections.createCollection(args.name as string, args.type as CollectionType | undefined);
        break;
      case 'get_collection':
        result = await collections.getCollection(args.name as string);
        break;
      case 'delete_collection':
        result = await collections.deleteCollection(args.name as string);
        break;
      case 'get_collection_indexes':
        result = await collections.getCollectionIndexes(args.name as string);
        break;
      
      // Documents
      case 'create_document':
        result = await documents.createDocument(args.collection as string, args.data as Record<string, unknown>);
        break;
      case 'get_document':
        result = await documents.getDocument(args.collection as string, args.id as string);
        break;
      case 'update_document':
        result = await documents.updateDocument(args.collection as string, args.id as string, args.data as Record<string, unknown>);
        break;
      case 'replace_document':
        result = await documents.replaceDocument(args.collection as string, args.id as string, args.data as Record<string, unknown>);
        break;
      case 'delete_document':
        result = await documents.deleteDocument(args.collection as string, args.id as string);
        break;
      
      // Queries
      case 'query_by_example':
        result = await queries.queryByExample(args.collection as string, args.example as Record<string, unknown>);
        break;
      case 'query_by_range':
        result = await queries.queryByRange(args.collection as string, args.attribute as string, args.low, args.high);
        break;
      case 'count_documents':
        result = await queries.countDocuments(args.collection as string);
        break;
      case 'execute_aql':
        result = await queries.executeAQL(args.query as string, args.bindVars as Record<string, unknown> | undefined);
        break;
      case 'generate_aql':
        result = await queries.generateAQLFromDescription(args.description as string);
        break;
      
      // Graphs
      case 'create_graph':
        result = await graphs.createGraph(args.name as string, args.edgeDefinitions as Array<{ collection: string; from: string[]; to: string[] }>);
        break;
      case 'list_graphs':
        result = await graphs.listGraphs();
        break;
      case 'get_graph':
        result = await graphs.getGraph(args.name as string);
        break;
      case 'delete_graph':
        result = await graphs.deleteGraph(args.name as string);
        break;
      case 'traverse_graph':
        result = await graphs.traverseGraph(
          args.graphName as string,
          args.startVertex as string,
          args.direction as 'outbound' | 'inbound' | 'any' | undefined,
          args.maxDepth as number | undefined
        );
        break;
      case 'create_edge_collection':
        result = await graphs.createEdgeCollection(args.name as string);
        break;
      case 'create_edge':
        result = await graphs.createEdge(
          args.collection as string,
          args.from as string,
          args.to as string,
          args.data as Record<string, unknown> | undefined
        );
        break;
      case 'get_edge':
        result = await graphs.getEdge(args.collection as string, args.id as string);
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    logger.error('Tool execution failed', { name, error });
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  logger.info('Starting MCP ArangoDB server (stdio transport)');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('MCP ArangoDB server connected');
}

main().catch((error) => {
  logger.error('Server failed to start', { error });
  process.exit(1);
});
