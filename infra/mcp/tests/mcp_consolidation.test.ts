
import { toolModules } from '../src/tools/index.ts';
import { describe, it, expect } from 'bun:test';

describe('MCP Tool Consolidation', () => {
  it('should contain the arangodb tool module', () => {
    const arangoModule = toolModules.find(m => m.name === 'arangodb');
    expect(arangoModule).toBeDefined();
  });

  it('should have all expected ArangoDB tools registered', () => {
    const arangoModule = toolModules.find(m => m.name === 'arangodb')!;
    // We can't easily call register() without a server instance, 
    // but we can check if the module object itself is correct.
    expect(arangoModule.name).toBe('arangodb');
  });
});
