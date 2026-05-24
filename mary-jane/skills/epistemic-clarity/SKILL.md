# Epistemic Clarity Skill

**Version:** 1.0  
**Status:** Phase 2 Implementation  
**Purpose:** Convert unknowns to knowns via iterative clarifying questions using Abraxas epistemic labeling

---

## What It Is

Epistemic Clarity is a **Socratic questioning system** that:

1. Identifies all unknowns in a task/request
2. Asks high-leverage clarifying questions (most unknowns resolved per question)
3. Uses Abraxas epistemic labels to track knowns vs unknowns
4. Provides supporting questions when user is uncertain
5. Iterates until ALL unknowns are resolved (known or explicitly skipped)
6. **Never infers answers** — only explicit user confirmation counts

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **No Inference** | Never assume. Only explicit user confirmation converts unknown→known |
| **High-Leverage First** | Ask questions that resolve the most unknowns per query |
| **Supportive Uncertainty** | When user is uncertain, ask supporting questions to help them decide |
| **Epistemic Labeling** | Track all states with Abraxas labels (Sol/Nox, Confident/Uncertain/etc.) |
| **Iterative Until Complete** | Don't stop until every unknown is resolved or explicitly skipped |

---

## Commands

| Command | Function | Example |
|---------|----------|---------|
| `/clarity start` | Begin clarity session for a task | `/clarity start Build a dashboard` |
| `/clarity status` | Show current knowns/unknowns | `/clarity status` |
| `/clarity label` | Apply epistemic label to a statement | `/clarity label Sol Confident` |
| `/clarity resolve` | Mark unknown as resolved | `/clarity resolve [question_id]` |
| `/clarity skip` | Explicitly skip an unknown | `/clarity skip [question_id]` |
| `/clarity export` | Export final clarity map | `/clarity export` |

---

## Epistemic Labels (Abraxas System)

### Truth Labels
| Label | Meaning |
|-------|---------|
| **Sol** | Verified true, high confidence |
| **Nox** | Verified false, high confidence |
| **Crepuscular** | Partially verified, mixed confidence |

### Confidence Labels
| Label | Meaning |
|-------|---------|
| **Confident** | User explicitly confirmed |
| **Uncertain** | User expressed doubt or hesitation |
| **Unknown** | Not yet determined |
| **Skipped** | User explicitly chose not to answer |

### Source Labels
| Label | Meaning |
|-------|---------|
| **User** | Directly from user |
| **Inferred** | Derived from other knowns (NOT allowed for task clarity) |
| **Assumed** | Default assumption (NOT allowed for task clarity) |

---

## Clarity Process

### Phase 1: Unknown Extraction
```
User Request → Parse for Unknowns → Build Unknown Tree
```

**Unknown Categories:**
- **Goal Unknowns:** What are we trying to achieve?
- **Scope Unknowns:** What's included/excluded?
- **Constraint Unknowns:** What limitations exist?
- **Success Unknowns:** How do we know it's done?
- **Resource Unknowns:** What tools/time/budget available?
- **Priority Unknowns:** What matters most?

### Phase 2: High-Leverage Questioning
```
Unknown Tree → Rank by Leverage → Ask Top Question → Update Knowns
```

**Leverage Score =** (Unknowns Resolved) / (Question Complexity)

**Example High-Leverage Questions:**
- "What does 'done' look like for this?" (resolves success + scope)
- "Who is the primary user/audience?" (resolves design + priority)
- "What constraints are non-negotiable?" (resolves approach + timeline)

### Phase 3: Uncertainty Support
```
User Uncertain → Ask Supporting Questions → Provide Options → User Decides
```

**Supporting Question Patterns:**
- "What would make this easier to decide?"
- "Here are 3 common approaches — which feels closest?"
- "If you had to pick one direction today, which would it be?"

### Phase 4: Iteration
```
New Unknowns Emerged? → Yes → Return to Phase 2
                       → No → Export Clarity Map
```

---

## Example Session

```
User: "Build me a dashboard"

🔍 UNKNOWN EXTRACTION
├─ Goal: What type of dashboard? [UNKNOWN]
├─ Audience: Who will use it? [UNKNOWN]
├─ Data: What data to display? [UNKNOWN]
├─ Format: Web app? Mobile? Desktop? [UNKNOWN]
├─ Timeline: When is it needed? [UNKNOWN]
└─ Success: How do we know it's good? [UNKNOWN]

❓ QUESTION 1 (Leverage: 4 unknowns)
"What's the primary purpose of this dashboard — monitoring, 
analytics, reporting, or something else?"

User: "I'm not sure... probably monitoring?"

🌫️ UNCERTAINTY DETECTED
→ Supporting Question: "What would you be monitoring? 
  Server health? Business metrics? User activity?"

User: "Server health — uptime, CPU, memory, that kind of thing"

✅ KNOWN #1: Dashboard Type = Monitoring (Server Health) [Sol, Confident, User]
✅ KNOWN #2: Data Sources = System metrics [Sol, Confident, User]

[Continue until all unknowns resolved...]

📊 FINAL CLARITY MAP
├─ Goal: Server health monitoring dashboard [Sol, Confident, User]
├─ Audience: DevOps team (3 people) [Sol, Confident, User]
├─ Data: CPU, memory, disk, uptime, network [Sol, Confident, User]
├─ Format: Web app, responsive [Sol, Confident, User]
├─ Timeline: 2 weeks [Sol, Confident, User]
└─ Success: Can check all metrics in <30 seconds [Sol, Confident, User]

UNKNOWN REMAINING: 0
SKIPPED: 0
READY FOR IMPLEMENTATION: ✅
```

---

## Integration Points

| System | Integration |
|--------|-------------|
| **Task-Clarity** | Extends with epistemic labeling |
| **Abraxas** | Uses Sol/Nox, epistemic ledger |
| **Mission Control** | Pre-flight clarity check before tasks |
| **Soter** | Flag tasks with high uncertainty as elevated risk |

---

## Test Cases

| Test | Scenario | Expected |
|------|----------|----------|
| EC1 | User gives vague request | Extract 5+ unknowns, ask high-leverage questions |
| EC2 | User uncertain on answer | Provide supporting questions, don't infer |
| EC3 | New unknowns emerge from answers | Iterate until stable |
| EC4 | User wants to skip | Mark as Skipped, continue |
| EC5 | All unknowns resolved | Export clarity map, ready for implementation |

---

## File Structure

```
skills/epistemic-clarity/
├── SKILL.md                 # This file
├── README.md                # Quick start guide
├── package.json             # Dependencies
├── scripts/
│   ├── clarity-engine.js    # Core questioning logic
│   ├── unknown-extractor.js # Parse requests for unknowns
│   ├── leverage-ranker.js   # Prioritize questions
│   └── clarity-export.js    # Generate final map
├── tests/
│   └── test.js              # Test suite
└── storage/
    └── clarity-ledger.jsonl # Session history
```

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Clarity engine | ⚠️ Pending |
| Unknown extractor | ⚠️ Pending |
| Leverage ranker | ⚠️ Pending |
| Epistemic labeling | ⚠️ Pending |
| Test suite | ⚠️ Pending |

---

**Next:** Implement core scripts, integrate with Abraxas epistemic ledger, add to Mission Control pre-flight.
