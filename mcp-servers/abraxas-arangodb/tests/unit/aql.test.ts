/**
 * Unit tests for AQL generation
 */

import { 
  generateAQL, 
  validateAQL, 
  escapeAQLValue 
} from '../../src/tools/aql';

describe('AQL Generation', () => {
  describe('generateAQL', () => {
    it('should generate find query for "find in users"', () => {
      const result = generateAQL('find in users');
      expect(result.aql).toContain('FOR doc IN users');
      expect(result.aql).toContain('RETURN doc');
    });

    it('should generate find query for "get all from products"', () => {
      const result = generateAQL('get all from products');
      expect(result.aql).toContain('FOR doc IN products');
    });

    it('should extract collection name from query', () => {
      const result = generateAQL('find in orders');
      expect(result.aql).toContain('IN orders');
    });

    it('should generate count query', () => {
      const result = generateAQL('count in users');
      expect(result.aql).toContain('COUNT(FOR doc IN users RETURN 1)');
    });

    it('should generate insert query', () => {
      const result = generateAQL('insert into users');
      expect(result.aql).toContain('INSERT');
      expect(result.aql).toContain('INTO users');
    });

    it('should generate update query', () => {
      const result = generateAQL('update in users');
      expect(result.aql).toContain('UPDATE');
      expect(result.aql).toContain('IN users');
    });

    it('should generate delete query', () => {
      const result = generateAQL('delete from users');
      expect(result.aql).toContain('REMOVE');
      expect(result.aql).toContain('IN users');
    });

    it('should generate traversal query for graph mentions', () => {
      const result = generateAQL('traverse graph mygraph start at users/123');
      expect(result.aql).toContain('GRAPH "mygraph"');
      expect(result.aql).toContain('OUTBOUND');
    });

    it('should generate edge query for edge mentions', () => {
      const result = generateAQL('edge collection relationships');
      expect(result.aql).toContain('FOR edge IN');
    });

    it('should include order by clause', () => {
      const result = generateAQL('find in users order by name');
      expect(result.aql).toContain('SORT doc.name');
    });

    it('should include limit clause', () => {
      const result = generateAQL('find in users limit 10');
      expect(result.aql).toContain('LIMIT 10');
    });
  });

  describe('validateAQL', () => {
    it('should validate a correct FOR query', () => {
      const result = validateAQL('FOR doc IN users RETURN doc');
      expect(result.valid).toBe(true);
    });

    it('should validate a correct INSERT query', () => {
      const result = validateAQL('INSERT { name: "test" } INTO users RETURN NEW');
      expect(result.valid).toBe(true);
    });

    it('should reject empty query', () => {
      const result = validateAQL('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject DROP DATABASE', () => {
      const result = validateAQL('DROP DATABASE test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('disallowed');
    });

    it('should reject DROP COLLECTION', () => {
      const result = validateAQL('DROP COLLECTION users');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('disallowed');
    });

    it('should reject TRUNCATE COLLECTION', () => {
      const result = validateAQL('TRUNCATE COLLECTION users');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('disallowed');
    });

    it('should reject query not starting with valid keyword', () => {
      const result = validateAQL('blah blah blah');
      expect(result.valid).toBe(false);
    });
  });

  describe('escapeAQLValue', () => {
    it('should escape control characters from strings', () => {
      const result = escapeAQLValue('test\x00value');
      expect(result).toBe('testvalue');
    });

    it('should return numbers unchanged', () => {
      expect(escapeAQLValue(42)).toBe(42);
      expect(escapeAQLValue(3.14)).toBe(3.14);
    });

    it('should return booleans unchanged', () => {
      expect(escapeAQLValue(true)).toBe(true);
      expect(escapeAQLValue(false)).toBe(false);
    });

    it('should escape strings in arrays', () => {
      const result = escapeAQLValue(['test\x00', 'value']);
      expect(result).toEqual(['test', 'value']);
    });

    it('should escape strings in objects', () => {
      const result = escapeAQLValue({ key: 'test\x00value' });
      expect(result).toEqual({ key: 'testvalue' });
    });

    it('should handle nested objects', () => {
      const input = { 
        outer: { 
          inner: 'test\x00value' 
        } 
      };
      const result = escapeAQLValue(input);
      expect(result).toEqual({ outer: { inner: 'testvalue' } });
    });
  });
});
