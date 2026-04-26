#!/usr/bin/env python3
"""
Sovereign Micro-Batch Test Runner for Abraxas v2
Executes the test suite in granular batches to prevent session timeouts and data loss.
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
LEDGER_FILE = RESULTS_DIR / "sovereign_progress_ledger.json"
BATCH_SIZE = 10

def load_ledger():
    if LEDGER_FILE.exists():
        with open(LEDGER_FILE, 'r') as f:
            return json.load(f)
    return {m[0]: 0 for m in MODELS}

def save_ledger(ledger):
    with open(LEDGER_FILE, 'w') as f:
        json.dump(ledger, f, indent=2)

def run_batch(model_id, model_name, start_idx, end_idx):
    print(f"🚀 Processing Batch: {model_id} | Queries {start_idx} to {end_idx}")
    
    temp_test_file = BASE_DIR / f"tests/temp_batch_{model_id}.py"
    try:
        # We must modify the test script to ONLY run a specific range of queries
        with open(TEST_FILE, 'r') as f:
            content = f.read()
        
        # Inject batch range constants
        import re
        content = re.sub(r'MODEL = "[^"]*"', f'MODEL = "{model_name}"', content)
        # Insert batching logic into the test script (assuming it has a query list)
        # This requires the test script to respect START_INDEX and END_INDEX
        content = "START_INDEX = " + str(start_idx) + "\nEND_INDEX = " + str(end_idx) + "\n" + content
        
        with open(temp_test_file, 'w') as f:
            f.write(content)
            
        start_time = datetime.now()
        result = subprocess.run(
            [sys.executable, str(temp_test_file)],
            capture_output=True,
            text=True,
            timeout=600, # 10 min per batch
            cwd=str(BASE_DIR)
        )
        
        # Collect the resulting JSON produced by the script
        result_files = sorted(
            [f for f in RESEARCH_DIR.glob("abraxas-v2-test-results-*.json")],
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )
        
        if result_files:
            latest = result_files[0]
            with open(latest, 'r') as f:
                batch_data = json.load(f)
            
            model_res_dir = RESULTS_DIR / model_id
            model_res_dir.mkdir(parents=True, exist_ok=True)
            dest = model_res_dir / f"batch-{start_idx}-{end_idx}.json"
            shutil.copy(latest, dest)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Batch Error {model_id} [{start_idx}-{end_idx}]: {e}")
        return False
    finally:
        if temp_test_file.exists():
            temp_test_file.unlink()

def main():
    print("=" * 60)
    print("ABRAXAS v2 - SOVEREIGN MICRO-BATCH RUNNER")
    print("Incremental Checkpointing Mode Active")
    print("=" * 60)
    
    ledger = load_ledger()
    
    for model_id, model_name in MODELS:
        current_idx = ledger.get(model_id, 0)
        if current_idx >= 100: # Assuming 100 queries in expanded suite
            print(f"✅ {model_id} already complete. Skipping.")
            continue
            
        print(f"\nResuming {model_id} from query {current_idx}...")
        
        while current_idx < 100:
            end_idx = min(current_idx + BATCH_SIZE, 100)
            success = run_batch(model_id, model_name, current_idx, end_idx)
            
            if success:
                current_idx = end_idx
                ledger[model_id] = current_idx
                save_ledger(ledger)
                print(f"💾 Checkpoint: {model_id} at {current_idx}/100")
            else:
                print(f"🚨 Failure at {model_id} batch {current_idx}-{end_idx}. Stopping.")
                return

    print("\n" + "=" * 60)
    print("ALL MODELS PROCESSED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
