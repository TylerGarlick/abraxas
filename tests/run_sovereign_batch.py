#!/usr/bin/env python3
"""
Sovereign Batch Test Runner for Abraxas v2
Runs the test suite against cloud models with incremental checkpointing
to prevent data loss from gateway saturation or system crashes.
"""

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

# --- Configuration ---
MODELS = [
    ("glm-5", "glm-5:cloud"),
    ("gemma3-27b", "gemma3:27b-cloud"),
    ("qwen3.5", "qwen3.5:cloud"),
    ("gpt-oss-120b", "gpt-oss:120b-cloud"),
    ("gpt-oss-20b", "gpt-oss:20b-cloud"),
    ("minimax-m2.7", "minimax-m2.7:cloud"),
]

BASE_DIR = Path("/root/.openclaw/workspace/abraxas")
TEST_FILE = BASE_DIR / "tests/test_abraxas_v2_7dim_nometa.py"
RESULTS_DIR = BASE_DIR / "tests/results"
RESEARCH_DIR = BASE_DIR / "research"
CHECKPOINT_FILE = RESULTS_DIR / "soter-validation-checkpoints.json"

def run_model_test(model_info: tuple) -> Dict[str, Any]:
    model_id, model_name = model_info
    print(f"🚀 Starting Sovereign Batch: {model_id} ({model_name})")
    
    temp_test_file = BASE_DIR / f"tests/test_{model_id}.py"
    try:
        shutil.copy(TEST_FILE, temp_test_file)
        
        with open(temp_test_file, 'r') as f:
            content = f.read()
        
        import re
        content = re.sub(r'MODEL = "[^"]*"', f'MODEL = "{model_name}"', content)
        
        with open(temp_test_file, 'w') as f:
            f.write(content)
            
        start_time = datetime.now()
        result = subprocess.run(
            [sys.executable, str(temp_test_file)],
            capture_output=True,
            text=True,
            timeout=3600, # Extended to 1 hour for 100-query suite
            cwd=str(BASE_DIR)
        )
        elapsed = (datetime.now() - start_time).total_seconds()
        
        result_files = sorted(
            [f for f in RESEARCH_DIR.glob("abraxas-v2-test-results-*.json")],
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )
        
        final_results = {}
        if result_files:
            latest = result_files[0]
            with open(latest, 'r') as f:
                final_results = json.load(f)
            
            model_res_dir = RESULTS_DIR / model_id
            model_res_dir.mkdir(parents=True, exist_ok=True)
            dest = model_res_dir / f"sovereign-run-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            shutil.copy(latest, dest)
        else:
            final_results = {"error": "No result file generated", "stdout": result.stdout[-1000:]}

        final_results["elapsed_seconds"] = elapsed
        final_results["return_code"] = result.returncode
        
        print(f"✅ Finished: {model_id} in {elapsed:.1f}s")
        return {
            "model_id": model_id,
            "status": "success" if result.returncode == 0 else "failed",
            "score": final_results.get("composite_score", 0),
            "results": final_results
        }
        
    except subprocess.TimeoutExpired:
        print(f"⏱️ Timeout: {model_id} exceeded time limit")
        return {"model_id": model_id, "status": "timeout", "score": 0}
    except Exception as e:
        print(f"❌ Error testing {model_id}: {e}")
        return {"model_id": model_id, "status": "error", "error": str(e), "score": 0}
    finally:
        if temp_test_file.exists():
            temp_test_file.unlink()

def main():
    print("=" * 60)
    print("ABRAXAS v2 - SOVEREIGN BATCH RUNNER")
    print(f"Sequential Execution for Stability")
    print("=" * 60)
    
    start_total = datetime.now()
    all_summaries = []
    
    # Ensure results dir exists
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    for m in MODELS:
        res = run_model_test(m)
        all_summaries.append(res)
        
        # INCREMENTAL CHECKPOINTING
        # Write current state to disk after each model finishes
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "completed_models": all_summaries
            }, f, indent=2)
        print(f"💾 Sovereign Checkpoint saved: {len(all_summaries)}/{len(MODELS)} models complete.")
    
    total_elapsed = (datetime.now() - start_total).total_seconds()
    
    print("\n" + "=" * 60)
    print("FINAL BATCH RESULTS")
    print("=" * 60)
    print(f"{'Model ID':<15} | {'Status':<10} | {'Score':<10}")
    print("-" * 40)
    
    for s in all_summaries:
        score_str = f"{s['score']:.1%}" if isinstance(s['score'], float) else str(s['score'])
        print(f"{s['model_id']:<15} | {s['status']:<10} | {score_str:<10}")
    
    print("=" * 60)
    print(f"Total Wall-Clock Time: {total_elapsed:.1f}s")
    
    summary_file = RESULTS_DIR / "soter-validation-sprint.json"
    with open(summary_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_elapsed": total_elapsed,
            "model_results": all_summaries
        }, f, indent=2)
    
    print(f"Final results saved to: {summary_file}")

if __name__ == "__main__":
    main()
