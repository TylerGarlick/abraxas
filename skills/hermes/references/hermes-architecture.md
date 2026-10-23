# Hermes Architecture

## Overview

Hermes tracks consensus, disagreement, and information flow when multiple AI agents collaborate. It maintains a ledger of positions, detects convergence/divergence patterns, and weights responses by historical track record.

## Core Components

### 1. Session Manager

```typescript
interface HermesSession {
  id: string;
  created: number;
  participants: Map<string, AgentPosition>;
  consensusType: 'strong' | 'weak' | 'divergent' | 'unknown';
  weightedResult?: WeightedConsensus;
}
```

### 2. Position Ledger

```typescript
interface AgentPosition {
  agentId: string;
  timestamp: number;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning?: string;
  metadata?: Record<string, any>;
}
```

### 3. Consensus Calculator

```typescript
interface ConsensusResult {
  type: 'strong_consensus' | 'weak_consensus' | 'divergence' | 'unknown';
  agreement: number; // 0-1
  positions: string[];
  weightedScore: number;
}
```

### 4. Track Record Manager

```typescript
interface TrackRecord {
  agentId: string;
  totalClaims: number;
  verifiedCorrect: number;
  verifiedIncorrect: number;
  accuracy: number; // 0-1
  lastUpdated: number;
}
```

## Consensus Algorithms

### Simple Majority

```typescript
function simpleMajority(positions: AgentPosition[]): ConsensusResult {
  const counts = new Map<string, number>();
  for (const pos of positions) {
    counts.set(pos.content, (counts.get(pos.content) || 0) + 1);
  }
  // ... calculate agreement percentage
}
```

### Weighted by Track Record

```typescript
function weightedConsensus(
  positions: AgentPosition[], 
  trackRecords: Map<string, TrackRecord>
): ConsensusResult {
  const weights = new Map<string, number>();
  let totalWeight = 0;
  
  for (const pos of positions) {
    const record = trackRecords.get(pos.agentId);
    const weight = record?.accuracy || 0.5;
    weights.set(pos.content, (weights.get(pos.content) || 0) + weight);
    totalWeight += weight;
  }
  // ... normalize and calculate weighted agreement
}
```

### Divergence Detection

```typescript
function detectDivergence(positions: AgentPosition[]): DivergenceResult {
  // Use semantic similarity to detect meaningful disagreement
  // vs. surface-level disagreement on equivalent statements
}
```

## Storage Schema

```json
{
  "sessions": {
    "session-id": {
      "id": "session-id",
      "created": 1709999999,
      "participants": {...},
      "consensus": {...}
    }
  },
  "track-records": {
    "agent-id": {
      "accuracy": 0.90,
      "totalClaims": 150,
      "verifiedCorrect": 135
    }
  }
}
```

## Integration Points

- **Janus**: Hermes adds inter-agent perspective to Janus's single-model labels
- **Aletheia**: Track record updates verified through Aletheia
- **Mnemosyne**: Session state persisted through Mnemosyne