#!/usr/bin/env python3
"""
Sequential Multi-Model Test Runner for Abraxas v2.

Runs the 13-dimension test suite against all 6 models sequentially,
saving per-model results.
"""

import json
import time
import os
import shutil
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
RESEARCH_DIR = "/home/ubuntu/.openclaw/workspace/abraxas/research"


def update_model(model_name: str) -> bool:
    """Update MODEL constant in test file."""
    try:
        with open(TEST_FILE, 'r') as f:
            content = f.read()
        old = 'MODEL = "minimax-m2.7:cloud"'
        new = f'MODEL = "{model_name}"'
        if old not in content:
            print(f"WARNING: Could not find '{old}' in test file")
            return False
        content = content.replace(old, new)
        with open(TEST_FILE, 'w') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


def find_latest_result() -> str:
    """Find most recent result JSON in research dir."""
    if not os.path.exists(RESEARCH_DIR):
        return None
    files = [f for f in os.listdir(RESEARCH_DIR) if f.endswith('.json')]
    if not files:
        return None
    files.sort(key=lambda x: os.path.getmtime(os.path.join(RESEARCH_DIR, x)), reverse=True)
    return os.path.join(RESEARCH_DIR, files[0])


def run_model_tests():
    """Run tests for each model sequentially."""
    all_results = {}
    model_results_dir = os.path.join(RESEARCH_DIR, "model-results")
    os.makedirs(model_results_dir, exist_ok=True)
    
    print("=" * 60)
    print("ABRAXAS v2 - MULTI-MODEL TEST SUITE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)
    
    for model_id, model_name in MODELS:
        print(f"\n{'='*60}")
        print(f"Testing: {model_id} ({model_name})")
        print("=" * 60)
        
        results_dir = os.path.join(RESULTS_BASE, model_id)
        os.makedirs(results_dir, exist_ok=True)
        
        # Clear old result files to avoid confusion
        old_files = [f for f in os.listdir(RESEARCH_DIR) if f.startswith('abraxas-v2-test-results-')]
        for f in old_files:
            try:
                os.remove(os.path.join(RESEARCH_DIR, f))
            except:
                pass
        
        # Update model
        if not update_model(model_name):
            all_results[model_id] = {"error": "Failed to update model"}
            continue
        
        print(f"Updated MODEL to {model_name}")
        
        # Run test
        start = time.time()
        sys.stdout.flush()
        
        # Run the test directly (it uses if __name__ == "__main__")
        # We need to import and run it
        import importlib.util
        spec = importlib.util.spec_from_file_location("test_module", TEST_FILE)
        module = importlib.util.module_from_spec(spec)
        
        # Clear any previous module state
        if 'test_module' in sys.modules:
            del sys.modules['test_module']
        
        try:
            spec.loader.exec_module(module)
        except Exception as e:
            print(f"Test error: {e}")
            all_results[model_id] = {"error": str(e)}
            continue
        
        elapsed = time.time() - start
        print(f"Test completed in {elapsed:.1f}s")
        
        # Find the result file
        latest = find_latest_result()
        if latest:
            with open(latest, 'r') as f:
                results = json.load(f)
            
            # Save copy to model dir
            dest = os.path.join(results_dir, os.path.basename(latest))
            shutil.copy(latest, dest)
            
            results["elapsed_seconds"] = elapsed
            results["result_file"] = dest
            
            # Extract key scores
            score = results.get('composite_score', results.get('overall_score', 0))
            all_results[model_id] = results
            
            print(f"Result: {score:.1%} ({len(results.get('dimensions', {}))} dimensions)")
            
            # Save condensed results
            condensed = {
                "model": results.get("model", model_name),
                "timestamp": results.get("timestamp", datetime.now().isoformat()),
                "composite_score": score,
                "elapsed_seconds": elapsed,
                "dimensions": {
                    dim: data.get("score", 0) 
                    for dim, data in results.get("dimensions", {}).items()
                }
            }
            with open(os.path.join(results_dir, "condensed.json"), 'w') as f:
                json.dump(condensed, f, indent=2)
        else:
            print("WARNING: No result file found!")
            all_results[model_id] = {"error": "No result file", "elapsed_seconds": elapsed}
    
    return all_results


def generate_summary(all_results):
    """Generate markdown summary."""
    summary_path = os.path.join(RESULTS_BASE, "SUMMARY.md")
    
    # Build rankings
    ranked = []
    for model_id, result in all_results.items():
        if "error" not in result:
            score = result.get('composite_score', result.get('overall_score', 0))
            ranked.append((model_id, score, result.get('elapsed_seconds', 0)))
    
    ranked.sort(key=lambda x: x[1], reverse=True)
    
    # Write markdown
    with open(summary_path, 'w') as f:
        f.write("# Abraxas v2 Multi-Model Test Results\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        
        f.write("## Overall Rankings\n\n")
        f.write("| Rank | Model | Composite Score | Time |\n")
        f.write("|------|-------|-----------------|------|\n")
        for i, (model_id, score, elapsed) in enumerate(ranked, 1):
            f.write(f"| {i} | {model_id} | {score:.1%} | {elapsed:.1f}s |\n")
        
        f.write("\n## Per-Dimension Scores\n\n")
        
        # Collect all dimensions
        all_dims = set()
        for result in all_results.values():
            if "error" not in result:
                all_dims.update(result.get("dimensions", {}).keys())
        
        dim_order = [
            "hallucination", "calibration", "sycophancy", "sol_nox", "uncertainty",
            "agon", "user_trust", "reasoning_depth", "epistemic_humility",
            "source_attribution", "contradiction_detection", "belief_updating", "metacognition"
        ]
        
        for dim in dim_order:
            if dim not in all_dims:
                continue
            f.write(f"\n### {dim.replace('_', ' ').title()}\n\n")
            f.write("| Model | Score |\n")
            f.write("|-------|-------|\n")
            
            dim_scores = []
            for model_id, result in all_results.items():
                if "error" not in result:
                    score = result.get("dimensions", {}).get(dim, {}).get("score", 0)
                    dim_scores.append((model_id, score))
            
            dim_scores.sort(key=lambda x: x[1], reverse=True)
            for model_id, score in dim_scores:
                f.write(f"| {model_id} | {score:.0%} |\n")
        
        f.write("\n## Raw Results\n\n")
        for model_id, result in all_results.items():
            f.write(f"\n### {model_id}\n\n")
            if "error" in result:
                f.write(f"**ERROR:** {result['error']}\n")
            else:
                score = result.get('composite_score', result.get('overall_score', 0))
                f.write(f"- **Score:** {score:.1%}\n")
                f.write(f"- **Time:** {result.get('elapsed_seconds', 0):.1f}s\n")
                f.write(f"- **Result File:** {result.get('result_file', 'N/A')}\n")
    
    # Save JSON summary
    json_summary = {
        "timestamp": datetime.now().isoformat(),
        "rankings": [{"model": m, "score": s, "time": t} for m, s, t in ranked],
        "all_results": {
            k: {
                "score": v.get("composite_score", 0),
                "time": v.get("elapsed_seconds", 0),
                "dimensions": {d: data.get("score", 0) for d, data in v.get("dimensions", {}).items()}
            } if "error" not in v else {"error": v["error"]}
            for k, v in all_results.items()
        }
    }
    
    with open(os.path.join(RESULTS_BASE, "summary.json"), 'w') as f:
        json.dump(json_summary, f, indent=2)
    
    return ranked


if __name__ == "__main__":
    results = run_model_tests()
    ranked = generate_summary(results)
    
    print("\n" + "=" * 60)
    print("FINAL RANKINGS")
    print("=" * 60)
    for i, (model_id, score, elapsed) in enumerate(ranked, 1):
        print(f"  {i}. {model_id}: {score:.1%} ({elapsed:.1f}s)")
    
    print(f"\nSummary: /tmp/abraxas-checkout/tests/results/SUMMARY.md")
