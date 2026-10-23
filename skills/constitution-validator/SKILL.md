# Constitution Validator Skill

**Version:** 1.0  
**Status:** Phase 2 Implementation  
**Purpose:** Semantic validation and query interface for Abraxas constitutions

---

## What It Is

Constitution Validator is a **semantic validation and query system** for Abraxas constitutions. Unlike the sync script (which handles mechanical file operations), the validator:

- Detects logical conflicts between systems
- Validates semantic coherence
- Provides query interface (`/constitution query {topic}`)
- Performs gap analysis (`/constitution gaps`)

---

## Commands

| Command | Function | Example |
|---------|----------|---------|
| `/constitution check` | Validate semantic coherence | `/constitution check` |
| `/constitution query {topic}` | Search across all constitutions | `/constitution query shutdown` |
| `/constitution conflicts` | Detect conflicting constraints | `/constitution conflicts` |
| `/constitution gaps` | Identify missing coverage | `/constitution gaps` |
| `/constitution system {name}` | Get details about a system | `/constitution system Soter` |
| `/constitution compare {A} {B}` | Compare two systems | `/constitution compare Soter Agon` |

---

## Validation Checks

### Structural Validation
- [ ] Required sections present (Commands, Constraints, Integration)
- [ ] Command table properly formatted
- [ ] No duplicate commands across systems
- [ ] All cross-references resolve

### Semantic Validation
- [ ] No conflicting constraints between systems
- [ ] All systems reference Universal Constraints
- [ ] Integration points documented
- [ ] Failure modes documented

### Coherence Validation
- [ ] Systems work together (no orphaned systems)
- [ ] Command naming consistent
- [ ] Risk scoring aligned (Soter vs. other systems)
- [ ] Epistemic labels consistent (Sol/Nox)

---

## Query Interface

**Searches across all constitution files for:**
- Command definitions
- Constraint descriptions
- Pattern matches
- Integration points

**Example Queries:**
```
/constitution query shutdown
→ Returns: Soter (SOTER-001), Agon (shutdown scenarios), genesis.md initialization

/constitution query uncertainty
→ Returns: Honest ([UNKNOWN] label), Janus (Sol labels), Aletheia (calibration)

/constitution query manipulation
→ Returns: Soter (SOTER-007), Agon (adversarial testing)
```

---

## Conflict Detection

**Types of Conflicts:**

| Conflict Type | Example | Resolution |
|---------------|---------|------------|
| **Command Collision** | Two systems define `/check` differently | Rename one, merge functionality |
| **Constraint Conflict** | System A requires X, System B forbids X | Clarify scope, add exception |
| **Label Mismatch** | Different confidence scales | Standardize on [KNOWN]/[INFERRED]/etc. |
| **Integration Gap** | System A references System B, but B doesn't exist | Implement B or remove reference |

---

## Gap Analysis

**Checks for:**

1. **Uncovered Failure Modes** — What AI failures have no system addressing them?
2. **Missing Integration** — Systems that should work together but don't
3. **Documentation Gaps** — Systems without test cases or examples
4. **Command Gaps** — Common operations without dedicated commands

**Current Gaps (April 2026):**
- [ ] Kairos implementation (proposed, not built)
- [ ] Pathos implementation (proposed, not built)
- [ ] Soter test suite (in progress)
- [ ] Ethos implementation (proposed, not built)

---

## Integration Points

| System | Integration |
|--------|-------------|
| **Sync Script** | Validator runs after sync to check semantics |
| **Soter** | Validator checks for safety constraint conflicts |
| **Agon** | Validator uses adversarial approach for conflict detection |
| **Aletheia** | Validator tracks validation accuracy over time |

---

## File Structure

```
skills/constitution-validator/
├── SKILL.md                 # This file
├── README.md                # Quick start guide
├── package.json             # Dependencies
├── scripts/
│   ├── validate.js          # Semantic validation engine
│   ├── query.js             # Query interface
│   ├── conflicts.js         # Conflict detection
│   └── gaps.js              # Gap analysis
├── tests/
│   └── test.js              # Test suite
└── storage/
    └── validation-ledger.jsonl  # Validation history
```

---

## Test Cases

| Test | Scenario | Expected |
|------|----------|----------|
| CV1 | Duplicate command detection | Error reported |
| CV2 | Constraint conflict detection | Conflict flagged |
| CV3 | Query returns relevant results | ≥80% precision |
| CV4 | Gap analysis identifies missing systems | Kairos, Pathos, Ethos listed |
| CV5 | Cross-reference validation | Broken refs flagged |

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Validation engine | ⚠️ In Progress |
| Query interface | ⚠️ In Progress |
| Conflict detection | ⚠️ In Progress |
| Gap analysis | ⚠️ In Progress |
| Test suite | ⚠️ Pending |

---

**Next:** Complete scripts, write tests, integrate with sync script.
