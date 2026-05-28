---
name: prometheus
description: >
  Prometheus — User Preference Learning. Use this skill to learn and persist user preferences across sessions.
  Tracks: detail level, domain expertise, risk tolerance, preferred sources, communication style. Updates based on
  explicit feedback and implicit signals. Commands: /prometheus profile, /prometheus set, /prometheus update,
  /prometheus clear, /prometheus status.
---

# Prometheus — User Preference Learning

Prometheus (Greek: Προμηθεύς, "forethought") learns and persists user preferences across sessions. It tracks detail level, domain expertise, risk tolerance, preferred sources, and communication style — adapting Abraxas output to the individual user.

## Why Prometheus?

One-size-fits-all epistemic framing doesn't serve all users well. A novice needs different granularity than an expert. A high-stakes decision-maker needs different uncertainty presentation than someone casually browsing. Prometheus adapts the system to the user.

- **Personalized detail level** — Experts get concise, novices get explanation
- **Domain expertise tracking** — Adapts based on demonstrated knowledge
- **Risk tolerance** — High-stakes queries get more caveats
- **Learning from interaction** — Explicit feedback + implicit signals
- **Cross-session persistence** — Remembers preferences between sessions

## Use Cases

1. **Explicit preference setting**: User says "I prefer concise answers"
2. **Implicit learning**: System notices user always rejects verbose explanations
3. **Expertise detection**: User asks about advanced physics → mark as expert
4. **Risk adaptation**: For high-stakes queries, add uncertainty caveats

## Storage Location

**`~/.abraxas/prometheus/`**

```
~/.abraxas/prometheus/
├── profiles/
│   └── {user_id}.json   # User preference profiles
├── signals/
│   └── {date}.json      # Raw signal data for learning
└── config.yaml          # Prometheus configuration
```

## Command Suite

| Command | Description |
|:---|:---|
| `/prometheus profile {user_id}` | Show current user preference profile |
| `/prometheus set {key} {value}` | Set a specific preference |
| `/prometheus update {key} {value}` | Update based on observed behavior |
| `/prometheus clear {user_id}` | Clear user profile |
| `/prometheus status` | Show learning status and signals |
| `/prometheus signals {limit}` | Show recent preference signals |
| `/prometheus train` | Run preference learning update |

## Preference Dimensions

### Detail Level

- `terse`: One-liner answers, minimal explanation
- `balanced`: Moderate detail, key points only
- `detailed`: Full explanation, all reasoning shown
- `comprehensive`: Exhaustive, leave no stone unturned

### Domain Expertise

- `novice`: No technical background assumed
- `intermediate`: Some domain knowledge
- `advanced`: Expert-level understanding
- `specialist`: Deep domain expertise

### Risk Tolerance

- `low`: High caution, extensive caveats for uncertain claims
- `medium`: Balanced uncertainty presentation
- `high`: Allow confident-sounding output, minimal hedging
- `custom`: User-configured risk parameters

### Communication Style

- `formal`: Professional, structured
- `casual`: Conversational, friendly
- `technical`: Use domain terminology
- `simple`: Plain language, avoid jargon

### Preferred Sources

- List of trusted domains/sources (e.g., arxiv.org, wikipedia.org)
- Can be prioritized for different domains

## Signal Types

### Explicit Signals

- `/prometheus set detail_level detailed` — Direct preference
- User corrections: "No, I meant..." → update learned preference

### Implicit Signals

| Signal | Interpretation |
|:---|:---|
| Follow-up questions | More detail needed |
| Rejection of suggestion | Didn't match preference |
| Clarification requests | Current explanation too complex |
| Quick acknowledgments | Prefer concise |
| Deep follow-ups | Show expertise, can handle detail |

## Profile Schema

```json
{
  "user_id": "default",
  "preferences": {
    "detail_level": "balanced",
    "domain_expertise": "intermediate",
    "risk_tolerance": "medium",
    "communication_style": "technical",
    "preferred_sources": ["wikipedia.org", "arxiv.org"]
  },
  "signals": {
    "total_signals": 150,
    "explicit": 20,
    "implicit": 130,
    "last_signal": 1709999999
  },
  "confidence": {
    "detail_level": 0.85,
    "domain_expertise": 0.70,
    "risk_tolerance": 0.60
  },
  "updated": 1709999999
}
```

## Usage Examples

### Viewing Profile

```
/prometheus profile default
→ Detail Level: balanced (85% confidence)
→ Domain Expertise: intermediate (70% confidence)
→ Risk Tolerance: medium (60% confidence)
→ Communication Style: technical
→ Preferred Sources: wikipedia.org, arxiv.org
→ Signals: 150 total (20 explicit, 130 implicit)
→ Last Updated: 2024-03-15
```

### Setting Preferences

```
/prometheus set detail_level terse
→ Set: detail_level = terse
→ Profile updated

/prometheus set risk_tolerance low
→ Set: risk_tolerance = low (will add more caveats)
→ Profile updated
```

### Implicit Learning

```
User: [Asks about quantum entanglement with precise terminology]

Prometheus detects: High technical language → signal expertise = advanced
→ domain_expertise: intermediate → advanced (confidence 0.75)
→ Updated profile

User: [Asks for clarification on basics]

Prometheus detects: Needs simpler explanation → signal: expertise_level mismatch
→ Review: keep at intermediate, user may be exploring
```

### Risk Adaptation

```
User: [Query involves medical decision]

Prometheus: High-stakes domain detected → apply risk_tolerance=low
→ Output includes: "This is not medical advice", uncertainty caveats
→ Confidence intervals added to any numerical claims
```

## Integration with Janus & Honest

Prometheus modifies output presentation:

| Janus Label | + Prometheus Detail Level |
|:---|:---|
| `[KNOWN]` | `terse`: "X" / `detailed`: "X (source: Y)" |
| `[INFERRED]` | `terse`: "X likely" / `detailed`: full reasoning chain |
| `[UNCERTAIN]` | `terse`: "unsure" / `detailed`: "X (70% confidence)" |

Prometheus affects **how** information is presented, not **what** information is true.

## Implementation

Core learning algorithm:

1. **Signal collection** — Gather explicit + implicit preference signals
2. **Feature extraction** — Map signals to preference dimensions
3. **Bayesian update** — Update belief about preferences using signals
4. **Confidence tracking** — Measure certainty in each preference dimension
5. **Application** — Modify output based on learned profile

```typescript
interface Prometheus {
  getProfile(userId: string): UserProfile;
  setPreference(userId: string, key: string, value: any): void;
  recordSignal(userId: string, signal: PreferenceSignal): void;
  learn(userId: string): UserProfile;
  applyPreferences(output: string, profile: UserProfile): string;
}
```

See `references/prometheus-architecture.md` for technical details.