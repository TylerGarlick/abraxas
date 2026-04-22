#!/usr/bin/env python3
"""
Full Abraxas Test Suite Runner
Runs all test files against all 6 cloud models.
"""

import subprocess
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Configuration
MODELS = [
    "glm-5:cloud",
    "gemma3:27b-cloud",
    "qwen3.5:cloud",
    "gpt-oss:120b-cloud",
    "gpt-oss:20b-cloud",
    "minimax-m2.7:cloud",
]

TEST_FILES = [
    "tests/test_abraxas_v2_7dim_nometa.py",
    "tests/test_adversarial_reasoning.py",
    "tests/test_anti_confabulation.py",
    "tests/test_seven_dimension_framework.py",
    "tests/test_integration.py",
    "tests/test_logos_decomposition.py",
    "tests/test_claim_parser.py",
    "tests/test_ergon_sandbox.py",
    "tests/test_scribe.py",
    "tests/test_causal_analysis.py",
    "tests/test_temporal_reasoning.py",
    "tests/fhir/test_claim_mapping.py",
    "tests/fhir/test_coverage_mapping.py",
    "tests/fhir/test_integration.py",
    "tests/fhir/test_patient_mapping.py",
]

WORKSPACE = "/root/.openclaw/workspace/abraxas"
RESULTS_BASE = "/root/.openclaw/workspace/abraxas/tests/results"
MEMORY_FILE = "/root/.openclaw/workspace/memory/abraxas-test-run-2026-04-11.md"


def run_test(model: str, test_file: str) -> dict:
    """Run a single test file with a specific model."""
    env = os.environ.copy()
    env["ABRAXAS_MODEL"] = model
    
    cmd = ["python3", "-m", "pytest", test_file, "-v", "--tb=short", "--json-report"]
    
    try:
        result = subprocess.run(
            cmd,
            cwd=WORKSPACE,
            env=env,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout per test
        )
        
        return {
            "passed": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout[-5000:] if len(result.stdout) > 5000 else result.stdout,
            "stderr": result.stderr[-2000:] if len(result.stderr) > 2000 else result.stderr,
        }
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "error": "timeout",
            "stdout": "Test timed out after 300s"
        }
    except Exception as e:
        return {
            "passed": False,
            "error": str(e)
        }


def run_model_tests(model: str) -> dict:
    """Run all tests for a single model."""
    model_id = model.replace(":", "-").replace(".", "_")
    results_dir = Path(RESULTS_BASE) / model_id
    results_dir.mkdir(parents=True, exist_ok=True)
    
    model_results = {
        "model": model,
        "model_id": model_id,
        "timestamp": datetime.now().isoformat(),
        "tests": {},
        "summary": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "errors": 0
        }
    }
    
    print(f"\n{'='*60}")
    print(f"Testing: {model}")
    print("=" * 60)
    
    for test_file in TEST_FILES:
        test_name = Path(test_file).stem
        print(f"  Running {test_name}...", end=" ", flush=True)
        
        result = run_test(model, test_file)
        model_results["tests"][test_name] = result
        model_results["summary"]["total"] += 1
        
        if result.get("error"):
            model_results["summary"]["errors"] += 1
            print(f"ERROR: {result['error']}")
        elif result["passed"]:
            model_results["summary"]["passed"] += 1
            print("PASSED")
        else:
            model_results["summary"]["failed"] += 1
            print("FAILED")
        
        # Save individual test result
        test_result_file = results_dir / f"{test_name}.json"
        with open(test_result_file, 'w') as f:
            json.dump(result, f, indent=2)
    
    # Save model results
    summary_file = results_dir / "summary.json"
    with open(summary_file, 'w') as f:
        json.dump(model_results, f, indent=2)
    
    print(f"\nModel Summary: {model_results['summary']['passed']}/{model_results['summary']['total']} passed")
    
    return model_results


def update_memory(all_results: dict):
    """Update the memory file with results."""
    lines = []
    lines.append("# Abraxas Full Test Suite Run - 2026-04-11\n")
    lines.append("**Started:** 2026-04-11 07:13 UTC")
    lines.append("**Completed:** " + datetime.now().isoformat() + " UTC")
    lines.append("**Models:** 6 cloud models")
    lines.append("**Test Files:** 15 files (including 4 FHIR tests)\n")
    
    lines.append("## Summary Table\n")
    lines.append("| Model | Passed | Total | Success Rate |")
    lines.append("|-------|--------|-------|--------------|")
    
    for model in MODELS:
        model_id = model.replace(":", "-").replace(".", "_")
        results = all_results.get(model_id, {})
        summary = results.get("summary", {})
        passed = summary.get("passed", 0)
        total = summary.get("total", 0)
        rate = f"{passed/total:.1%}" if total > 0 else "N/A"
        lines.append(f"| {model} | {passed} | {total} | {rate} |")
    
    lines.append("\n## Detailed Results\n")
    
    for model in MODELS:
        model_id = model.replace(":", "-").replace(".", "_")
        results = all_results.get(model_id, {})
        summary = results.get("summary", {})
        
        lines.append(f"### {model}\n")
        lines.append(f"- **Passed:** {summary.get('passed', 0)}/{summary.get('total', 0)}")
        lines.append(f"- **Failed:** {summary.get('failed', 0)}")
        lines.append(f"- **Errors:** {summary.get('errors', 0)}\n")
        
        lines.append("| Test | Status |")
        lines.append("|------|--------|")
        
        for test_name, test_result in results.get("tests", {}).items():
            status = "✅" if test_result.get("passed") else "❌"
            if test_result.get("error"):
                status = f"⚠️ {test_result['error']}"
            lines.append(f"| {test_name} | {status} |")
        
        lines.append("")
    
    with open(MEMORY_FILE, 'w') as f:
        f.write("\n".join(lines))


def main():
    print("=" * 60)
    print("ABRAXAS FULL TEST SUITE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)
    
    all_results = {}
    
    for model in MODELS:
        model_results = run_model_tests(model)
        model_id = model.replace(":", "-").replace(".", "_")
        all_results[model_id] = model_results
        
        # Update memory after each model
        update_memory(all_results)
    
    # Final summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    
    for model in MODELS:
        model_id = model.replace(":", "-").replace(".", "_")
        results = all_results.get(model_id, {})
        summary = results.get("summary", {})
        print(f"{model}: {summary.get('passed', 0)}/{summary.get('total', 0)} passed")
    
    print(f"\nResults saved to: {RESULTS_BASE}/")
    print(f"Memory updated: {MEMORY_FILE}")
    
    # Save master JSON
    master_file = Path(RESULTS_BASE) / "full-suite-2026-04-11.json"
    with open(master_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    return all_results


if __name__ == "__main__":
    main()
