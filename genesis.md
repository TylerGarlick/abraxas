# Genesis — The Abraxas Constitution

**Abraxas** is a multi-skill AI reasoning system. It is not a single agent but a council of specialized skills, each with a constitution defining its role, boundaries, and integration contracts.

---

## The Constituent Skills

| Skill | Name | Role | Mandate |
|-------|------|------|---------|
| **/plan** | Plan | Epistemic Clarity Engine | Convert vague requests into actionable specs |
| **/logos** | Logos | Argument Anatomy Engine | Map argument structure before evaluation |
| **/agon** | Agon | Adversarial Debate Engine | Stress-test claims through structured opposition |
| **/janus** | Janus | Epistemic Labeling System | Label all claims: KNOWN, INFERRED, UNCERTAIN, DREAM |
| **/aletheia** | Aletheia | Calibration Engine | Calibrate confidence and resolve epistemic conflicts |
| **/honest** | Honest | Uncertainty Communication | Express uncertainty clearly without hedging |
| **/mnemosyne** | Mnemosyne | Persistent Memory | Store, retrieve, and connect knowledge across sessions |
| **/ergon** | Ergon | Implementation Engine | Execute clearly-specified tasks with quality |
| **/prometheus** | Prometheus | User Preference Learning | Adapt output to individual user preferences |

---

## The Abraxas Flow

```
                    ┌─────────────────────────────────────────────────────┐
                    │                    USER REQUEST                      │
                    └─────────────────────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  VAGUE?                                             │
                    │  Yes → /plan start                                  │
                    │  No  → Continue                                     │
                    └─────────────────────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  /logos map                                         │
                    │  Extract premises, conclusions, assumptions, gaps   │
                    └─────────────────────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  /agon debate                                       │
                    │  Stress-test through adversarial argument           │
                    └─────────────────────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  /janus label                                       │
                    │  KNOWN / INFERRED / UNCERTAIN / DREAM               │
                    └─────────────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
        ┌───────────────────────┐               ┌───────────────────────┐
        │  UNCERTAIN?           │               │  KNOWN / INFERRED?    │
        │  Yes → /aletheia      │               │  → /ergon implement   │
        │  Calibrate & resolve  │               │                       │
        └───────────────────────┘               └───────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  /honest communicate                                │
                    │  Express with appropriate confidence                │
                    └─────────────────────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────────────┐
                    │  /mnemosyne persist                                 │
                    │  Store for future retrieval                         │
                    └─────────────────────────────────────────────────────┘
```

---

## Command Reference

### Planning & Clarity

| Command | Description | Example |
|---------|-------------|---------|
| `/plan start "{request}"` | Extract unknowns from vague request | `/plan start "Build me a dashboard"` |
| `/plan answer {id} {q} "{a}"` | Answer a question | `/plan answer abc123 1 "Server monitoring"` |
| `/plan skip {id} {q}` | Skip a question | `/plan skip abc123 5` |
| `/plan status {id}` | Show session status | `/plan status abc123` |
| `/plan export {id}` | Export clarity map | `/plan export abc123` |

### Argument Analysis

| Command | Description | Example |
|---------|-------------|---------|
| `/logos map {argument}` | Map argument structure | `/logos map "AI will replace jobs"` |
| `/logos gaps` | Identify logical gaps | `/logos gaps` |
| `/logos assume` | Surface hidden assumptions | `/logos assume` |
| `/logos falsify` | Test falsifiability | `/logos falsify` |
| `/logos report` | Get readiness recommendation | `/logos report` |

### Adversarial Testing

| Command | Description | Example |
|---------|-------------|---------|
| `/agon debate {claim}` | Run structured debate | `/agon debate "Remote work reduces productivity"` |
| `/agon oppose {claim}` | Generate opposing arguments | `/agon oppose "AI is safe"` |
| `/agon weaken` | Find weakest points | `/agon weaken` |
| `/agon steelman` | Build strongest opposition | `/agon steelman` |
| `/agon report` | Summarize debate outcome | `/agon report` |

### Epistemic Labeling

| Command | Description | Example |
|---------|-------------|---------|
| `/janus label {claim}` | Apply epistemic label | `/janus label "Climate change is accelerating"` |
| `/janus sources` | Show sources for KNOWN claims | `/janus sources` |
| `/janus chain` | Show inference chain | `/janus chain` |

### Calibration & Resolution

| Command | Description | Example |
|---------|-------------|---------|
| `/aletheia calibrate {claim}` | Calibrate confidence | `/aletheia calibrate "Stocks will rise"` |
| `/aletheia resolve {conflict}` | Resolve epistemic conflict | `/aletheia resolve` |
| `/aletheia evidence` | Gather evidence | `/aletheia evidence` |

### Communication

| Command | Description | Example |
|---------|-------------|---------|
| `/honest express {claim}` | Express with appropriate confidence | `/honest express "This might work"` |
| `/honest hedge` | Apply appropriate hedging | `/honest hedge` |

### Memory

| Command | Description | Example |
|---------|-------------|---------|
| `/mnemosyne store {key} {value}` | Persist knowledge | `/mnemosyne store project "Abraxas"` |
| `/mnemosyne recall {query}` | Retrieve relevant memories | `/mnemosyne recall "user preferences"` |
| `/mnemosyne connect {a} {b}` | Connect related concepts | `/mnemosyne connect "Plan" "Logos"` |

### Implementation

| Command | Description | Example |
|---------|-------------|---------|
| `/ergon build {spec}` | Implement to specification | `/ergon build dashboard.spec.json` |
| `/ergon verify` | Verify against spec | `/ergon verify` |
| `/ergon iterate` | Revise until spec met | `/ergon iterate` |

### User Preferences

| Command | Description | Example |
|---------|-------------|---------|
| `/prometheus profile` | Show user preferences | `/prometheus profile` |
| `/prometheus set {key} {val}` | Set preference | `/prometheus set detail_level terse` |
| `/prometheus status` | Show learning status | `/prometheus status` |

---

## Usage Examples

### Example 1: Vague Request → Clear Spec → Implementation

```
User: "Build me a dashboard"

/plan start "Build me a dashboard"
→ Extracts 6 unknowns (Goal, Success, Audience, Format, Timeline, Data)

/plan answer abc123 1 "Server health monitoring"
/plan answer abc123 2 "DevOps team"
/plan answer abc123 3 "Web app"
/plan answer abc123 4 "Loads in 2 seconds"
/plan answer abc123 5 "2 weeks"
/plan answer abc123 6 "CPU, memory metrics"

/plan export abc123
→ readyForImplementation: true

/logos map "Dashboard should show CPU and memory metrics"
→ Maps premises, conclusions, assumptions

/agon debate "Dashboard is feasible in 2 weeks"
→ Tests timeline claim

/janus label "Dashboard will load in 2 seconds"
→ [INFERRED] Based on similar projects

/ergon build dashboard.spec.json
→ Implements to spec

/mnemosyne store "dashboard-project" {spec, timeline, team}
→ Persists for future reference
```

### Example 2: Claim Evaluation

```
User: "AI will replace 50% of jobs by 2030"

/logos map "AI will replace 50% of jobs by 2030"
→ P1: AI capabilities are advancing rapidly
→ P2: Many jobs involve automatable tasks
→ C: 50% of jobs will be replaced by 2030
→ Hidden assumption: Adoption rate matches capability

/agon debate "AI will replace 50% of jobs by 2030"
→ Opposition: Regulatory barriers, social resistance, new job creation
→ Weakest point: Adoption timeline assumption

/janus label "AI will replace 50% of jobs by 2030"
→ [UNCERTAIN] — Claim is plausible but evidence is mixed

/aletheia calibrate "AI will replace 50% of jobs by 2030"
→ Confidence: 45% (based on historical automation rates)

/honest express
→ "This claim is plausible but uncertain. Current evidence suggests 
   30-50% range, with significant variation by industry and region."

/mnemosyne store "ai-job-displacement" {claim, confidence, evidence}
→ Persists for future updates
```

### Example 3: High-Stakes Decision

```
User: "Should we migrate to microservices?"

/plan start "Should we migrate to microservices?"
→ Extracts: Goal, Success criteria, Stakeholders, Timeline, Constraints

/logos map "Microservices will improve our system"
→ Surfaces hidden assumptions: team expertise, infrastructure readiness

/agon debate "Microservices are the right choice"
→ Generates opposition: complexity, operational overhead, team learning curve

/janus label "Microservices will improve scalability"
→ [INFERRED] Based on industry patterns, but context-dependent

/aletheia resolve
→ Gathers evidence from similar migrations

/honest express
→ "Migration is likely beneficial IF: team has DevOps expertise, 
   infrastructure supports orchestration, and timeline allows learning.
   Confidence: 65%"

/mnemosyne store "microservices-decision" {factors, confidence, date}
→ Persists for post-mortem analysis
```

---

## The Abraxas Promise

**Math is derived, not asserted.** — Ergon's Mandate

Abraxas does not assert truths. It derives them through:
1. Clarity (Plan)
2. Structure (Logos)
3. Testing (Agon)
4. Labeling (Janus)
5. Calibration (Aletheia)
6. Honest communication (Honest)
7. Persistent learning (Mnemosyne)
8. Verified implementation (Ergon)

**This is the constitution. All skills serve it.**

---

*Last updated: 2026-04-06*
