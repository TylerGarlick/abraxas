import * as crypto from 'crypto';

export interface CognitiveBlock {
  index: number;
  timestamp: number;
  content: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

export class SovereignNexus {
  private chain: CognitiveBlock[] = [];

  constructor(genesisContent?: any) {
    if (genesisContent) {
      this.createGenesisBlock(genesisContent);
    }
  }

  private createGenesisBlock(content: any) {
    const timestamp = Date.now();
    const previousHash = '0'.repeat(64);
    const nonce = 0;
    const hash = this.calculateHash(0, timestamp, content, previousHash, nonce);
    
    const genesisBlock: CognitiveBlock = {
      index: 0,
      timestamp,
      content,
      previousHash,
      hash,
      nonce,
    };
    
    this.chain.push(genesisBlock);
  }

  public addBlock(content: any): CognitiveBlock {
    const previousBlock = this.getLatestBlock();
    if (!previousBlock) {
      throw new Error('Chain must be initialized with a genesis block before adding blocks.');
    }

    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    const previousHash = previousBlock.hash;
    const nonce = 0;
    const hash = this.calculateHash(index, timestamp, content, previousHash, nonce);

    const newBlock: CognitiveBlock = {
      index,
      timestamp,
      content,
      previousHash,
      hash,
      nonce,
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  public calculateHash(index: number, timestamp: number, content: any, previousHash: string, nonce: number): string {
    const data = JSON.stringify({ index, timestamp, content, previousHash, nonce });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public validateChain(): { valid: boolean; error?: string } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (!current || !previous) {
        return { valid: false, error: `Missing block at index ${i}` };
      }

      if (current.hash !== this.calculateHash(current.index, current.timestamp, current.content, current.previousHash, current.nonce)) {
        return { valid: false, error: `Hash mismatch at block ${i}` };
      }

      if (current.previousHash !== previous.hash) {
        return { valid: false, error: `Chain break at block ${i}: previous hash does not match` };
      }
    }
    return { valid: true };
  }

  public getChain(): CognitiveBlock[] {
    return [...this.chain];
  }

  public getLatestBlock(): CognitiveBlock | null {
    if (this.chain.length === 0) return null;
    return this.chain[this.chain.length - 1] ?? null;
  }
}
