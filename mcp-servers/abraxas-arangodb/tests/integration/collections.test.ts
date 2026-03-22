/**
 * Integration tests for collection tools
 * Requires real ArangoDB connection
 */

import { getClient, createClient } from '../../src/client';

describe('Collection Integration Tests', () => {
  const TEST_COLLECTION = 'test_collection_integration';
  
  beforeAll(async () => {
    createClient();
  });
  
  afterEach(async () => {
    // Clean up test collection
    const db = getClient();
    try {
      const col = db.collection(TEST_COLLECTION);
      await col.drop();
    } catch {
      // Collection might not exist
    }
  });
  
  describe('listCollections', () => {
    it('should list collections without error', async () => {
      const { listCollections } = await import('../../src/tools/collections');
      const collections = await listCollections();
      expect(Array.isArray(collections)).toBe(true);
    });
  });
  
  describe('createCollection', () => {
    it('should create a document collection', async () => {
      const { createCollection, deleteCollection } = await import('../../src/tools/collections');
      
      const collection = await createCollection(TEST_COLLECTION, 'document');
      expect(collection.name).toBe(TEST_COLLECTION);
      expect(collection.type).toBe('document');
      
      await deleteCollection(TEST_COLLECTION);
    });
    
    it('should create an edge collection', async () => {
      const { createCollection, deleteCollection, getCollection } = await import('../../src/tools/collections');
      
      await createCollection(TEST_COLLECTION, 'edge');
      const collection = await getCollection(TEST_COLLECTION);
      expect(collection?.type).toBe('edge');
      
      await deleteCollection(TEST_COLLECTION);
    });
  });
  
  describe('getCollection', () => {
    it('should return collection info for existing collection', async () => {
      const { createCollection, getCollection, deleteCollection } = await import('../../src/tools/collections');
      
      await createCollection(TEST_COLLECTION);
      const collection = await getCollection(TEST_COLLECTION);
      
      expect(collection).not.toBeNull();
      expect(collection?.name).toBe(TEST_COLLECTION);
      
      await deleteCollection(TEST_COLLECTION);
    });
    
    it('should return null for non-existent collection', async () => {
      const { getCollection } = await import('../../src/tools/collections');
      const collection = await getCollection('non_existent_collection_xyz');
      expect(collection).toBeNull();
    });
  });
  
  describe('deleteCollection', () => {
    it('should delete an existing collection', async () => {
      const { createCollection, deleteCollection, getCollection } = await import('../../src/tools/collections');
      
      await createCollection(TEST_COLLECTION);
      const result = await deleteCollection(TEST_COLLECTION);
      
      expect(result.deleted).toBe(true);
      
      const collection = await getCollection(TEST_COLLECTION);
      expect(collection).toBeNull();
    });
  });
  
  describe('getCollectionIndexes', () => {
    it('should return indexes for a collection', async () => {
      const { createCollection, getCollectionIndexes, deleteCollection } = await import('../../src/tools/collections');
      
      await createCollection(TEST_COLLECTION);
      const indexes = await getCollectionIndexes(TEST_COLLECTION);
      
      expect(Array.isArray(indexes)).toBe(true);
      // Primary index always exists
      expect(indexes.length).toBeGreaterThan(0);
      
      await deleteCollection(TEST_COLLECTION);
    });
  });
});
