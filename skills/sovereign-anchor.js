/**
 * sovereign-anchor.js
 * 
 * The Sovereign-Anchor implements "Divine Priority." 
 * It manages Genesis Blocks—human-anchored truth fragments 
 * that override all probabilistic weights in the system.
 */

const fs = require('fs');
const path = require('path');

class SovereignAnchor {
  constructor(storagePath = './.abraxas/data/genesis_blocks.json') {
    this.storagePath = storagePath;
    this.ensureStorageExists();
  }

  ensureStorageExists() {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Inject a Genesis Block into the system.
   * Genesis blocks are manually verified by the Human-Sovereign.
   * @param {string} key - The unique identifier for the truth fragment.
   * @param {string} value - The verified truth content.
   * @param {Object} metadata - Provenance and verification details.
   */
  injectGenesisBlock(key, value, metadata = {}) {
    const blocks = this.getBlocks();
    
    const genesisBlock = {
      key,
      value,
      verified: true,
      is_genesis: true,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Override existing keys (Sovereign update)
    const index = blocks.findIndex(b => b.key === key);
    if (index !== -1) {
      blocks[index] = genesisBlock;
    } else {
      blocks.push(genesisBlock);
    }

    fs.writeFileSync(this.storagePath, JSON.stringify(blocks, null, 2));
    return genesisBlock;
  }

  /**
   * Retrieves a block by key.
   * Divine Priority: If a Genesis block exists, it MUST be used over 
   * any probabilistic inference.
   */
  getAnchor(key) {
    const blocks = this.getBlocks();
    const block = blocks.find(b => b.key === key);
    return block || null;
  }

  /**
   * Returns all Genesis Blocks.
   */
  getBlocks() {
    try {
      const data = fs.readFileSync(this.storagePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  /**
   * Resolves a query against the Anchor.
   * If the query matches a Genesis key, it returns the value with Divine Priority.
   */
  resolve(query) {
    const blocks = this.getBlocks();
    // Simple key match; could be evolved to semantic search
    const match = blocks.find(b => query.toLowerCase().includes(b.key.toLowerCase()));
    
    if (match) {
      return {
        found: true,
        value: match.value,
        priority: 'DIVINE',
        block: match
      };
    }
    
    return { found: false };
  }
}

module.exports = SovereignAnchor;
