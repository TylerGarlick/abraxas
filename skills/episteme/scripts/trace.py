#!/usr/bin/env python3
"""
Episteme Trace - Knowledge Boundary Mapping

Analyzes a claim and breaks it down into:
- Direct Knowledge: Facts from training data or external sources
- Inferred Knowledge: Conclusions derived from chaining facts
- Artifact Knowledge: Patterns from training corpus (style, phrasing)
"""

import sys
import json
import re
from typing import Dict, List, Any

# Epistemic labels
LABELS = {
    "KNOWN": "Verified fact, established",
    "INFERRED": "Derived through reasoning",
    "UNCERTAIN": "Not fully verifiable, uncertain, ambiguous, speculative",
    "UNKNOWN": "Genuinely don't know",
    "DREAM": "Symbolic/creative content"
}

def parse_claim(claim: str) -> List[str]:
    """Break claim into atomic propositions."""
    # Simple sentence splitter - can be enhanced with NLP
    sentences = re.split(r'[.!?]+', claim)
    return [s.strip() for s in sentences if s.strip()]

def classify_proposition(prop: str) -> Dict[str, Any]:
    """
    Classify a proposition's epistemic status.
    In production, this would query a knowledge base.
    """
    # Heuristics for demo purposes
    prop_lower = prop.lower()
    
    # Check for uncertainty markers
    uncertainty_markers = ['might', 'could', 'possibly', 'probably', 'perhaps', 'maybe', 'uncertain']
    if any(m in prop_lower for m in uncertainty_markers):
        return {"label": "UNCERTAIN", "confidence": 0.6, "reason": "Contains uncertainty markers"}
    
    # Check for unknown markers
    unknown_markers = ['unknown', 'unclear', 'debatable', 'contested']
    if any(m in prop_lower for m in unknown_markers):
        return {"label": "UNKNOWN", "confidence": 0.5, "reason": "Explicitly marked as unknown"}
    
    # Check for inference markers
    inference_markers = ['therefore', 'thus', 'hence', 'implies', 'suggests', 'indicates']
    if any(m in prop_lower for m in inference_markers):
        return {"label": "INFERRED", "confidence": 0.7, "reason": "Derived through reasoning"}
    
    # Default to KNOWN for factual statements
    return {"label": "KNOWN", "confidence": 0.8, "reason": "Appears to be established fact"}

def trace_claim(claim: str, max_depth: int = 3) -> Dict[str, Any]:
    """
    Perform epistemic trace on a claim.
    
    Args:
        claim: The claim to analyze
        max_depth: Maximum inference depth (default: 3)
    
    Returns:
        Dictionary with trace breakdown
    """
    propositions = parse_claim(claim)
    trace_results = []
    
    for i, prop in enumerate(propositions):
        classification = classify_proposition(prop)
        trace_results.append({
            "proposition": prop,
            **classification,
            "depth": min(i, max_depth)
        })
    
    # Summary statistics
    label_counts = {}
    for result in trace_results:
        label = result["label"]
        label_counts[label] = label_counts.get(label, 0) + 1
    
    return {
        "claim": claim,
        "propositions": trace_results,
        "summary": {
            "total": len(trace_results),
            "by_label": label_counts,
            "max_depth_reached": max(0, len(propositions) - 1)
        }
    }

def format_trace_output(trace: Dict[str, Any]) -> str:
    """Format trace results for display."""
    output = []
    output.append(f"Epistemic Trace for: {trace['claim']}\n")
    output.append("=" * 60)
    
    for i, prop in enumerate(trace['propositions'], 1):
        output.append(f"[{prop['label']}] Proposition {i}: {prop['proposition']}")
        output.append(f"  Confidence: {prop['confidence']:.0%}")
        output.append(f"  Reason: {prop['reason']}")
        output.append(f"  Inference Depth: {prop['depth']}\n")
    
    output.append("-" * 60)
    output.append("Summary:")
    for label, count in trace['summary']['by_label'].items():
        output.append(f"  {label}: {count} proposition(s)")
    output.append(f"  Total: {trace['summary']['total']} propositions")
    
    return "\n".join(output)

def main():
    if len(sys.argv) < 2:
        print("Usage: python trace.py <claim>")
        print("Example: python trace.py 'The Earth orbits the Sun'")
        sys.exit(1)
    
    claim = " ".join(sys.argv[1:])
    trace = trace_claim(claim)
    print(format_trace_output(trace))

if __name__ == "__main__":
    main()
