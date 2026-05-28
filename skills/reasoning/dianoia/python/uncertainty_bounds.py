"""
D2: Uncertainty Bounds Calculator
Error bars on claims
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import math
import statistics


class ConfidenceLevel(Enum):
    """Standard confidence levels"""
    CL_50 = 0.50
    CL_80 = 0.80
    CL_90 = 0.90
    CL_95 = 0.95
    CL_99 = 0.99


# Z-scores for confidence levels
Z_SCORES = {
    0.50: 0.674,
    0.80: 1.282,
    0.90: 1.645,
    0.95: 1.960,
    0.99: 2.576,
}


@dataclass
class UncertaintyBounds:
    """Uncertainty bounds for a claim"""
    claim_id: str
    point_estimate: Optional[float]
    standard_error: float
    confidence_intervals: Dict[ConfidenceLevel, Tuple[float, float]]
    margin_of_error: float
    sample_size: Optional[int]
    distribution_type: str  # normal/t/custom
    confidence: float
    formatted: str


@dataclass
class ErrorPropagationResult:
    """Result of error propagation through calculations"""
    operation: str
    inputs: List[Dict]
    output_estimate: float
    output_error: float
    output_bounds: UncertaintyBounds
    propagation_method: str


class UncertaintyBoundsCalculator:
    """
    Calculate uncertainty bounds and error bars for claims
    
    Provides confidence intervals, margins of error,
    and error propagation for derived quantities.
    """
    
    def __init__(self, default_confidence: ConfidenceLevel = ConfidenceLevel.CL_95):
        self.default_confidence = default_confidence
        self.results: Dict[str, UncertaintyBounds] = {}
    
    def calculate_bounds(
        self,
        claim_id: str,
        point_estimate: Optional[float],
        standard_error: float,
        sample_size: Optional[int] = None,
        distribution_type: str = "normal",
        base_confidence: float = 0.5
    ) -> UncertaintyBounds:
        """
        Calculate uncertainty bounds for a claim
        
        Args:
            claim_id: Unique identifier
            point_estimate: Point estimate (mean, proportion, etc.)
            standard_error: Standard error of estimate
            sample_size: Sample size (for t-distribution)
            distribution_type: "normal" or "t"
            base_confidence: Base confidence score
            
        Returns:
            UncertaintyBounds
        """
        # Calculate confidence intervals for all levels
        intervals = {}
        
        for level in ConfidenceLevel:
            z_score = self._get_critical_value(level.value, sample_size, distribution_type)
            margin = z_score * standard_error
            
            lower = (point_estimate - margin) if point_estimate is not None else None
            upper = (point_estimate + margin) if point_estimate is not None else None
            
            if lower is not None and upper is not None:
                intervals[level] = (
                    max(0.0, lower) if level != ConfidenceLevel.CL_50 else lower,
                    upper
                )
        
        # Calculate margin of error (at default confidence)
        z_default = self._get_critical_value(
            self.default_confidence.value, sample_size, distribution_type
        )
        margin_of_error = z_default * standard_error
        
        # Format bounds
        formatted = self._format_bounds(
            point_estimate, intervals[self.default_confidence], margin_of_error
        )
        
        bounds = UncertaintyBounds(
            claim_id=claim_id,
            point_estimate=point_estimate,
            standard_error=standard_error,
            confidence_intervals=intervals,
            margin_of_error=margin_of_error,
            sample_size=sample_size,
            distribution_type=distribution_type,
            confidence=base_confidence,
            formatted=formatted
        )
        
        self.results[claim_id] = bounds
        return bounds
    
    def _get_critical_value(
        self,
        confidence_level: float,
        sample_size: Optional[int],
        distribution_type: str
    ) -> float:
        """Get critical value (z or t) for confidence level"""
        if distribution_type == "normal" or sample_size is None or sample_size > 30:
            # Use z-score
            return Z_SCORES.get(confidence_level, 1.96)
        else:
            # Use t-distribution (approximate)
            df = sample_size - 1
            # Approximate t-value (slightly larger than z)
            z = Z_SCORES.get(confidence_level, 1.96)
            t_adjustment = 1 + (1.5 / df) if df > 0 else 1.5
            return z * t_adjustment
    
    def _format_bounds(
        self,
        point_estimate: Optional[float],
        interval: Tuple[float, float],
        margin_of_error: float
    ) -> str:
        """Format bounds for display"""
        if point_estimate is None:
            return "No point estimate available"
        
        lower, upper = interval
        moe_percent = (margin_of_error / point_estimate * 100) if point_estimate != 0 else 0
        
        return (
            f"{point_estimate:.2f} ± {margin_of_error:.2f} "
            f"[{lower:.2f}, {upper:.2f}] "
            f"(±{moe_percent:.1f}%)"
        )
    
    def calculate_from_sample(
        self,
        claim_id: str,
        sample_data: List[float],
        base_confidence: float = 0.5
    ) -> UncertaintyBounds:
        """
        Calculate uncertainty bounds from sample data
        
        Args:
            claim_id: Unique identifier
            sample_data: Raw sample data
            base_confidence: Base confidence score
            
        Returns:
            UncertaintyBounds
        """
        n = len(sample_data)
        
        if n < 2:
            raise ValueError("Need at least 2 samples")
        
        # Calculate statistics
        mean = statistics.mean(sample_data)
        std_dev = statistics.stdev(sample_data)
        standard_error = std_dev / math.sqrt(n)
        
        return self.calculate_bounds(
            claim_id=claim_id,
            point_estimate=mean,
            standard_error=standard_error,
            sample_size=n,
            distribution_type="t" if n <= 30 else "normal",
            base_confidence=base_confidence
        )
    
    def calculate_proportion_bounds(
        self,
        claim_id: str,
        successes: int,
        total: int,
        base_confidence: float = 0.5
    ) -> UncertaintyBounds:
        """
        Calculate uncertainty bounds for a proportion
        
        Uses Wilson score interval for better coverage.
        
        Args:
            claim_id: Unique identifier
            successes: Number of successes
            total: Total sample size
            base_confidence: Base confidence score
            
        Returns:
            UncertaintyBounds
        """
        if total == 0:
            raise ValueError("Total must be > 0")
        
        p_hat = successes / total
        n = total
        
        # Wilson score interval
        z = self._get_critical_value(self.default_confidence.value, n, "normal")
        
        denominator = 1 + z**2 / n
        center = (p_hat + z**2 / (2 * n)) / denominator
        margin = z * math.sqrt((p_hat * (1 - p_hat) + z**2 / (4 * n)) / n) / denominator
        
        lower = max(0.0, center - margin)
        upper = min(1.0, center + margin)
        
        standard_error = math.sqrt(p_hat * (1 - p_hat) / n)
        
        # Build intervals for all levels
        intervals = {}
        for level in ConfidenceLevel:
            z_level = self._get_critical_value(level.value, n, "normal")
            margin_level = z_level * standard_error
            intervals[level] = (
                max(0.0, p_hat - margin_level),
                min(1.0, p_hat + margin_level)
            )
        
        bounds = UncertaintyBounds(
            claim_id=claim_id,
            point_estimate=p_hat,
            standard_error=standard_error,
            confidence_intervals=intervals,
            margin_of_error=margin,
            sample_size=n,
            distribution_type="normal",
            confidence=base_confidence,
            formatted=f"{p_hat:.3f} ± {margin:.3f} [{lower:.3f}, {upper:.3f}]"
        )
        
        self.results[claim_id] = bounds
        return bounds
    
    def propagate_error(
        self,
        operation: str,
        inputs: List[UncertaintyBounds],
        constants: Optional[List[float]] = None
    ) -> ErrorPropagationResult:
        """
        Propagate uncertainty through mathematical operations
        
        Supports: addition, subtraction, multiplication, division, power
        
        Args:
            operation: Mathematical operation
            inputs: Input uncertainty bounds
            constants: Optional constants
            
        Returns:
            ErrorPropagationResult
        """
        if not inputs:
            raise ValueError("Need at least one input")
        
        # Extract point estimates and standard errors
        estimates = [b.point_estimate for b in inputs if b.point_estimate is not None]
        errors = [b.standard_error for b in inputs]
        
        if not estimates or len(estimates) != len(errors):
            raise ValueError("All inputs must have point estimates")
        
        # Calculate output estimate based on operation
        output_estimate = self._apply_operation(operation, estimates, constants)
        
        # Propagate error (Gaussian error propagation)
        output_error = self._propagate_gaussian_error(operation, estimates, errors, constants)
        
        # Create output bounds
        output_bounds = self.calculate_bounds(
            claim_id=f"prop_{operation}_{len(self.results)}",
            point_estimate=output_estimate,
            standard_error=output_error
        )
        
        result = ErrorPropagationResult(
            operation=operation,
            inputs=[{'estimate': b.point_estimate, 'error': b.standard_error} for b in inputs],
            output_estimate=output_estimate,
            output_error=output_error,
            output_bounds=output_bounds,
            propagation_method="gaussian"
        )
        
        return result
    
    def _apply_operation(
        self,
        operation: str,
        values: List[float],
        constants: Optional[List[float]]
    ) -> float:
        """Apply mathematical operation to values"""
        if operation == "add":
            return sum(values)
        elif operation == "subtract":
            if len(values) < 2:
                raise ValueError("Need at least 2 values for subtraction")
            return values[0] - sum(values[1:])
        elif operation == "multiply":
            result = 1.0
            for v in values:
                result *= v
            return result
        elif operation == "divide":
            if len(values) < 2:
                raise ValueError("Need at least 2 values for division")
            return values[0] / values[1]
        elif operation == "power":
            if len(values) < 2:
                raise ValueError("Need base and exponent")
            return values[0] ** values[1]
        else:
            raise ValueError(f"Unknown operation: {operation}")
    
    def _propagate_gaussian_error(
        self,
        operation: str,
        values: List[float],
        errors: List[float],
        constants: Optional[List[float]]
    ) -> float:
        """
        Propagate error using Gaussian error propagation formula
        
        σ_f = sqrt(Σ (∂f/∂x_i)² σ_i²)
        """
        if operation == "add":
            # σ_sum = sqrt(σ₁² + σ₂² + ...)
            return math.sqrt(sum([e**2 for e in errors]))
        
        elif operation == "subtract":
            # Same as addition
            return math.sqrt(sum([e**2 for e in errors]))
        
        elif operation == "multiply":
            # σ_xy = xy * sqrt((σ₁/x₁)² + (σ₂/x₂)² + ...)
            product = self._apply_operation("multiply", values, constants)
            relative_errors = sum([(e/v)**2 for v, e in zip(values, errors) if v != 0])
            return abs(product) * math.sqrt(relative_errors)
        
        elif operation == "divide":
            # σ_x/y = (x/y) * sqrt((σ₁/x₁)² + (σ₂/x₂)²)
            if len(values) < 2 or values[1] == 0:
                return float('inf')
            quotient = values[0] / values[1]
            relative_errors = sum([(e/v)**2 for v, e in zip(values[:2], errors[:2]) if v != 0])
            return abs(quotient) * math.sqrt(relative_errors)
        
        elif operation == "power":
            # σ_x^n = |n| * x^(n-1) * σ_x
            if len(values) < 2:
                return float('inf')
            base, exponent = values[0], values[1]
            error = errors[0]
            return abs(exponent * (base ** (exponent - 1)) * error)
        
        else:
            return sum(errors)  # Fallback
    
    def get_bounds(self, claim_id: str) -> Optional[UncertaintyBounds]:
        """Get uncertainty bounds by ID"""
        return self.results.get(claim_id)
    
    def compare_bounds(
        self,
        bounds1: UncertaintyBounds,
        bounds2: UncertaintyBounds
    ) -> Dict:
        """
        Compare two uncertainty bounds
        
        Checks for overlap and statistical significance.
        """
        # Get 95% CIs
        ci1 = bounds1.confidence_intervals.get(ConfidenceLevel.CL_95)
        ci2 = bounds2.confidence_intervals.get(ConfidenceLevel.CL_95)
        
        if not ci1 or not ci2:
            return {'error': 'Missing confidence intervals'}
        
        # Check overlap
        overlaps = not (ci1[1] < ci2[0] or ci2[1] < ci1[0])
        
        # Calculate difference
        if bounds1.point_estimate is not None and bounds2.point_estimate is not None:
            diff = bounds1.point_estimate - bounds2.point_estimate
            # Pooled standard error
            pooled_se = math.sqrt(bounds1.standard_error**2 + bounds2.standard_error**2)
            z_score = diff / pooled_se if pooled_se > 0 else 0
            significant = abs(z_score) > 1.96
        else:
            diff = None
            z_score = None
            significant = False
        
        return {
            'overlaps': overlaps,
            'difference': diff,
            'z_score': z_score,
            'statistically_significant': significant,
            'ci1': ci1,
            'ci2': ci2
        }
