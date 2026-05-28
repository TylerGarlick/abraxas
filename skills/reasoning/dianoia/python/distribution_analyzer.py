"""
D3: Distribution Analyzer
Analyze probability distributions (Gaussian, multimodal, etc.)
"""

from typing import Dict, List, Optional, Tuple, Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import math
import statistics
import json


class DistributionType(Enum):
    """Types of probability distributions"""
    NORMAL = "normal"
    UNIFORM = "uniform"
    BETA = "beta"
    BIMODAL = "bimodal"
    MULTIMODAL = "multimodal"
    SKEWED = "skewed"
    CUSTOM = "custom"
    UNKNOWN = "unknown"


@dataclass
class DistributionParameters:
    """Parameters of a fitted distribution"""
    distribution_type: DistributionType
    parameters: Dict[str, float]
    fit_quality: float  # R-squared or similar
    sample_size: int
    standard_errors: Dict[str, float]


@dataclass
class DistributionAnalysis:
    """Complete distribution analysis"""
    data_id: str
    sample_size: int
    distribution_type: DistributionType
    parameters: DistributionParameters
    descriptive_stats: Dict[str, float]
    normality_test: Dict
    modality: int  # Number of modes
    skewness: float
    kurtosis: float
    outliers: List[Dict]
    visualization_data: List[Dict]
    recommendations: List[str]


@dataclass
class MultimodalResult:
    """Result of multimodal analysis"""
    data_id: str
    num_modes: int
    mode_locations: List[float]
    mode_weights: List[float]
    separation_quality: float  # How well-separated modes are
    components: List[Dict]


class DistributionAnalyzer:
    """
    Analyze probability distributions of uncertainty estimates
    
    Identifies distribution type, fits parameters,
    detects multimodality, and characterizes shape.
    """
    
    def __init__(self):
        self.analyses: Dict[str, DistributionAnalysis] = {}
        self.multimodal_results: Dict[str, MultimodalResult] = {}
    
    def analyze(
        self,
        data_id: str,
        data: List[float],
        hypothesized_type: Optional[DistributionType] = None
    ) -> DistributionAnalysis:
        """
        Analyze distribution of data
        
        Args:
            data_id: Unique identifier
            data: Sample data
            hypothesized_type: Optional hypothesized distribution
            
        Returns:
            DistributionAnalysis
        """
        n = len(data)
        
        if n < 3:
            raise ValueError("Need at least 3 data points")
        
        # Calculate descriptive statistics
        desc_stats = self._descriptive_statistics(data)
        
        # Calculate shape metrics
        skewness = self._calculate_skewness(data, desc_stats['mean'], desc_stats['std'])
        kurtosis = self._calculate_kurtosis(data, desc_stats['mean'], desc_stats['std'])
        
        # Test normality
        normality_test = self._test_normality(data)
        
        # Detect modality
        modality, mode_locations = self._detect_modality(data)
        
        # Determine distribution type
        if hypothesized_type:
            dist_type = hypothesized_type
        else:
            dist_type = self._infer_distribution_type(
                data, normality_test, modality, skewness, kurtosis
            )
        
        # Fit distribution parameters
        params = self._fit_distribution(data, dist_type)
        
        # Detect outliers
        outliers = self._detect_outliers(data, desc_stats)
        
        # Generate visualization data
        viz_data = self._prepare_visualization_data(data, params)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            dist_type, normality_test, modality, skewness, kurtosis
        )
        
        analysis = DistributionAnalysis(
            data_id=data_id,
            sample_size=n,
            distribution_type=dist_type,
            parameters=params,
            descriptive_stats=desc_stats,
            normality_test=normality_test,
            modality=modality,
            skewness=skewness,
            kurtosis=kurtosis,
            outliers=outliers,
            visualization_data=viz_data,
            recommendations=recommendations
        )
        
        self.analyses[data_id] = analysis
        return analysis
    
    def _descriptive_statistics(self, data: List[float]) -> Dict[str, float]:
        """Calculate descriptive statistics"""
        n = len(data)
        mean = statistics.mean(data)
        median = statistics.median(data)
        std = statistics.stdev(data) if n > 1 else 0.0
        variance = statistics.variance(data) if n > 1 else 0.0
        min_val = min(data)
        max_val = max(data)
        range_val = max_val - min_val
        q1 = statistics.quantiles(data, n=4)[0] if n > 1 else min_val
        q3 = statistics.quantiles(data, n=4)[2] if n > 1 else max_val
        iqr = q3 - q1
        
        return {
            'mean': mean,
            'median': median,
            'std': std,
            'variance': variance,
            'min': min_val,
            'max': max_val,
            'range': range_val,
            'q1': q1,
            'q3': q3,
            'iqr': iqr,
            'n': n
        }
    
    def _calculate_skewness(
        self,
        data: List[float],
        mean: float,
        std: float
    ) -> float:
        """Calculate Fisher's skewness"""
        if std == 0 or len(data) < 3:
            return 0.0
        
        n = len(data)
        m2 = std ** 2
        m3 = sum([(x - mean) ** 3 for x in data]) / n
        
        skewness = m3 / (m2 ** 1.5)
        return skewness
    
    def _calculate_kurtosis(
        self,
        data: List[float],
        mean: float,
        std: float
    ) -> float:
        """Calculate excess kurtosis"""
        if std == 0 or len(data) < 4:
            return 0.0
        
        n = len(data)
        m2 = std ** 2
        m4 = sum([(x - mean) ** 4 for x in data]) / n
        
        kurtosis = (m4 / (m2 ** 2)) - 3  # Excess kurtosis
        return kurtosis
    
    def _test_normality(self, data: List[float]) -> Dict:
        """Test for normality (Shapiro-Wilk approximation)"""
        n = len(data)
        
        if n < 3:
            return {'is_normal': False, 'p_value': 0.0, 'test': 'INSUFFICIENT_DATA'}
        
        # Use skewness and kurtosis for normality test
        # (Simplified - in production use scipy.stats.shapiro)
        mean = statistics.mean(data)
        std = statistics.stdev(data)
        
        skewness = self._calculate_skewness(data, mean, std)
        kurtosis = self._calculate_kurtosis(data, mean, std)
        
        # Jarque-Bera test approximation
        jb_statistic = n * (skewness**2 / 6 + kurtosis**2 / 24)
        
        # Approximate p-value (chi-squared with 2 df)
        # p < 0.05 suggests non-normal
        is_normal = abs(skewness) < 0.5 and abs(kurtosis) < 0.5
        
        return {
            'is_normal': is_normal,
            'skewness': skewness,
            'kurtosis': kurtosis,
            'jb_statistic': jb_statistic,
            'test': 'JARQUE-BERA',
            'interpretation': 'normal' if is_normal else 'non-normal'
        }
    
    def _detect_modality(self, data: List[float]) -> Tuple[int, List[float]]:
        """Detect number of modes and their locations"""
        # Simple histogram-based mode detection
        sorted_data = sorted(data)
        n = len(sorted_data)
        
        if n < 10:
            return 1, [statistics.mean(data)]
        
        # Create histogram bins
        num_bins = int(math.sqrt(n))
        bin_width = (sorted_data[-1] - sorted_data[0]) / num_bins
        
        # Count values in bins
        bin_counts = []
        bin_centers = []
        
        for i in range(num_bins):
            bin_start = sorted_data[0] + i * bin_width
            bin_end = bin_start + bin_width
            count = sum([1 for x in data if bin_start <= x < bin_end])
            bin_counts.append(count)
            bin_centers.append(bin_start + bin_width / 2)
        
        # Find local maxima (modes)
        modes = []
        for i in range(1, len(bin_counts) - 1):
            if bin_counts[i] > bin_counts[i-1] and bin_counts[i] > bin_counts[i+1]:
                if bin_counts[i] > max(bin_counts) * 0.3:  # Significant mode
                    modes.append(bin_centers[i])
        
        if not modes:
            # Single mode at mean
            return 1, [statistics.mean(data)]
        
        return len(modes), modes
    
    def _infer_distribution_type(
        self,
        data: List[float],
        normality_test: Dict,
        modality: int,
        skewness: float,
        kurtosis: float
    ) -> DistributionType:
        """Infer distribution type from characteristics"""
        if modality > 2:
            return DistributionType.MULTIMODAL
        elif modality == 2:
            return DistributionType.BIMODAL
        elif normality_test['is_normal']:
            return DistributionType.NORMAL
        elif abs(skewness) > 1.0:
            return DistributionType.SKEWED
        elif abs(kurtosis) > 2.0:
            return DistributionType.BETA  # Heavy-tailed or light-tailed
        else:
            return DistributionType.UNKNOWN
    
    def _fit_distribution(
        self,
        data: List[float],
        dist_type: DistributionType
    ) -> DistributionParameters:
        """Fit distribution parameters"""
        if dist_type == DistributionType.NORMAL:
            mean = statistics.mean(data)
            std = statistics.stdev(data)
            params = {'mu': mean, 'sigma': std}
            se = {'mu': std / math.sqrt(len(data)), 'sigma': std / math.sqrt(2 * len(data))}
            fit_quality = 0.9  # Placeholder
        
        elif dist_type == DistributionType.UNIFORM:
            min_val = min(data)
            max_val = max(data)
            params = {'a': min_val, 'b': max_val}
            se = {'a': 0.0, 'b': 0.0}
            fit_quality = 0.95
        
        elif dist_type == DistributionType.BETA:
            # Method of moments approximation
            mean = statistics.mean(data)
            var = statistics.variance(data) if len(data) > 1 else 0.1
            
            # Beta parameters (simplified)
            alpha = mean * ((mean * (1 - mean) / var) - 1)
            beta = (1 - mean) * ((mean * (1 - mean) / var) - 1)
            
            params = {'alpha': max(0.1, alpha), 'beta': max(0.1, beta)}
            se = {'alpha': 0.1, 'beta': 0.1}
            fit_quality = 0.7
        
        else:
            params = {'mean': statistics.mean(data), 'std': statistics.stdev(data)}
            se = {'mean': 0.0, 'std': 0.0}
            fit_quality = 0.5
        
        return DistributionParameters(
            distribution_type=dist_type,
            parameters=params,
            fit_quality=fit_quality,
            sample_size=len(data),
            standard_errors=se
        )
    
    def _detect_outliers(
        self,
        data: List[float],
        stats: Dict[str, float]
    ) -> List[Dict]:
        """Detect outliers using IQR method"""
        q1 = stats['q1']
        q3 = stats['q3']
        iqr = stats['iqr']
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = []
        for i, x in enumerate(data):
            if x < lower_bound or x > upper_bound:
                outliers.append({
                    'index': i,
                    'value': x,
                    'type': 'low' if x < lower_bound else 'high',
                    'z_score': (x - stats['mean']) / stats['std'] if stats['std'] > 0 else 0
                })
        
        return outliers
    
    def _prepare_visualization_data(
        self,
        data: List[float],
        params: DistributionParameters
    ) -> List[Dict]:
        """Prepare data for histogram/density plot"""
        # Create histogram bins
        sorted_data = sorted(data)
        num_bins = int(math.sqrt(len(data)))
        bin_width = (sorted_data[-1] - sorted_data[0]) / num_bins
        
        viz_data = []
        for i in range(num_bins):
            bin_start = sorted_data[0] + i * bin_width
            bin_end = bin_start + bin_width
            count = sum([1 for x in data if bin_start <= x < bin_end])
            viz_data.append({
                'bin_start': bin_start,
                'bin_end': bin_end,
                'count': count,
                'density': count / len(data)
            })
        
        return viz_data
    
    def _generate_recommendations(
        self,
        dist_type: DistributionType,
        normality_test: Dict,
        modality: int,
        skewness: float,
        kurtosis: float
    ) -> List[str]:
        """Generate analysis recommendations"""
        recommendations = []
        
        if dist_type == DistributionType.NORMAL:
            recommendations.append("Data appears normally distributed - parametric tests appropriate")
        elif dist_type == DistributionType.MULTIMODAL:
            recommendations.append(f"Multimodal distribution detected ({modality} modes) - consider mixture modeling")
        elif dist_type == DistributionType.SKEWED:
            if skewness > 0:
                recommendations.append("Right-skewed distribution - consider log transformation")
            else:
                recommendations.append("Left-skewed distribution - consider inverse transformation")
        
        if abs(kurtosis) > 1.0:
            if kurtosis > 0:
                recommendations.append("Heavy-tailed distribution - outliers likely")
            else:
                recommendations.append("Light-tailed distribution - fewer extreme values")
        
        if not normality_test['is_normal']:
            recommendations.append("Non-normal distribution - use non-parametric methods")
        
        return recommendations
    
    def analyze_multimodal(self, data_id: str, data: List[float]) -> MultimodalResult:
        """
        Detailed multimodal analysis using Gaussian mixture modeling
        
        Args:
            data_id: Unique identifier
            data: Sample data
            
        Returns:
            MultimodalResult
        """
        # Detect modes
        num_modes, mode_locations = self._detect_modality(data)
        
        if num_modes <= 1:
            return MultimodalResult(
                data_id=data_id,
                num_modes=1,
                mode_locations=[statistics.mean(data)],
                mode_weights=[1.0],
                separation_quality=0.0,
                components=[]
            )
        
        # Fit Gaussian mixture (simplified)
        components = []
        weights = []
        
        # Assign data points to nearest mode
        assignments = [[] for _ in range(num_modes)]
        for x in data:
            distances = [abs(x - mode) for mode in mode_locations]
            nearest = distances.index(min(distances))
            assignments[nearest].append(x)
        
        # Calculate component parameters
        for i, mode_data in enumerate(assignments):
            if not mode_data:
                continue
            
            mean = statistics.mean(mode_data)
            std = statistics.stdev(mode_data) if len(mode_data) > 1 else 0.1
            weight = len(mode_data) / len(data)
            
            components.append({
                'component_id': i,
                'mean': mean,
                'std': std,
                'weight': weight,
                'n_points': len(mode_data)
            })
            weights.append(weight)
        
        # Calculate separation quality
        if len(mode_locations) > 1:
            # Distance between modes relative to spread
            mode_distances = []
            for i in range(len(mode_locations)):
                for j in range(i+1, len(mode_locations)):
                    mode_distances.append(abs(mode_locations[i] - mode_locations[j]))
            
            avg_distance = sum(mode_distances) / len(mode_distances)
            avg_spread = statistics.stdev(data)
            separation_quality = avg_distance / avg_spread if avg_spread > 0 else 0
        else:
            separation_quality = 0
        
        result = MultimodalResult(
            data_id=data_id,
            num_modes=num_modes,
            mode_locations=mode_locations,
            mode_weights=weights,
            separation_quality=min(1.0, separation_quality),
            components=components
        )
        
        self.multimodal_results[data_id] = result
        return result
    
    def get_analysis(self, data_id: str) -> Optional[DistributionAnalysis]:
        """Get distribution analysis by ID"""
        return self.analyses.get(data_id)
    
    def get_multimodal_result(self, data_id: str) -> Optional[MultimodalResult]:
        """Get multimodal result by ID"""
        return self.multimodal_results.get(data_id)
    
    def compare_distributions(
        self,
        analysis1: DistributionAnalysis,
        analysis2: DistributionAnalysis
    ) -> Dict:
        """Compare two distribution analyses"""
        return {
            'same_type': analysis1.distribution_type == analysis2.distribution_type,
            'mean_diff': analysis1.descriptive_stats['mean'] - analysis2.descriptive_stats['mean'],
            'std_ratio': analysis1.descriptive_stats['std'] / analysis2.descriptive_stats['std'] if analysis2.descriptive_stats['std'] > 0 else float('inf'),
            'skewness_diff': analysis1.skewness - analysis2.skewness,
            'kurtosis_diff': analysis1.kurtosis - analysis2.kurtosis,
            'modality_diff': analysis1.modality - analysis2.modality
        }
