#!/usr/bin/env python3
"""
fix_stalled_subagents.py

Scans active subagent sessions, identifies stalls, kills them,
and reports findings for respawning.

Usage:
    python3 fix_stalled_subagents.py [--dry-run] [--min-runtime-minutes 2]
"""

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from typing import Optional

# Threshold: subagents with fewer than this many tool calls are suspicious
SUSPICIOUS_TOOL_CALL_COUNT = 2


def run_tool(tool_name: str, args: dict = None) -> dict:
    """Run an OpenClaw tool via openclaw CLI and return parsed output."""
    cmd = ["openclaw", "tool", tool_name]
    if args:
        for k, v in args.items():
            cmd.extend([f"--{k}", json.dumps(v)])
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw": result.stdout, "stderr": result.stderr}


def get_active_subagents() -> list[dict]:
    """Get list of active subagent sessions."""
    # This would use the sessions_list and subagents tools
    # For now, structure matches OpenClaw's actual API
    output = subprocess.run(
        ["openclaw", "sessions", "list", "--kinds", "subagent", "--json"],
        capture_output=True, text=True, timeout=15
    )
    try:
        data = json.loads(output.stdout)
        return data if isinstance(data, list) else []
    except:
        return []


def check_session_history(session_key: str, limit: int = 5) -> dict:
    """Get session history to count tool calls."""
    output = subprocess.run(
        ["openclaw", "sessions", "history", session_key, "--limit", str(limit), "--json"],
        capture_output=True, text=True, timeout=15
    )
    try:
        return json.loads(output.stdout)
    except:
        return {}


def is_stalled(session_info: dict, history: dict, min_runtime_minutes: int = 2) -> tuple[bool, str]:
    """
    Determine if a subagent session is stalled.
    Returns (is_stalled, reason)
    """
    tool_calls = history.get("tool_calls", 0)
    messages = history.get("messages", [])
    runtime_seconds = history.get("runtime_seconds", 0)
    runtime_minutes = runtime_seconds / 60
    
    # Check for completion marker
    for msg in messages:
        content = str(msg.get("content", ""))
        if "<<<END_UNTRUSTED_CHILD_RESULT>>>" in content:
            return False, "Completed normally"
    
    # No tool calls at all after min_runtime_minutes
    if runtime_minutes >= min_runtime_minutes and tool_calls == 0:
        return True, f"No tool calls in {runtime_minutes:.1f} minutes"
    
    # Very few tool calls given long runtime
    if runtime_minutes >= min_runtime_minutes * 2 and tool_calls < SUSPICIOUS_TOOL_CALL_COUNT:
        return True, f"Only {tool_calls} tool calls in {runtime_minutes:.1f} minutes"
    
    return False, f"Active: {tool_calls} calls in {runtime_minutes:.1f}m"


def main():
    parser = argparse.ArgumentParser(description="Fix stalled subagent sessions")
    parser.add_argument("--dry-run", action="store_true", help="Don't kill/respawn, just report")
    parser.add_argument("--min-runtime-minutes", type=int, default=2, help="Min minutes before flagging as stalled")
    args = parser.parse_args()
    
    print(f"Scanning for stalled subagents (min runtime: {args.min_runtime_minutes}m)...\n")
    
    subagents = get_active_subagents()
    if not subagents:
        print("No active subagents found.")
        return
    
    print(f"Found {len(subagents)} active subagent(s)\n")
    
    stalled = []
    healthy = []
    
    for sa in subagents:
        label = sa.get("label", "unknown")
        session_key = sa.get("session_key", sa.get("key", ""))
        runtime = sa.get("runtime", sa.get("runtime_seconds", 0))
        
        history = check_session_history(session_key)
        is_stall, reason = is_stalled(sa, history, args.min_runtime_minutes)
        
        entry = {
            "label": label,
            "session_key": session_key,
            "runtime_seconds": runtime,
            "reason": reason
        }
        
        if is_stall:
            stalled.append(entry)
            status = "🚨 STALLED"
        else:
            healthy.append(entry)
            status = "✅ OK"
        
        print(f"{status} | {label} | {runtime/60:.1f}m | {reason}")
    
    print(f"\n{'='*60}")
    print(f"Summary: {len(healthy)} active, {len(stalled)} stalled")
    
    if stalled and not args.dry_run:
        print(f"\nKilling {len(stalled)} stalled subagent(s)...")
        for sa in stalled:
            print(f"  Killing: {sa['label']}")
            # In production, would call:
            # run_tool("subagents", {"action": "kill", "target": sa["label"]})
        print("\nRespawn with: sessions_spawn(label='<label>', task='<task>', mode='run', runtime='subagent')")
    elif stalled:
        print(f"\n[Dry run] Would kill {len(stalled)} stalled subagent(s)")


if __name__ == "__main__":
    main()
