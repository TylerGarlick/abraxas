/**
 * Integration tests for document tools
 * Requires real ArangoDB connection
 */

import { getClient, createClient } from '../../src/client';

describe('Document Integration Tests', () => {
  const TEST_COLLECTION = 'test_documents';
  
  beforeAll(async () => {
    createClient();
  });
  
  beforeEach(async () => {
    // Ensure test collection exists
    const db = getClient();
    try {
      await db.createCollection(TEST_COLLECTION, { type: 2 });
    } catch {
      // Collection might already exist
    }
  });
  
  afterEach(async () => {
    // Clean up test collection
    const db = getClient();
    try {
      const col = db.collection(TEST_COLLECTION);
      await col.truncate();
    } catch {
      // Collection might not exist
    }
  });
  
  afterAll(async () => {
    const db = getClient();
    try {
      const col = db.collection(TEST_COLLECTION);
      await col.drop();
    } catch {
      // Ignore cleanup errors
    }
  });
  
  describe('createDocument', () => {
    it('should create a document', async () => {
      const { createDocument } = await import('../../src/tools/documents');
      
      const doc = await createDocument(TEST_COLLECTION, {
        name: 'John Doe',
        email: 'john@example.com',
      });
      
      expect(doc._id).toBeDefined();
      expect(doc._key).toBeDefined();
      expect(doc.name).toBe('John Doe');
    });
  });
  
  describe('getDocument', () => {
    it('should get an existing document', async () => {
      const { createDocument, getDocument } = await import('../../src/tools/documents');
      
      const created = await createDocument(TEST_COLLECTION, {
        name: 'Jane Doe',
      });
      
      const retrieved = await getDocument(TEST_COLLECTION, created._id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Jane Doe');
    });
    
    it('should return null for non-existent document', async () => {
      const { getDocument } = await import('../../src/tools/documents');
      const doc = await getDocument(TEST_COLLECTION, 'non_existent/key');
      expect(doc).toBeNull();
    });
  });
  
  describe('updateDocument', () => {
    it('should update a document', async () => {
      const { createDocument, updateDocument, getDocument } = await import('../../src/tools/documents');
      
      const created = await createDocument(TEST_COLLECTION, {
        name: 'Original',
        value: 1,
      });
      
      const updated = await updateDocument(TEST_COLLECTION, created._id, {
        name: 'Updated',
        value: 2,
      });
      
      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated');
      
      // Verify with get
      const retrieved = await getDocument(TEST_COLLECTION, created._id);
      expect(retrieved?.name).toBe('Updated');
    });
  });
  
  describe('replaceDocument', () => {
    it('should replace a document entirely', async () => {
      const { createDocument, replaceDocument, getDocument } = await import('../../src/tools/documents');
      
      const created = await createDocument(TEST_COLLECTION, {
        name: 'Original',
        oldField: 'should be gone',
      });
      
      const replaced = await replaceDocument(TEST_COLLECTION, created._id, {
        name: 'Replaced',
        newField: 'new value',
      });
      
      expect(replaced?.name).toBe('Replaced');
      
      // Verify old field is gone
      const retrieved = await getDocument(TEST_COLLECTION, created._id);
      expect(retrieved?.oldField).toBeUndefined();
      expect(retrieved?.newField).toBe('new value');
    });
  });
  
  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      const { createDocument, deleteDocument, getDocument } = await import('../../src/tools/documents');
      
      const created = await createDocument(TEST_COLLECTION, { name: 'ToDelete' });
      
      const result = await deleteDocument(TEST_COLLECTION, created._id);
      expect(result.deleted).toBe(true);
      
      const retrieved = await getDocument(TEST_COLLECTION, created._id);
      expect(retrieved).toBeNull();
    });
  });
});
