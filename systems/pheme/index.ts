/**
 * Pheme - Real-Time Fact-Checking Engine
 * Core logic module
 */

import * as fs from 'fs';
import * as path from 'path';

interface Claim {
  id: string;
  type: 'direct' | 'numerical' | 'relationship';
  text: string;
  entities: string[];
  confidence: number;
}

interface SourceResult {
  source: string;
  url: string;
  content: string;
  relevance: number;
  date: string;
}

interface VerificationResult {
  status: 'VERIFIED' | 'CONTRADICTED' | 'UNVERIFIABLE' | 'PENDING';
  confirmingSources: string[];
  contradictingSources: string[];
  confidence: number;
  details: string;
}

interface SourceReliability {
  domain: string;
  reliability: number;
  categories: string[];
  lastUpdated: number;
}

const STORAGE_DIR = path.join(process.env.HOME || '/root', '.abraxas', 'pheme');

// Default source reliability scores
const DEFAULT_SOURCES: Record<string, SourceReliability> = {
  'wikipedia.org': { domain: 'wikipedia.org', reliability: 0.85, categories: ['encyclopedia'], lastUpdated: Date.now() },
  'britannica.com': { domain: 'britannica.com', reliability: 0.90, categories: ['encyclopedia'], lastUpdated: Date.now() },
  'arxiv.org': { domain: 'arxiv.org', reliability: 0.95, categories: ['academic', 'science'], lastUpdated: Date.now() },
  'nature.com': { domain: 'nature.com', reliability: 0.92, categories: ['academic', 'science'], lastUpdated: Date.now() },
  'sciencemag.org': { domain: 'sciencemag.org', reliability: 0.92, categories: ['academic', 'science'], lastUpdated: Date.now() },
  'github.com': { domain: 'github.com', reliability: 0.75, categories: ['code', 'technical'], lastUpdated: Date.now() },
  'mdn.io': { domain: 'mdn.io', reliability: 0.88, categories: ['documentation', 'technical'], lastUpdated: Date.now() },
};

export class Pheme {
  private verifications: Map<string, VerificationResult> = new Map();
  private sources: Map<string, SourceReliability> = new Map();

  constructor() {
    this.ensureStorage();
    this.loadSources();
    this.loadVerifications();
  }

  private ensureStorage(): void {
    const dirs = [STORAGE_DIR, path.join(STORAGE_DIR, 'cache')];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadSources(): void {
    // Initialize with defaults
    for (const [domain, source] of Object.entries(DEFAULT_SOURCES)) {
      this.sources.set(domain, source);
    }

    // Load custom sources
    const sourcesPath = path.join(STORAGE_DIR, 'sources.json');
    if (fs.existsSync(sourcesPath)) {
      const customSources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
      for (const source of Object.values(customSources) as SourceReliability[]) {
        this.sources.set(source.domain, source);
      }
    }
  }

  private saveSources(): void {
    const data: Record<string, SourceReliability> = {};
    for (const source of this.sources.values()) {
      data[source.domain] = source;
    }
    fs.writeFileSync(path.join(STORAGE_DIR, 'sources.json'), JSON.stringify(data, null, 2));
  }

  private loadVerifications(): void {
    const verifPath = path.join(STORAGE_DIR, 'verifications.json');
    if (fs.existsSync(verifPath)) {
      const data = JSON.parse(fs.readFileSync(verifPath, 'utf-8'));
      for (const [claim, result] of Object.entries(data)) {
        this.verifications.set(claim, result as VerificationResult);
      }
    }
  }

  private saveVerifications(): void {
    const data: Record<string, VerificationResult> = {};
    for (const [claim, result] of this.verifications) {
      data[claim] = result;
    }
    fs.writeFileSync(path.join(STORAGE_DIR, 'verifications.json'), JSON.stringify(data, null, 2));
  }

  /**
   * Extract factual claims from text
   */
  extractClaims(text: string): Claim[] {
    const claims: Claim[] = [];
    const claimId = this.hashString(text);

    // Simple claim detection - look for factual statements
    // In production, this would use NER and fact extraction
    const patterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+(?:the\s+)?(\w+(?:\s+\w+)?)/g,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:was|are|were)\s+(\d+(?:,\d+)*(?:\.\d+)?)\s*(\w+)?/g,
    ];

    // Direct factual claims
    if (text.includes(' is ') || text.includes(' was ')) {
      claims.push({
        id: claimId,
        type: 'direct',
        text: text,
        entities: this.extractEntities(text),
        confidence: 0.8,
      });
    }

    // Numerical claims
    const numbers = text.match(/\d+(?:,\d+)*(?:\.\d+)?/g);
    if (numbers) {
      claims.push({
        id: `${claimId}-num`,
        type: 'numerical',
        text: text,
        entities: this.extractEntities(text),
        confidence: 0.7,
      });
    }

    // If no specific pattern matched, treat whole text as claim
    if (claims.length === 0) {
      claims.push({
        id: claimId,
        type: 'direct',
        text: text,
        entities: this.extractEntities(text),
        confidence: 0.5,
      });
    }

    return claims;
  }

  private extractEntities(text: string): string[] {
    // Simple entity extraction - capitalized words
    const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    return matches ? [...new Set(matches)] : [];
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify a claim against known sources
   * Note: In production, this would query actual knowledge bases
   */
  async verify(claim: string): Promise<VerificationResult> {
    // Check cache first
    const cached = this.verifications.get(claim);
    if (cached) {
      return cached;
    }

    // In a full implementation, this would:
    // 1. Query Wikipedia/Wikidata API
    // 2. Compare claim against source content
    // 3. Determine verification status

    // For now, simulate verification based on claim content
    const result = this.simulateVerification(claim);
    
    this.verifications.set(claim, result);
    this.saveVerifications();

    return result;
  }

  private simulateVerification(claim: string): VerificationResult {
    const lowerClaim = claim.toLowerCase();

    // Known verifiable facts (simulated)
    const verifiableFacts = [
      'paris is the capital of france',
      'the earth orbits the sun',
      'water freezes at 0 degrees celsius',
      'the speed of light is approximately 300000 km/s',
      'h2o is water',
    ];

    // Known false facts (simulated)
    const falseFacts = [
      'paris is the capital of germany',
      'the earth is flat',
      'the sun orbits the earth',
    ];

    for (const fact of verifiableFacts) {
      if (lowerClaim.includes(fact) || fact.includes(lowerClaim)) {
        return {
          status: 'VERIFIED',
          confirmingSources: ['wikipedia.org', 'britannica.com'],
          contradictingSources: [],
          confidence: 0.85,
          details: 'Claim confirmed by multiple authoritative sources',
        };
      }
    }

    for (const fact of falseFacts) {
      if (lowerClaim.includes(fact)) {
        return {
          status: 'CONTRADICTED',
          confirmingSources: [],
          contradictingSources: ['wikipedia.org'],
          confidence: 0.80,
          details: 'Claim contradicts authoritative sources',
        };
      }
    }

    // Default: unverifiable
    return {
      status: 'UNVERIFIABLE',
      confirmingSources: [],
      contradictingSources: [],
      confidence: 0,
      details: 'No authoritative sources found for verification',
    };
  }

  /**
   * Get source reliability info
   */
  getSourceInfo(domain: string): SourceReliability | null {
    return this.sources.get(domain) || null;
  }

  /**
   * Set trust score for a source
   */
  setTrust(domain: string, reliability: number): void {
    const source = this.sources.get(domain) || {
      domain,
      reliability: 0.5,
      categories: ['unknown'],
      lastUpdated: Date.now(),
    };
    source.reliability = Math.max(0, Math.min(1, reliability));
    source.lastUpdated = Date.now();
    this.sources.set(domain, source);
    this.saveSources();
  }

  /**
   * Get recent verification history
   */
  getHistory(limit: number = 10): Array<{ claim: string; result: VerificationResult }> {
    const entries = Array.from(this.verifications.entries());
    return entries.slice(-limit).map(([claim, result]) => ({ claim, result }));
  }

  /**
   * Get current status
   */
  getStatus(): { totalVerifications: number; sources: number } {
    return {
      totalVerifications: this.verifications.size,
      sources: this.sources.size,
    };
  }
}

export default Pheme;