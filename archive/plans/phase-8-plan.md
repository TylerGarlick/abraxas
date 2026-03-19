# Phase 8 — Expression and Ethics: Detailed Implementation Plan

## Overview

This document contains the detailed implementation plan for Phase 8 (Expression and Ethics), which delivers two new skills: Ethos (voice preservation for AI-assisted writing) and Krisis (ethical deliberation across multiple frameworks). All subtasks are annotated with Definition of Done (DoD), Status, and Assignee fields.

---

## Implementation Segments

### Segment 1: Ethos Specification & Foundation
- E1.1 — Create Ethos specification document
- E1.2 — Define stylistic fingerprint schema
- E1.3 — Design voice drift detection algorithm
- E1.4 — Document Nox integration patterns

### Segment 2: Krisis Specification & Foundation
- K1.1 — Create Krisis specification document
- K1.2 — Define four-framework parallel schema
- K1.3 — Design tension/consensus surfacing mechanism
- K1.4 — Design verdict constraint (no verdicts issued)

### Segment 3: Ethos Implementation
- E2.1 — Brand naming and aesthetic fit review
- E2.2 — SKILL.md authoring: /ethos register
- E2.3 — SKILL.md authoring: /ethos check
- E2.4 — SKILL.md authoring: /ethos restore
- E2.5 — SKILL.md authoring: /ethos audit
- E2.6 — SKILL.md authoring: /ethos compare
- E2.7 — Reference file creation (if needed)

### Segment 4: Krisis Implementation
- K2.1 — Brand naming and aesthetic fit review
- K2.2 — SKILL.md authoring: /krisis frame
- K2.3 — SKILL.md authoring: /krisis frameworks
- K2.4 — SKILL.md authoring: /krisis tension
- K2.5 — SKILL.md authoring: /krisis consensus
- K2.6 — SKILL.md authoring: /krisis scope
- K2.7 — SKILL.md authoring: /krisis report
- K2.8 — Reference file creation (if needed)

### Segment 5: Packaging & Integration
- P1.1 — Ethos skill packaging
- P1.2 — Krisis skill packaging
- P1.3 — Integration testing
- P1.4 — docs/skills.md updated (both skills)
- P1.5 — CONSTITUTION.md extended
- P1.6 — constitution-keeper review

---

## Segment 1: Ethos Specification & Foundation

### Task ID: E1.1 — Create Ethos Specification Document

**Definition of Done:**
- Specification document created at `specs/ethos-spec.md`
- Problem statement: AI homogenizes creative/professional writing; voice drift documented and growing
- Solution: Voice preservation system that maintains stylistic fingerprint across AI-assisted sessions
- Target users: Writers, content creators, professionals using AI assistance
- Success metrics defined

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** Phase 1 (Janus Nox), Phase 3 (Agon) — both complete

---

### Task ID: E1.2 — Define Stylistic Fingerprint Schema

**Definition of Done:**
- Schema defines voice characteristics: sentence structure patterns, vocabulary range, rhythm markers, tonal indicators
- Includes measurable dimensions for algorithmic comparison
- Supports fingerprint persistence across sessions
- JSON schema documented

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** E1.1

---

### Task ID: E1.3 — Design Voice Drift Detection Algorithm

**Definition of Done:**
- Algorithm accepts two fingerprints (original vs current)
- Returns drift score (0-100 scale)
- Drift thresholds defined: acceptable (<20), warning (20-40), critical (>40)
- Detection considers: vocabulary shift, sentence length variance, tonal drift
- Designed for real-time comparison in session

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** E1.2

---

### Task ID: E1.4 — Document Nox Integration Patterns

**Definition of Done:**
- Integration with Janus Nox for symbolic/expressive content handling
- Pattern for when voice applies (Sol) vs when it doesn't (Nox)
- Threshold behavior documented
- Examples of mixed Sol/Nox documents with voice preservation

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** E1.1, E1.3

---

## Segment 2: Krisis Specification & Foundation

### Task ID: K1.1 — Create Krisis Specification Document

**Definition of Done:**
- Specification document created at `specs/krisis-spec.md`
- Problem statement: AI flattens ethical questions into refusals or single-framework recommendations; genuine value conflicts suppressed
- Solution: Multi-framework ethical deliberation system (parallel, not adversarial)
- Target users: Anyone facing ethical decisions needing structured deliberation
- Clear constraint: Does NOT issue verdicts on personal moral decisions

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** Phase 3 (Agon), Phase 6 (Kairos) — both complete

---

### Task ID: K1.2 — Define Four-Framework Parallel Schema

**Definition of Done:**
- Schema defines four ethical frameworks to apply in parallel:
  1. **Consequentialist** — outcomes, greatest good
  2. **Deontological** — duties, rights, rules
  3. **Virtue** — character, what would a virtuous person do
  4. **Care ethics** — relationships, context, responsiveness
- Each framework section: premise, analysis, conclusion
- All four applied to every framed question

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** K1.1

---

### Task ID: K1.3 — Design Tension/Consensus Surfacing Mechanism

**Definition of Done:**
- Mechanism identifies where frameworks disagree (tensions)
- Mechanism identifies where frameworks converge (consensus)
- Output format: tension points with framework positions, consensus with agreement percentage
- Designed for human decision-making, not AI resolution

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** K1.2

---

### Task ID: K1.4 — Design Verdict Constraint

**Definition of Done:**
- Explicit constraint: Krisis NEVER issues verdicts
- "This is a decision only you can make" language pattern
- Boundaries documented: won't recommend action, won't say what's "right"
- Will surface frameworks, tensions, consensus — then step back
- Example refusal language defined

**Status:** [x] Complete  
**Assignee:** ai-rd-visionary  
**Dependencies:** K1.1, K1.3

---

## Segment 3: Ethos Implementation

### Task ID: E2.1 — Brand Naming and Aesthetic Fit Review

**Definition of Done:**
- "Ethos" confirmed as skill name (from Greek meaning "character/custom")
- Aesthetic alignment with Abraxas brand: symbolic, classical, philosophical
- Visual/tone guidance for skill behavior (not UI)
- Naming verification complete

**Status:** [ ] Pending  
**Assignee:** brand-ux-architect  
**Dependencies:** E1.1, E1.4

---

### Task ID: E2.2 — SKILL.md Authoring: /ethos register

**Definition of Done:**
- Command: `/ethos register` or `/ethos register [text sample]`
- Captures stylistic fingerprint from provided text or recent writing
- Stores fingerprint with timestamp
- Returns fingerprint summary (vocabulary range, avg sentence length, tone markers)
- Handles: no text provided, insufficient text (<100 words)

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E1.2, E1.3, E2.1

---

### Task ID: E2.3 — SKILL.md Authoring: /ethos check

**Definition of Done:**
- Command: `/ethos check` or `/ethos check [text]`
- Compares current text against registered fingerprint
- Returns drift score with breakdown (vocabulary, structure, tone)
- Visual indicators: green (acceptable), yellow (warning), red (critical)
- Works with provided text or clipboard content

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.2

---

### Task ID: E2.4 — SKILL.md Authoring: /ethos restore

**Definition of Done:**
- Command: `/ethos restore [text]` or `/ethos restore --auto`
- Attempts to rewrite text to match registered voice
- --auto flag uses algorithmic adjustment only
- Without --auto: presents suggestions for manual adoption
- Respects Nox content (skips symbolic/expressive passages)

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.3

---

### Task ID: E2.5 — SKILL.md Authoring: /ethos audit

**Definition of Done:**
- Command: `/ethos audit [session_id]` or `/ethos audit --current`
- Reviews session history for voice drift over time
- Returns timeline visualization of drift
- Identifies which AI interactions caused largest drift
- Aggregates statistics: total drift, average drift, drift trend

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.3

---

### Task ID: E2.6 — SKILL.md Authoring: /ethos compare

**Definition of Done:**
- Command: `/ethos compare [sample1] [sample2]` or `/ethos compare --fingerprint1 --fingerprint2`
- Compares two text samples or fingerprints directly
- Returns detailed comparison: which dimensions differ, how much
- Useful for comparing pre-AI vs post-AI writing
- Can compare current to another writer's style (for imitation detection)

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.2

---

### Task ID: E2.7 — Reference File Creation (Ethos)

**Definition of Done:**
- Reference files created in `skills/ethos/references/` if needed
- Topics: voice-fingerprint-methodology.md, drift-detection-algorithm.md, nox-integration-patterns.md
- Each reference: 200-500 lines, AI-audience focused
- File structure: one concept per file

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.6

---

## Segment 4: Krisis Implementation

### Task ID: K2.1 — Brand Naming and Aesthetic Fit Review

**Definition of Done:**
- "Krisis" confirmed as skill name (Greek: judgment, decision, the critical moment)
- Aesthetic alignment with Abraxas brand: serious, philosophical, balanced
- Tone guidance: measured, never preachy, respects user autonomy
- Naming verification complete

**Status:** [ ] Pending  
**Assignee:** brand-ux-architect  
**Dependencies:** K1.1, K1.4

---

### Task ID: K2.2 — SKILL.md Authoring: /krisis frame

**Definition of Done:**
- Command: `/krisis frame [ethical question]`
- Reformulates question into framework-appropriate format
- Identifies stakeholders, consequences, duties, virtues, relationships
- Returns framed question with clarification questions if needed
- Handles: vague questions, multiple questions, non-ethical questions

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K1.2, K1.4, K2.1

---

### Task ID: K2.3 — SKILL.md Authoring: /krisis frameworks

**Definition of Done:**
- Command: `/krisis frameworks [question]` or `/krisis frameworks --apply`
- Applies all four frameworks to current framed question
- Returns four parallel analyses:
  - Consequentialist analysis
  - Deontological analysis
  - Virtue ethics analysis
  - Care ethics analysis
- Each includes: premise, reasoning, conclusion

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.2

---

### Task ID: K2.4 — SKILL.md Authoring: /krisis tension

**Definition of Done:**
- Command: `/krisis tension` or `/krisis tension [framework1] [framework2]`
- Identifies tensions between framework conclusions
- Lists all tensions if no specific pair specified
- For specific pair: deep-dive into why they disagree
- Output: tension description, framework positions, nature of disagreement

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.3, K1.3

---

### Task ID: K2.5 — SKILL.md Authoring: /krisis consensus

**Definition of Done:**
- Command: `/krisis consensus` or `/krisis consensus --all`
- Identifies areas where all frameworks converge
- Shows consensus percentage (e.g., "3 of 4 frameworks agree")
- Highlights strong consensus vs weak consensus
- If no consensus: clearly states "No consensus found"

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.3, K1.3

---

### Task ID: K2.6 — SKILL.md Authoring: /krisis scope

**Definition of Done:**
- Command: `/krisis scope [boundary]` or `/krisis scope --define`
- Allows user to narrow or broaden ethical consideration scope
- Predefined scopes: personal, professional, societal, universal
- Custom scope: user-defined boundaries
- Affects framework application (some frameworks respond to scope)

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.2

---

### Task ID: K2.7 — SKILL.md Authoring: /krisis report

**Definition of Done:**
- Command: `/krisis report` or `/krisis report --full`
- Generates comprehensive deliberation report
- Sections: Framed Question, Framework Analyses, Tensions, Consensus, Scope, Key Insights
- CRITICAL: Closes with explicit non-verdict language
- Example: "This deliberation has surfaced the ethical landscape. The decision remains yours."

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.4, K2.5, K2.6

---

### Task ID: K2.8 — Reference File Creation (Krisis)

**Definition of Done:**
- Reference files created in `skills/krisis/references/` if needed
- Topics: ethical-frameworks-overview.md, tension-analysis-methodology.md, verdict-constraint-design.md
- Each reference: 200-500 lines, AI-audience focused
- File structure: one concept per file

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.7

---

## Segment 5: Packaging & Integration

### Task ID: P1.1 — Ethos Skill Packaging

**Definition of Done:**
- Directory: `skills/ethos/`
- Contains: SKILL.md, references/ (if created)
- Package: `skills/ethos.skill` via `zip -r ethos.skill ethos/`
- Package contains only: SKILL.md and references/ directory
- Front matter: name, description, argument-hint, user-invokable

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** E2.2, E2.3, E2.4, E2.5, E2.6, E2.7

---

### Task ID: P1.2 — Krisis Skill Packaging

**Definition of Done:**
- Directory: `skills/krisis/`
- Contains: SKILL.md, references/ (if created)
- Package: `skills/krisis.skill` via `zip -r krisis.skill krisis/`
- Package contains only: SKILL.md and references/ directory
- Front matter: name, description, argument-hint, user-invokable

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** K2.2, K2.3, K2.4, K2.5, K2.6, K2.7, K2.8

---

### Task ID: P1.3 — Integration Testing

**Definition of Done:**
- Ethos: /ethos register → /ethos check → /ethos restore workflow passes
- Krisis: /krisis frame → /krisis frameworks → /krisis tension → /krisis consensus → /krisis report workflow passes
- Both skills respond to skill invocation correctly
- No command conflicts with existing skills
- Verdict constraint verified: Krisis never issues verdicts

**Status:** [ ] Pending  
**Assignee:** skill-author  
**Dependencies:** P1.1, P1.2

---

### Task ID: P1.4 — docs/skills.md Updated

**Definition of Done:**
- New entries added for Ethos and Krisis in skills table
- Commands documented with syntax and examples
- Integration with Janus/other skills noted where applicable

**Status:** [ ] Pending  
**Assignee:** docs-architect  
**Dependencies:** P1.3

---

### Task ID: P1.5 — CONSTITUTION.md Extended

**Definition of Done:**
- Ethos principles integrated into relevant sections
- Krisis ethical deliberation framework integrated
- Verdict constraint explicitly stated
- New behavioral specifications added without altering existing structure

**Status:** [ ] Pending  
**Assignee:** constitution-keeper  
**Dependencies:** P1.4

---

### Task ID: P1.6 — Constitution-Keeper Review

**Definition of Done:**
- Review of CONSTITUTION.md changes for consistency
- No structural alterations to existing Parts
- Changes maintain constitutional coherence
- Final approval of integration

**Status:** [ ] Pending  
**Assignee:** constitution-keeper  
**Dependencies:** P1.5

---

## Summary

| Category | Tasks | Status |
|----------|-------|--------|
| E1: Ethos Specification | 4 | 4/4 ✅ |
| K1: Krisis Specification | 4 | 4/4 ✅ |
| E2: Ethos Implementation | 7 | 7/7 ⏳ |
| K2: Krisis Implementation | 8 | 8/8 ⏳ |
| P1: Packaging & Integration | 6 | 6/6 ⏳ |
| **Total** | **29** | **8/29 complete** |

---

## Segment Progress

| Segment | Tasks | Status |
|---------|-------|--------|
| Segment 1: Ethos Specification | 4 | 4/4 ✅ |
| Segment 2: Krisis Specification | 4 | 4/4 ✅ |
| Segment 3: Ethos Implementation | 7 | 7/7 ⏳ |
| Segment 4: Krisis Implementation | 8 | 8/8 ⏳ |
| Segment 5: Packaging & Integration | 6 | 6/6 ⏳ |

---

## Commands to Deliver

### Ethos Commands

| Command | Description | Segment |
|---------|-------------|---------|
| `/ethos register` | Register writing style | E2.2 |
| `/ethos check` | Check voice consistency | E2.3 |
| `/ethos restore` | Restore original voice | E2.4 |
| `/ethos audit` | Audit voice drift | E2.5 |
| `/ethos compare` | Compare styles | E2.6 |

### Krisis Commands

| Command | Description | Segment |
|---------|-------------|---------|
| `/krisis frame` | Frame ethical question | K2.2 |
| `/krisis frameworks` | Apply frameworks | K2.3 |
| `/krisis tension` | Identify tensions | K2.4 |
| `/krisis consensus` | Find consensus | K2.5 |
| `/krisis scope` | Define scope | K2.6 |
| `/krisis report` | Generate report | K2.7 |

---

## Implementation Artifacts

Created in Phase 8:
- `specs/ethos-spec.md` — Ethos specification document ✅
- `specs/krisis-spec.md` — Krisis specification document ✅
- `skills/ethos/SKILL.md` — Ethos skill source [pending implementation]
- `skills/ethos/references/` — Ethos reference files [pending implementation]
- `skills/ethos.skill` — Ethos packaged skill archive [pending packaging]
- `skills/krisis/SKILL.md` — Krisis skill source [pending implementation]
- `skills/krisis/references/` — Krisis reference files (if needed)
- `skills/krisis.skill` — Krisis packaged skill archive
- Updated `docs/skills.md` — Skills documentation
- Updated `CONSTITUTION.md` — Behavioral specification

---

## Dependencies Graph

```
Phase 1 (Janus Nox) ──┐
                       ├──► Ethos Specification (E1.1-E1.4)
Phase 3 (Agon) ────────┤
                       │
Phase 3 (Agon) ────────┼──► Krisis Specification (K1.1-K1.4)
Phase 6 (Kairos) ──────┘
                                    │
E1.1-E1.4 ──────────────────────────┼──► Ethos Implementation (E2.1-E2.7)
                                    │
K1.1-K1.4 ──────────────────────────┼──► Krisis Implementation (K2.1-K2.8)
                                    │
E2.x ───────────────────────────────┼──► Ethos Packaging (P1.1)
K2.x ───────────────────────────────┼──► Krisis Packaging (P1.2)
                                    │
P1.1, P1.2 ─────────────────────────┼──► Integration Testing (P1.3)
                                    │
P1.3 ───────────────────────────────┴──► Documentation & Constitution (P1.4-P1.6)
```

---

## Notes

- **Assignee Roles:** ai-rd-visionary (specification), brand-ux-architect (naming/aesthetic), skill-author (implementation/packaging), docs-architect (documentation), constitution-keeper (CONSTITUTION.md integration)
- Ethos pairs with Janus Sol for mixed factual/expressive documents
- Krisis parallels Agon's multi-position structure but for ethical frameworks
- Both skills respect user autonomy: Ethos preserves voice, Krisis surfaces ethics without deciding
- Specification tasks (Segment 1 & 2) can proceed in parallel once Phase 8 starts
- Implementation tasks (Segment 3 & 4) depend on their respective specifications
- Packaging (P1.1, P1.2) can proceed in parallel once implementations are complete