/**
 * Integration tests for graph tools
 * Requires real ArangoDB connection
 */

import { getClient, createClient } from '../../src/client';

describe('Graph Integration Tests', () => {
  const TEST_GRAPH = 'test_graph';
  const EDGE_COLLECTION = 'test_edges';
  const VERTEX_COLLECTION = 'test_vertices';
  
  beforeAll(async () => {
    createClient();
  });
  
  afterEach(async () => {
    const db = getClient();
    try {
      const graph = db.graph(TEST_GRAPH);
      await graph.drop();
    } catch {
      // Graph might not exist
    }
    
    try {
      const col = db.collection(EDGE_COLLECTION);
      await col.drop();
    } catch {
      // Ignore
    }
    
    try {
      const col = db.collection(VERTEX_COLLECTION);
      await col.drop();
    } catch {
      // Ignore
    }
  });
  
  describe('createGraph', () => {
    it('should create a graph', async () => {
      const { createGraph, deleteGraph } = await import('../../src/tools/graphs');
      
      const graph = await createGraph(TEST_GRAPH, [
        {
          collection: EDGE_COLLECTION,
          from: [VERTEX_COLLECTION],
          to: [VERTEX_COLLECTION],
        },
      ]);
      
      expect(graph.name).toBe(TEST_GRAPH);
      expect(graph.edgeDefinitions).toHaveLength(1);
      
      await deleteGraph(TEST_GRAPH);
    });
  });
  
  describe('listGraphs', () => {
    it('should list graphs', async () => {
      const { createGraph, listGraphs, deleteGraph } = await import('../../src/tools/graphs');
      
      await createGraph(TEST_GRAPH, [
        {
          collection: EDGE_COLLECTION,
          from: [VERTEX_COLLECTION],
          to: [VERTEX_COLLECTION],
        },
      ]);
      
      const graphs = await listGraphs();
      expect(Array.isArray(graphs)).toBe(true);
      expect(graphs.some((g) => g.name === TEST_GRAPH)).toBe(true);
      
      await deleteGraph(TEST_GRAPH);
    });
  });
  
  describe('getGraph', () => {
    it('should get graph info', async () => {
      const { createGraph, getGraph, deleteGraph } = await import('../../src/tools/graphs');
      
      await createGraph(TEST_GRAPH, [
        {
          collection: EDGE_COLLECTION,
          from: [VERTEX_COLLECTION],
          to: [VERTEX_COLLECTION],
        },
      ]);
      
      const graph = await getGraph(TEST_GRAPH);
      expect(graph).not.toBeNull();
      expect(graph?.name).toBe(TEST_GRAPH);
      
      await deleteGraph(TEST_GRAPH);
    });
    
    it('should return null for non-existent graph', async () => {
      const { getGraph } = await import('../../src/tools/graphs');
      const graph = await getGraph('non_existent_graph');
      expect(graph).toBeNull();
    });
  });
  
  describe('deleteGraph', () => {
    it('should delete a graph', async () => {
      const { createGraph, deleteGraph, getGraph } = await import('../../src/tools/graphs');
      
      await createGraph(TEST_GRAPH, [
        {
          collection: EDGE_COLLECTION,
          from: [VERTEX_COLLECTION],
          to: [VERTEX_COLLECTION],
        },
      ]);
      
      const result = await deleteGraph(TEST_GRAPH);
      expect(result.deleted).toBe(true);
      
      const graph = await getGraph(TEST_GRAPH);
      expect(graph).toBeNull();
    });
  });
  
  describe('createEdgeCollection', () => {
    it('should create an edge collection', async () => {
      const { createEdgeCollection, deleteCollection } = await import('../../src/tools/graphs');
      
      const result = await createEdgeCollection(EDGE_COLLECTION);
      expect(result.name).toBe(EDGE_COLLECTION);
      expect(result.type).toBe('edge');
      
      await deleteCollection(EDGE_COLLECTION);
    });
  });
  
  describe('createEdge and getEdge', () => {
    it('should create and retrieve an edge', async () => {
      const { createEdgeCollection } = await import('../../src/tools/graphs');
      const { createEdge, getEdge, deleteCollection } = await import('../../src/tools/graphs');
      const { createDocument } = await import('../../src/tools/documents');
      
      await createEdgeCollection(EDGE_COLLECTION);
      
      // Create vertices first
      const v1 = await createDocument(VERTEX_COLLECTION, { name: 'v1' });
      const v2 = await createDocument(VERTEX_COLLECTION, { name: 'v2' });
      
      // Create edge
      const edge = await createEdge(
        EDGE_COLLECTION,
        v1._id,
        v2._id,
        { label: 'connects' }
      );
      
      expect(edge._from).toBe(v1._id);
      expect(edge._to).toBe(v2._id);
      
      // Retrieve edge
      const retrieved = await getEdge(EDGE_COLLECTION, (edge as { _id: string })._id);
      expect(retrieved).not.toBeNull();
      expect((retrieved as { _from: string })._from).toBe(v1._id);
      
      // Cleanup
      await deleteCollection(EDGE_COLLECTION);
      await deleteCollection(VERTEX_COLLECTION);
    });
  });
  
  describe('traverseGraph', () => {
    it('should traverse a graph', async () => {
      const { createGraph, createEdgeCollection } = await import('../../src/tools/graphs');
      const { createDocument } = await import('../../src/tools/documents');
      const { traverseGraph, deleteGraph } = await import('../../src/tools/graphs');
      
      await createEdgeCollection(EDGE_COLLECTION);
      
      const v1 = await createDocument(VERTEX_COLLECTION, { name: 'start' });
      const v2 = await createDocument(VERTEX_COLLECTION, { name: 'end' });
      
      await createGraph(TEST_GRAPH, [
        {
          collection: EDGE_COLLECTION,
          from: [VERTEX_COLLECTION],
          to: [VERTEX_COLLECTION],
        },
      ]);
      
      // Create edge
      const { createEdge } = await import('../../src/tools/graphs');
      await createEdge(EDGE_COLLECTION, v1._id, v2._id);
      
      // Traverse
      const result = await traverseGraph(TEST_GRAPH, v1._id, 'outbound', 2);
      
      expect(result.vertices).toBeDefined();
      expect(result.edges).toBeDefined();
      
      await deleteGraph(TEST_GRAPH);
    });
  });
});
