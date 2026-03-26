#!/bin/bash
# scan-subagents.sh - Check all subagents for stalls

echo "=== Active Subagents ==="
openclaw subagent list 2>/dev/null || echo "No subagent command available"

echo ""
echo "=== Process List ==="
ps aux | grep -E "(subagent|sessions_spawn)" | grep -v grep | head -20
