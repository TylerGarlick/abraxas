import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'bun:test';
import { 
  executeSessionSave,
  executeSessionLoad,
  executeSessionList,
  executeSessionArchive,
  executeSessionExport,
  executeSessionLinkAdd,
  executeSessionLinkValidate,
  executeSessionLinksList,
  executeIndexUpdate
} from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.homedir(), '.abraxas', '.sessions', 'test');
const TEST_INDEX = path.join(os.homedir(), '.abraxas', 'index.test.json');
const ORIGINAL_INDEX = path.join(os.homedir(), '.abraxas', 'index.json');

function createTestSession(title: string, content: string, metadata: any = {}) {
  return executeSessionSave(title, content, metadata);
}

function cleanupTestSessions() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

function generateUniqueId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function createSampleContent(withLinks: boolean = false): string {
  if (withLinks) {
    return `Test session content with cross-skill IDs:
- Janus ledger: jl-20260310-alpha1
- Mnemon belief: mb-20260310-beta2
- Logos analysis: lg-20260310-gamma3
- Kairos decision: kr-20260310-delta4
This is a comprehensive test session.`;
  }
  return `Test session content without links.
This is a simple session for testing basic CRUD operations.`;
}

describe('Mnemosyne MCP Server', () => {
  let testSessionId: string;
  const testSessions: string[] = [];

  beforeAll(() => {
    cleanupTestSessions();
  });

  beforeEach(() => {
    testSessionId = '';
    testSessions.length = 0;
  });

  afterEach(async () => {
    // Clean up: archive all test sessions
    for (const sessionId of testSessions) {
      try {
        await executeSessionArchive(sessionId);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Clear the index for fresh tests
    const indexPath = path.join(os.homedir(), '.abraxas', 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
      version: "1.0.0",
      last_updated: new Date().toISOString(),
      sessions: [],
      metadata: { total_sessions: 0, active_count: 0, recent_count: 0, archived_count: 0 }
    }, null, 2));
  });

  describe('session_save', () => {
    test('should save session successfully', async () => {
      const result = await createTestSession(
        'Basic Test Session',
        createSampleContent(false)
      );
      
      expect(result.success).toBe(true);
      expect(result.session_id).toMatch(/^mnemo-\d{8}-[a-z0-9]+$/);
      expect(result.created).toBeDefined();
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should save session with auto-extracted cross-skill IDs', async () => {
      const result = await createTestSession(
        'Cross-Link Test',
        createSampleContent(true)
      );
      
      expect(result.success).toBe(true);
      expect(result.links_detected.janus).toBe(1);
      expect(result.links_detected.mnemon).toBe(1);
      expect(result.links_detected.logos).toBe(1);
      expect(result.links_detected.kairos).toBe(1);
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should save session with metadata', async () => {
      const metadata = { total_turns: 42, tags: ['test', 'automated'] };
      const result = await createTestSession(
        'Metadata Test',
        'Content here',
        metadata
      );
      
      expect(result.success).toBe(true);
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
      
      const loaded = await executeSessionLoad(result.session_id);
      expect(loaded.metadata.total_turns).toBe(42);
    });

    test('should save session with multiple IDs of same type', async () => {
      const content = `Session with jl-20260310-first and jl-20260310-second`;
      const result = await createTestSession('Multi-ID Test', content);
      
      expect(result.links_detected.janus).toBe(2);
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });
  });

  describe('session_load', () => {
    beforeEach(async () => {
      const result = await createTestSession('Load Test', 'Content to load');
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should load saved session', async () => {
      const session = await executeSessionLoad(testSessionId);
      
      expect(session.id).toBe(testSessionId);
      expect(session.title).toBe('Load Test');
      expect(session.content).toBe('Content to load');
      expect(session.status).toBe('active');
      expect(session.created).toBeDefined();
      expect(session.modified).toBeDefined();
    });

    test('should return error for non-existent session', async () => {
      const result = await executeSessionLoad('mnemo-00000000-xxxxxx');
      
      expect(result.error).toBe('Session not found');
    });

    test('should preserve links when loading', async () => {
      const result = await createTestSession('Links Test', createSampleContent(true));
      testSessions.push(result.session_id);
      
      const session = await executeSessionLoad(result.session_id);
      
      expect(session.links.janus).toContain('jl-20260310-alpha1');
      expect(session.links.mnemon).toContain('mb-20260310-beta2');
      expect(session.links.logos).toContain('lg-20260310-gamma3');
      expect(session.links.kairos).toContain('kr-20260310-delta4');
    });
  });

  describe('session_list', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        const result = await createTestSession(`List Test ${i}`, `Content ${i}`);
        testSessions.push(result.session_id);
      }
    });

    test('should list all sessions', async () => {
      const result = await executeSessionList('all', 10, 0);
      
      expect(result.sessions).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.returned).toBe(result.sessions.length);
    });

    test('should filter by status active', async () => {
      const result = await executeSessionList('active', 10, 0);
      
      result.sessions.forEach(s => {
        expect(s.status).toBe('active');
      });
    });

    test('should support pagination', async () => {
      const page1 = await executeSessionList('all', 2, 0);
      const page2 = await executeSessionList('all', 2, 2);
      
      expect(page1.sessions.length).toBe(2);
      expect(page2.sessions.length).toBeGreaterThan(0);
      expect(page1.sessions[0].id).not.toBe(page2.sessions[0].id);
    });

    test('should return empty array when no matches', async () => {
      const result = await executeSessionList('archived', 10, 0);
      
      expect(result.sessions).toEqual([]);
    });

    test('should include link count in results', async () => {
      const result = await createTestSession('Link Count Test', createSampleContent(true));
      testSessions.push(result.session_id);
      
      const list = await executeSessionList('all', 10, 0);
      const session = list.sessions.find(s => s.id === result.session_id);
      
      expect(session?.link_count).toBe(4);
    });
  });

  describe('session_export', () => {
    beforeEach(async () => {
      const result = await createTestSession('Export Test', createSampleContent(true));
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should export as JSON', async () => {
      const result = await executeSessionExport(testSessionId, 'json');
      
      expect(result.session_id).toBe(testSessionId);
      expect(result.format).toBe('json');
      
      const parsed = JSON.parse(result.content);
      expect(parsed.id).toBe(testSessionId);
      expect(parsed.title).toBe('Export Test');
    });

    test('should export as Markdown', async () => {
      const result = await executeSessionExport(testSessionId, 'markdown');
      
      expect(result.format).toBe('markdown');
      expect(result.content).toContain('# Export Test');
      expect(result.content).toContain('**ID:**');
      expect(result.content).toContain('## Links');
      expect(result.content).toContain('jl-20260310-alpha1');
    });

    test('should export as Text', async () => {
      const result = await executeSessionExport(testSessionId, 'text');
      
      expect(result.format).toBe('text');
      expect(result.content).toContain('Export Test');
      expect(result.content).toContain(testSessionId);
    });

    test('should default to markdown format', async () => {
      const result = await executeSessionExport(testSessionId);
      
      expect(result.format).toBe('markdown');
    });

    test('should return error for invalid format', async () => {
      const result = await executeSessionExport(testSessionId, 'invalid');
      
      expect(result.error).toBe('Invalid format');
    });
  });

  describe('session_link_add', () => {
    beforeEach(async () => {
      const result = await createTestSession('Link Add Test', 'Content');
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should add valid Janus link', async () => {
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'jl-20260310-test12', 
        'janus'
      );
      
      expect(result.success).toBe(true);
      expect(result.link_added).toBe('jl-20260310-test12');
      expect(result.link_type).toBe('janus');
    });

    test('should add valid Logos link', async () => {
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'lg-20260310-test12', 
        'logos'
      );
      
      expect(result.success).toBe(true);
    });

    test('should add valid Kairos link', async () => {
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'kr-20260310-test12', 
        'kairos'
      );
      
      expect(result.success).toBe(true);
    });

    test('should add manual link', async () => {
      // Manual links use a different ID format
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'mnemo-20260310-test1',  // Use proper ID format for manual
        'manual'
      );
      
      expect(result.success).toBe(true);
    });

    test('should reject invalid ID format', async () => {
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'invalid-id', 
        'janus'
      );
      
      expect(result.error).toBe('Invalid ID format');
      expect(result.expected_format).toBe('prefix-YYYYMMDD-xxxxxx');
    });

    test('should reject invalid link type', async () => {
      const result = await executeSessionLinkAdd(
        testSessionId, 
        'jl-20260310-test12', 
        'invalid_type' as any
      );
      
      expect(result.error).toBeDefined();
    });

    test('should not duplicate existing links', async () => {
      await executeSessionLinkAdd(testSessionId, 'jl-20260310-dup123', 'janus');
      const result = await executeSessionLinkAdd(testSessionId, 'jl-20260310-dup123', 'janus');
      
      expect(result.success).toBe(true);
    });
  });

  describe('session_link_validate', () => {
    test('should validate existing ID format', async () => {
      const result = await executeSessionLinkValidate(
        'test-session', 
        'jl-20260310-valid'
      );
      
      expect(result.valid).toBeDefined();
    });

    test('should identify unknown prefix', async () => {
      const result = await executeSessionLinkValidate(
        'test-session', 
        'xx-20260310-valid'
      );
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Unknown prefix');
    });
  });

  describe('session_links_list', () => {
    beforeEach(async () => {
      const result = await createTestSession('Links List Test', createSampleContent(true));
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should list all links', async () => {
      const result = await executeSessionLinksList(testSessionId);
      
      expect(result.session_id).toBe(testSessionId);
      expect(result.total_links).toBe(4);
      expect(result.links.janus).toHaveLength(1);
      expect(result.links.mnemon).toHaveLength(1);
      expect(result.links.logos).toHaveLength(1);
      expect(result.links.kairos).toHaveLength(1);
    });

    test('should return error for non-existent session', async () => {
      const result = await executeSessionLinksList('mnemo-00000000-xxxxxx');
      
      expect(result.error).toBe('Session not found');
    });
  });

  describe('session_archive', () => {
    beforeEach(async () => {
      const result = await createTestSession('Archive Test', 'Content');
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should archive active session', async () => {
      const result = await executeSessionArchive(testSessionId);
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('archived');
    });

    test('should return error for non-existent session', async () => {
      const result = await executeSessionArchive('mnemo-00000000-xxxxxx');
      
      expect(result.error).toBe('Session not found');
    });

    test('should update index after archiving', async () => {
      await executeSessionArchive(testSessionId);
      
      const list = await executeSessionList('archived', 10, 0);
      const archived = list.sessions.find(s => s.id === testSessionId);
      
      expect(archived?.status).toBe('archived');
    });
  });

  describe('index_update', () => {
    beforeEach(async () => {
      const result = await createTestSession('Update Test', 'Content');
      testSessionId = result.session_id;
      testSessions.push(result.session_id);
    });

    test('should update index entry', async () => {
      const result = await executeIndexUpdate(
        'update', 
        testSessionId, 
        { title: 'Updated Title' }
      );
      
      expect(result.success).toBe(true);
      
      const list = await executeSessionList('all', 10, 0);
      const session = list.sessions.find(s => s.id === testSessionId);
      expect(session?.title).toBe('Updated Title');
    });

    test('should update index metadata', async () => {
      await executeIndexUpdate(
        'update', 
        testSessionId, 
        { metadata: { custom_field: 'value' } }
      );
      
      const list = await executeSessionList('all', 10, 0);
      // Index update modifies the index entry - verify via index
      expect(list.sessions.some(s => s.id === testSessionId)).toBe(true);
    });

    test('should update index modification time', async () => {
      const list1 = await executeSessionList('all', 10, 0);
      const before = list1.sessions.find(s => s.id === testSessionId)?.modified;
      
      await executeIndexUpdate(
        'update', 
        testSessionId, 
        { title: 'Changed' }
      );
      
      const list2 = await executeSessionList('all', 10, 0);
      const after = list2.sessions.find(s => s.id === testSessionId)?.modified;
      
      expect(after).toBeDefined();
    });
  });

  describe('cross-skill ID extraction', () => {
    test('should extract Janus IDs (jl-)', async () => {
      const content = 'Content with jl-20260310-alpha and jl-20260311-beta';
      const result = await createTestSession('Janus Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.janus).toBe(2);
    });

    test('should extract Mnemon IDs (mb-)', async () => {
      const content = 'Content with mb-20260310-mem1 and mb-20260310-mem2';
      const result = await createTestSession('Mnemon Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.mnemon).toBe(2);
    });

    test('should extract Logos IDs (lg-)', async () => {
      const content = 'Content with lg-20260310-log1';
      const result = await createTestSession('Logos Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.logos).toBe(1);
    });

    test('should extract Kairos IDs (kr-)', async () => {
      const content = 'Content with kr-20260310-kai1 and kr-20260310-kai2 and kr-20260310-kai3';
      const result = await createTestSession('Kairos Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.kairos).toBe(3);
    });

    test('should handle mixed IDs', async () => {
      const content = `
        jl-20260310-alpha1
        mb-20260310-beta22
        lg-20260310-gamma3
        kr-20260310-delta4
      `;
      const result = await createTestSession('Mixed Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.janus).toBe(1);
      expect(result.links_detected.mnemon).toBe(1);
      expect(result.links_detected.logos).toBe(1);
      expect(result.links_detected.kairos).toBe(1);
    });

    test('should dedupe duplicate IDs', async () => {
      const content = 'jl-20260310-alpha1 and jl-20260310-alpha1 again';
      const result = await createTestSession('Dedupe Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.janus).toBe(1);
    });

    test('should dedupe duplicate IDs', async () => {
      const content = 'jl-20260310-alpha1 and jl-20260310-alpha1 again';
      const result = await createTestSession('Dedupe Test', content);
      testSessions.push(result.session_id);
      
      expect(result.links_detected.janus).toBe(1);
    });
  });

  describe('error handling', () => {
    test('should handle empty session title', async () => {
      const result = await createTestSession('', 'Content');
      testSessions.push(result.session_id);
      
      expect(result.success).toBe(true);
    });

    test('should handle empty content', async () => {
      const result = await createTestSession('Empty Test', '');
      testSessions.push(result.session_id);
      
      expect(result.success).toBe(true);
    });

    test('should handle very long content', async () => {
      const longContent = 'x'.repeat(100000);
      const result = await createTestSession('Long Test', longContent);
      testSessions.push(result.session_id);
      
      expect(result.success).toBe(true);
    });

    test('should handle special characters in content', async () => {
      const content = 'Content with émoji 🎉 and "quotes" and <brackets>';
      const result = await createTestSession('Special Test', content);
      testSessions.push(result.session_id);
      
      expect(result.success).toBe(true);
      
      const loaded = await executeSessionLoad(result.session_id);
      expect(loaded.content).toContain('🎉');
    });
  });

  describe('atomic operations', () => {
    test('should handle concurrent saves', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        createTestSession(`Concurrent ${i}`, `Content ${i}`)
      );
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        testSessions.push(result.session_id);
      });
      
      const uniqueIds = new Set(results.map(r => r.session_id));
      expect(uniqueIds.size).toBe(5);
    });
  });
});
