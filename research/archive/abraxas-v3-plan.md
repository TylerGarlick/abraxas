# Abraxas v3 Implementation Plan

## Phase 1: Logos + Ergon Systems (14 weeks)

### Logos System (Compositional Verification)

**L1: Claim Decomposition Engine**
- Status: Not started
- Path: `/abraxas/systems/logos/decomposition.py`
- Description: Break complex claims into atomic propositions
- Deliverables:
  - Claim parser and tokenizer
  - Atomic proposition extractor
  - Unit tests for decomposition logic

**L2: Cross-Source Verification**
- Status: Not started
- Path: `/abraxas/systems/logos/verification.py`
- Description: Check each atom against multiple sources
- Deliverables:
  - Multi-source query engine
  - Source credibility scoring
  - Integration tests

**L3: Confidence Aggregation**
- Status: Not started
- Path: `/abraxas/systems/logos/aggregation.py`
- Description: Combine verification results into final confidence
- Deliverables:
  - Bayesian confidence calculator
  - Weighted aggregation engine
  - Statistical tests

**L4: Honest Skill Integration**
- Status: Not started
- Path: `/abraxas/systems/logos/honest_integration.py`
- Description: Auto-label decomposed claims
- Deliverables:
  - Honest skill adapter
  - Auto-labeling pipeline
  - End-to-end tests

### Ergon System (Tool-Use Verification)

**E1: Tool Execution Sandbox**
- Status: Not started
- Path: `/abraxas/systems/ergon/sandbox.py`
- Description: Isolated execution with timeouts
- Deliverables:
  - Process isolation layer
  - Timeout manager
  - Resource limits

**E2: Output Validation**
- Status: Not started
- Path: `/abraxas/systems/ergon/validation.py`
- Description: Verify tool outputs match expected schemas
- Deliverables:
  - Schema validator
  - Type checker
  - Contract tests

**E3: Failure Detection**
- Status: Not started
- Path: `/abraxas/systems/ergon/failure_detection.py`
- Description: Graceful degradation ([UNKNOWN] when tools fail)
- Deliverables:
  - Exception handler
  - Fallback manager
  - Error recovery tests

**E4: API Integration**
- Status: Not started
- Path: `/abraxas/systems/ergon/api.py`
- Description: Tool-use endpoints with verification
- Deliverables:
  - REST API layer
  - Verification middleware
  - Integration tests

## Progress Log

### 2026-03-19: Phase 1 Implementation Complete ✓

**Logos System - ALL COMPONENTS IMPLEMENTED:**
- ✓ L1: Claim Decomposition Engine (`/abraxas/systems/logos/decomposition.py` - 8.8KB)
  - Claim parser with linguistic pattern matching
  - Proposition type classification (5 types)
  - Confidence extraction from markers
  - Unit tests written
- ✓ L2: Cross-Source Verification (`/abraxas/systems/logos/verification.py` - 10.6KB)
  - Multi-source verification engine
  - Source credibility database (15 sources)
  - Async verification pipeline
  - Bayesian aggregation support
- ✓ L3: Confidence Aggregation (`/abraxas/systems/logos/aggregation.py` - 13.7KB)
  - 4 aggregation methods (Bayesian, Weighted, Dempster-Shafer, Consensus)
  - Uncertainty bounds calculation
  - Recommendation generation
- ✓ L4: Honest Integration (`/abraxas/systems/logos/honest_integration.py` - 11.2KB)
  - End-to-end pipeline automation
  - Auto-labeling (TRUE/FALSE/MIXED/UNVERIFIED)
  - Label threshold configuration

**Ergon System - ALL COMPONENTS IMPLEMENTED:**
- ✓ E1: Tool Execution Sandbox (`/abraxas/systems/ergon/sandbox.py` - 13.5KB)
  - Process isolation with RLIMITS
  - Configurable timeouts
  - Memory/CPU/file limits
  - Async execution support
- ✓ E2: Output Validation (`/abraxas/systems/ergon/validation.py` - 15.1KB)
  - JSON Schema validation
  - Type checking
  - Contract validation
  - 3 built-in schemas
- ✓ E3: Failure Detection (`/abraxas/systems/ergon/failure_detection.py` - 17.9KB)
  - 7 failure type classifications
  - 6 degradation strategies
  - [UNKNOWN] result standardization
  - Fallback registry
- ✓ E4: API Integration (`/abraxas/systems/ergon/api.py` - 15.0KB)
  - Request/response handling
  - Verification middleware pipeline
  - 4 default tool handlers
  - Rate limiting support

**Documentation:**
- ✓ Logos SKILL.md (4.0KB)
- ✓ Ergon SKILL.md (5.8KB)

**Tests:**
- ✓ test_logos_decomposition.py (5.0KB)
- ✓ test_ergon_sandbox.py (5.7KB)

**Total Code Written:** ~97KB across 8 Python modules + 2 SKILL.md files + 2 test files

---

## Phase 3: Aitia + Dianoia Systems (14 weeks)

### Aitia System (Causal Reasoning Engine)

**A1: Causal Graph Builder**
- Status: ✓ Implemented
- Path: `/abraxas/systems/aitia/causal_graph.py`
- Description: Construct causal DAGs from claims
- Deliverables:
  - 7 causal relation types (DIRECT_CAUSE, CONTRIBUTING, PREVENTING, ENABLING, NECESSARY, SUFFICIENT)
  - Linguistic pattern extraction
  - Automatic cycle detection/removal
  - Topological ordering
  - Graph export (JSON, DOT)

**A2: Counterfactual Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/aitia/counterfactual.py`
- Description: What-if reasoning over causal graphs
- Deliverables:
  - Do-operator interventions
  - Effect propagation (topological)
  - Direct/indirect effect decomposition
  - Scenario comparison
  - Reasoning trace generation

**A3: Policy Impact Analyzer**
- Status: ✓ Implemented
- Path: `/abraxas/systems/aitia/policy_impact.py`
- Description: Predict downstream effects of policy interventions
- Deliverables:
  - Direct/indirect impact identification
  - Impact path tracing
  - Unintended consequence detection
  - Beneficiary/victim identification
  - Policy comparison/ranking
  - Automated recommendations

**A4: Logos Integration**
- Status: ✓ Implemented
- Path: `/abraxas/systems/aitia/logos_integration.py`
- Description: Causal verification using Logos system
- Deliverables:
  - Causal claim decomposition
  - Multi-source verification
  - Causal confidence aggregation
  - Verification status (VERIFIED/PARTIAL/UNVERIFIED)

### Dianoia System (Uncertainty Quantification)

**D1: Probability Calibration Module**
- Status: ✓ Implemented
- Path: `/abraxas/systems/dianoia/python/calibration.py`
- Description: Confidence → probability mapping
- Deliverables:
  - ECE/MCE calculation
  - Reliability diagram generation
  - 10-bin calibration analysis
  - Historical calibration tracking
  - Calibration correction application

**D2: Uncertainty Bounds Calculator**
- Status: ✓ Implemented
- Path: `/abraxas/systems/dianoia/python/uncertainty_bounds.py`
- Description: Error bars on claims
- Deliverables:
  - Confidence intervals (50/80/90/95/99%)
  - Error propagation (add/sub/mul/div/power)
  - Wilson score intervals for proportions
  - t-distribution support
  - Statistical significance testing

**D3: Distribution Analyzer**
- Status: ✓ Implemented
- Path: `/abraxas/systems/dianoia/python/distribution_analyzer.py`
- Description: Analyze probability distributions
- Deliverables:
  - Distribution type inference (normal/uniform/beta/bimodal/multimodal/skewed)
  - Parameter fitting
  - Normality testing (Jarque-Bera)
  - Modality detection
  - Skewness/kurtosis calculation
  - Outlier detection (IQR)
  - Gaussian mixture modeling

**D4: Aletheia Integration**
- Status: ✓ Implemented
- Path: `/abraxas/systems/dianoia/python/aletheia_integration.py`
- Description: Calibration tracking for Aletheia
- Deliverables:
  - Continuous calibration monitoring
  - Drift detection/alerts
  - Historical ECE trends
  - Aletheia report generation
  - Export for truth-tracking

## Progress Log

### 2026-03-19: Phase 3 Implementation Complete ✓

**Aitia System - ALL COMPONENTS IMPLEMENTED:**
- ✓ A1: Causal Graph Builder (`/abraxas/systems/aitia/causal_graph.py` - 12.0KB)
  - 7 causal relation types with linguistic patterns
  - Automatic cycle detection and removal
  - Topological ordering for propagation
  - Graph export (JSON, DOT)
  - Parent/child/descendant queries
- ✓ A2: Counterfactual Engine (`/abraxas/systems/aitia/counterfactual.py` - 10.1KB)
  - Do-operator interventions (set/add)
  - Effect propagation through topological order
  - Direct vs indirect effect decomposition
  - Multiple scenario comparison
  - Reasoning trace generation
- ✓ A3: Policy Impact Analyzer (`/abraxas/systems/aitia/policy_impact.py` - 11.7KB)
  - Direct/indirect impact identification
  - Impact path tracing through causal graph
  - Unintended consequence detection
  - Beneficiary/victim identification
  - Policy comparison and ranking
  - Automated recommendations
- ✓ A4: Logos Integration (`/abraxas/systems/aitia/logos_integration.py` - 9.5KB)
  - Causal claim decomposition
  - Multi-source verification simulation
  - Causal confidence aggregation
  - Verification status classification
  - Batch verification support

**Dianoia System - ALL COMPONENTS IMPLEMENTED:**
- ✓ D1: Probability Calibration (`/abraxas/systems/dianoia/python/calibration.py` - 13.5KB)
  - ECE/MCE calculation
  - 10-bin calibration analysis
  - Reliability diagram data generation
  - Historical calibration tracking
  - Confidence → probability mapping
  - Calibration correction application
- ✓ D2: Uncertainty Bounds (`/abraxas/systems/dianoia/python/uncertainty_bounds.py` - 14.5KB)
  - 5 confidence levels (50/80/90/95/99%)
  - Error propagation (add/sub/mul/div/power)
  - Wilson score intervals for proportions
  - t-distribution for small samples
  - Statistical significance testing
  - Bounds comparison
- ✓ D3: Distribution Analyzer (`/abraxas/systems/dianoia/python/distribution_analyzer.py` - 17.8KB)
  - 7 distribution types supported
  - Parameter fitting (normal/uniform/beta)
  - Normality testing (Jarque-Bera)
  - Modality detection
  - Skewness/kurtosis calculation
  - Outlier detection (IQR method)
  - Gaussian mixture modeling for multimodal
- ✓ D4: Aletheia Integration (`/abraxas/systems/dianoia/python/aletheia_integration.py` - 14.1KB)
  - Continuous calibration monitoring
  - Drift detection (threshold > 0.05)
  - Historical ECE trends
  - Aletheia report generation
  - Export for truth-tracking integration

**Documentation:**
- ✓ Aitia SKILL.md (9.4KB)
- ✓ Dianoia SKILL.md (11.1KB)

**Tests:**
- ✓ test_aitia.py (8.6KB) - 15+ test cases
- ✓ test_dianoia.py (8.0KB) - 15+ test cases

**Total Code Written:** ~109KB across 8 Python modules + 2 SKILL.md files + 2 test files

**Combined Total (Phase 1 + Phase 2 + Phase 3):** ~301KB across 24 Python modules + 6 SKILL.md files + 6 test files

---

## Phase 2: Chronos + Scribe Systems (14 weeks)

### Chronos System (Temporal Coherence Tracking)

**C1: Temporal Index Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/chronos/temporal_index.py`
- Description: Index claims by session timestamp for temporal queries
- Deliverables:
  - ClaimRecord data structure
  - Time-range queries
  - Session-based retrieval
  - Persistent storage

**C2: Drift Detection Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/chronos/drift_detection.py`
- Description: Detect epistemic drift across sessions
- Deliverables:
  - 4 drift types (CONTRADICTION, LABEL_CHANGE, CONFIDENCE_SHIFT, REFINEMENT)
  - Semantic similarity comparison
  - Contradiction pattern matching
  - Severity classification

**C3: Contradiction Resolution Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/chronos/contradiction_resolution.py`
- Description: Resolve temporal conflicts
- Deliverables:
  - 6 resolution strategies (RECENCY, CONFIDENCE, SOURCE_STRENGTH, MANUAL, MERGE, FLAG)
  - Label reconciliation
  - Resolution tracking

**C4: Timeline Visualization Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/chronos/timeline_viz.py`
- Description: Generate epistemic timeline visualizations
- Deliverables:
  - ASCII timeline output
  - HTML timeline generation
  - Claim evolution traces
  - JSON/HTML/TXT export

### Scribe System (Source Provenance & Citation Integrity)

**S1: Source Capture Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/scribe/source_capture.py`
- Description: Capture source metadata at claim creation
- Deliverables:
  - URL normalization
  - Source type classification (6 types)
  - Initial reliability scoring
  - Persistent storage

**S2: Reliability Scorer Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/scribe/reliability_scorer.py`
- Description: Dynamic source reliability scoring
- Deliverables:
  - Track record tracking
  - Retraction/correction penalties
  - Consensus bonuses
  - Score recalculation

**S3: Link Checker Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/scribe/link_checker.py`
- Description: Monitor sources for link rot and retractions
- Deliverables:
  - Async link checking (aiohttp)
  - 7 link statuses
  - Retraction/correction detection
  - Scheduled re-validation

**S4: Provenance Tracker Engine**
- Status: ✓ Implemented
- Path: `/abraxas/systems/scribe/provenance_tracker.py`
- Description: Maintain provenance graphs and alerts
- Deliverables:
  - Citation chain tracking
  - 5 alert types
  - Alert callbacks
  - Impact analysis

### Progress Log

### 2026-03-19: Phase 2 Implementation Complete ✓

**Chronos System - ALL COMPONENTS IMPLEMENTED:**
- ✓ C1: Temporal Index Engine (`/abraxas/systems/chronos/temporal_index.py` - 9.2KB)
  - ClaimRecord with session metadata
  - Time-range and session queries
  - Persistent JSON storage
  - Unit tests written
- ✓ C2: Drift Detection Engine (`/abraxas/systems/chronos/drift_detection.py` - 11.6KB)
  - 4 drift types with severity classification
  - Contradiction pattern matching
  - Confidence/label change detection
  - Integration with TemporalIndex
- ✓ C3: Resolution Engine (`/abraxas/systems/chronos/contradiction_resolution.py` - 10.5KB)
  - 6 resolution strategies
  - Label reconciliation logic
  - Resolution result tracking
- ✓ C4: Timeline Visualization (`/abraxas/systems/chronos/timeline_viz.py` - 11.9KB)
  - ASCII and HTML timeline generation
  - Claim evolution traces
  - Multi-format export (JSON/HTML/TXT)

**Scribe System - ALL COMPONENTS IMPLEMENTED:**
- ✓ S1: Source Capture (`/abraxas/systems/scribe/source_capture.py` - 13.4KB)
  - URL normalization (tracking param removal)
  - 6 source type classifications
  - Base reliability scoring
  - Persistent storage
- ✓ S2: Reliability Scorer (`/abraxas/systems/scribe/reliability_scorer.py` - 14.3KB)
  - Accuracy track recording
  - Retraction (-0.50) and correction (-0.20) penalties
  - Consensus bonus (+0.15)
  - Factor-based update history
- ✓ S3: Link Checker (`/abraxas/systems/scribe/link_checker.py` - 14.4KB)
  - Async aiohttp-based checking
  - 7 link statuses (ACTIVE/RETRACTED/CORRECTED/etc)
  - Retraction/correction pattern detection
  - Scheduled re-validation logic
- ✓ S4: Provenance Tracker (`/abraxas/systems/scribe/provenance_tracker.py` - 16.9KB)
  - Citation chain registration
  - 5 alert types (RETRACTION/CORRECTION/DROP/ROT/CONSENSUS)
  - Alert callback system
  - Acknowledgment workflow

**Documentation:**
- ✓ Chronos SKILL.md (6.7KB)
- ✓ Scribe SKILL.md (7.4KB)

**Tests:**
- ✓ test_chronos.py (14.4KB) - 25+ test cases
- ✓ test_scribe.py (16.1KB) - 25+ test cases

**Total Code Written:** ~95KB across 8 Python modules + 2 SKILL.md files + 2 test files

**Combined Total (Phase 1 + Phase 2):** ~192KB across 16 Python modules + 4 SKILL.md files + 4 test files
