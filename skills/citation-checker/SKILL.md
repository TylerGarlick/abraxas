---
name: citation-checker
description: "Bibliography verification — pairs claims with sources and verifies citations"
user-invokable: true
argument-hint: "<check|flag|resolve|export> [options]"
---

# Citation Checker Skill

Bibliography verification tool that pairs claims with their sources. Ensures all assertions have proper documentation. The QA layer of the Abraxas citation system.

## Identity

Citation Checker is the quality assurance layer. While Scribe creates citations and Research Assistant manages projects, Citation Checker verifies that citations actually support the claims they're attached to. It answers: "Does this source actually say what we're claiming?"

## When to Use Citation Checker

- Before submitting research or documentation
- Verifying that cited sources support claims
- Checking bibliography for completeness
- Quality control for published work

## Commands

### /citation check [claim]

Verify a claim has sufficient source support.

**Usage:** `/citation check [claim]`

**Example:**
```
/citation check Python is the most popular programming language
→ Claim: "Python is the most popular programming language"
→ Source: TIOBE Index 2024
→ Verdict: Supported (ranked #1 in 2024)
```

### /citation flag [claim]

Mark a claim as needing verification.

**Usage:** `/citation flag [claim]`

**Example:**
```
/citation flag AI will replace all programmers by 2030
→ Flagged: No supporting sources found
→ Suggested: Add source or rephrase
```

### /citation resolve [citation ID]

Confirm or refute a citation's validity.

**Usage:** `/citation resolve [citation ID] [status]`

**Statuses:**
- `confirmed` — Source supports the claim
- `refuted` — Source contradicts the claim
- `partial` — Source partially supports claim

**Example:**
```
/citation resolve 3 confirmed
→ Citation 3 marked as confirmed
```

### /citation export

Export citation audit report.

**Usage:** `/citation export [format]`

**Formats:**
- `markdown` — Formatted report
- `json` — Structured data

**Example:**
```
/citation export markdown
→ # Citation Audit Report
→ 
→ ✓ Confirmed: 5
→ ⚠ Partial: 2
→ ✗ Refuted: 0
→ ⚐ Flagged: 3
```

## Claim-Source Pairing

Citation Checker maintains:
- Claims made in the session
- Sources cited for each claim
- Verification status
- Resolution notes

## Integration Points

### With Scribe

Imports citations from Scribe for verification.

### With Research Assistant

Verifies sources within research projects.

### With Retrieval

Can invoke Retrieval to fetch source content for verification.

## Constraints

1. **Claim-centric** — Focuses on claims, not just sources
2. **Manual resolution** — User confirms/refutes; not automated
3. **Requires sources** — Cannot verify claims without citations

## Quality Checklist

- [ ] All substantive claims have sources
- [ ] Sources actually support the claims
- [ ] Flagged claims are addressed
- [ ] Export provides actionable summary
