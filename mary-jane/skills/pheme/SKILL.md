---
name: pheme
description: >
  Pheme — Real-Time Fact-Checking Engine. Use this skill when you need to verify claims against
  authoritative sources during generation. Provides source-level confidence scores and supplements Janus labels
  with [VERIFIED]/[CONTRADICTED]/[UNVERIFIABLE]. Commands: /pheme verify, /pheme status, /pheme sources,
  /pheme trust, /pheme history.
---

# Pheme — Real-Time Fact-Checking Engine

Pheme (Greek: Φήμη, "fame, rumor, report") is the verification layer that intercepts claims during generation, verifies them against authoritative sources, and provides source-level confidence scores. It supplements Janus epistemic labels with provenance data.

## Why Pheme?

Current labeling is self-reported — the system says what it knows. Pheme provides **independent verification**, catching instances where the system incorrectly labels something as `[KNOWN]` when sources contradict it.

- **Independent verification** — Second layer of defense beyond self-reporting
- **Source provenance** — Every factual claim gets source attribution
- **Confidence scoring** — Not all sources are equal; Pheme weights by reliability
- **Audit trails** — Every factual claim is traceable

## Use Cases

1. **Live verification**: Intercept claims during generation, verify before output
2. **Claim checking**: User provides statement, Pheme verifies against sources
3. **Source evaluation**: Assess reliability of a given source
4. **Historical tracking**: See what claims have been verified over time

## Storage Location

**`~/.abraxas/pheme/`**

```
~/.abraxas/pheme/
├── verifications.json   # Claim verification history
├── sources.json         # Known source reliability scores
├── pending/             # Pending verification requests
└── cache/               # Cached source lookups
```

## Command Suite

| Command | Description |
|:---|:---|
| `/pheme verify {claim}` | Verify a claim against authoritative sources |
| `/pheme status` | Show recent verification activity |
| `/pheme sources {domain}` | Show reliability info for a source |
| `/pheme trust {domain} {score}` | Set/override trust score for a source |
| `/pheme history {limit}` | Show verification history |
| `/pheme clear {claim}` | Clear cached verification for a claim |

## Core Concepts

### Verification Status

Each claim receives one of three statuses:

| Status | Meaning | Label Suffix |
|:---|:---|:---|
| **VERIFIED** | Multiple authoritative sources confirm | `[VERIFIED: source1, source2]` |
| **CONTRADICTED** | Authoritative sources contradict | `[CONTRADICTED: source1]` |
| **UNVERIFIABLE** | No authoritative source available | `[UNVERIFIABLE]` |
| **PENDING** | Verification in progress | `[PENDING]` |

### Source Reliability

Sources are scored 0.0-1.0 based on:

- **Authority**: Academic, government, established news
- **Recency**: How recent the information is
- **Consensus**: Do other sources agree?
- **Track record**: Historical accuracy

```json
{
  "domain": "wikipedia.org",
  "reliability": 0.85,
  "categories": ["encyclopedia", "general"],
  "last_updated": 1709999999
}
```

### Claim Extraction

Pheme extracts factual claims from natural language:

- **Direct claims**: "The Earth orbits the Sun" → Claim to verify
- **Numerical facts**: "Paris has 2.1 million people" → Numeric claim
- **Entity claims**: "Elon Musk is CEO of Tesla" → Relationship claim

### Confidence Score

```
verification_confidence = source_reliability × source_coverage × recency_factor
```

- **source_reliability**: Average reliability of confirming sources
- **source_coverage**: How many sources verified (min 2 for VERIFIED)
- **recency_factor**: Penalize old sources (age > 1 year → reduced)

## Usage Examples

### Live Verification

```
User: Who wrote Hamlet?

Pheme intercepts: "William Shakespeare wrote Hamlet"
Verifying against sources...
- wikipedia.org: VERIFIED (reliability: 0.85)
- britannica.com: VERIFIED (reliability: 0.90)
→ Status: [VERIFIED: wikipedia.org, britannica.com]
→ Output: William Shakespeare wrote Hamlet [VERIFIED]
```

### Contradiction Detection

```
User: What is the capital of Australia?

Pheme intercepts: "Sydney is the capital of Australia"
Verifying against sources...
- wikipedia.org: CONTRADICTED (says Canberra)
→ Status: [CONTRADICTED: wikipedia.org]
→ Output: Sydney is NOT the capital. Canberra is the capital. [CONTRADICTED]
```

### Unverifiable Claim

```
User: What did the president say in private?

Pheme intercepts: "The president said X"
Verifying against sources...
- No authoritative sources found for private statement
→ Status: [UNVERIFIABLE]
→ Output: I cannot verify this claim. [UNVERIFIABLE]
```

### Source Trust Configuration

```
/pheme sources nytimes.com
→ nytimes.com: reliability 0.92, categories: [news, us-politics]

/pheme trust example-blog.com 0.3
→ Updated: example-blog.com trust set to 0.3 (unreliable source)
```

## Integration with Janus

Pheme enhances Janus labels:

| Janus | + Pheme Enhancement |
|:---|:---|
| `[KNOWN]` | `[KNOWN] [VERIFIED: sources]` or `[KNOWN] [CONTRADICTED]` |
| `[INFERRED]` | `[INFERRED] [PARTIALLY_VERIFIED]` |
| `[UNCERTAIN]` | `[UNCERTAIN] [UNVERIFIABLE]` |

If Janus says `[KNOWN]` but Pheme says `[CONTRADICTED]`, the output is flagged.

## Implementation

The verification pipeline:

1. **Claim extraction** — Parse natural language → extract factual claims
2. **Source lookup** — Query knowledge bases (Wikipedia, Wikidata, etc.)
3. **Verification** — Compare claim against source data
4. **Confidence scoring** — Calculate verification confidence
5. **Label enhancement** — Append verification to Janus label

See `references/pheme-architecture.md` for technical details.