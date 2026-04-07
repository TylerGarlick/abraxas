/**
 * Integration tests for query tools
 * Requires real ArangoDB connection
 */

import { getClient, createClient } from '../../src/client';

describe('Query Integration Tests', () => {
  const TEST_COLLECTION = 'test_queries';
  
  beforeAll(async () => {
    createClient();
  });
  
  beforeEach(async () => {
    // Ensure test collection exists and has data
    const db = getClient();
    try {
      await db.createCollection(TEST_COLLECTION, { type: 2 });
    } catch {
      // Collection might already exist
    }
    
    // Insert test documents
    const col = db.collection(TEST_COLLECTION);
    await col.truncate();
    await col.save({ name: 'Alice', age: 30, city: 'NYC' });
    await col.save({ name: 'Bob', age: 25, city: 'LA' });
    await col.save({ name: 'Charlie', age: 35, city: 'NYC' });
  });
  
  afterAll(async () => {
    const db = getClient();
    try {
      const col = db.collection(TEST_COLLECTION);
      await col.drop();
    } catch {
      // Ignore
    }
  });
  
  describe('queryByExample', () => {
    it('should find documents matching example', async () => {
      const { queryByExample } = await import('../../src/tools/queries');
      
      const results = await queryByExample(TEST_COLLECTION, { city: 'NYC' });
      
      expect(results).toHaveLength(2);
      expect(results.map((r: { name: string }) => r.name).sort()).toEqual(['Alice', 'Charlie']);
    });
    
    it('should return empty array for no matches', async () => {
      const { queryByExample } = await import('../../src/tools/queries');
      
      const results = await queryByExample(TEST_COLLECTION, { city: 'NonExistent' });
      
      expect(results).toHaveLength(0);
    });
  });
  
  describe('queryByRange', () => {
    it('should find documents within range', async () => {
      const { queryByRange } = await import('../../src/tools/queries');
      
      const results = await queryByRange(TEST_COLLECTION, 'age', 25, 32);
      
      expect(results).toHaveLength(2);
      expect(results.map((r: { name: string }) => r.name).sort()).toEqual(['Alice', 'Bob']);
    });
  });
  
  describe('countDocuments', () => {
    it('should count documents in collection', async () => {
      const { countDocuments } = await import('../../src/tools/queries');
      
      const result = await countDocuments(TEST_COLLECTION);
      
      expect(result.count).toBe(3);
    });
  });
  
  describe('executeAQL', () => {
    it('should execute AQL query', async () => {
      const { executeAQL } = await import('../../src/tools/queries');
      
      const result = await executeAQL(
        'FOR doc IN @@collection FILTER doc.city == @city RETURN doc',
        { '@collection': TEST_COLLECTION, city: 'NYC' }
      );
      
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result).toHaveLength(2);
    });
    
    it('should reject invalid AQL', async () => {
      const { executeAQL } = await import('../../src/tools/queries');
      
      await expect(executeAQL('INVALID QUERY')).rejects.toThrow();
    });
    
    it('should reject dangerous AQL', async () => {
      const { executeAQL } = await import('../../src/tools/queries');
      
      await expect(executeAQL('DROP COLLECTION test')).rejects.toThrow();
    });
  });
  
  describe('generateAQL', () => {
    it('should generate AQL from description', async () => {
      const { generateAQLFromDescription } = await import('../../src/tools/queries');
      
      const result = await generateAQLFromDescription('find in users');
      
      expect(result.aql).toContain('FOR doc IN users');
      expect(result.explanation).toBeTruthy();
    });
  });
});
