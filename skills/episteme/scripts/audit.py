#!/usr/bin/env python3
"""
Episteme Audit - Deep Knowledge Audit

Performs a deeper audit of claims, checking consistency with known sources
and flagging potential epistemic gaps.
"""

import sys
import json
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime

# Simulated knowledge base for demo
KNOWLEDGE_SOURCES = {
    "scientific_consensus": ["climate change", "evolution", "vaccines"],
    "historical_facts": ["World War II ended in 1945", "Washington was first US president"],
    "mathematical_truths": ["2+2=4", "pi is approximately 3.14159"],
    "geographic_facts": ["Canberra is capital of Australia", "Pacific is largest ocean"]
}

def hash_claim(claim: str) -> str:
    """Create a unique hash for a claim."""
    return hashlib.sha256(claim.encode()).hexdigest()[:16]

def check_source_consistency(claim: str) -> Dict[str, Any]:
    """Check if claim is consistent with known sources."""
    claim_lower = claim.lower()
    
    matches = []
    for source, facts in KNOWLEDGE_SOURCES.items():
        for fact in facts:
            if fact.lower() in claim_lower or claim_lower in fact.lower():
                matches.append({
                    "source": source,
                    "fact": fact,
                    "consistency": "consistent"
                })
    
    return {
        "claim_hash": hash_claim(claim),
        "matches": matches,
        "source_coverage": len(matches) / max(1, len(KNOWLEDGE_SOURCES))
    }

def identify_epistemic_gaps(claim: str) -> List[Dict[str, str]]:
    """Identify potential gaps in the claim's epistemic foundation."""
    gaps = []
    
    # Check for unsupported superlatives
    if any(word in claim.lower() for word in ["always", "never", "all", "none", "every"]):
        gaps.append({
            "type": "absolute_claim",
            "description": "Absolute claims require universal evidence",
            "severity": "high"
        })
    
    # Check for causal claims without mechanism
    causal_markers = ["causes", "leads to", "results in", "because"]
    if any(m in claim.lower() for m in causal_markers):
        if "mechanism" not in claim.lower() and "study" not in claim.lower():
            gaps.append({
                "type": "causal_without_mechanism",
                "description": "Causal claim without explained mechanism or citation",
                "severity": "medium"
            })
    
    # Check for statistical claims without source
    if "%" in claim or "percent" in claim.lower():
        if "study" not in claim.lower() and "source" not in claim.lower():
            gaps.append({
                "type": "statistical_without_source",
                "description": "Statistical claim without cited source",
                "severity": "high"
            })
    
    # Check for future predictions
    future_markers = ["will", "going to", "future", "predict"]
    if any(m in claim.lower() for m in future_markers):
        gaps.append({
            "type": "prediction",
            "description": "Future prediction - inherently uncertain",
            "severity": "low"
        })
    
    return gaps

def audit_claim(claim: str) -> Dict[str, Any]:
    """
    Perform comprehensive epistemic audit.
    
    Args:
        claim: The claim to audit
    
    Returns:
        Dictionary with audit results
    """
    source_check = check_source_consistency(claim)
    gaps = identify_epistemic_gaps(claim)
    
    # Calculate overall risk score
    risk_score = 0
    for gap in gaps:
        if gap["severity"] == "high":
            risk_score += 3
        elif gap["severity"] == "medium":
            risk_score += 2
        else:
            risk_score += 1
    
    # Determine audit status
    if risk_score == 0 and source_check["source_coverage"] > 0.5:
        status = "VERIFIED"
    elif risk_score <= 2:
        status = "NEEDS_REVIEW"
    else:
        status = "HIGH_RISK"
    
    return {
        "claim": claim,
        "timestamp": datetime.utcnow().isoformat(),
        "claim_hash": source_check["claim_hash"],
        "source_consistency": source_check,
        "epistemic_gaps": gaps,
        "risk_score": risk_score,
        "status": status,
        "recommendation": get_recommendation(status, gaps)
    }

def get_recommendation(status: str, gaps: List[Dict]) -> str:
    """Generate recommendation based on audit results."""
    if status == "VERIFIED":
        return "Claim appears well-supported. Proceed with appropriate epistemic labels."
    elif status == "NEEDS_REVIEW":
        return "Review identified gaps and add citations or qualifications."
    else:
        return "High risk of epistemic issues. Require source verification before use."

def format_audit_output(audit: Dict[str, Any]) -> str:
    """Format audit results for display."""
    output = []
    output.append(f"Epistemic Audit for: {audit['claim']}\n")
    output.append("=" * 60)
    output.append(f"Status: {audit['status']}")
    output.append(f"Risk Score: {audit['risk_score']}")
    output.append(f"Claim Hash: {audit['claim_hash']}\n")
    
    output.append("Source Consistency:")
    if audit['source_consistency']['matches']:
        for match in audit['source_consistency']['matches']:
            output.append(f"  ✓ {match['source']}: {match['fact']}")
    else:
        output.append("  No direct matches in knowledge base")
    output.append(f"  Coverage: {audit['source_consistency']['source_coverage']:.0%}\n")
    
    output.append("Epistemic Gaps:")
    if audit['epistemic_gaps']:
        for gap in audit['epistemic_gaps']:
            output.append(f"  ⚠ [{gap['severity'].upper()}] {gap['type']}")
            output.append(f"     {gap['description']}")
    else:
        output.append("  No significant gaps identified")
    output.append("")
    
    output.append(f"Recommendation: {audit['recommendation']}")
    
    return "\n".join(output)

def main():
    if len(sys.argv) < 2:
        print("Usage: python audit.py <claim>")
        print("Example: python audit.py 'Vitamin C prevents colds'")
        sys.exit(1)
    
    claim = " ".join(sys.argv[1:])
    audit = audit_claim(claim)
    print(format_audit_output(audit))
    
    # Also output JSON for programmatic use
    if len(sys.argv) > 2 and sys.argv[2] == "--json":
        print("\n" + "=" * 60)
        print("JSON Output:")
        print(json.dumps(audit, indent=2))

if __name__ == "__main__":
    main()
