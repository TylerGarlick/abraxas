# Abraxas v2.0 — Next Systems Implementation Plan

**Based on:** `research/13-subagent-next-systems-report.md`  
**Created:** 2026-03-19  
**Priority:** Logos → Chronos → Aitia → Scribe

---

## Phase 1: Logos (Compositional Verification Engine)

**Timeline:** Weeks 1-3 (10-12 days)  
**Priority:** High  
**Impact:** Direct hallucination reduction (40-60% per research)

### Task 100: Logos System Implementation

#### Subtask 100.1: Claim Decomposition Parser
- [ ] Research NLP parsing approaches for SVO triplets
- [ ] Implement claim → atomic proposition parser
- [ ] Handle logical operators (AND, OR, NOT, IMPLIES)
- [ ] Test on 50+ complex claims from test corpus
- [ ] Document parsing accuracy metrics

#### Subtask 100.2: Atomic Verification Integration
- [ ] Integrate with existing Pheme verification
- [ ] Integrate with Janus labeling system
- [ ] Create verification pipeline: atom → verify → label
- [ ] Handle verification failures gracefully
- [ ] Add unit tests for verification flow

#### Subtask 100.3: Confidence Combination Engine
- [ ] Research probabilistic logic approaches (noisy-OR, product rules)
- [ ] Implement confidence combination algorithms
- [ ] Handle divergent component verification (flagging logic)
- [ ] Test on benchmark claims with known ground truth
- [ ] Document confidence calibration results

#### Subtask 100.4: Logos API & Commands
- [ ] Create `/logos decompose` command
- [ ] Create `/logos verify` command
- [ ] Create `/logos confidence` command
- [ ] Add API endpoints for programmatic access
- [ ] Write usage documentation

#### Subtask 100.5: Testing & Validation
- [ ] Run 100+ test claims through full pipeline
- [ ] Compare holistic vs. compositional confidence
- [ ] Measure hallucination reduction rate
- [ ] Validate against EMNLP 2025 research findings
- [ ] Write test report with metrics

**Definition of Done:**
- ✅ All 5 subtasks complete
- ✅ 100+ test claims processed
- ✅ Hallucination reduction ≥40%
- ✅ Documentation written
- ✅ Pushed to GitHub

---

## Phase 2: Chronos (Temporal Coherence Tracker)

**Timeline:** Weeks 4-6 (10-12 days)  
**Priority:** High  
**Impact:** Multi-session coherence, prevents unflagged belief drift

### Task 101: Chronos System Implementation

#### Subtask 101.1: Temporal Claim Index
- [ ] Design temporal ledger schema (claim + timestamp + session_id)
- [ ] Index existing Mnemosyne session storage
- [ ] Implement claim extraction from sessions
- [ ] Build temporal query API (get claims between T1-T2)
- [ ] Test indexing on 1000+ historical claims

#### Subtask 101.2: Contradiction Detection Engine
- [ ] Research semantic contradiction detection (NLI models)
- [ ] Implement contradiction scoring algorithm
- [ ] Handle partial contradictions (degree of conflict)
- [ ] Test on known contradictory claim pairs
- [ ] Document detection accuracy

#### Subtask 101.3: Epistemic Drift Flagging
- [ ] Define drift detection rules (claim-N vs claim-N+k)
- [ ] Implement automatic drift flagging
- [ ] Distinguish implicit vs. explicit revision
- [ ] Create user-facing drift alerts
- [ ] Test on multi-session investigations

#### Subtask 101.4: Timeline Visualization
- [ ] Design epistemic timeline UI concept
- [ ] Implement text-based timeline output
- [ ] Add claim evolution tracking
- [ ] Create "diff" view for claim changes
- [ ] Document visualization options

#### Subtask 101.5: Chronos Commands & Integration
- [ ] Create `/chronos timeline` command
- [ ] Create `/chronos drift` command
- [ ] Create `/chronos contradict` command
- [ ] Integrate with Aletheia calibration tracking
- [ ] Write usage documentation

**Definition of Done:**
- ✅ All 5 subtasks complete
- ✅ 1000+ claims indexed
- ✅ Contradiction detection ≥85% accuracy
- ✅ Drift alerts working
- ✅ Documentation written

---

## Phase 3: Aitia (Causal Reasoning Engine)

**Timeline:** Weeks 7-10 (15-20 days)  
**Priority:** High (strategic)  
**Impact:** Enables rigorous "what if" analysis for decision-making

### Task 102: Aitia System Implementation

#### Subtask 102.1: Causal Graph Representation
- [ ] Research DAG representation formats (DOT, graphml, JSON)
- [ ] Design causal graph schema for Abraxas
- [ ] Implement graph data structure
- [ ] Add graph serialization/deserialization
- [ ] Test on 50+ causal scenarios

#### Subtask 102.2: Natural Language → Causal Graph Parser
- [ ] Research NL → causal graph approaches (2025-2026 papers)
- [ ] Implement causal claim extraction
- [ ] Build causal graph constructor from parsed claims
- [ ] Handle confounders, mediators, colliders
- [ ] Test parsing accuracy on benchmark dataset

#### Subtask 102.3: Causal Query Engine
- [ ] Implement association queries (P(Y|X))
- [ ] Implement intervention queries (P(Y|do(X)))
- [ ] Implement counterfactual queries (P(Y|X=x') given X=x)
- [ ] Add causal confidence propagation
- [ ] Test all three query levels

#### Subtask 102.4: Causal Confidence Integration
- [ ] Integrate with Dianoia uncertainty quantification
- [ ] Implement causal confidence scores
- [ ] Add Janus labeling to causal claims
- [ ] Handle causal confusion detection (correlation vs. causation)
- [ ] Test calibration on known causal scenarios

#### Subtask 102.5: Aitia Commands & API
- [ ] Create `/aitia graph` command (show causal graph)
- [ ] Create `/aitia query` command (causal queries)
- [ ] Create `/aitia intervene` command (interventional reasoning)
- [ ] Create `/aitia counterfactual` command
- [ ] Write comprehensive documentation

#### Subtask 102.6: Validation & Benchmarking
- [ ] Test on 100+ causal reasoning benchmarks
- [ ] Compare to baseline (no causal reasoning)
- [ ] Measure policy error reduction (target: 35-50%)
- [ ] Validate against NeurIPS 2025 research
- [ ] Write validation report

**Definition of Done:**
- ✅ All 6 subtasks complete
- ✅ 100+ causal benchmarks passed
- ✅ Policy error reduction ≥35%
- ✅ Causal confidence calibrated
- ✅ Documentation written

---

## Phase 4: Scribe (Source Provenance & Citation Integrity)

**Timeline:** Weeks 11-14 (12-15 days)  
**Priority:** Medium-High  
**Impact:** Maintains citation integrity over time, prevents source decay

### Task 103: Scribe System Implementation

#### Subtask 103.1: Source Metadata Capture
- [ ] Design source metadata schema (URL, date, type, domain)
- [ ] Implement metadata extraction at claim creation
- [ ] Handle multiple source types (academic, news, blogs, etc.)
- [ ] Add source persistence to Mnemosyne
- [ ] Test on 500+ sourced claims

#### Subtask 103.2: Source Reliability Scoring
- [ ] Research source reliability factors (peer review, domain authority, correction history)
- [ ] Design scoring algorithm (0-100 reliability score)
- [ ] Implement initial scoring based on domain/type
- [ ] Add dynamic score adjustment over time
- [ ] Test scoring on known reliable/unreliable sources

#### Subtask 103.3: Source Re-Validation Pipeline
- [ ] Build periodic re-validation scheduler (cron job)
- [ ] Integrate retraction monitoring APIs (Retraction Watch, Crossref)
- [ ] Implement link rot detection (HTTP status checks)
- [ ] Add correction notice monitoring
- [ ] Test re-validation on 100+ sources over 30 days

#### Subtask 103.4: Source Decay Alerts
- [ ] Define alert triggers (retraction, downgrade, link rot)
- [ ] Implement alert generation system
- [ ] Create user-facing alert notifications
- [ ] Add alert escalation for high-impact claims
- [ ] Test alert system on known retracted sources

#### Subtask 103.5: Scribe Commands & API
- [ ] Create `/scribe source` command (show source metadata)
- [ ] Create `/scribe reliability` command (show reliability score)
- [ ] Create `/scribe validate` command (re-validate source)
- [ ] Create `/scribe alerts` command (show active alerts)
- [ ] Write comprehensive documentation

#### Subtask 103.6: Citation Integrity Validation
- [ ] Test on 200+ cited claims over 60 days
- [ ] Measure source decay detection rate
- [ ] Validate against FAccT 2025 research (23% decay rate)
- [ ] Measure time-to-detection for retractions
- [ ] Write validation report

**Definition of Done:**
- ✅ All 6 subtasks complete
- ✅ 200+ sources tracked
- ✅ Source decay detection ≥90%
- ✅ Retraction alerts working
- ✅ Documentation written

---

## Cross-System Integration Tasks

### Task 104: System Integration & Orchestration

#### Subtask 104.1: Unified Pipeline Design
- [ ] Design request routing: User → Logos → (Janus/Pheme/Scribe) → Chronos → Aitia
- [ ] Implement pipeline orchestration
- [ ] Handle system failures gracefully
- [ ] Add pipeline logging/observability
- [ ] Test end-to-end flow

#### Subtask 104.2: Shared State Management
- [ ] Design shared state schema across systems
- [ ] Implement state synchronization
- [ ] Handle concurrent access safely
- [ ] Add state persistence layer
- [ ] Test state consistency

#### Subtask 104.3: Unified Command Interface
- [ ] Create `/abraxas v2` command (show all systems status)
- [ ] Create `/abraxas status` command (system health)
- [ ] Add command routing/dispatching
- [ ] Implement command help system
- [ ] Write unified command documentation

#### Subtask 104.4: Performance Optimization
- [ ] Profile pipeline latency per system
- [ ] Identify bottlenecks (likely: Logos parsing, Aitia queries)
- [ ] Implement caching strategies
- [ ] Add async processing where applicable
- [ ] Benchmark end-to-end latency

#### Subtask 104.5: Error Handling & Recovery
- [ ] Design error taxonomy per system
- [ ] Implement graceful degradation
- [ ] Add error recovery procedures
- [ ] Create user-facing error messages
- [ ] Test error scenarios

**Definition of Done:**
- ✅ All 5 subtasks complete
- ✅ End-to-end pipeline working
- ✅ Latency <5s for typical queries
- ✅ Error handling tested
- ✅ Documentation written

---

## Testing & Validation Phase

### Task 105: Comprehensive Testing

#### Subtask 105.1: Unit Test Suite
- [ ] Write unit tests for Logos (decomposition, verification, confidence)
- [ ] Write unit tests for Chronos (indexing, contradiction, drift)
- [ ] Write unit tests for Aitia (parsing, queries, confidence)
- [ ] Write unit tests for Scribe (metadata, scoring, re-validation)
- [ ] Achieve ≥90% code coverage

#### Subtask 105.2: Integration Test Suite
- [ ] Test Logos + Janus integration
- [ ] Test Chronos + Aletheia integration
- [ ] Test Aitia + Dianoia integration
- [ ] Test Scribe + Pheme integration
- [ ] Test full pipeline integration

#### Subtask 105.3: End-to-End Validation
- [ ] Run 500+ end-to-end test queries
- [ ] Measure accuracy vs. baseline (v1.0)
- [ ] Measure hallucination reduction
- [ ] Measure temporal coherence improvement
- [ ] Measure causal reasoning accuracy
- [ ] Measure source integrity maintenance

#### Subtask 105.4: User Acceptance Testing
- [ ] Recruit 10+ beta testers
- [ ] Run 2-week beta testing period
- [ ] Collect feedback on each system
- [ ] Identify usability issues
- [ ] Iterate based on feedback

#### Subtask 105.5: Performance Benchmarking
- [ ] Benchmark latency per system
- [ ] Benchmark memory usage
- [ ] Benchmark throughput (queries/second)
- [ ] Compare to v1.0 baseline
- [ ] Document performance characteristics

**Definition of Done:**
- ✅ All 5 subtasks complete
- ✅ 500+ E2E tests passed
- ✅ ≥90% code coverage
- ✅ Beta feedback incorporated
- ✅ Performance benchmarks documented

---

## Documentation & Release

### Task 106: Documentation & Release

#### Subtask 106.1: Technical Documentation
- [ ] Write system architecture docs for each system
- [ ] Write API reference docs
- [ ] Write command reference docs
- [ ] Write integration guide
- [ ] Publish to docs/ folder

#### Subtask 106.2: User Documentation
- [ ] Write user guide for each system
- [ ] Write examples & use cases
- [ ] Write troubleshooting guide
- [ ] Write FAQ
- [ ] Publish to website/docs

#### Subtask 106.3: Research Documentation
- [ ] Write research validation report
- [ ] Document alignment with 2025-2026 papers
- [ ] Write comparative analysis (vs. other epistemic systems)
- [ ] Submit to arXiv / relevant venue
- [ ] Present at AI safety meetup/conference

#### Subtask 106.4: Release Preparation
- [ ] Create release candidate build
- [ ] Run final QA testing
- [ ] Prepare release notes
- [ ] Update CHANGELOG.md
- [ ] Tag v2.0 release

#### Subtask 106.5: Launch & Communication
- [ ] Announce v2.0 release (blog, social, Discord)
- [ ] Create demo video/walkthrough
- [ ] Host launch Q&A session
- [ ] Collect post-launch feedback
- [ ] Monitor for issues/crashes

**Definition of Done:**
- ✅ All 5 subtasks complete
- ✅ All docs published
- ✅ v2.0 tagged & released
- ✅ Launch communication complete
- ✅ Post-launch monitoring active

---

## Summary

| Phase | Task | System | Timeline | Subtasks | Priority |
|-------|------|--------|----------|----------|----------|
| 1 | 100 | Logos | Weeks 1-3 | 5 | High |
| 2 | 101 | Chronos | Weeks 4-6 | 5 | High |
| 3 | 102 | Aitia | Weeks 7-10 | 6 | High |
| 4 | 103 | Scribe | Weeks 11-14 | 6 | Medium-High |
| - | 104 | Integration | Weeks 14-16 | 5 | Critical |
| - | 105 | Testing | Weeks 16-18 | 5 | Critical |
| - | 106 | Release | Weeks 18-20 | 5 | Critical |

**Total:** 7 tasks, 37 subtasks, ~20 weeks (5 months)

**Next Action:** Start Task 100 (Logos) — highest priority, strongest research validation, clearest scope.

---

**Saved to memory:** 2026-03-19  
**Location:** `memory/projects/abraxas-v2-implementation-plan.md`
