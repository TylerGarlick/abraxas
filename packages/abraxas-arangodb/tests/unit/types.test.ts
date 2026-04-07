/**
 * Unit tests for types
 */

import type {
  CollectionInfo,
  DocumentData,
  CreateCollectionOptions,
  EdgeDefinition,
  GraphInfo,
  TraverseOptions,
} from '../../src/types';

describe('Type definitions', () => {
  describe('CollectionInfo', () => {
    it('should accept valid collection info', () => {
      const collection: CollectionInfo = {
        id: '12345',
        name: 'users',
        type: 'document',
        status: 0,
        isSystem: false,
      };
      expect(collection.name).toBe('users');
      expect(collection.type).toBe('document');
    });

    it('should accept edge collection type', () => {
      const collection: CollectionInfo = {
        id: '12346',
        name: 'edges',
        type: 'edge',
        status: 0,
        isSystem: false,
      };
      expect(collection.type).toBe('edge');
    });
  });

  describe('DocumentData', () => {
    it('should accept document with various field types', () => {
      const doc: DocumentData = {
        _key: '123',
        name: 'John',
        age: 30,
        active: true,
        scores: [1, 2, 3],
        metadata: { role: 'admin' },
      };
      expect(doc.name).toBe('John');
      expect(doc.age).toBe(30);
      expect(doc.active).toBe(true);
    });

    it('should allow dynamic keys', () => {
      const key = 'dynamicField';
      const doc: DocumentData = {};
      doc[key] = 'value';
      expect(doc.dynamicField).toBe('value');
    });
  });

  describe('CreateCollectionOptions', () => {
    it('should accept minimal options', () => {
      const options: CreateCollectionOptions = { name: 'users' };
      expect(options.name).toBe('users');
    });

    it('should accept full options with type', () => {
      const options: CreateCollectionOptions = { 
        name: 'edges', 
        type: 'edge' 
      };
      expect(options.type).toBe('edge');
    });
  });

  describe('EdgeDefinition', () => {
    it('should accept valid edge definition', () => {
      const edgeDef: EdgeDefinition = {
        collection: 'user_edges',
        from: ['users'],
        to: ['posts'],
      };
      expect(edgeDef.collection).toBe('user_edges');
      expect(edgeDef.from).toContain('users');
      expect(edgeDef.to).toContain('posts');
    });

    it('should allow multiple from/to collections', () => {
      const edgeDef: EdgeDefinition = {
        collection: 'rels',
        from: ['users', 'groups'],
        to: ['users', 'resources'],
      };
      expect(edgeDef.from).toHaveLength(2);
      expect(edgeDef.to).toHaveLength(2);
    });
  });

  describe('GraphInfo', () => {
    it('should accept valid graph info', () => {
      const graph: GraphInfo = {
        _id: 'graphs/mygraph',
        _key: 'mygraph',
        _rev: '1-abc',
        name: 'mygraph',
        edgeDefinitions: [],
        orphanCollections: [],
      };
      expect(graph.name).toBe('mygraph');
    });

    it('should accept graph with edge definitions', () => {
      const graph: GraphInfo = {
        _id: 'graphs/test',
        _key: 'test',
        _rev: '1-xyz',
        name: 'test',
        edgeDefinitions: [
          { collection: 'e', from: ['a'], to: ['b'] },
        ],
        orphanCollections: ['orphan'],
      };
      expect(graph.edgeDefinitions).toHaveLength(1);
      expect(graph.orphanCollections).toHaveLength(1);
    });
  });

  describe('TraverseOptions', () => {
    it('should accept minimal traverse options', () => {
      const options: TraverseOptions = {
        graphName: 'mygraph',
        startVertex: 'users/123',
      };
      expect(options.graphName).toBe('mygraph');
    });

    it('should accept full traverse options', () => {
      const options: TraverseOptions = {
        graphName: 'mygraph',
        startVertex: 'users/123',
        direction: 'inbound',
        maxDepth: 5,
      };
      expect(options.direction).toBe('inbound');
      expect(options.maxDepth).toBe(5);
    });
  });
});
