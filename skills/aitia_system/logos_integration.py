"""
A4: Integration with Logos
Causal verification of claims using Logos system
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from .causal_graph import CausalGraphBuilder, CausalDAG, CausalRelationType
import sys
import os

# Add logos to path for integration
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'logos'))


@dataclass
class CausalVerificationResult:
    """Result of causal verification"""
    claim: str
    causal_structure_detected: bool
    causal_graph: Optional[CausalDAG]
    logos_verification: Dict  # From Logos system
    causal_confidence: float
    overall_confidence: float
    verification_status: str  # VERIFIED, PARTIAL, UNVERIFIED
    reasoning: str
    sources: List[str]
    causal_edges_validated: int
    total_causal_edges: int


class LogosCausalVerifier:
    """
    Integrate Aitia causal reasoning with Logos verification
    
    Uses Logos to verify causal claims by:
    1. Decomposing causal claims into atomic propositions
    2. Verifying each proposition against sources
    3. Aggregating confidence for causal structure
    4. Validating causal edges with evidence
    """
    
    def __init__(self, logos_integration=None):
        self.causal_builder = CausalGraphBuilder()
        self.logos_integration = logos_integration
        self.results: Dict[str, CausalVerificationResult] = {}
    
    def verify_causal_claim(
        self,
        claim: str,
        sources: Optional[List[str]] = None
    ) -> CausalVerificationResult:
        """
        Verify a causal claim using Logos + Aitia
        
        Args:
            claim: Natural language causal claim
            sources: Optional source list for verification
            
        Returns:
            CausalVerificationResult
        """
        # Step 1: Extract causal structure
        causal_claims = self.causal_builder.extract_causal_claims(claim)
        
        if not causal_claims:
            return CausalVerificationResult(
                claim=claim,
                causal_structure_detected=False,
                causal_graph=None,
                logos_verification={},
                causal_confidence=0.0,
                overall_confidence=0.0,
                verification_status="UNVERIFIED",
                reasoning="No causal structure detected in claim",
                sources=sources or [],
                causal_edges_validated=0,
                total_causal_edges=0
            )
        
        # Step 2: Build causal DAG
        dag = self.causal_builder.build_dag(causal_claims, graph_id="temp")
        
        # Step 3: Verify atomic propositions with Logos
        # (Simulated - in production would call actual Logos API)
        logos_results = self._verify_with_logos(causal_claims, sources)
        
        # Step 4: Aggregate causal confidence
        causal_confidence = self._aggregate_causal_confidence(
            causal_claims, logos_results
        )
        
        # Step 5: Determine verification status
        if causal_confidence >= 0.7:
            status = "VERIFIED"
        elif causal_confidence >= 0.4:
            status = "PARTIAL"
        else:
            status = "UNVERIFIED"
        
        # Step 6: Build reasoning
        reasoning = self._build_reasoning(
            causal_claims, dag, logos_results, causal_confidence
        )
        
        result = CausalVerificationResult(
            claim=claim,
            causal_structure_detected=True,
            causal_graph=dag,
            logos_verification=logos_results,
            causal_confidence=causal_confidence,
            overall_confidence=causal_confidence,
            verification_status=status,
            reasoning=reasoning,
            sources=sources or [],
            causal_edges_validated=len([c for c in causal_claims if c.get('verified', False)]),
            total_causal_edges=len(causal_claims)
        )
        
        self.results[f"cvr_{len(self.results)}"] = result
        return result
    
    def _verify_with_logos(
        self,
        causal_claims: List[Dict],
        sources: Optional[List[str]]
    ) -> Dict:
        """
        Verify causal claims using Logos system
        
        In production, this would call the actual Logos API.
        Here we simulate the verification process.
        """
        verification_results = {}
        
        for i, claim in enumerate(causal_claims):
            # Simulate Logos verification
            # In production: call logos.honest_integration.process_claim()
            
            cause_verified = self._simulate_logos_check(claim['cause'], sources)
            effect_verified = self._simulate_logos_check(claim['effect'], sources)
            
            verification_results[f"claim_{i}"] = {
                'cause': claim['cause'],
                'effect': claim['effect'],
                'cause_verified': cause_verified,
                'effect_verified': effect_verified,
                'relation_type': claim['relation_type'],
                'combined_confidence': (cause_verified['confidence'] + effect_verified['confidence']) / 2,
                'verified': cause_verified['verified'] and effect_verified['verified']
            }
        
        return verification_results
    
    def _simulate_logos_check(
        self,
        proposition: str,
        sources: Optional[List[str]]
    ) -> Dict:
        """Simulate Logos verification of a proposition"""
        # In production, this would call actual Logos API
        # For now, return simulated results
        
        # Base confidence from linguistic markers
        confidence = 0.5
        
        if any(word in proposition.lower() for word in ['proven', 'confirmed', 'established']):
            confidence = 0.8
        elif any(word in proposition.lower() for word in ['suggests', 'indicates', 'may']):
            confidence = 0.4
        
        verified = confidence > 0.6
        
        return {
            'proposition': proposition,
            'verified': verified,
            'confidence': confidence,
            'sources': sources or ['simulated'],
            'status': 'VERIFIED' if verified else 'UNVERIFIED'
        }
    
    def _aggregate_causal_confidence(
        self,
        causal_claims: List[Dict],
        logos_results: Dict
    ) -> float:
        """Aggregate confidence across causal claims"""
        if not logos_results:
            return 0.0
        
        confidences = []
        for key, result in logos_results.items():
            confidences.append(result.get('combined_confidence', 0.5))
        
        # Average confidence
        avg_confidence = sum(confidences) / len(confidences)
        
        # Adjust for number of claims (more claims = more uncertainty)
        adjustment = 1.0 - (len(causal_claims) * 0.02)
        adjustment = max(0.5, adjustment)
        
        return avg_confidence * adjustment
    
    def _build_reasoning(
        self,
        causal_claims: List[Dict],
        dag: CausalDAG,
        logos_results: Dict,
        causal_confidence: float
    ) -> str:
        """Build human-readable reasoning trace"""
        parts = []
        
        parts.append(f"Detected {len(causal_claims)} causal relationships")
        
        if dag:
            parts.append(f"Built causal DAG with {len(dag.nodes)} nodes and {len(dag.edges)} edges")
        
        verified_count = sum([1 for r in logos_results.values() if r.get('verified', False)])
        parts.append(f"Logos verification: {verified_count}/{len(logos_results)} claims verified")
        
        parts.append(f"Causal confidence: {causal_confidence:.2f}")
        
        if causal_confidence >= 0.7:
            parts.append("Strong causal evidence detected")
        elif causal_confidence >= 0.4:
            parts.append("Moderate causal evidence - some uncertainty")
        else:
            parts.append("Weak causal evidence - low confidence")
        
        return " | ".join(parts)
    
    def batch_verify(
        self,
        claims: List[str],
        sources: Optional[List[str]] = None
    ) -> List[CausalVerificationResult]:
        """Verify multiple causal claims"""
        results = []
        
        for claim in claims:
            result = self.verify_causal_claim(claim, sources)
            results.append(result)
        
        return results
    
    def get_verification_summary(
        self,
        results: List[CausalVerificationResult]
    ) -> Dict:
        """Generate summary of verification results"""
        total = len(results)
        verified = sum([1 for r in results if r.verification_status == "VERIFIED"])
        partial = sum([1 for r in results if r.verification_status == "PARTIAL"])
        unverified = sum([1 for r in results if r.verification_status == "UNVERIFIED"])
        
        avg_causal_conf = sum([r.causal_confidence for r in results]) / total if total > 0 else 0
        
        return {
            'total_claims': total,
            'verified': verified,
            'partial': partial,
            'unverified': unverified,
            'verification_rate': verified / total if total > 0 else 0,
            'average_causal_confidence': avg_causal_conf,
            'total_causal_edges': sum([r.total_causal_edges for r in results]),
            'validated_edges': sum([r.causal_edges_validated for r in results])
        }
