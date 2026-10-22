
import { z } from 'zod';
import { defineTool, type ToolModule } from './helpers.ts';
import { 
  listCollections, 
  createCollection, 
  getCollection, 
  deleteCollection, 
  getCollectionIndexes 
} from './collections.js';
import { 
  generateAQL 
} from './aql.js';
import { getClient } from '../arangodb_client.ts';
import { 
  createDocument, 
  getDocument, 
  updateDocument, 
  replaceDocument, 
  deleteDocument 
} from './documents.js';
import { 
  createGraph, 
  listGraphs, 
  getGraph, 
  deleteGraph, 
  traverseGraph, 
  createEdgeCollection, 
  createEdge, 
  getEdge 
} from './graphs.js';
import { 
  queryByExample, 
  queryByRange, 
  countDocuments 
} from './queries.js';
import type { CollectionType } from '../arangodb_types.ts';

export const arangoDbTools: ToolModule = {
  name: 'arangodb',
  register(server, ctx) {
    // Collections
    defineTool(server, ctx, 'arangodb_list_collections', 'List all ArangoDB collections', 
      {}, 
      async () => await listCollections()
    );
    defineTool(server, ctx, 'arangodb_create_collection', 'Create a new ArangoDB collection', 
      { name: z.string(), type: z.enum(['document', 'edge']).optional().default('document') }, 
      async ({ name, type }) => await createCollection(name, type)
    );
    defineTool(server, ctx, 'arangodb_get_collection', 'Get information about a specific collection', 
      { name: z.string() }, 
      async ({ name }) => await getCollection(name)
    );
    defineTool(server, ctx, 'arangodb_delete_collection', 'Delete a collection', 
      { name: z.string() }, 
      async ({ name }) => await deleteCollection(name)
    );

    // Documents
    defineTool(server, ctx, 'arangodb_create_document', 'Create a document in a collection', 
      { collection: z.string(), document: z.any() }, 
      async ({ collection, document }) => await createDocument(collection, document)
    );
    defineTool(server, ctx, 'arangodb_get_document', 'Get a document by ID', 
      { collection: z.string(), id: z.string() }, 
      async ({ collection, id }) => await getDocument(collection, id)
    );

    // AQL
    defineTool(server, ctx, 'arangodb_execute_aql', 'Execute a raw AQL query', 
      { query: z.string(), bindVars: z.record(z.any()).optional() }, 
      async ({ query, bindVars }) => {
        const db = getClient();
        return await db.query(query, bindVars);
      }
    );

    // Graphs
    defineTool(server, ctx, 'arangodb_traverse_graph', 'Execute a graph traversal', 
      { 
        graphName: z.string(), 
        startVertex: z.string(), 
        direction: z.enum(['inbound', 'outbound', 'any']).default('any'),
        minDepth: z.number().optional().default(1),
        maxDepth: z.number().optional().default(1),
      }, 
      async ({ graphName, startVertex, direction, minDepth, maxDepth }) => 
        await traverseGraph(graphName, startVertex, direction, minDepth, maxDepth)
    );
  }
};
