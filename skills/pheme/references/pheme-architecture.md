# Pheme Architecture

## Overview

Pheme provides real-time fact-checking by intercepting claims during generation, verifying against authoritative sources, and providing source-level confidence scores.

## Verification Pipeline

```
Claim → Extraction → Source Lookup → Verification → Confidence → Label
```

### 1. Claim Extraction

```typescript
interface ClaimExtractor {
  extract(text: string): Claim[];
  // Types: direct, numerical, relationship
}

interface Claim {
  id: string;
  type: 'direct' | 'numerical' | 'relationship';
  text: string;
  entities: string[];
  confidence: number;
}
```

### 2. Source Lookup

```typescript
interface SourceLookup {
  query(claim: Claim): Promise<SourceResult[]>;
  // Sources: Wikipedia, Wikidata, custom knowledge bases
}

interface SourceResult {
  source: string;
  url: string;
  content: string;
  relevance: number;
  date: string;
}
```

### 3. Verification Engine

```typescript
interface VerificationEngine {
  verify(claim: Claim, sources: SourceResult[]): VerificationResult;
  // Compares claim against source content
}

interface VerificationResult {
  status: 'VERIFIED' | 'CONTRADICTED' | 'UNVERIFIABLE' | 'PENDING';
  confirmingSources: string[];
  contradictingSources: string[];
  confidence: number;
  details: string;
}
```

### 4. Confidence Scoring

```typescript
function calculateConfidence(
  sources: SourceResult[], 
  verification: VerificationResult
): number {
  const sourceReliability = sources.reduce((sum, s) => 
    sum + getSourceReliability(s.source), 0) / sources.length;
  const sourceCoverage = Math.min(sources.length / 2, 1);
  const recencyFactor = calculateRecencyFactor(sources);
  
  return sourceReliability * sourceCoverage * recencyFactor;
}
```

## Source Reliability

```typescript
interface SourceReliability {
  domain: string;
  reliability: number; // 0-1
  categories: string[];
  lastUpdated: number;
  // Default sources:
  // wikipedia.org: 0.85
  // britannica.com: 0.90
  // arxiv.org: 0.95
  // news sources: 0.70-0.90
  // blogs: 0.30-0.50
}
```

## Storage Schema

```json
{
  "verifications": {
    "claim-hash": {
      "claim": "The Earth orbits the Sun",
      "status": "VERIFIED",
      "sources": ["wikipedia.org", "britannica.com"],
      "confidence": 0.88,
      "timestamp": 1709999999
    }
  },
  "sources": {
    "wikipedia.org": {
      "reliability": 0.85,
      "categories": ["encyclopedia"],
      "lastUpdated": 1709999999
    }
  }
}
```

## Integration with Janus

| Janus Label | Pheme Enhancement |
|:---|:---|
| `[KNOWN]` | `[KNOWN] [VERIFIED: source1, source2]` |
| `[KNOWN]` | `[KNOWN] [CONTRADICTED: source]` → Warning |
| `[INFERRED]` | `[INFERRED] [PARTIALLY_VERIFIED]` |
| `[UNCERTAIN]` | `[UNCERTAIN] [UNVERIFIABLE]` |

## Known Limitations

1. **Coverage gaps**: Not all claims can be verified
2. **Source staleness**: Information may be outdated
3. **Semantic matching**: Claims may not match sources exactly
4. **Language**: Currently focused on English sources