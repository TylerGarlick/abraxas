# Dianoia System - Uncertainty Quantification

## Overview

Dianoia (Greek: διάνοια, "thinking") provides formal uncertainty quantification for Abraxas, enabling:
- Probability calibration (confidence → probability mapping)
- Uncertainty bounds calculation (error bars, confidence intervals)
- Distribution analysis (Gaussian, multimodal, skewed, etc.)
- Integration with Aletheia for calibration tracking

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dianoia System                            │
├─────────────────────────────────────────────────────────────┤
│  D1: Calibration  →  D2: Bounds  →  D3: Distribution        │
│                          ↓                                   │
│                    D4: Aletheia Integration                  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### D1: Probability Calibration Module (`calibration.py`)

**Purpose:** Map confidence scores to calibrated probabilities

**Features:**
- Confidence → probability mapping
- Expected Calibration Error (ECE) calculation
- Maximum Calibration Error (MCE) calculation
- Reliability diagram generation
- Calibration bin analysis (10 bins)
- Historical calibration tracking

**Calibration Threshold:**
- ECE < 0.05: Calibrated
- ECE ≥ 0.05: Uncalibrated

**Key Metrics:**
| Metric | Description | Target |
|--------|-------------|--------|
| ECE | Expected Calibration Error (weighted average) | < 0.05 |
| MCE | Maximum Calibration Error (worst bin) | < 0.10 |
| Calibration Rate | Fraction of predictions in correct bins | > 0.90 |

**Usage:**
```python
from dianoia.calibration import ProbabilityCalibrationModule

calib = ProbabilityCalibrationModule()

# Record predictions for calibration tracking
calib.record_prediction(
    claim_id="claim_001",
    predicted_confidence=0.75,
    actual_outcome=True,  # Claim was verified
    model_id="default"
)

# Get calibration report
report = calib.get_calibration_report("default")
print(f"ECE: {report.expected_calibration_error}")
print(f"MCE: {report.maximum_calibration_error}")
print(f"Calibrated: {report.is_calibrated}")

# Convert confidence to calibrated probability
calibrated_prob = calib.confidence_to_probability(0.75)
print(f"Calibrated probability: {calibrated_prob}")
```

### D2: Uncertainty Bounds Calculator (`uncertainty_bounds.py`)

**Purpose:** Calculate uncertainty bounds and error bars

**Features:**
- Confidence intervals (50%, 80%, 90%, 95%, 99%)
- Margin of error calculation
- Error propagation (addition, subtraction, multiplication, division, power)
- Wilson score intervals for proportions
- t-distribution support for small samples
- Statistical significance testing

**Confidence Levels:**
| Level | Z-score | Use Case |
|-------|---------|----------|
| 50% | 0.674 | Quick estimates |
| 80% | 1.282 | Moderate confidence |
| 90% | 1.645 | Standard reporting |
| 95% | 1.960 | Scientific standard |
| 99% | 2.576 | High confidence |

**Usage:**
```python
from dianoia.uncertainty_bounds import UncertaintyBoundsCalculator

calc = UncertaintyBoundsCalculator()

# Calculate bounds from sample data
bounds = calc.calculate_from_sample(
    claim_id="sample_001",
    sample_data=[1.2, 1.5, 1.3, 1.4, 1.6, 1.2, 1.5],
    base_confidence=0.5
)
print(bounds.formatted)  # "1.39 ± 0.12 [1.27, 1.51] (±8.6%)"

# Calculate bounds for proportion
prop_bounds = calc.calculate_proportion_bounds(
    claim_id="prop_001",
    successes=75,
    total=100,
    base_confidence=0.5
)
print(prop_bounds.formatted)  # "0.750 ± 0.086 [0.664, 0.836]"

# Propagate error through calculation
bounds1 = calc.calculate_bounds("b1", 10.0, 0.5)
bounds2 = calc.calculate_bounds("b2", 5.0, 0.3)

result = calc.propagate_error("multiply", [bounds1, bounds2])
print(f"Result: {result.output_estimate} ± {result.output_error}")
```

### D3: Distribution Analyzer (`distribution_analyzer.py`)

**Purpose:** Analyze probability distributions

**Features:**
- Distribution type inference (normal, uniform, beta, bimodal, multimodal, skewed)
- Parameter fitting (mean, std, alpha, beta, etc.)
- Normality testing (Jarque-Bera)
- Modality detection (number of modes)
- Skewness and kurtosis calculation
- Outlier detection (IQR method)
- Gaussian mixture modeling for multimodal data

**Distribution Types:**
| Type | Parameters | Characteristics |
|------|------------|-----------------|
| NORMAL | μ, σ | Symmetric, bell-shaped |
| UNIFORM | a, b | Flat, equal probability |
| BETA | α, β | Bounded [0,1], flexible shape |
| BIMODAL | 2 modes | Two distinct peaks |
| MULTIMODAL | n modes | Multiple peaks |
| SKEWED | μ, σ, γ | Asymmetric tail |

**Usage:**
```python
from dianoia.distribution_analyzer import DistributionAnalyzer

analyzer = DistributionAnalyzer()

# Analyze distribution
analysis = analyzer.analyze(
    data_id="dist_001",
    data=[0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9],
    hypothesized_type=None  # Auto-detect
)

print(f"Type: {analysis.distribution_type}")
print(f"Skewness: {analysis.skewness}")
print(f"Kurtosis: {analysis.kurtosis}")
print(f"Modality: {analysis.modality}")
print(f"Normality: {analysis.normality_test['is_normal']}")

# Multimodal analysis
if analysis.modality > 1:
    multimodal = analyzer.analyze_multimodal("dist_001", data)
    print(f"Modes: {multimodal.num_modes}")
    print(f"Mode locations: {multimodal.mode_locations}")
    print(f"Separation quality: {multimodal.separation_quality}")
```

### D4: Aletheia Integration (`aletheia_integration.py`)

**Purpose:** Integrate calibration tracking with Aletheia truth-tracking

**Features:**
- Continuous calibration monitoring
- Drift detection and alerts
- Historical ECE trends
- Calibration event tracking
- Aletheia report generation
- Export for truth-tracking integration

**Drift Detection:**
- Threshold: ECE change > 0.05
- Window size: 50 recent predictions
- Alert generation on threshold exceedance

**Usage:**
```python
from dianoia.aletheia_integration import AletheiaCalibrationTracker

tracker = AletheiaCalibrationTracker()

# Track predictions
tracker.track_prediction(
    claim_id="claim_001",
    model_id="default",
    predicted_confidence=0.75
)

# Track outcomes (when claims are verified)
tracker.track_outcome(
    claim_id="claim_001",
    model_id="default",
    actual_outcome=True
)

# Check for drift
alert = tracker.check_drift("default")
if alert:
    print(f"Drift detected: {alert.drift_magnitude}")
    print(f"Recommendation: {alert.recommended_action}")

# Generate Aletheia report
report = tracker.generate_aletheia_report("default", period_days=30)
print(f"Calibrated: {report.is_calibrated}")
print(f"Drift detected: {report.drift_detected}")
print(f"Recommendations: {report.recommendations}")

# Export for Aletheia
export = tracker.export_for_aletheia("default")
print(f"Reliability score: {export['aletheia_integration']['reliability_score']}")
```

## Data Structures

### CalibrationRecord
```python
@dataclass
class CalibrationRecord:
    record_id: str
    claim_id: str
    predicted_confidence: float
    predicted_probability: float
    actual_outcome: bool
    timestamp: float
    model_id: str
    metadata: Dict
```

### UncertaintyBounds
```python
@dataclass
class UncertaintyBounds:
    claim_id: str
    point_estimate: Optional[float]
    standard_error: float
    confidence_intervals: Dict[ConfidenceLevel, Tuple[float, float]]
    margin_of_error: float
    sample_size: Optional[int]
    distribution_type: str
    confidence: float
    formatted: str
```

### DistributionAnalysis
```python
@dataclass
class DistributionAnalysis:
    data_id: str
    sample_size: int
    distribution_type: DistributionType
    parameters: DistributionParameters
    descriptive_stats: Dict[str, float]
    normality_test: Dict
    modality: int
    skewness: float
    kurtosis: float
    outliers: List[Dict]
    visualization_data: List[Dict]
    recommendations: List[str]
```

## Installation

```bash
# Ensure dependencies
pip install statistics
```

## Testing

```bash
cd /abraxas/systems/dianoia/python
python -m pytest tests/ -v
```

## Integration with Other Systems

### With Logos
Dianoia provides uncertainty bounds for Logos verification:
```python
from dianoia.uncertainty_bounds import UncertaintyBoundsCalculator
bounds = calc.calculate_bounds(claim_id, estimate, error)
# Pass bounds to Logos aggregation
```

### With Aitia
Causal confidence uses Dianoia calibration:
```python
from dianoia.calibration import ProbabilityCalibrationModule
calib = ProbabilityCalibrationModule()
calibrated_conf = calib.confidence_to_probability(causal_confidence)
```

### With Chronos
Uncertainty bounds tracked temporally:
```python
from chronos.temporal_index import TemporalIndex
index = TemporalIndex()
index.register_uncertainty(claim_id, bounds, session_timestamp)
```

### With Aletheia
Direct integration for truth-tracking:
```python
from dianoia.aletheia_integration import AletheiaCalibrationTracker
tracker = AletheiaCalibrationTracker()
export = tracker.export_for_aletheia()
# Import into Aletheia
```

## Example: Full Uncertainty Quantification Pipeline

```python
from dianoia.calibration import ProbabilityCalibrationModule
from dianoia.uncertainty_bounds import UncertaintyBoundsCalculator
from dianoia.distribution_analyzer import DistributionAnalyzer
from dianoia.aletheia_integration import AletheiaCalibrationTracker

# Initialize components
calib = ProbabilityCalibrationModule()
bounds_calc = UncertaintyBoundsCalculator()
analyzer = DistributionAnalyzer()
tracker = AletheiaCalibrationTracker()

# Record prediction
calib.record_prediction(
    claim_id="climate_claim",
    predicted_confidence=0.85,
    actual_outcome=True,
    model_id="gpt-4"
)

# Calculate uncertainty bounds
bounds = bounds_calc.calculate_from_sample(
    claim_id="temp_data",
    sample_data=[14.2, 14.5, 14.3, 14.8, 14.1],
    base_confidence=0.85
)

# Analyze distribution
analysis = analyzer.analyze(
    data_id="temp_dist",
    data=[14.2, 14.5, 14.3, 14.8, 14.1]
)

# Track for Aletheia
tracker.track_prediction("climate_claim", "gpt-4", 0.85)
tracker.track_outcome("climate_claim", "gpt-4", True)

# Generate report
report = tracker.generate_aletheia_report("gpt-4")
print(f"Calibration status: {report.is_calibrated}")
print(f"Uncertainty: {bounds.formatted}")
print(f"Distribution: {analysis.distribution_type}")
```

## Calibration Best Practices

1. **Record all predictions** - Track every confidence score for calibration analysis
2. **Wait for outcomes** - Calibration requires knowing whether claims were verified
3. **Minimum samples** - Need at least 10 predictions for meaningful ECE
4. **Monitor drift** - Check calibration weekly for production systems
5. **Apply corrections** - Use `apply_calibration_correction()` for uncalibrated models

## Uncertainty Reporting Standards

- Always report confidence intervals (95% standard)
- Include margin of error as percentage
- Specify distribution type
- Note sample size
- Flag non-normal distributions

## Version

3.0.0 - Abraxas v3 Phase 3
