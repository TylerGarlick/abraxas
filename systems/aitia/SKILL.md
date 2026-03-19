# Aitia System - Causal Reasoning Engine

## Overview

Aitia (Greek: αἰτία, "cause") provides causal reasoning capabilities for Abraxas, enabling:
- Construction of causal graphs from natural language claims
- Counterfactual reasoning ("what if" analysis)
- Policy impact prediction with downstream effect tracing
- Integration with Logos for causal claim verification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Aitia System                            │
├─────────────────────────────────────────────────────────────┤
│  A1: Causal Graph  →  A2: Counterfactual  →  A3: Policy     │
│                          ↓                                   │
│                    A4: Logos Integration                     │
└─────────────────────────────────────────────────────────────┘
```

## Components

### A1: Causal Graph Builder (`causal_graph.py`)

**Purpose:** Construct causal DAGs from natural language claims

**Features:**
- Linguistic pattern matching for causal extraction
- 7 causal relation types (DIRECT_CAUSE, CONTRIBUTING, PREVENTING, ENABLING, MEDIATING, CONFONDING, NECESSARY, SUFFICIENT)
- Automatic cycle detection and removal
- Topological ordering for causal propagation
- Graph export (JSON, DOT format)

**Causal Relation Types:**
| Type | Description | Example Patterns |
|------|-------------|------------------|
| DIRECT_CAUSE | A directly causes B | "causes", "leads to", "results in" |
| CONTRIBUTING | A contributes to B | "contributes to", "facilitates", "promotes" |
| PREVENTING | A prevents B | "prevents", "blocks", "inhibits", "reduces" |
| ENABLING | A enables B | "enables", "allows", "permits" |
| NECESSARY | A is necessary for B | "requires", "depends on", "prerequisite" |
| SUFFICIENT | A is sufficient for B | "guarantees", "ensures", "always leads to" |

**Usage:**
```python
from aitia.causal_graph import CausalGraphBuilder

builder = CausalGraphBuilder()

# Extract causal claims from text
claims = builder.extract_causal_claims("Smoking causes lung cancer")
# Returns: [{'cause': 'smoking', 'effect': 'lung cancer', 'relation_type': 'direct_cause', ...}]

# Build causal DAG
dag = builder.build_dag(claims, graph_id="health")
print(f"Nodes: {len(dag.nodes)}, Edges: {len(dag.edges)}")

# Query causal relationships
parents = builder.get_parents("health", "lung_cancer")
descendants = builder.get_descendants("health", "smoking")
paths = builder.find_paths("health", "smoking", "mortality")
```

### A2: Counterfactual Engine (`counterfactual.py`)

**Purpose:** Perform what-if reasoning over causal graphs

**Features:**
- Do-operator interventions (Pearl's calculus)
- Effect propagation through topological ordering
- Direct vs indirect effect decomposition
- Multiple scenario comparison
- Reasoning trace generation

**Intervention Types:**
- `set`: Do-operator (force variable to specific value)
- `add`: Incremental change (add delta to current value)

**Usage:**
```python
from aitia.counterfactual import CounterfactualEngine, CounterfactualQuery

engine = CounterfactualEngine()

# Define counterfactual query
query = CounterfactualQuery(
    antecedent="If smoking were eliminated",
    consequent="What happens to lung cancer rates?",
    intervention={"smoking": 0.0},  # Set smoking to zero
    graph_id="health"
)

# Run counterfactual
result = engine.query(dag, query)
print(result.summary())
print(f"Effect magnitude: {result.effect_magnitude}")
print(f"Affected variables: {result.affected_variables}")
```

### A3: Policy Impact Analyzer (`policy_impact.py`)

**Purpose:** Predict downstream effects of policy interventions

**Features:**
- Direct and indirect impact identification
- Impact path tracing through causal graph
- Unintended consequence detection
- Beneficiary/victim identification
- Policy comparison and ranking
- Automated recommendations

**Output:**
- Direct impacts (immediate causal children)
- Indirect impacts (downstream effects)
- Impact paths (causal pathways)
- Unintended consequences (negative side effects)
- Policy recommendations

**Usage:**
```python
from aitia.policy_impact import PolicyImpactAnalyzer, PolicyIntervention

analyzer = PolicyImpactAnalyzer()

# Define policy
policy = PolicyIntervention(
    policy_id="smoking_tax",
    name="Smoking Tax Increase",
    description="Increase tobacco tax by 50%",
    target_variables={"smoking": -0.3},  # Expected 30% reduction
    expected_cost=0.0,
    implementation_time="medium"
)

# Analyze impact
result = analyzer.analyze(dag, policy)
print(result.summary())
print(f"Total impact score: {result.total_impact_score}")
print(f"Unintended consequences: {result.unintended_consequences}")
print(f"Recommendations: {result.recommendations}")

# Compare policies
comparison = analyzer.compare_policies(dag, [policy1, policy2, policy3])
print(f"Best trade-off: {comparison['best_trade_off']}")
```

### A4: Logos Integration (`logos_integration.py`)

**Purpose:** Verify causal claims using Logos system

**Features:**
- Causal claim decomposition
- Multi-source verification of atomic propositions
- Causal confidence aggregation
- Verification status classification (VERIFIED/PARTIAL/UNVERIFIED)
- Reasoning trace generation

**Integration Flow:**
1. Extract causal structure from claim
2. Build causal DAG
3. Verify atomic propositions with Logos
4. Aggregate causal confidence
5. Generate verification result

**Usage:**
```python
from aitia.logos_integration import LogosCausalVerifier

verifier = LogosCausalVerifier()

# Verify causal claim
result = verifier.verify_causal_claim(
    "Climate change causes extreme weather",
    sources=["ipcc.org", "nasa.gov", "noaa.gov"]
)

print(f"Status: {result.verification_status}")
print(f"Causal confidence: {result.causal_confidence}")
print(f"Reasoning: {result.reasoning}")

# Batch verification
results = verifier.batch_verify([
    "Smoking causes lung cancer",
    "Exercise improves mental health",
    "Vaccines prevent disease"
])

summary = verifier.get_verification_summary(results)
print(f"Verification rate: {summary['verification_rate']:.2f}")
```

## Causal Graph Data Structures

### CausalNode
```python
@dataclass
class CausalNode:
    id: str
    label: str
    claim_text: str
    variable_type: str  # endogenous/exogenous
    confidence: float
    sources: List[str]
    metadata: Dict
```

### CausalEdge
```python
@dataclass
class CausalEdge:
    source: str
    target: str
    relation_type: CausalRelationType
    strength: float  # 0.0-1.0
    confidence: float
    evidence: List[str]
    mechanism: Optional[str]
```

### CausalDAG
```python
@dataclass
class CausalDAG:
    graph: nx.DiGraph
    nodes: Dict[str, CausalNode]
    edges: List[CausalEdge]
    created_at: float
    updated_at: float
    metadata: Dict
```

## Installation

```bash
# Ensure dependencies
pip install networkx
```

## Testing

```bash
cd /abraxas/systems/aitia
python -m pytest tests/ -v
```

## Integration with Other Systems

### With Logos
Aitia uses Logos for atomic proposition verification:
```python
from aitia.logos_integration import LogosCausalVerifier
verifier = LogosCausalVerifier()
result = verifier.verify_causal_claim("X causes Y")
```

### With Ergon
Aitia can use Ergon sandbox for safe causal simulation:
```python
from ergon.sandbox import ToolExecutionSandbox
sandbox = ToolExecutionSandbox()
# Run causal simulations in isolated environment
```

### With Chronos
Causal graphs can be tracked temporally:
```python
from chronos.temporal_index import TemporalIndex
index = TemporalIndex()
index.register_causal_graph(graph_id, dag, session_timestamp)
```

### With Dianoia
Causal confidence integrates with uncertainty quantification:
```python
from dianoia.calibration import CalibrationModule
calibration = CalibrationModule()
calibrated_confidence = calibration.calibrate(causal_confidence)
```

## Example: Full Causal Analysis Pipeline

```python
from aitia.causal_graph import CausalGraphBuilder
from aitia.counterfactual import CounterfactualEngine, CounterfactualQuery
from aitia.policy_impact import PolicyImpactAnalyzer, PolicyIntervention
from aitia.logos_integration import LogosCausalVerifier

# Initialize components
builder = CausalGraphBuilder()
cf_engine = CounterfactualEngine()
policy_analyzer = PolicyImpactAnalyzer()
verifier = LogosCausalVerifier()

# Extract and build causal graph
claims = builder.extract_causal_claims("Air pollution causes respiratory disease")
dag = builder.build_dag(claims, graph_id="air_quality")

# Verify causal claim
verification = verifier.verify_causal_claim("Air pollution causes respiratory disease")

# Run counterfactual
query = CounterfactualQuery(
    antecedent="If air pollution were reduced by 50%",
    consequent="Respiratory disease rates",
    intervention={"air_pollution": 0.5},
    graph_id="air_quality"
)
cf_result = cf_engine.query(dag, query)

# Analyze policy impact
policy = PolicyIntervention(
    policy_id="clean_air_act",
    name="Clean Air Act",
    description="Reduce industrial emissions",
    target_variables={"air_pollution": -0.5}
)
impact = policy_analyzer.analyze(dag, policy)

print(f"Verification: {verification.verification_status}")
print(f"Counterfactual effect: {cf_result.effect_magnitude}")
print(f"Policy impact score: {impact.total_impact_score}")
```

## Version

3.0.0 - Abraxas v3 Phase 3
