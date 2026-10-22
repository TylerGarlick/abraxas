/**
 * sovereign-nexus.js
 * 
 * The Sovereign-Nexus implements a SHA-256 hash-linked cognitive ledger
 * known as the "Iron Chain." Every reasoning step (CognitiveBlock) is 
 * hashed and linked to the previous block, ensuring immutability.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SovereignNexus {
  constructor(storagePath = './.abraxas/data/nexus_ledger.jsonl') {
    this.storagePath = storagePath;
    this.ensureStorageExists();
  }

  ensureStorageExists() {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, '');
    }
  }

  /**
   * Creates a new Cognitive Block and appends it to the Iron Chain.
   * @param {Object} data - The reasoning step data.
   * @param {string} previousHash - The hash of the preceding block.
   * @returns {Object} The created block with its hash.
   */
  appendBlock(data, previousHash = '0'.repeat(64)) {
    const timestamp = new Date().toISOString();
    const block = {
      timestamp,
      data,
      previousHash,
      nonce: crypto.randomBytes(4).toString('hex')
    };

    const hash = this.calculateHash(block);
    const finalBlock = { ...block, hash };

    fs.appendFileSync(this.storagePath, JSON.stringify(finalBlock) + '\n');
    return finalBlock;
  }

  /**
   * Calculates the SHA-256 hash of a block.
   */
  calculateHash(block) {
    const stringified = JSON.stringify(block);
    return crypto.createHash('sha256').update(stringified).digest('hex');
  }

  /**
   * Verifies the integrity of the entire Iron Chain.
   * @returns {{isValid: boolean, corruptionIndex: number|null}}
   */
  verifyChain() {
    const lines = fs.readFileSync(this.storagePath, 'utf8').trim().split('\n').filter(Boolean);
    let lastHash = '0'.repeat(64);

    for (let i = 0; i < lines.length; i++) {
      const block = JSON.parse(lines[i]);
      const currentHash = block.hash;
      
      // 1. Verify current block hash
      const tempBlock = { ...block };
      delete tempBlock.hash;
      if (this.calculateHash(tempBlock) !== currentHash) {
        return { isValid: false, corruptionIndex: i, reason: 'Hash mismatch' };
      }

      // 2. Verify chain link
      if (block.previousHash !== lastHash) {
        return { isValid: false, corruptionIndex: i, reason: 'Chain break' };
      }

      lastHash = currentHash;
    }

    return { isValid: true, corruptionIndex: null };
  }

  /**
   * Retrieves the full chain as an array.
   */
  getChain() {
    const lines = fs.readFileSync(this.storagePath, 'utf8').trim().split('\n').filter(Boolean);
    return lines.map(l => JSON.parse(l));
  }

  /**
   * Generates a Sovereign Receipt for a specific block.
   */
  generateReceipt(blockHash) {
    const chain = this.getChain();
    const index = chain.findIndex(b => b.hash === blockHash);
    if (index === -1) return null;

    return {
      blockIndex: index,
      receipt: `Sovereign-Nexus-Receipt:${blockHash}`,
      provenance: chain.slice(0, index + 1).map(b => b.hash)
    };
  }
}

module.exports = SovereignNexus;
