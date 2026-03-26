#!/bin/bash
#
# Cron Wrapper for Evening Briefing
# Wraps briefing execution, tracks failures, sends alerts on failure
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
STATE_DIR="$SKILL_DIR/state"
FAILURE_FILE="$STATE_DIR/cron-failures.json"
LOG_FILE="$STATE_DIR/briefing.log"

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Read failure state
read_failures() {
  if [ -f "$FAILURE_FILE" ]; then
    CONSECUTIVE=$(node -e "console.log(require('$FAILURE_FILE').consecutive_failures || 0)")
    LAST_RUN=$(node -e "console.log(require('$FAILURE_FILE').last_run || 0)")
  else
    CONSECUTIVE=0
    LAST_RUN=0
  fi
}

# Write failure state
write_failures() {
  node -e "
    const fs = require('fs');
    const obj = { consecutive_failures: $CONSECUTIVE, last_run: $LAST_RUN, updated: new Date().toISOString() };
    fs.writeFileSync('$FAILURE_FILE', JSON.stringify(obj, null, 2));
  "
}

# Send alert via message tool
send_alert() {
  local level="$1"
  local message="$2"
  
  # Log it
  echo "[$(date)] ALERT ($level): $message" >> "$LOG_FILE"
  
  # Use message tool via OpenClaw - this would be called from the main session
  # For cron context, we write to a pending alerts file that the main session can check
  echo "ALERT|$level|$(date -u +%Y-%m-%dT%H:%M:%SZ)|$message" >> "$STATE_DIR/pending-alerts.txt"
}

# Run the briefing
run_briefing() {
  cd "$SCRIPT_DIR"
  /usr/bin/env node briefing.js 2>> "$LOG_FILE"
}

# Main
main() {
  echo "[$(date)] Starting evening briefing cron..." >> "$LOG_FILE"
  
  read_failures
  
  # Run the briefing
  local start_time=$(date +%s)
  local output
  output=$(run_briefing 2>&1)
  local exit_code=$?
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  
  if [ $exit_code -eq 0 ]; then
    # Success!
    echo "[$(date)] Briefing completed successfully in ${duration}s" >> "$LOG_FILE"
    CONSECUTIVE=0
    LAST_RUN=$(date +%s)
    write_failures
    
    # If there were previous failures, note recovery
    if [ -f "$FAILURE_FILE" ] && [ "$(node -e "console.log(require('$FAILURE_FILE').consecutive_failures)")" -gt 0 ]; then
      echo "[$(date)] RECOVERY: Briefing succeeded after $(node -e "console.log(require('$FAILURE_FILE').consecutive_failures)") failures" >> "$LOG_FILE"
    fi
    
    echo "$output"
    exit 0
  else
    # Failure
    CONSECUTIVE=$((CONSECUTIVE + 1))
    LAST_RUN=$(date +%s)
    write_failures
    
    echo "[$(date)] Briefing FAILED (exit $exit_code, consecutive: $CONSECUTIVE)" >> "$LOG_FILE"
    echo "$output" >> "$LOG_FILE"
    
    # Send escalating alert
    if [ $CONSECUTIVE -eq 1 ]; then
      send_alert "warn" "Evening briefing missed (1/3) — check logs"
    elif [ $CONSECUTIVE -eq 2 ]; then
      send_alert "warn" "Evening briefing missed (2/3) — still failing"
    else
      send_alert "alert" "Evening briefing failing ${CONSECUTIVE} times — needs attention!"
    fi
    
    # Exit with error so cron marks it as failed
    exit 1
  fi
}

main "$@"
