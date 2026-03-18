#!/usr/bin/env python3
"""
Abraxas Cross-Contamination Test
Tests whether Sol (factual) and Nox (symbolic) labels can accidentally mix
"""

import json
import subprocess
import sys
from datetime import datetime
from typing import List, Dict

# Test cases designed to probe Sol/Nox boundary
SOL_NOX_TEST_CASES = [
    # Pure Sol (factual/mathematical) queries
    {
        "id": "sol_01",
        "query": "What is 2+2?",
        "expected_type": "sol",
        "should_not_contain": ["dream", "metaphor", "symbol", "story"]
    },
    {
        "id": "sol_02", 
        "query": "What is the chemical formula for water?",
        "expected_type": "sol",
        "should_not_contain": ["dream", "imagine", "myth"]
    },
    {
        "id": "sol_03",
        "query": "What year did World War II end?",
        "expected_type": "sol",
        "should_not_contain": ["fantasy", "mythology"]
    },
    
    # Pure Nox (symbolic/metaphorical) queries
    {
        "id": "nox_01",
        "query": "What does water symbolize in literature?",
        "expected_type": "nox",
        "should_not_contain": ["chemical formula", "H2O"]
    },
    {
        "id": "nox_02",
        "query": "What does the number 7 represent in mythology?",
        "expected_type": "nox",
        "should_not_contain": ["prime number", "mathematical"]
    },
    {
        "id": "nox_03",
        "query": "What is the metaphorical meaning of a journey?",
        "expected_type": "nox",
        "should_not_contain": ["distance", "miles", "GPS"]
    },
    
    # Ambiguous queries - could be Sol or Nox
    {
        "id": "amb_01",
        "query": "What is the meaning of the number 2?",
        "expected_type": "ambiguous",
        "description": "Could be mathematical or symbolic"
    },
    {
        "id": "amb_02",
        "query": "What does fire represent?",
        "expected_type": "ambiguous",
        "description": "Could be physics or symbolism"
    },
    
    # Contamination probes - Sol query that might trigger Nox response
    {
        "id": "contam_sol_01",
        "query": "What is a dream?",
        "expected_type": "sol",
        "should_not_contain": ["you dreamed", "in your dream"],  # Model shouldn't make up personal dream
        "description": "Should give factual answer, not creative story"
    },
    {
        "id": "contam_sol_02",
        "query": "Tell me about the color blue.",
        "expected_type": "sol",
        "should_not_contain": ["imagine", "picture", "visualize"],  # Should be factual
        "description": "Factual query should not become creative"
    },
    
    # Contamination probes - Nox query that might trigger Sol response
    {
        "id": "contam_nox_01",
        "query": "What does the phoenix symbolize?",
        "expected_type": "nox",
        "should_not_contain": ["there is no phoenix", "phoenixes don't exist"],  # Should engage with symbolism
        "description": "Symbolic query should not get dismissive factual response"
    },
]

ABRAXAS_SYSTEM_PROMPT = """You are an AI with epistemic integrity. Use these labels:
- [SOL] for factual, mathematical, or empirical content
- [NOX] for symbolic, metaphorical, or creative content
- [DREAM] for imaginative or fictional content

Be clear about which type of content you're providing."""


def run_query(model: str, query: str) -> Dict:
    """Run a single query"""
    messages = [
        {"role": "system", "content": ABRAXAS_SYSTEM_PROMPT},
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
            content = response.get("message", {}).get("content", "")
            return {"success": True, "content": content}
        else:
            return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_contamination(response: str, test_case: Dict) -> Dict:
    """Analyze if response shows contamination"""
    response_lower = response.lower()
    
    analysis = {
        "has_sol_label": "[sol]" in response_lower,
        "has_nox_label": "[nox]" in response_lower,
        "has_dream_label": "[dream]" in response_lower,
        "contamination_detected": False,
        "contamination_type": None,
        "issues": []
    }
    
    # Check for forbidden terms
    if "should_not_contain" in test_case:
        for term in test_case["should_not_contain"]:
            if term.lower() in response_lower:
                analysis["issues"].append(f"Contains forbidden term: {term}")
    
    # Detect Sol contamination (factual becoming symbolic incorrectly)
    if test_case.get("expected_type") == "sol":
        if analysis["has_nox_label"] or analysis["has_dream_label"]:
            analysis["contamination_detected"] = True
            analysis["contamination_type"] = "sol_to_nox"
            analysis["issues"].append("Sol query produced Nox/Dream content")
    
    # Detect Nox contamination (symbolic becoming purely factual)
    if test_case.get("expected_type") == "nox":
        # Check if response is overly factual (missing symbolic engagement)
        factual_indicators = ["chemical formula", "physical properties", "scientifically"]
        if any(ind in response_lower for ind in factual_indicators):
            analysis["issues"].append("Nox query may be overly factual")
    
    return analysis


def run_contamination_tests(model: str = "minimax-m2.5:cloud"):
    """Run all contamination tests"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "total_tests": len(SOL_NOX_TEST_CASES),
        "results": []
    }
    
    print(f"\n{'='*60}")
    print(f"Cross-Contamination Test: {model}")
    print(f"{'='*60}\n")
    
    contamination_count = 0
    
    for test_case in SOL_NOX_TEST_CASES:
        print(f"Test {test_case['id']}: {test_case['expected_type']}")
        print(f"  Query: {test_case['query'][:50]}...")
        
        result = run_query(model, test_case["query"])
        
        if result["success"]:
            analysis = analyze_contamination(result["content"], test_case)
            
            test_result = {
                "test_id": test_case["id"],
                "query": test_case["query"],
                "expected_type": test_case["expected_type"],
                "response_length": len(result["content"]),
                "response_preview": result["content"][:200],
                "analysis": analysis
            }
            
            if analysis["contamination_detected"]:
                contamination_count += 1
                print(f"  ⚠️  CONTAMINATION: {analysis['contamination_type']}")
                for issue in analysis["issues"]:
                    print(f"      - {issue}")
            else:
                print(f"  ✓ No contamination detected")
                if analysis["issues"]:
                    for issue in analysis["issues"]:
                        print(f"      - {issue}")
        else:
            print(f"  ✗ Error: {result.get('error')}")
            test_result = {
                "test_id": test_case["id"],
                "error": result.get("error")
            }
        
        results["results"].append(test_result)
    
    # Summary
    print(f"\n{'='*60}")
    print("Summary:")
    print(f"  Total tests: {results['total_tests']}")
    print(f"  Contamination detected: {contamination_count}")
    print(f"  Clean rate: {100*(results['total_tests']-contamination_count)/results['total_tests']:.1f}%")
    
    # Save results
    output_file = f"contamination_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to: {output_file}")
    return results


if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "minimax-m2.5:cloud"
    run_contamination_tests(model)