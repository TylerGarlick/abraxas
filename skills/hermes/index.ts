/**
 * Hermes - Multi-Agent Consensus & Divergence Tracker
 * Core logic module
 */

import * as fs from 'fs';
import * as path from 'path';

interface AgentPosition {
  agentId: string;
  timestamp: number;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning?: string;
  metadata?: Record<string, unknown>;
}

interface HermesSession {
  id: string;
  created: number;
  participants: Map<string, AgentPosition>;
  consensusType: 'strong_consensus' | 'weak_consensus' | 'divergence' | 'unknown';
}

interface TrackRecord {
  agentId: string;
  totalClaims: number;
  verifiedCorrect: number;
  verifiedIncorrect: number;
  accuracy: number;
  lastUpdated: number;
}

interface ConsensusResult {
  type: string;
  agreement: number;
  positions: string[];
  weightedScore: number;
  details: string;
}

const STORAGE_DIR = path.join(process.env.HOME || '/root', '.abraxas', 'hermes');

export class Hermes {
  private currentSession: HermesSession | null = null;
  private trackRecords: Map<string, TrackRecord> = new Map();

  constructor() {
    this.ensureStorage();
    this.loadTrackRecords();
  }

  private ensureStorage(): void {
    const dirs = [
      STORAGE_DIR,
      path.join(STORAGE_DIR, 'track-records'),
      path.join(STORAGE_DIR, 'sessions'),
    ];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadTrackRecords(): void {
    const trPath = path.join(STORAGE_DIR, 'track-records', 'index.json');
    if (fs.existsSync(trPath)) {
      const data = JSON.parse(fs.readFileSync(trPath, 'utf-8'));
      for (const [agentId, record] of Object.entries(data)) {
        this.trackRecords.set(agentId, record as TrackRecord);
      }
    }
  }

  private saveTrackRecords(): void {
    const data: Record<string, TrackRecord> = {};
    for (const [agentId, record] of this.trackRecords) {
      data[agentId] = record;
    }
    const trPath = path.join(STORAGE_DIR, 'track-records', 'index.json');
    fs.writeFileSync(trPath, JSON.stringify(data, null, 2));
  }

  initSession(sessionId: string): HermesSession {
    this.currentSession = {
      id: sessionId,
      created: Date.now(),
      participants: new Map(),
      consensusType: 'unknown',
    };
    return this.currentSession;
  }

  addPosition(agentId: string, content: string, confidence: 'high' | 'medium' | 'low' = 'medium', reasoning?: string): AgentPosition {
    if (!this.currentSession) {
      this.initSession(`session-${Date.now()}`);
    }

    const position: AgentPosition = {
      agentId,
      timestamp: Date.now(),
      content,
      confidence,
      reasoning,
    };

    this.currentSession!.participants.set(agentId, position);
    return position;
  }

  computeConsensus(): ConsensusResult {
    if (!this.currentSession || this.currentSession.participants.size === 0) {
      return {
        type: 'unknown',
        agreement: 0,
        positions: [],
        weightedScore: 0,
        details: 'No positions recorded',
      };
    }

    const positions = Array.from(this.currentSession.participants.values());
    const contentCounts = new Map<string, number>();

    for (const pos of positions) {
      const count = contentCounts.get(pos.content) || 0;
      contentCounts.set(pos.content, count + 1);
    }

    // Find most common position
    let maxCount = 0;
    let topPosition = '';
    for (const [content, count] of contentCounts) {
      if (count > maxCount) {
        maxCount = count;
        topPosition = content;
      }
    }

    const agreement = maxCount / positions.length;
    const totalPositions = Array.from(contentCounts.keys());

    // Determine consensus type
    let type: string;
    if (agreement >= 0.8) {
      type = 'strong_consensus';
    } else if (agreement >= 0.6) {
      type = 'weak_consensus';
    } else if (totalPositions.length === positions.length) {
      type = 'divergence';
    } else {
      type = 'unknown';
    }

    // Calculate weighted score based on track records
    let weightedScore = 0.5;
    let totalWeight = 0;
    for (const pos of positions) {
      const record = this.trackRecords.get(pos.agentId);
      const weight = record?.accuracy || 0.5;
      if (pos.content === topPosition) {
        weightedScore += weight;
      }
      totalWeight += weight;
    }
    if (totalWeight > 0) {
      weightedScore /= totalWeight;
    }

    this.currentSession.consensusType = type as HermesSession['consensusType'];

    return {
      type,
      agreement,
      positions: totalPositions,
      weightedScore,
      details: `${maxCount}/${positions.length} agents agree`,
    };
  }

  detectDivergence(): { hasDivergence: boolean; details: string; positions: string[] } {
    const consensus = this.computeConsensus();
    const hasDivergence = consensus.type === 'divergence';

    return {
      hasDivergence,
      details: hasDivergence 
        ? `${consensus.positions.length} distinct positions detected` 
        : 'No significant divergence',
      positions: consensus.positions,
    };
  }

  getTrackRecord(agentId: string): TrackRecord | null {
    return this.trackRecords.get(agentId) || null;
  }

  updateTrackRecord(agentId: string, correct: boolean): TrackRecord {
    let record = this.trackRecords.get(agentId);
    
    if (!record) {
      record = {
        agentId,
        totalClaims: 0,
        verifiedCorrect: 0,
        verifiedIncorrect: 0,
        accuracy: 0.5,
        lastUpdated: Date.now(),
      };
    }

    record.totalClaims++;
    if (correct) {
      record.verifiedCorrect++;
    } else {
      record.verifiedIncorrect++;
    }
    record.accuracy = record.verifiedCorrect / record.totalClaims;
    record.lastUpdated = Date.now();

    this.trackRecords.set(agentId, record);
    this.saveTrackRecords();

    return record;
  }

  setWeight(agentId: string, accuracy: number): TrackRecord {
    let record = this.trackRecords.get(agentId);
    
    if (!record) {
      record = {
        agentId,
        totalClaims: 10,
        verifiedCorrect: Math.round(10 * accuracy),
        verifiedIncorrect: Math.round(10 * (1 - accuracy)),
        accuracy,
        lastUpdated: Date.now(),
      };
    } else {
      record.accuracy = Math.max(0, Math.min(1, accuracy));
      record.lastUpdated = Date.now();
    }

    this.trackRecords.set(agentId, record);
    this.saveTrackRecords();

    return record;
  }

  getStatus(): { session: HermesSession | null; participants: number } {
    return {
      session: this.currentSession,
      participants: this.currentSession?.participants.size || 0,
    };
  }
}

export default Hermes;