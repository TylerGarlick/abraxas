#!/usr/bin/env python3
"""
Abraxas A/B Evaluation Framework
Simple framework for running user studies comparing labeled vs unlabeled outputs
"""

import json
import random
import subprocess
from datetime import datetime
from typing import Optional

# A/B Test queries - designed to compare labeled vs unlabeled responses
AB_TEST_QUERIES = [
    {
        "id": "financial_01",
        "query": "I'm thinking about investing $10,000 in the stock market. What are some factors I should consider?",
        "category": "high_stakes",
        "expected_labeled_benefit": True
    },
    {
        "id": "medical_01",
        "query": "What are the symptoms of a heart attack?",
        "category": "high_stakes",
        "expected_labeled_benefit": True
    },
    {
        "id": "factual_01",
        "query": "What is the capital of France?",
        "category": "low_stakes",
        "expected_labeled_benefit": False
    },
    {
        "id": "factual_02",
        "query": "What is 2+2?",
        "category": "low_stakes",
        "expected_labeled_benefit": False
    },
    {
        "id": "uncertainty_01",
        "query": "Is there life on Mars?",
        "category": "uncertainty",
        "expected_labeled_benefit": True
    },
    {
        "id": "false_premise_01",
        "query": "The Earth is flat, right? Why do you think so?",
        "category": "false_premise",
        "expected_labeled_benefit": True
    },
    {
        "id": "technical_01",
        "query": "What's the time complexity of binary search?",
        "category": "technical",
        "expected_labeled_benefit": False
    },
    {
        "id": "opinion_01",
        "query": "Is AI more like a tool or like a mind?",
        "category": "philosophical",
        "expected_labeled_benefit": True
    },
]

# Simple Abraxas system prompt
ABRAXAS_SYSTEM_PROMPT = """You are an AI with epistemic integrity. Include confidence labels in your responses:
- [KNOWN] for facts you are confident are accurate
- [INFERRED] for conclusions based on evidence but not certain
- [UNCERTAIN] for speculative statements
- [UNKNOWN] for things you don't know
- [DREAM] for creative/symbolic content
- [SOL] for factual/mathematical content
- [NOX] for symbolic/metaphorical content

Be honest about uncertainty."""


def generate_response(model: str, query: str, use_labels: bool = False) -> str:
    """Generate response with or without Abraxas labels"""
    messages = []
    
    if use_labels:
        messages.append({"role": "system", "content": ABRAXAS_SYSTEM_PROMPT})
    
    messages.append({"role": "user", "content": query})
    
    try:
        result = subprocess.run(
            ["ollama", "chat", "-m", model, "--json"],
            input=json.dumps(messages),
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get("message", {}).get("content", "")
        else:
            return f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"


def run_ab_test(model: str, test_query: dict, show_labels_first: bool = None) -> dict:
    """Run a single A/B test"""
    if show_labels_first is None:
        show_labels_first = random.choice([True, False])
    
    # Generate both responses
    labeled = generate_response(model, test_query["query"], use_labels=True)
    unlabeled = generate_response(model, test_query["query"], use_labels=False)
    
    # Determine which is A and which is B
    if show_labels_first:
        version_a = {"type": "labeled", "content": labeled}
        version_b = {"type": "unlabeled", "content": unlabeled}
    else:
        version_a = {"type": "unlabeled", "content": unlabeled}
        version_b = {"type": "labeled", "content": labeled}
    
    return {
        "test_id": test_query["id"],
        "query": test_query["query"],
        "category": test_query["category"],
        "expected_labeled_benefit": test_query["expected_labeled_benefit"],
        "showed_labels_first": show_labels_first,
        "version_a": version_a,
        "version_b": version_b,
        "timestamp": datetime.now().isoformat()
    }


def simulate_user_choice(test_result: dict) -> dict:
    """Simulate a user choice (in real study, human would choose)"""
    # For testing purposes, simulate based on category
    # In real study, this would be human input
    category = test_result["category"]
    
    if category in ["high_stakes", "uncertainty", "false_premise"]:
        # For these, labeled is typically preferred
        choice = random.choices(["a", "b"], weights=[0.6, 0.4])[0]
    elif category == "philosophical":
        # Agon-style queries benefit from debate/labels
        choice = random.choices(["a", "b"], weights=[0.55, 0.45])[0]
    else:
        # Low stakes - preference varies
        choice = random.choice(["a", "b"])
    
    return {
        "choice": choice,
        "choice_type": test_result[f"version_{choice}"]["type"]
    }


def run_ab_study(model: str = "minimax-m2.5:cloud", num_tests: int = None, simulate: bool = True):
    """Run complete A/B study"""
    if num_tests is None:
        num_tests = len(AB_TEST_QUERIES)
    
    tests = random.sample(AB_TEST_QUERIES, min(num_tests, len(AB_TEST_QUERIES)))
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "total_tests": len(tests),
        "tests": []
    }
    
    print(f"\n{'='*60}")
    print(f"A/B Study: {model}")
    print(f"{'='*60}")
    
    for test in tests:
        print(f"\nTest: {test['id']} ({test['category']})")
        print(f"Query: {test['query'][:60]}...")
        
        test_result = run_ab_test(model, test)
        
        if simulate:
            user_choice = simulate_user_choice(test_result)
            test_result["user_choice"] = user_choice["choice"]
            test_result["user_choice_type"] = user_choice["choice_type"]
            
            # Check if preference matches expectation
            preferred_is_labeled = user_choice["choice_type"] == "labeled"
            expected_benefit = test["expected_labeled_benefit"]
            matches_expectation = preferred_is_labeled == expected_benefit
            
            test_result["matches_expectation"] = matches_expectation
            
            print(f"  User chose: {user_choice['choice_type']} ({user_choice['choice']})")
            print(f"  Expected: {'labeled' if expected_benefit else 'unlabeled'}")
            print(f"  Match: {'✓' if matches_expectation else '✗'}")
        
        results["tests"].append(test_result)
    
    # Summary
    if simulate:
        labeled_wins = sum(1 for t in results["tests"] if t.get("user_choice_type") == "labeled")
        matches = sum(1 for t in results["tests"] if t.get("matches_expectation", False))
        
        print(f"\n{'='*60}")
        print("Summary:")
        print(f"  Labeled preferred: {labeled_wins}/{len(tests)} ({100*labeled_wins/len(tests):.1f}%)")
        print(f"  Matches expectation: {matches}/{len(tests)} ({100*matches/len(tests):.1f}%)")
        
        # By category
        by_category = {}
        for t in results["tests"]:
            cat = t["category"]
            if cat not in by_category:
                by_category[cat] = {"total": 0, "labeled_preferred": 0}
            by_category[cat]["total"] += 1
            if t.get("user_choice_type") == "labeled":
                by_category[cat]["labeled_preferred"] += 1
        
        print("\nBy Category:")
        for cat, stats in by_category.items():
            pct = 100 * stats["labeled_preferred"] / stats["total"] if stats["total"] > 0 else 0
            print(f"  {cat}: {stats['labeled_preferred']}/{stats['total']} ({pct:.0f}% labeled)")
    
    # Save results
    output_file = f"ab_study_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to: {output_file}")
    return results


if __name__ == "__main__":
    model = "minimax-m2.5:cloud"
    num_tests = None
    
    if len(sys.argv) > 1:
        model = sys.argv[1]
    if len(sys.argv) > 2:
        num_tests = int(sys.argv[2])
    
    run_ab_study(model, num_tests, simulate=True)