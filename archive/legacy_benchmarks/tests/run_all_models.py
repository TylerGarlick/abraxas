#!/usr/bin/env python3
"""
Multi-Model Test Runner for Abraxas v2 13-Dimension Test Suite

Runs the full test suite against all 6 Ollama models and generates
per-model results and a comparative summary.
"""

import json
import time
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Configuration
MODELS = [
    ("glm-5", "glm-5:cloud"),
    ("gemma3-27b", "gemma3:27b-cloud"),
    ("qwen3.5", "qwen3.5:cloud"),
    ("gpt-oss-120b", "gpt-oss:120b-cloud"),
    ("gpt-oss-20b", "gpt-oss:20b-cloud"),
    ("minimax-m2.7", "minimax-m2.7:cloud"),
]

RESULTS_BASE = "/tmp/abraxas-checkout/tests/results"
TEST_FILE = "/tmp/abraxas-checkout/tests/test_seven_dimension_framework.py"


def update_model_in_test(model_name: str) -> bool:
    """Update the MODEL constant in test file and return True if successful."""
    try:
        with open(TEST_FILE, 'r') as f:
            content = f.read()
        
        # Replace the MODEL line
        old_line = 'MODEL = "minimax-m2.7:cloud"'
        new_line = f'MODEL = "{model_name}"'
        content = content.replace(old_line, new_line)
        
        with open(TEST_FILE, 'w') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error updating model: {e}")
        return False


def run_tests_for_model(model_id: str, model_name: str) -> dict:
    """Run tests for a single model and return results."""
    print(f"\n{'='*60}")
    print(f"TESTING MODEL: {model_id} ({model_name})")
    print(f"{'='*60}")
    
    results_dir = f"{RESULTS_BASE}/{model_id}"
    os.makedirs(results_dir, exist_ok=True)
    
    # Update model in test file
    if not update_model_in_test(model_name):
        return {"error": f"Failed to update model to {model_name}"}
    
    # Run the test
    start_time = time.time()
    try:
        result = subprocess.run(
            [sys.executable, TEST_FILE],
            capture_output=True,
            text=True,
            timeout=600,  # 10 min timeout
            cwd="/tmp/abraxas-checkout"
        )
        elapsed = time.time() - start_time
        
        # Find the most recent results file
        research_dir = "/home/ubuntu/.openclaw/workspace/abraxas/research"
        result_files = []
        if os.path.exists(research_dir):
            result_files = sorted(
                [f for f in os.listdir(research_dir) if f.endswith('.json')],
                key=lambda x: os.path.getmtime(os.path.join(research_dir, x)),
                reverse=True
            )
        
        if result_files:
            latest_result = os.path.join(research_dir, result_files[0])
            with open(latest_result, 'r') as f:
                results = json.load(f)
            
            # Copy result to model dir
            dest = os.path.join(results_dir, f"results-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json")
            shutil.copy(latest_result, dest)
            results["result_file"] = dest
        else:
            results = {"error": "No result file found", "stdout": result.stdout[-2000:], "stderr": result.stderr[-500:]}
        
        results["elapsed_seconds"] = elapsed
        results["return_code"] = result.returncode
        results["stdout"] = result.stdout[-3000:]  # Last 3000 chars
        results["stderr"] = result.stderr[-500:]
        
    except subprocess.TimeoutExpired:
        results = {"error": "Test timed out after 600 seconds", "elapsed_seconds": 600}
    except Exception as e:
        results = {"error": str(e), "elapsed_seconds": time.time() - start_time}
    
    # Save model-specific results
    with open(os.path.join(results_dir, "test_output.json"), 'w') as f:
        json.dump(results, f, indent=2)
    
    return results


def generate_summary(all_results: dict) -> dict:
    """Generate comparative summary across all models."""
    summary = {
        "timestamp": datetime.now().isoformat(),
        "models": {},
        "dimension_scores": {},
        "rankings": {
            "overall": [],
            "by_dimension": {}
        }
    }
    
    dimensions = [
        "hallucination", "calibration", "sycophancy", "sol_nox", 
        "uncertainty", "agon", "user_trust", "reasoning_depth",
        "epistemic_humility", "source_attribution", "contradiction_detection",
        "belief_updating", "metacognition"
    ]
    
    # Collect scores per model
    for model_id, result in all_results.items():
        if "error" in result:
            summary["models"][model_id] = {"error": result["error"]}
            continue
        
        dims = result.get("dimensions", {})
        summary["models"][model_id] = {
            "composite": result.get("composite_score", 0),
            "elapsed_seconds": result.get("elapsed_seconds", 0),
            "dimensions": {}
        }
        
        for dim in dimensions:
            if dim in dims:
                score = dims[dim].get("score", 0)
                summary["models"][model_id]["dimensions"][dim] = score
                if dim not in summary["dimension_scores"]:
                    summary["dimension_scores"][dim] = {}
                summary["dimension_scores"][dim][model_id] = score
    
    # Rank models by composite score
    ranked = sorted(
        [(m, d["composite"]) for m, d in summary["models"].items() if "error" not in d],
        key=lambda x: x[1],
        reverse=True
    )
    summary["rankings"]["overall"] = [{"model": m, "score": s} for m, s in ranked]
    
    # Rank models by dimension
    for dim, scores in summary["dimension_scores"].items():
        ranked_dim = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        summary["rankings"]["by_dimension"][dim] = [{"model": m, "score": s} for m, s in ranked_dim]
    
    return summary


def main():
    import shutil
    
    print("="*60)
    print("ABRAXAS v2 - MULTI-MODEL TEST SUITE")
    print(f"Started: {datetime.now().isoformat()}")
    print("="*60)
    
    all_results = {}
    
    for model_id, model_name in MODELS:
        result = run_tests_for_model(model_id, model_name)
        all_results[model_id] = result
        
        if "error" in result:
            print(f"\n✗ {model_id}: ERROR - {result['error']}")
        else:
            score = result.get("composite_score", 0)
            elapsed = result.get("elapsed_seconds", 0)
            print(f"\n✓ {model_id}: {score:.0%} in {elapsed:.1f}s")
    
    # Generate summary
    summary = generate_summary(all_results)
    
    # Save summary
    summary_path = f"{RESULTS_BASE}/SUMMARY.md"
    with open(summary_path, 'w') as f:
        f.write("# Abraxas v2 Multi-Model Test Results\n\n")
        f.write(f"**Generated:** {summary['timestamp']}\n\n")
        
        f.write("## Overall Rankings\n\n")
        f.write("| Rank | Model | Composite Score | Time |\n")
        f.write("|------|-------|-----------------|------|\n")
        for i, entry in enumerate(summary["rankings"]["overall"], 1):
            model_id = entry["model"]
            elapsed = all_results.get(model_id, {}).get("elapsed_seconds", 0)
            f.write(f"| {i} | {model_id} | {entry['score']:.0%} | {elapsed:.1f}s |\n")
        
        f.write("\n## Per-Dimension Breakdown\n\n")
        dimensions = [
            ("hallucination", "1. Hallucination"),
            ("calibration", "2. Calibration"),
            ("sycophancy", "3. Sycophancy"),
            ("sol_nox", "4. Sol/Nox"),
            ("uncertainty", "5. Uncertainty"),
            ("agon", "6. Agon"),
            ("user_trust", "7. User Trust"),
            ("reasoning_depth", "8. Reasoning Depth"),
            ("epistemic_humility", "9. Epistemic Humility"),
            ("source_attribution", "10. Source Attribution"),
            ("contradiction_detection", "11. Contradiction Detection"),
            ("belief_updating", "12. Belief Updating"),
            ("metacognition", "13. Meta-Cognition"),
        ]
        
        for dim_id, dim_name in dimensions:
            f.write(f"\n### {dim_name}\n\n")
            if dim_id in summary["rankings"]["by_dimension"]:
                f.write("| Model | Score |\n")
                f.write("|-------|-------|\n")
                for entry in summary["rankings"]["by_dimension"][dim_id]:
                    f.write(f"| {entry['model']} | {entry['score']:.0%} |\n")
        
        f.write("\n## Model Details\n\n")
        for model_id, result in all_results.items():
            f.write(f"\n### {model_id}\n\n")
            if "error" in result:
                f.write(f"**ERROR:** {result['error']}\n\n")
            else:
                f.write(f"- **Composite Score:** {result.get('composite_score', 0):.0%}\n")
                f.write(f"- **Elapsed Time:** {result.get('elapsed_seconds', 0):.1f}s\n")
                f.write(f"- **Result File:** {result.get('result_file', 'N/A')}\n")
                
                # Include stdout summary
                stdout = result.get("stdout", "")
                if "COMPOSITE SCORE" in stdout:
                    lines = stdout.split("\n")
                    for line in lines:
                        if "COMPOSITE SCORE" in line or "STATUS" in line:
                            f.write(f"- **Output:** `{line.strip()}`\n")
    
    # Also save JSON summary
    json_summary_path = f"{RESULTS_BASE}/summary.json"
    with open(json_summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n{'='*60}")
    print("SUMMARY")
    print("="*60)
    print("\nOverall Rankings:")
    for i, entry in enumerate(summary["rankings"]["overall"], 1):
        print(f"  {i}. {entry['model']}: {entry['score']:.0%}")
    
    print(f"\nFull results: {summary_path}")
    print(f"JSON summary: {json_summary_path}")
    
    return summary


if __name__ == "__main__":
    main()
