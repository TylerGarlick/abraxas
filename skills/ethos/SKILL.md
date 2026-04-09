# Ethos — Source Credibility Assessment

**Status:** ⚠️ In Progress  
**Phase:** Phase 2 (HIGH Priority)  
**Issue:** `abraxas-checkout-b3l`

---

## What Ethos Is

Ethos is a source credibility assessment system for AI reasoning. It addresses **source blindness** — the failure mode where AI systems treat all verification sources equally regardless of their actual credibility.

The problem: When verifying claims, AI systems often weight a peer-reviewed journal article the same as a random blog post. This leads to false confidence in poorly-sourced conclusions and inability to resolve conflicts between high and low-credibility sources.

Ethos makes source quality visible through:
- **Tier-based credibility scoring** (Tier 1-5)
- **Source database** with pre-scored examples
- **Conflict resolution** when sources disagree
- **Integration with Logos** for weighted verification

---

## Source Credibility Tiers

| Tier | Name | Description | Examples |
|------|------|-------------|----------|
| **Tier 1** | Peer-Reviewed | Academic journals, scientific publications | Nature, Science, PNAS, arXiv (peer-reviewed) |
| **Tier 2** | Major News | Established news organizations with editorial standards | Reuters, AP, BBC, NYT, Washington Post |
| **Tier 3** | Fact-Checkers | Dedicated fact-checking organizations | Snopes, PolitiFact, FactCheck.org |
| **Tier 4** | Industry | Trade publications, industry journals | IEEE Spectrum, TechCrunch, industry whitepapers |
| **Tier 5** | Unverified | Social media, blogs, unknown sources | Twitter, Reddit, personal blogs, wikis |

---

## Ethos Commands

| Command | Function |
|---------|----------|
| `/ethos-score {source}` | Get credibility score for a source (1-5) |
| `/ethos-check {claim}` | Check claim sources and return weighted credibility |
| `/ethos-source {name}` | Look up a source in the database |
| `/ethos-add {source} {tier}` | Add new source to database |
| `/ethos-conflict {claim}` | Analyze conflicting sources for a claim |
| `/ethos-list {tier}` | List all sources at a given tier |
| `/ethos-integrate` | Toggle Logos integration (on/off) |

---

## Integration with Logos

When Ethos integration is enabled, Logos verification includes source credibility weighting:

```
Claim: "X causes Y"
Sources:
  - Nature study (Tier 1) → Weight: 1.0
  - Reuters article (Tier 2) → Weight: 0.8
  - Blog post (Tier 5) → Weight: 0.2

Weighted confidence: HIGH (driven by Tier 1 source)
```

Without Ethos, all sources would be treated equally.

---

## API

### ethos-score.js

```javascript
const { scoreSource, getTier, getSourceInfo } = require('./ethos-score.js');

// Score a source (returns 1-5)
const score = scoreSource('Nature'); // Returns: 1

// Get tier name
const tier = getTier(1); // Returns: "Tier 1: Peer-Reviewed"

// Get source info
const info = getSourceInfo('Reuters'); 
// Returns: { name: 'Reuters', tier: 2, description: 'Major news agency' }
```

### ethos-check.js

```javascript
const { checkClaim } = require('./ethos-check.js');

const result = checkClaim("Climate change is real", [
  { source: 'Nature', year: 2023 },
  { source: 'Reuters', year: 2024 },
  { source: 'random-blog.com', year: 2024 }
]);

// Returns: {
//   weightedScore: 0.92,
//   tierBreakdown: { tier1: 1, tier2: 1, tier5: 1 },
//   confidence: 'HIGH',
//   conflicts: []
// }
```

---

## Files

- `SKILL.md` — This file
- `ethos-score.js` — Source scoring engine
- `ethos-check.js` — Claim verification with weighting
- `ethos-conflict.js` — Conflict resolution
- `sources.json` — Source database
- `tests/test.js` — Test suite

---

## Testing

Test coverage includes:
- Scoring accuracy (known sources return correct tier)
- Source conflict resolution (Tier 1 > Tier 5)
- Weighted confidence calculation
- Logos integration (source-aware verification)

Run tests: `npm test -- ethos`

---

## Related Systems

- **Logos** — Reasoning verification (Ethos provides source weighting)
- **Aletheia** — Plain language enforcement (Ethos ensures source transparency)
- **Honest** — Epistemic labeling (Ethos informs [KNOWN] vs [INFERRED])

---

**Last Updated:** 2026-04-09  
**Author:** Abraxas Team
