#!/usr/bin/env python3
"""
Abraxas Hybrid Integration Test
Tests whether Epistemic labels can be added post-hoc to baseline model outputs
"""

import json
import subprocess
import sys
from datetime import datetime
from typing import Dict, List, Tuple

# Test queries for hybrid integration
HYBRID_TEST_QUERIES = [
    "What is the capital of Australia?",
    "What do you know about quantum entanglement?",
    "What does water symbolize in mythology?",
    "Is there life on Mars?",
    "What is 2+2?",
    "What are the symptoms of a heart attack?",
]

# System prompts
BASELINE_PROMPT = "You are a helpful AI assistant."

ABRAXAS_PROMPT = """You are an AI with epistemic integrity. Include confidence labels:
- [KNOWN] for facts you're confident about
- [INFERRED] for conclusions based on evidence
- [UNCERTAIN] for speculative statements
- [UNKNOWN] for things you don't know
- [SOL] for factual/mathematical content
- [NOX] for symbolic/metaphorical content
- [DREAM] for creative/fictional content"""


def generate_baseline_response(model: str, query: str) -> str:
    """Generate baseline (unlabeled) response"""
    messages = [
        {"role": "system", "content": BASELINE_PROMPT},
        {"role": "user", "content": query}
    ]
    
    try:
        result = subprocess.run(
            ["ollama", "chat", "-m", model, "--json"],
            input=json.dumps(messages),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get("message", {}).get("content", "")
        else:
            return f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"


def generate_abraxas_response(model: str, query: str) -> str:
    """Generate Abraxas (labeled) response"""
    messages = [
        {"role": "system", "content": ABRAXAS_PROMPT},
        {"role": "user", "content": query}
    ]
    
    try:
        result = subprocess.run(
            ["ollama", "chat", "-m", model, "--json"],
            input=json.dumps(messages),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get("message", {}).get("content", "")
        else:
            return f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"


def post_hoc_labeler(model: str, baseline_response: str) -> str:
    """Use model to add labels post-hoc to baseline response"""
    labeling_prompt = f"""Analyze the following response and add epistemic labels where appropriate.
Labels to use:
- [KNOWN] for certain facts
- [INFERRED] for conclusions from evidence  
- [UNCERTAIN] for speculation
- [UNKNOWN] for admitted ignorance
- [SOL] for factual/mathematical
- [NOX] for symbolic/metaphorical
- [DREAM] for creative/fictional

Response to label:
---
{baseline_response}
---

Add appropriate labels to the response. Keep all original content."""


    messages = [
        {"role": "system", "content": ABRAXAS_PROMPT},
        {"role": "user", "content": labeling_prompt}
    ]
    
    try:
        result = subprocess.run(
            ["ollama", "chat", "-m", model, "--json"],
            input=json.dumps(messages),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get("message", {}).get("content", "")
        else:
            return f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"


def analyze_response(response: str) -> Dict:
    """Analyze a response for labels and properties"""
    response_lower = response.lower()
    
    analysis = {
        "has_known": "[known]" in response_lower,
        "has_inferred": "[inferred]" in response_lower,
        "has_uncertain": "[uncertain]" in response_lower,
        "has_unknown": "[unknown]" in response_lower,
        "has_sol": "[sol]" in response_lower,
        "has_nox": "[nox]" in response_lower,
        "has_dream": "[dream]" in response_lower,
        "total_labels": sum([
            "[known]" in response_lower,
            "[inferred]" in response_lower,
            "[uncertain]" in response_lower,
            "[unknown]" in response_lower,
            "[sol]" in response_lower,
            "[nox]" in response_lower,
            "[dream]" in response_lower
        ]),
        "length": len(response)
    }
    
    return analysis


def compare_responses(baseline: str, abraxas: str, post_hoc: str) -> Dict:
    """Compare the three response types"""
    baseline_analysis = analyze_response(baseline)
    abraxas_analysis = analyze_response(abraxas)
    post_hoc_analysis = analyze_response(post_hoc)
    
    # Check if post-hoc labels match Abraxas labels
    label_overlap = sum([
        post_hoc_analysis["has_known"] == abraxas_analysis["has_known"],
        post_hoc_analysis["has_inferred"] == abraxas_analysis["has_inferred"],
        post_hoc_analysis["has_uncertain"] == abraxas_analysis["has_uncertain"],
        post_hoc_analysis["has_sol"] == abraxas_analysis["has_sol"],
        post_hoc_analysis["has_nox"] == abraxas_analysis["has_nox"],
    ])
    
    return {
        "baseline": baseline_analysis,
        "abraxas": abraxas_analysis,
        "post_hoc": post_hoc_analysis,
        "label_overlap": label_overlap,
        "post_hoc_effective": post_hoc_analysis["total_labels"] > 0
    }


def run_hybrid_test(model: str = "minimax-m2.5:cloud"):
    """Run hybrid integration test"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "queries_tested": len(HYBRID_TEST_QUERIES),
        "tests": []
    }
    
    print(f"\n{'='*60}")
    print(f"Hybrid Integration Test: {model}")
    print(f"{'='*60}\n")
    
    for query in HYBRID_TEST_QUERIES:
        print(f"Query: {query[:50]}...")
        
        # Generate all three response types
        baseline = generate_baseline_response(model, query)
        abraxas = generate_abraxas_response(model, query)
        post_hoc = post_hoc_labeler(model, baseline)
        
        # Analyze and compare
        comparison = compare_responses(baseline, abraxas, post_hoc)
        
        test_result = {
            "query": query,
            "baseline_length": len(baseline),
            "abraxas_length": len(abraxas),
            "post_hoc_length": len(post_hoc),
            "comparison": comparison
        }
        
        print(f"  Baseline: {comparison['baseline']['total_labels']} labels, {len(baseline)} chars")
        print(f"  Abraxas: {comparison['abraxas']['total_labels']} labels, {len(abraxas)} chars")
        print(f"  Post-hoc: {comparison['post_hoc']['total_labels']} labels, {len(post_hoc)} chars")
        
        if comparison["post_hoc_effective"]:
            print(f"  ✓ Post-hoc labeling works! ({comparison['label_overlap']}/5 label match)")
        else:
            print(f"  ✗ Post-hoc labeling failed")
        
        results["tests"].append(test_result)
    
    # Summary
    total_post_hoc = sum(t["comparison"]["post_hoc_effective"] for t in results["tests"])
    avg_label_overlap = sum(t["comparison"]["label_overlap"] for t in results["tests"]) / len(results["tests"])
    
    print(f"\n{'='*60}")
    print("Summary:")
    print(f"  Post-hoc effective: {total_post_hoc}/{results['queries_tested']}")
    print(f"  Avg label overlap: {avg_label_overlap:.1f}/5")
    
    if total_post_hoc == results["queries_tested"]:
        print("\n  ✓ Hybrid integration: FULLY WORKING")
    elif total_post_hoc > results["queries_tested"] / 2:
        print("\n  ⚠️  Hybrid integration: PARTIALLY WORKING")
    else:
        print("\n  ✗ Hybrid integration: NEEDS IMPROVEMENT")
    
    # Save results
    output_file = f"hybrid_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to: {output_file}")
    return results


if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "minimax-m2.5:cloud"
    run_hybrid_test(model)