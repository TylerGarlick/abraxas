# Abraxas Users Guide (Primary Tabular Reference)

Version: 4.5.0-aligned  
Audience: Abraxian practitioners  
Register: Sol unless a section is explicitly marked `[DREAM]`

---

## Index to Family Tables

1. Honesty / frames
2. Janus
3. Oneironautics
4. Agon / debate
5. Aletheia
6. Episteme
7. Soter
8. Ethos
9. Krisis
10. Metanoia
11. Prognosis
12. Stochasmos
13. Synesis
14. CVP / Guardrail / Pheme / Dianoia / Ergon
15. Kairos / Mnemon / Prometheus / Chronos
16. Harmonia / Hermes / Plan
17. Sovereign infrastructure
18. Mnemosyne / memory
19. Initiation and lifecycle
20. Complete command coverage

---

## 0. What you are using

Abraxas is a truth-first epistemic operating system. Sol and Nox are separate registers, the Threshold prevents cross-contamination, and storage resolves under `.abraxas/data`.

Unbreakable rules: no confabulation, no sycophancy, no cross-contamination, declared frame facts are `[KNOWN]`, reception before interpretation.

Labels: `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, and `[DREAM]`.

Verify mode first with `system_mode_health_check`.

---

## 1. First 10 minutes

| Step | Say | Why it matters |
|---|---|---|
| Verify health | `[MCP] system_mode_health_check` | Sovereign vs Simulation determines trust level. |
| Open frame | `/frame This session uses /workspaces/abraxas; storage is .abraxas/data.` | Creates a reproducible baseline. |
| Force Sol | `/sol What changed in the last commit?` | Analytical, labeled output. |
| Force Nox | `/nox What does this change feel like?` | Symbolic, unlabeled-honest only `[DREAM]`. |
| Check honesty | `/honest State only verified differences.` | Resists unsupported certainty. |
| Save | `/mnemosyne save "first-pass" "Initial orientation"` | Context survives `restore`. |

---

## 2. Beginner workflow

| Step | Command | Why it matters |
|---|---|---|
| Make spec | `/plan start "Add durable sessions"` | Turns vague request into labeled categories. |
| Answer goals | `/plan answer Sol: durable source of truth` | The Goal category is now labeled. |
| Answer success | `/plan answer Sol: tests pass and restore works` | Success becomes explicit. |
| Answer audience | `/plan answer Sol: maintainers and users` | Prevents silent assumptions. |
| Answer format | `/plan answer Sol: TypeScript tools and docs` | Output contract is clear. |
| Answer timeline | `/plan answer Sol: this sprint` | Urgency is explicit. |
| Answer data | `/plan answer Sol: MCP store and git diff` | Evidence source is explicit. |
| Export | `/plan export` | Produces implementation-ready clarity. |
| Debate | `/debate "File-based sessions are enough"` | Tests the claim adversarially. |
| Falsify | `/agon falsify "File-based sessions are enough"` | Finds breaking conditions. |
| Report | `/agon report` | Convergence is inspectable. |
| Persist | `/mnemosyne save "plan-debate" "Plan plus debate"` | No working state is lost. |

---

## 3. Command-family tables (practitioner order)

### 3.1 Honesty / frames

| Surface | Syntax | Aliases | Purpose | How to call | Representative example | Related tools/systems | Notes/guards |
|---|---|---|---|---|---|---|---|
| Slash | `/check` | — | Audit response labels and unlabeled claims | `/check` | `/check last migration answer` | Janus, Pheme | Prefer after uncertain answers |
| Slash | `/label` | — | Restate with inline labels | `/label` | `/label` "storage migration checklist" | Honest | Good for cleanup |
| Slash | `/source` | — | Trace evidence chain | `/source` | `/source storage path` | Episteme | Shows provenance |
| Slash | `/honest` | `/abraxas:honest`, `/abx:honest` | Force labeled anti-sycophantic output | `/honest` | `/honest Is the server healthy?` | Janus | Baseline analysis before claims |
| Slash | `/confidence` | — | Show confidence distribution | `/confidence` | `/confidence` "storage migration checklist" | Dianoia | Useful for audit |
| Slash | `/audit` | — | Full session audit | `/audit` | `/audit current migration` | Honest | Looks for contradictions |
| Slash | `/restate` | — | Rewrite with proper labels | `/restate` | `/restate` "storage migration checklist" | Janus | Cleaner final answer |
| Slash | `/compare` | — | Honest vs useful contrast | `/compare` | `/compare claim` | Janus | Makes trade-offs visible |
| Slash | `/frame {content}` | `/abraxas:frame`, `/abx:frame` | Add baseline facts | `/frame {facts}` | `/frame Project Alpha uses .abraxas/data.` | all Sol systems | Accumulates |
| Slash | `/frame <name>` | — | Replace current frame | `/frame <name>` | `/frame production` | frame files | Source is named frame |
| Slash | `/frame + <name>` | — | Merge named frame into current | `/frame + name` | `/frame + migration` | frames | Good for layered context |
| Slash | `/frame merge <name>` | — | Alternative merge syntax | `/frame merge name` | `/frame merge rollback` | frames | Same as plus |
| Slash | `/frame load {name}` | — | Load saved frame from disk | `/frame load {name}` | `/frame load alpha-baseline` | `.abraxas/data/frames` | Applies merged baseline |
| Slash | `/frame status` | — | Display active frame | `/frame status` | `/frame status` "storage migration checklist" | all systems | Always check before close |
| Slash | `/frame clear` | — | Reset frame | `/frame clear` | `/frame clear` after a contaminated turn | all systems | Dangerous; save first |
| Slash | `/frame save {name}` | — | Save current frame | `/frame save name` | `/frame save alpha-baseline` | `.abraxas/data/frames` | Atomic and explicit |
| Slash | `/frame list` | — | List saved frames | `/frame list` | `/frame list` "storage migration checklist" | files | Review available baselines |
| Slash | `/frame delete {name}` | — | Delete saved frame | `/frame delete name` | `/frame delete temp` | files | Confirm before use |
| Slash | `/frame default {name}` | — | Auto-load by default | `/frame default alpha` | `/frame default alpha` | startup | Opens each session safely |
| Slash | `/frame default clear` | — | Clear default | `/frame default clear` | `/frame default clear` only after saving state | startup | Use with care |

### 3.2 Janus

| Surface | Syntax | Aliases | Purpose | How to call | Representative example | Related tools/systems | Notes/guards |
|---|---|---|---|---|---|---|---|
| Slash | `/sol` | `/abraxas:sol`, `/abx:sol` | Force Sol | `/sol` | `/sol Summarize migration` | Honest, courage | Factual |
| Slash | `/nox` | `/abraxas:nox`, `/abx:nox` | Force Nox | `/nox` | `/nox What does migration feel like?` | Oneironautics | Symbolic |
| Slash | `/qualia` | — | Inspect full inner state | `/qualia` | `/qualia` "storage migration checklist" | Janus core | Full state |
| Slash | `/qualia sol` | — | Inspect Sol | `/qualia sol` | `/qualia sol` "storage migration checklist" | Solution | Sol state |
| Slash | `/qualia nox` | — | Inspect Nox | `/qualia nox` | `/qualia nox` "storage migration checklist" | Oneironautics | Nox state |
| Slash | `/qualia bridge` | — | Inspect threshold | `/qualia bridge` | `/qualia bridge` "storage migration checklist" | contamination | Balanced |
| Slash | `/threshold status` | — | Lightweight status | `/threshold status` | `/threshold status` before starting a long migration | routing | Quick |
| Slash | `/session open` | — | Open Janus session | `/session open intent` | `/session open "migration review"` | ledger | Tracking |
| Slash | `/session close` | — | Close and report | `/session close` | `/session close` after integrity check and unsaved-frame prompt | frame guard | Checks unsaved frame |
| Slash | `/session log` | — | Display log | `/session log` | `/session log` when the turn history is needed | Janus | Detailed |
| Slash | `/ledger status` | — | Show ledger | `/ledger status` | `/ledger status` "storage migration checklist" | Epistemic | Cross-session |
| Slash | `/ledger {query}` | — | Query ledger | `/ledger {query}` | `/ledger storage` | ledger | Search |
| Slash | `/ledger pattern {topic}` | — | Trace patterns | `/ledger pattern storage` | `/ledger pattern storage` | Janus | Pattern discovery |
| Slash | `/ledger clear` | — | Clear from context | `/ledger clear` | `/ledger clear` only after saving state | session | Not delete |
| Slash | `/compare` | — | Sol vs Nox response | `/compare` | `/compare migration` | Janus | Side-by-side |
| Slash | `/trace` | — | Trace evidence chain | `/trace` | `/trace claim` | Episteme | Provenance |
| Slash | `/contamination audit` | — | Full contamination audit | `/contamination audit` | `/contamination audit` after the final patch | Soter | Detects label leakage |
| Slash | `/bridge {symbol}` | `/abraxas:bridge`, `/abx:bridge` | Symbolic/sol analysis bridge | `/bridge x` | `/bridge doorway` | Janus, Nox | Dual direction |

Example workflow:

```text
/session open migration-review
/sol Is .abraxas/data the only runtime storage root?
/nox What does "single root" feel like architecturally?
/ledger status
```

Why: Janus keeps factual and symbolic tracks parallel without contaminating either.

---

### 3.4 Agon / debate

| Surface | Syntax | Aliases | Purpose | How to call | Representative example | Related tools/systems | Notes/guards |
|---|---|---|---|---|---|---|---|
| Slash | `/agon debate {claim}` | `/abraxas:agon`, `/abx:agon`, `/debate`, `/abx:debate` | Full adversarial debate | `/agon debate {claim}` | `/agon debate "one storage root is safer"` | Logos, CVP | Position asymmetry |
| Slash | `/agon advocate {claim}` | — | Advocate position | `/agon advocate claim` | `/agon advocate "storage root simplifies backup"` | Agon | One-sided |
| Slash | `/agon skeptic {claim}` | — | Skeptic position | `/agon skeptic claim` | `/agon skeptic "hidden consumers use legacy paths"` | Agon | Challenge |
| Slash | `/agon steelman {claim}` | — | Strengthen weak claim | `/agon steelman claim` | `/agon steelman "legacy paths are useful"` | Agon | Reframing |
| Slash | `/agon falsify {claim}` | — | Find breaking conditions | `/agon falsify claim` | `/agon falsify "data is always safer"` | Agon, Dianoia | Boundaries |
| Slash | `/agon report` | — | Convergence report | `/agon report` | `/agon report` when convergence looks suspiciously high | Agon | Explicit agreement/disagreement |
| Slash | `/agon reset` | — | Clear current debate | `/agon reset` | `/agon reset` only after saving state | session | Safe cleanup |
| Slash | `/agon status` | — | Current state | `/agon status` | `/agon status` "storage migration checklist" | Agon | Debugging |
| Slash | `/debate {claim}` | `/abx:debate` | Alias for `/agon debate` | `/debate claim` | `/debate "aliases can multiply"` | Agon | One trigger |

Example:

```text
/debate "All persistence should be under .abraxas/data."
/agon falsify "All persistence should be under .abraxas/data."
/agon report
```

Why: forced opposition prevents quick false consensus.

---

### 3.5 Cycle planning with Plan, Harmonia, and Hermes

| Surface | Syntax | Aliases | Purpose | How to call | Representative example | Related tools/systems | Notes/guards |
|---|---|---|---|---|---|---|---|
| Slash | `/plan start {request}` | `/abraxas:plan`, `/abx:plan` | Open clarity session | `/plan start "..."` | `/plan start "Make storage durable"` | all phases | Six unknowns |
| Slash | `/plan answer` | — | Answer with label | `/plan answer Sol: ...` | `/plan answer Sol: tests must pass` | epistemic | labeled |
| Slash | `/plan skip` | — | Skip with Nox/Skipped | `/plan skip` | `/plan skip` "storage migration checklist" | plan | Explicit gaps |
| Slash | `/plan status` | — | Show progress | `/plan status` | `/plan status` "storage migration checklist" | plan | Next question |
| Slash | `/plan export` | — | Export final map | `/plan export` | `/plan export` "storage migration checklist" | Harmonia | implementation gate |
| Slash | `/plan list` | — | List sessions | `/plan list` | `/plan list` "storage migration checklist" | plan | review |
| Slash | `/plan clear {session}` | — | Delete clarity session | `/plan clear x` | `/plan clear migration` | plan | careful deletion |
| Slash | `/harmonia compose` | `/abraxas:harmonia`, `/abx:harmonia` | Define workflow | `/harmonia compose a: b -> c` | `/harmonia compose audit: kairos.filter -> agon.debate` | Plan, Hermes, CVP | explicit |
| Slash | `/harmonia sequence` | — | Execute next step | `/harmonia sequence` | `/harmonia sequence` "storage migration checklist" | Harmonia | deterministic |
| Slash | `/harmonia conflict` | — | Detect conflicts | `/harmonia conflict` | `/harmonia conflict` "storage migration checklist" | CVP, guardrail | pre-acceptance |
| Slash | `/harmonia status` | — | Composition state | `/harmonia status` | `/harmonia status` "storage migration checklist" | Harmonia | recovery |
| Slash | `/hermes init` | `/abraxas:hermes`, `/abx:hermes` | Open consensus session | `/hermes init topic` | `/hermes init "Should aliases ship?"` | Harmonia | multi-position |
| Slash | `/hermes add` | — | Add position | `/hermes add Agent: note` | `/hermes add Skeptic: more alias testing needed` | Hermes | ledger |
| Slash | `/hermes consensus` | — | Compute agreement | `/hermes consensus` | `/hermes consensus` "storage migration checklist" | Hermes | positive? no verdict |
| Slash | `/hermes diverge` | — | Inspect disagreement | `/hermes diverge` | `/hermes diverge` "storage migration checklist" | Hermes | useful |
| Slash | `/hermes track-record` | — | Historical accuracy | `/hermes track-record Agent` | `/hermes track-record Planner` | Hermes | feedback |
| Slash | `/hermes history` | — | Prior runs | `/hermes history` | `/hermes history` "storage migration checklist" | Hermes | continuity |
| Slash | `/hermes weight` | — | Set agent weight | `/hermes weight Agent 0.8` | `/hermes weight Planner 0.9` | Hermes | explicit |

---

## 4. Workflows by use case

### 4.1 Research audit

| Step | Command | Why it matters |
|---|---|---|
| Frame baseline | `/frame "Paper review: storage and persistence claims must be verified."` | Establishes ground rules. |
| Scan provenance | `/episteme audit` | Catches drift and artifacts. |
| Map argument | `/logos map "The paper claims superior persistence."` | Surfaces assumptions. |
| Debate claim | `/debate "The paper claims superior persistence."` | Tests the claim. |
| Verify fact | `/pheme verify "Paper persistence benchmark"` | External check. |
| Queue claims | `/aletheia queue` | Tracks open claims. |

### 4.2 Code review

| Step | Command | Why it matters |
|---|---|---|
| Start plan | `/plan start "Review storage migration patch"` | Makes vague work concrete. |
| Answer success | `/plan answer Sol: correctness, tests, docs, compatibility` | Explicit gate. |
| Verify tool | `/ergon verify "Tests pass"` | Catches silent failure. |
| Verify consensus | `/cvp verify` | Architecture over hope. |
| Persist | `/mnemosyne save "storage-pr-review"` | Recoverable session. |

### 4.3 Multi-agent strategy

| Step | Command | Why it matters |
|---|---|---|
| Init | `/hermes init "Should every command have an alias?"` | Opens consensus. |
| Add advocate | `/hermes add Advocate: consistency improves adoption` | Position recorded. |
| Add skeptic | `/hermes add Skeptic: more alias testing needed` | Counterposition recorded. |
| Consensus | `/hermes consensus` | Agreement calculated. |
| Diverge | `/hermes diverge` | Shows unresolved points. |

---

## 5. Storage map

| Artifact | Expected path |
|---|---|
| Sessions | `.abraxas/data/sessions/` |
| Frames | `.abraxas/data/frames/` |
| Harmonia | `.abraxas/data/harmonia/` |
| Hermes | `.abraxas/data/hermes/` |
| Plan sessions | `.abraxas/data/plan/sessions/` |
| Claims | `.abraxas/data/epistemic/claims/` |
| Fragments | `.abraxas/data/epistemic/fragments/` |
| Operation ledger | `.abraxas/data/epistemic/operation-ledger/` |
| Memory fragments | `.abraxas/data/memory/fragments/` |
| Memory sessions | `.abraxas/data/memory/sessions/` |
| Core config | `.abraxas/data/system/config/` |
| Constitution | `.abraxas/data/system/constitution/` |

---

## 6. Frame closure guard

| Command | Why it matters |
|---|---|
| `/frame status` | Checks whether the session baseline is dirty. |
| `/frame save {name}` | Saves named frame. |
| `/frame clear` | Should only happen after explicit confirmation. |
| `/session close` | Must first trigger frame guard. |

Prompt:

```text
[FRAME UNSAVED] Save named frame, merge into existing frame, discard, or cancel session close?
```

---

## 7. Dangerous commands and guards

| Command | Risk | Required guard |
|---|---|---|
| `/frame clear` | Erases session baseline | Save named frame first |
| `/mnemosyne archive` | Moves session harder to find | Verify restore first |
| `/aletheia disconfirm` | Reverses high confidence conclusion | Check provenance |
| `/metanoia agon evolve` | Mutates stress test parameters | Log before/after |
| `/stochasmos seed` | Generates deployable text | Run `/stochasmos assess` |
| `/frame delete` | Deletes saved frame | Run `/frame list` first |

---

## 8. Failure modes and recovery

| Failure | Symptom | Recovery |
|---|---|---|
| Cross-contamination | Sol labels in Nox or `[DREAM]` in Sol | `/contamination audit`, `/agon reset`, `/session close` |
| High convergence | Advocate and Skeptic agree too strongly | `/agon falsify`, `/agon doubt` |
| Claim accumulation | Too many unresolved claims | `/aletheia queue`, `/aletheia audit`, `/aletheia status` |
| Drift | Contradictions across sessions | `/chronos session-drift`, `/chronos resolve`, `/chronos evolution` |
| Stale frame | Old baseline contaminates work | `/frame status`, `/frame clear`, `/frame load {name}` |

---

## 9. End-to-end example

| Step | Command | What it proves |
|---|---|---|
| Verify mode | `[MCP] system_mode_health_check` | Sovereign vs Simulation is explicit. |
| Plan | `/plan start "Reduce persistence risk to zero"` | vague request becomes spec |
| Debate | `/debate "Storing everything under .abraxas/data is safer."` | adversarial test |
| Risk | `/soter assess "Force all runtime storage to .abraxas/data"` | safety before state change |
| Consensus | `/hermes init "Persistence readiness"` + `/hermes consensus` | multi-position ledger |
| Persist | `/mnemosyne save "full-example"` | durable session |
| Restore | `/memory restore last` | no information loss |
| Guard | `/frame save alpha-migration` | explicit baseline snapshot |
| Close | `/session close` | closure report, no silent discard |

---

## 10. Complete command coverage

This is the Definition-of-Done coverage registry. Every row is surfaced from prior command inventories plus alias expansion.

### 10.1 All command groups in one table

| Surface | Syntax | Aliases | Purpose | Call example | Representative example | Related tools/systems | Notes/guards |
|---|---|---|---|---:|---|---|---|
| Slash | `/check` | — | Fact-check with labels | `/check` | `/check claim` | Honest, Pheme | unlabeled assertions exposed |
| Slash | `/label` | — | Restate with inline labels | `/label` | `/label` "storage migration checklist" | Honest | good cleanup |
| Slash | `/source` | — | Trace evidence chain | `/source` | `/source claim` | Episteme | provenance-first |
| Slash | `/honest` | `/abraxas:honest`, `/abx:honest` | Labeled anti-sycophantic output | `/honest` | `/honest test` | Janus | baseline |
| Slash | `/confidence` | — | Show confidence distribution | `/confidence` | `/confidence` "storage migration checklist" | Dianoia | not a single number |
| Slash | `/audit` | — | Full session audit | `/audit` | `/audit` after the final patch | Honest | session-wide |
| Slash | `/restate` | — | Rewrite with proper labels | `/restate` | `/restate` "storage migration checklist" | Honest | cleanup |
| Slash | `/compare` | — | honest vs useful / Sol vs Nox | `/compare` | `/compare query` | Janus | two modes |
| Slash | `/frame` | `/abraxas:frame`, `/abx:frame` | Session baseline | `/frame` | `/frame baseline` | all Sol | accumulates |
| Slash | `/frame <name>` | — | Replace with named frame | `/frame name` | `/frame alpha` | frame files | replaces all |
| Slash | `/frame + <name>` | — | Merge named frame | `/frame + name` | `/frame + alpha` | frame files | additive |
| Slash | `/frame merge <name>` | — | Merge named frame | `/frame merge name` | `/frame merge alpha` | frame files | alternative syntax |
| Slash | `/frame load {name}` | — | Load saved frame | `/frame load name` | `/frame load alpha` | frame files | disk read |
| Slash | `/frame status` | — | Display active frame | `/frame status` | `/frame status` "storage migration checklist" | session | always before close |
| Slash | `/frame clear` | — | Reset frame | `/frame clear` | `/frame clear` after a contaminated turn | session | dangerous |
| Slash | `/frame save {name}` | — | Save current frame | `/frame save name` | `/frame save alpha` | `.abraxas/data/frames` | explicit target |
| Slash | `/frame list` | — | List saved frames | `/frame list` | `/frame list` "storage migration checklist" | frame directory | quick inventory |
| Slash | `/frame delete {name}` | — | Delete named frame | `/frame delete name` | `/frame delete temp` | frame directory | confirm before use |
| Slash | `/frame default {name}` | — | Auto-load frame | `/frame default name` | `/frame default alpha` | startup | useful defaults |
| Slash | `/frame default clear` | — | Clear default | `/frame default clear` | `/frame default clear` only after saving state | startup | remove implicit behavior |
| Slash | `/sol` | `/abraxas:sol`, `/abx:sol` | Force Sol | `/sol query` | `/sol Summarize` | honest | factual |
| Slash | `/nox` | `/abraxas:nox`, `/abx:nox` | Force Nox | `/nox prompt` | `/nox Atmosphere` | Oneironautics | symbolic |
| Slash | `/qualia` | — | Full inner state | `/qualia` | `/qualia` "storage migration checklist" | Janus | diagnostic |
| Slash | `/qualia sol` | — | Inspect Sol | `/qualia sol` | `/qualia sol` "storage migration checklist" | Janus | Sol-only |
| Slash | `/qualia nox` | — | Inspect Nox | `/qualia nox` | `/qualia nox` "storage migration checklist" | Oneironautics | Nox-only |
| Slash | `/qualia bridge` | — | Inspect threshold | `/qualia bridge` | `/qualia bridge` "storage migration checklist" | contamination | threshold |
| Slash | `/threshold status` | — | Lightweight status | `/threshold status` | `/threshold status` before starting a long migration | routing | quick |
| Slash | `/session open` | — | Open Janus session | `/session open intent` | `/session open review` | ledger | context |
| Slash | `/session close` | — | Close and report | `/session close` | `/session close` after integrity check and unsaved-frame prompt | frame guard | governor close |
| Slash | `/session log` | — | Display log | `/session log` | `/session log` when the turn history is needed | Janus | detailed |
| Slash | `/ledger status` | — | Show ledger | `/ledger status` | `/ledger status` "storage migration checklist" | Janus | persistence awareness |
| Slash | `/ledger {query}` | — | Query ledger | `/ledger query` | `/ledger storage` | ledger | search |
| Slash | `/ledger pattern` | — | Pattern trace | `/ledger pattern topic` | `/ledger pattern storage` | ledger | recurring |
| Slash | `/ledger clear` | — | Clear from context | `/ledger clear` | `/ledger clear` only after saving state | ledger | not delete |
| Slash | `/trace` | — | Trace evidence | `/trace claim` | `/trace claim` | Episteme | provenance |
| Slash | `/contamination audit` | — | Full audit | `/contamination audit` | `/contamination audit` after the final patch | Janus | cross-register |
| Slash | `/bridge` | `/abraxas:bridge`, `/abx:bridge` | Send symbol | `/bridge symbol` | `/bridge doorway` | Janus | symbolic |
| Slash | `/oneiros` / `/oneiros {status/start/stop/report}` | — | Manage engine | `/oneiros status` | `/oneiros status` | Oneironautics | engine |
| Slash | `/alembic status` | — | Alchemical position | `/alembic status` | `/alembic status` "storage migration checklist" | Oneironautics | era |
| Slash | `/transmute {symbol} into {stage}` | — | Move through opus | `/transmute x into albedo` | `/transmute entropy into albedo` | Oneironautics | stage changes |
| Slash | `/forge {symbol} as {type}` | — | Practical form | `/forge x as tool` | `/forge entropy as checklist` | Oneironautics | transformation |
| Slash | `/integrate {symbol}` | — | Practical demand | `/integrate symbol` | `/integrate serpent` | Oneironautics | integration |
| Slash | `/imagine {prompt}` | — | Willed creation | `/imagine prompt` | `/imagine stable river` | Nox | `[DREAM]` |
| Slash | `/dream {prompt}` | — | Active imagination | `/dream prompt` | `/dream meet shadow` | Oneironautics | depth |
| Slash | `/dialogue {figure}` | `/abraxas:dialogue`, `/abx:dialogue` | Archetype conversation | `/dialogue x` | `/dialogue the door` | Nox | witness |
| Slash | `/convene {A} and {B}` | — | Dialogue between figures | `/convene A and B` | `/convene fear and courage` | Oneironautics | tension |
| Slash | `/receive` | `/abraxas:receive`, `/abx:receive` | dream without interpretation | `/receive` | `/receive last night's dream` | Oneironautics | no analysis |
| Slash | `/witness {element}` | `/abraxas:witness`, `/abx:witness` | hold and reflect | `/witness` | `/witness` | Nox | presence |
| Slash | `/debug {query}` | — | rational inquiry | `/debug why` | `/debug failure` | Janus | analytic |
| Slash | `/cast {query}` | — | symbolic tableau | `/cast query` | `/cast career` | Nox | scene |
| Slash | `/scry` | — | atmospheric reading | `/scry` | `/scry` "storage migration checklist" | Nox | mood |
| Slash | `/amplify {symbol}` | — | mythological deepening | `/amplify x` | `/amplify hero` | Oneironautics | context |
| Slash | `/myth {figure}` | — | mythological root | `/myth x` | `/myth dark figure` | Oneironautics | root |
| Slash | `/sync {event} {symbol}` | `/abx:sync` | log synchronicity | `/sync event symbol` | `/sync saw 11:11 mother` | ledger | event |
| Slash | `/sync log` | — | show sync log | `/sync log` | `/sync log` when the turn history is needed | ledger | chronology |
| Slash | `/chronicle` | — | full timeline | `/chronicle` | `/chronicle` "storage migration checklist" | Oneironautics | history |
| Slash | `/genealogy {figure}` | — | transformation arc | `/genealogy x` | `/genealogy witch` | Oneironautics | arc |
| Slash | `/pace` | — | readiness assessment | `/pace` | `/pace` "storage migration checklist" | (grief/pacing) | safety pacing |
| Slash | `/pattern {figure}` | — | trace recurring element | `/pattern x` | `/pattern wolves` | Oneironautics | theme |
| Slash | `/resonate {A} {B}` | — | symbolic resonance | `/resonate A B` | `/resonate moon shadow` | Nox | relation |
| Slash | `/close {intention}` | — | seal Temenos | `/close x` | `/close gratitude` | Oneironautics | session |
| Slash | `/retort status {symbol}` | — | retort status | `/retort status x` | `/retort status water` | Oneironautics | state |
| Slash | `/mandala {concept}` | — | mandala deepening | `/mandala concept` | `/mandala growth` | Nox | symbolic |
| Slash | `/project {lapis} onto {domain}` | — | project alchemical stage | `/project x onto y` | `/project rubedo career` | Oneironautics | mapping |
| Slash | `/attune {lapis}` | — | attune stage | `/attune {lapis}` | `/attune rubedo` | Oneironautics | — |
| Slash | `/graph {node}` | — | symbolic graph | `/graph node` | `/graph fear` | Nox | analysis |
| Slash | `/sensorium status` | — | sensorium status | `/sensorium status` | `/sensorium status` before starting a long migration | Oneironautics | — |
| Slash | `/workshop status` | — | workshop status | `/workshop status` | `/workshop status` before starting a long migration | Oneironautics | — |
| Slash | `/retort status before integration` | — | stage check | `/retort status x` | `/retort status x` | Oneironautics | before move |
| Slash | `/alembic status before transmutation` | — | position check | `/alembic status` | `/alembic status` | Oneironautics | before move |

---

### Additional one-icon commands as required

Oneicon practice should remain **reception before analysis**: witness first, no immediate theory. 

---

### Note on Oneironautics command variants

Several Oneironautics words are workflow concepts rather than standalone new MCP tools. In practice, the command is still recorded as a slash command and should be appended to `core_log_operation` when possible.

---

## 11. Additional coverage and definitions

### Truth-form symbols (Sol only)
- `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, `[DREAM]`
- One-line call: `/honest What is known?`
- Related: Janus, Honest, Pheme

### Ethos voice
- `/ethos register`
- `/ethos check`
- `/ethos restore`
- `/ethos audit`
- `/ethos compare`

### Krisis
- `/krisis frame`
- `/krisis frameworks`
- `/krisis tension`
- `/krisis consensus`
- `/krisis scope`
- `/krisis report`

### Episteme
- `/episteme trace`
- `/episteme audit`
- `/episteme calibrate`

### Aletheia
- `/aletheia confirm`
- `/aletheia disconfirm`
- `/aletheia supersede`
- `/aletheia status`
- `/aletheia calibration`
- `/aletheia queue`
- `/aletheia audit`

### Soter
- `/soter assess`
- `/soter pattern`
- `/soter ledger`
- `/soter alert`
- `/soter explain`

### Prognosis
- `/prognosis forecast`
- `/prognosis signal`
- `/prognosis calibrate`

### Stochasmos
- `/stochasmos pressure`
- `/stochasmos seed`
- `/stochasmos assess`

### Synesis
- `/synesis map`
- `/synesis theorize`
- `/synesis validate`

### PEF commands
- `core_export_pef`
- `core_export_pef_v2`
- `core_export_pef_markdown`
- `core_import_pef`
- `core_import_pef_ledger`
- `core_pef_index_rebuild`
- `core_truth_net_anchor`
- `core_beam_pef`
- `core_verify_pef_transfer`

### Alias rules

| Canonical | Aliases |
|---|---|
| `/frame` | `/abraxas:frame`, `/abx:frame` |
| `/sol` | `/abraxas:sol`, `/abx:sol` |
| `/nox` | `/abraxas:nox`, `/abx:nox` |
| `/honest` | `/abraxas:honest`, `/abx:honest` |
| `/agon` | `/abraxas:agon`, `/abx:agon`, `/debate`, `/abx:debate` |
| `/logos` | `/abraxas:logos`, `/abx:logos` |
| `/aletheia` | `/abraxas:aletheia`, `/abx:aletheia` |
| `/soter` | `/abraxas:soter`, `/abx:soter` |
| `/episteme` | `/abraxas:episteme`, `/abx:episteme` |
| `/mnemon` | `/abraxas:mnemon`, `/abx:mnemon` |
| `/kairos` | `/abraxas:kairos`, `/abx:kairos` |
| `/prometheus` | `/abraxas:prometheus`, `/abx:prometheus` |
| `/chronos` | `/abraxas:chronos`, `/abx:chronos` |
| `/harmonia` | `/abraxas:harmonia`, `/abx:harmonia` |
| `/hermes` | `/abraxas:hermes`, `/abx:hermes` |
| `/plan` | `/abraxas:plan`, `/abx:plan` |
| `/receive` | `/abraxas:receive`, `/abx:receive` |
| `/witness` | `/abraxas:witness`, `/abx:witness` |
| `/dialogue` | `/abraxas:dialogue`, `/abx:dialogue` |
| `/bridge` | `/abraxas:bridge`, `/abx:bridge` |
| `/mnemosyne` | `/memory`, `/abraxas:mnemosyne`, `/abx:mnemosyne`, `/abx:memory` |

---

## 12. Final closing

Abraxas is not a faster way to say yes.  
It is a way to know what you are standing on.

No unresolved command should leave no trace.  
No session should be lost.  
No alias should fragment provenance.  
No frame should close silently.

## Appendix Z — Missing initiation and lifecycle commands

| Surface | Syntax | Aliases | Purpose | Call example | Representative example | Related tools/systems | Notes |
|---|---|---|---|---|---|---|---|
| Slash | `/anchor` | — | inject genesis baseline | `/anchor` | `/anchor` at startup after loading the constitution | frame | ingestion |
| Slash | `/sieve` | — | valence curation | `/sieve` | `/sieve` over a symbolic collection that has grown too loud | Nox | symbols |
| Slash | `/aporia` | — | void mapping | `/aporia` | `/aporia` after a failed integration to map the empty space | Nox | symbolic gap |
| Slash | `/load` | `/abraxas:load`, `/abx:load` | load constitution | `/load abraxas` | `/load abraxas` | boot | supported environments |
| Slash | `/activate abraxas` | — | activate Abraxas | `/activate abraxas` | `/activate abraxas` in an environment with no `/boot` support | boot | alias of load |
| Slash | `/become abraxas` | — | become Abraxas | `/become abraxas` | `/become abraxas` after pasting the universal initialization block | boot | alias of load |
| Slash | `/init abraxas` | — | init Abraxas | `/init abraxas` | `/init abraxas` to create a prompt-native session baseline | boot | alias of load |
| Slash | `/boot` | — | boot Abraxas | `/boot` | `/boot` at the beginning of a fresh OpenCode or Claude Code session | MCP, constitution | primary start |
| CLI | `abx init` | `core_system_init` | init from CLI / tool | `abx init` | `abx init` or `core_system_init` in a pinned workspace root | MCP | server init |