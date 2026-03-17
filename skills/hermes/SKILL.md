---
name: hermes
description: >
  Hermes — Multi-Agent Consensus & Divergence Tracker. Use this skill when multiple AI agents collaborate
  and you need to track consensus, detect divergence, or weight responses by track record. Track ledger of
  positions, detect convergence/divergence patterns. Commands: /hermes init, /hermes add, /hermes consensus,
  /hermes diverge, /hermes track-record, /hermes history, /hermes weight.
---

# Hermes — Multi-Agent Consensus & Divergence Tracker

Hermes (Greek: Ἑρμῆς, "the messenger") tracks consensus, disagreement, and information flow when multiple AI agents collaborate or when the same query is posed to multiple models. It maintains a ledger of positions, detects convergence/divergence patterns, and weights responses by historical track record.

## Why Hermes?

When multiple AI agents collaborate, there's no built-in mechanism to know whether they agree, who to trust when they disagree, or how consensus forms over time. Hermes adds:

- **Crowd-sourced epistemic judgment** — weighted by track record
- **Divergence detection** — identifies when agents meaningfully disagree
- **Consensus tracking** — shows how agreement evolves across interactions
- **Evidence trails** — every collaborative conclusion has a provenance chain

## Use Cases

1. **Multi-model queries**: Pose the same question to multiple models and track agreement
2. **Collaborative problem-solving**: Multiple agents work on the same problem, Hermes tracks convergence
3. **Consensus-building**: Over turns, see how agent positions evolve toward or away from agreement
4. **Trust weighting**: Weight responses by historical accuracy (track record)

## Storage Location

**`~/.abraxas/hermes/`**

```
~/.abraxas/hermes/
├── ledger.json      # Consensus/divergence ledger
├── track-records/  # Per-agent accuracy history
└── sessions/       # Session-specific consensus data
```

## Command Suite

| Command | Description |
|:---|:---|
| `/hermes init {session_id}` | Initialize a new Hermes consensus tracking session |
| `/hermes add {agent_id} {position}` | Add an agent's position to the current session |
| `/hermes consensus` | Compute consensus among tracked positions |
| `/hermes diverge` | Show divergence detection results |
| `/hermes track-record {agent_id}` | Show or update agent's historical track record |
| `/hermes history {topic?}` | Show consensus history, optionally filtered by topic |
| `/hermes weight {agent_id} {accuracy}` | Set/update agent's accuracy weight |
| `/hermes status` | Show current session status and participants |

## Core Concepts

### Agent Position

An agent's stated position on a query or claim:

```json
{
  "agent_id": "model-ollama-llama3",
  "timestamp": 1709999999,
  "position": "The capital of France is Paris",
  "confidence": "high",
  "reasoning": "Geographic fact, well-established"
}
```

### Consensus Types

- **Strong consensus**: ≥80% agreement with high confidence
- **Weak consensus**: 60-79% agreement
- **Divergence**: <60% agreement or conflicting high-confidence positions
- **Unknown**: Insufficient data for determination

### Track Record

Each agent has a weighted track record:

```json
{
  "agent_id": "model-ollama-llama3",
  "total_claims": 150,
  "verified_correct": 135,
  "accuracy": 0.90,
  "last_updated": 1709999999
}
```

### Weighted Consensus

Consensus weight = Σ(agent_accuracy × agent_position_agreement) / Σ(agent_accuracy)

This gives more weight to agents with better historical accuracy.

## Usage Examples

### Multi-Model Query

```
User: What is 2+2?

/hermes init math-001
/hermes add model-llama "4" 
/hermes add model-mixtral "4"
/hermes add model-codellama "4"
/hermes consensus
→ Strong consensus: 3/3 agents agree (100%)
→ Weighted consensus: 0.93 (based on track records)
→ Position: "4"
```

### Divergence Detection

```
User: What is the best programming language?

/hermes init lang-debate-001
/hermes add model-llama "Python is best for AI/ML"
/hermes add model-mixtral "Rust is best for safety"
/hermes add model-codellama "C++ is best for performance"
/hermes diverge
→ Divergence detected: 3 distinct positions
→ No consensus possible on subjective claim
→ Each agent's position noted with confidence
```

### Track Record Weighting

```
/hermes track-record model-llama
→ model-llama: 90% accuracy (135/150 verified claims)

/hermes weight model-llama 0.85
→ Updated: model-llama accuracy weight set to 0.85
```

## Integration with Janus

Hermes complements Janus by adding inter-agent perspective:

- Janus labels **[KNOWN]/[INFERRED]/[UNCERTAIN]/[UNKNOWN]** — single-model epistemic state
- Hermes tracks whether multiple models agree — multi-model epistemic state
- Together: you see both "Is this true?" (Janus) and "Do others agree?" (Hermes)

## Implementation

The core logic is in `src/hermes.ts`:

- `initSession(sessionId)` — Create new consensus session
- `addPosition(agentId, position)` — Add agent position
- `computeConsensus()` — Calculate consensus among positions
- `detectDivergence()` — Identify meaningful disagreement
- `getTrackRecord(agentId)` — Retrieve agent's accuracy history
- `updateTrackRecord(agentId, correct)` — Update after verification

See `references/hermes-architecture.md` for full technical details.