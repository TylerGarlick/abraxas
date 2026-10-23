import { expect, test, describe } from 'bun:test';
import { SovereignNexus } from '../src/lib/core/nexus';

describe('SovereignNexus', () => {
  test('should initialize with genesis block', () => {
    const nexus = new SovereignNexus('Genesis');
    const chain = nexus.getChain();
    expect(chain.length).toBe(1);
    expect(chain[0].content).toBe('Genesis');
    expect(chain[0].index).toBe(0);
  });

  test('should add blocks and link them', () => {
    const nexus = new SovereignNexus('Genesis');
    nexus.addBlock('Block 1');
    nexus.addBlock('Block 2');
    
    const chain = nexus.getChain();
    expect(chain.length).toBe(3);
    expect(chain[1].previousHash).toBe(chain[0].hash);
    expect(chain[2].previousHash).toBe(chain[1].hash);
  });

  test('should validate a correct chain', () => {
    const nexus = new SovereignNexus('Genesis');
    nexus.addBlock('Block 1');
    nexus.addBlock('Block 2');
    
    const validation = nexus.validateChain();
    expect(validation.valid).toBe(true);
  });

  test('should detect tampered data', () => {
    const nexus = new SovereignNexus('Genesis');
    nexus.addBlock('Block 1');
    nexus.addBlock('Block 2');
    
    const chain = nexus.getChain();
    // Tamper with content of Block 1
    chain[1].content = 'Tampered';
    
    const validation = nexus.validateChain();
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Hash mismatch');
  });

  test('should detect broken link', () => {
    const nexus = new SovereignNexus('Genesis');
    nexus.addBlock('Block 1');
    nexus.addBlock('Block 2');
    
    const chain = nexus.getChain();
    // Tamper with the hash of Block 1, which breaks the link to Block 2
    chain[0].hash = 'tampered_hash';
    
    const validation = nexus.validateChain();
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Chain break');
  });
});
