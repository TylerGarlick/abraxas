#!/usr/bin/env python3
"""
Episteme Calibrate - Claim Refinement Suggestions

Suggests how to rephrase or add citations to move a claim
from [UNCERTAIN] toward [KNOWN].
"""

import sys
import re
from typing import Dict, List, Any, Tuple

# Calibration patterns
CALIBRATION_PATTERNS = {
    "absolute_to_qualified": [
        (r'\b(always|never|all|none|every)\b', r'[qualified: sometimes/often/most]'),
    ],
    "causal_to_correlational": [
        (r'\b(causes|leads to|results in)\b', r'[correlational: associated with]'),
    ],
    "prediction_to_projection": [
        (r'\b(will|going to)\b', r'[projected: may/likely to]'),
    ],
    "subjective_to_attributed": [
        (r'\b(is (the )?best|terrible|amazing)\b', r'[subjective: according to X]'),
    ],
}

# Citation templates
CITATION_TEMPLATES = {
    "scientific": "According to [SOURCE], [YEAR]",
    "statistical": "Based on [DATASET] analysis ([ORG], [YEAR])",
    "historical": "Historical records indicate [EVENT] occurred in [YEAR]",
    "geographic": "Per [AUTHORITY] data, [LOCATION] is [FACT]",
    "mathematical": "Mathematically verified: [FORMULA/PROOF]",
}

def identify_claim_type(claim: str) -> List[str]:
    """Identify the type(s) of claim being made."""
    types = []
    claim_lower = claim.lower()
    
    if any(m in claim_lower for m in ["always", "never", "all", "none"]):
        types.append("absolute")
    
    if any(m in claim_lower for m in ["causes", "leads to", "because", "therefore"]):
        types.append("causal")
    
    if any(m in claim_lower for m in ["will", "future", "predict", "going to"]):
        types.append("prediction")
    
    if any(m in claim_lower for m in ["best", "worst", "amazing", "terrible"]):
        types.append("subjective")
    
    if "%" in claim or "percent" in claim_lower:
        types.append("statistical")
    
    if any(m in claim_lower for m in ["study", "research", "evidence"]):
        types.append("evidence_based")
    
    if not types:
        types.append("factual")
    
    return types

def suggest_refinements(claim: str, claim_types: List[str]) -> List[Dict[str, str]]:
    """Generate refinement suggestions based on claim type."""
    suggestions = []
    
    for claim_type in claim_types:
        if claim_type == "absolute":
            suggestions.append({
                "type": "qualification",
                "current": "Absolute language (always/never/all)",
                "suggested": "Use qualified language (often/sometimes/most)",
                "example": re.sub(r'\b(always|never)\b', 'often', claim, flags=re.IGNORECASE)
            })
        
        elif claim_type == "causal":
            suggestions.append({
                "type": "causal_precision",
                "current": "Direct causal claim",
                "suggested": "Specify mechanism or use correlational language",
                "example": re.sub(r'\bcauses\b', 'is associated with', claim, flags=re.IGNORECASE)
            })
        
        elif claim_type == "prediction":
            suggestions.append({
                "type": "temporal_precision",
                "current": "Definitive prediction",
                "suggested": "Frame as projection with confidence interval",
                "example": re.sub(r'\bwill\b', 'is projected to', claim, flags=re.IGNORECASE)
            })
        
        elif claim_type == "subjective":
            suggestions.append({
                "type": "attribution",
                "current": "Subjective claim without source",
                "suggested": "Attribute to specific perspective or criteria",
                "example": f"According to [criteria], {claim.lower()}"
            })
        
        elif claim_type == "statistical":
            suggestions.append({
                "type": "source_citation",
                "current": "Statistical claim without source",
                "suggested": "Add data source and methodology",
                "example": claim + " [Source: STUDY_NAME, YEAR]"
            })
    
    return suggestions

def suggest_citations(claim: str, claim_types: List[str]) -> List[str]:
    """Suggest appropriate citation formats."""
    citations = []
    
    for claim_type in claim_types:
        if claim_type == "statistical":
            citations.append(CITATION_TEMPLATES["statistical"])
        elif claim_type == "causal":
            citations.append(CITATION_TEMPLATES["scientific"])
        elif claim_type == "factual":
            if "history" in claim.lower() or any(y in claim for y in ["19", "20"]):
                citations.append(CITATION_TEMPLATES["historical"])
            elif any(w in claim.lower() for w in ["city", "country", "capital", "ocean"]):
                citations.append(CITATION_TEMPLATES["geographic"])
            elif any(w in claim.lower() for w in ["=", "plus", "times", "divided"]):
                citations.append(CITATION_TEMPLATES["mathematical"])
    
    return citations

def calibrate_claim(claim: str) -> Dict[str, Any]:
    """
    Generate calibration suggestions for a claim.
    
    Args:
        claim: The claim to calibrate
    
    Returns:
        Dictionary with calibration recommendations
    """
    claim_types = identify_claim_type(claim)
    refinements = suggest_refinements(claim, claim_types)
    citations = suggest_citations(claim, claim_types)
    
    # Generate calibrated version
    calibrated = claim
    for refinement in refinements:
        if "example" in refinement:
            calibrated = refinement["example"]
            break  # Apply most significant refinement
    
    # Calculate confidence improvement estimate
    base_confidence = 0.5  # Starting assumption
    improvement = min(0.3, len(refinements) * 0.1 + len(citations) * 0.1)
    
    return {
        "original_claim": claim,
        "claim_types": claim_types,
        "refinements": refinements,
        "suggested_citations": citations,
        "calibrated_version": calibrated,
        "estimated_confidence_improvement": f"{base_confidence:.0%} → {base_confidence + improvement:.0%}"
    }

def format_calibration_output(calibration: Dict[str, Any]) -> str:
    """Format calibration results for display."""
    output = []
    output.append(f"Episteme Calibration for: {calibration['original_claim']}\n")
    output.append("=" * 60)
    
    output.append(f"Claim Types: {', '.join(calibration['claim_types'])}\n")
    
    output.append("Refinement Suggestions:")
    if calibration['refinements']:
        for i, ref in enumerate(calibration['refinements'], 1):
            output.append(f"  {i}. [{ref['type'].upper()}]")
            output.append(f"     Current: {ref['current']}")
            output.append(f"     Suggested: {ref['suggested']}")
            output.append(f"     Example: {ref['example']}\n")
    else:
        output.append("  No refinements needed\n")
    
    output.append("Suggested Citations:")
    if calibration['suggested_citations']:
        for cit in calibration['suggested_citations']:
            output.append(f"  • {cit}")
    else:
        output.append("  No specific citations required")
    output.append("")
    
    output.append("Calibrated Version:")
    output.append(f"  {calibration['calibrated_version']}")
    output.append("")
    
    output.append(f"Estimated Confidence: {calibration['estimated_confidence_improvement']}")
    
    return "\n".join(output)

def main():
    if len(sys.argv) < 2:
        print("Usage: python calibrate.py <claim>")
        print("Example: python calibrate.py 'This will definitely succeed'")
        sys.exit(1)
    
    claim = " ".join(sys.argv[1:])
    calibration = calibrate_claim(claim)
    print(format_calibration_output(calibration))

if __name__ == "__main__":
    main()
