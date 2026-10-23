# Prometheus Architecture

## Overview

Prometheus learns and persists user preferences across sessions, tracking detail level, domain expertise, risk tolerance, preferred sources, and communication style.

## Preference Model

```typescript
interface UserPreferences {
  detailLevel: 'terse' | 'balanced' | 'detailed' | 'comprehensive';
  domainExpertise: 'novice' | 'intermediate' | 'advanced' | 'specialist';
  riskTolerance: 'low' | 'medium' | 'high' | 'custom';
  communicationStyle: 'formal' | 'casual' | 'technical' | 'simple';
  preferredSources: string[];
  customSettings: Record<string, any>;
}

interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  signals: SignalCounts;
  confidence: PreferenceConfidence;
  updated: number;
}

interface PreferenceConfidence {
  detailLevel: number;    // 0-1
  domainExpertise: number;
  riskTolerance: number;
  communicationStyle: number;
}
```

## Signal Processing

### Explicit Signals

```typescript
interface ExplicitSignal {
  type: 'set' | 'update' | 'correct';
  key: string;
  value: any;
  timestamp: number;
}
```

### Implicit Signals

```typescript
interface ImplicitSignal {
  type: 'followup' | 'rejection' | 'clarification' | 'acknowledgment' | 'terminology';
  interpretation: string;
  weight: number;
  timestamp: number;
}

// Signal interpretations:
// - followup → need more detail
// - rejection → didn't match preference
// - clarification → current too complex
// - quick_ack → prefer concise
// - deep_followup → can handle detail
// - technical_terms → show expertise
```

## Learning Algorithm

```typescript
interface Prometheus {
  // Collect signals
  recordSignal(userId: string, signal: ImplicitSignal | ExplicitSignal): void;
  
  // Update belief about preferences (Bayesian)
  learn(userId: string): UserProfile;
  
  // Apply preferences to output
  applyPreferences(output: string, profile: UserProfile): string;
}

function bayesianUpdate(
  prior: number, 
  signal: ImplicitSignal
): number {
  // P(preference | signal) ∝ P(signal | preference) × P(preference)
  // Use signal weight to update confidence
  const strength = signal.weight * 0.1;
  return prior + (1 - prior) * strength; // Move toward 1
}
```

## Preference Application

```typescript
function applyDetailLevel(
  output: string, 
  level: string
): string {
  switch (level) {
    case 'terse':
      return extractMainPoint(output);
    case 'balanced':
      return moderatePruning(output);
    case 'detailed':
      return output; // Full output
    case 'comprehensive':
      return expandWithContext(output);
  }
}

function applyRiskTolerance(
  output: string, 
  tolerance: string,
  claims: Claim[]
): string {
  switch (tolerance) {
    case 'low':
      return addCaveats(claims, output);
    case 'medium':
      return moderateCaveats(claims, output);
    case 'high':
      return output; // Minimal hedging
  }
}
```

## Storage Schema

```json
{
  "profiles": {
    "default": {
      "userId": "default",
      "preferences": {
        "detailLevel": "balanced",
        "domainExpertise": "intermediate",
        "riskTolerance": "medium",
        "communicationStyle": "technical",
        "preferredSources": []
      },
      "signals": {
        "total": 150,
        "explicit": 20,
        "implicit": 130
      },
      "confidence": {
        "detailLevel": 0.85,
        "domainExpertise": 0.70,
        "riskTolerance": 0.60
      }
    }
  },
  "signals": {
    "2024-03-15": [
      {"type": "followup", "interpretation": "need_more_detail", "weight": 0.5}
    ]
  }
}
```

## Integration

- **Janus**: Modifies label presentation based on preferences
- **Honest**: Adjusts explanation level
- **Mnemosyne**: Profile persisted through Mnemosyne