#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# HERMES-DELPHI DAILY PIPELINE CRON TRIGGER
# Runs: Daily at configured time (default: 14:00 UTC / 7AM MST)
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ABRAXAS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$ABRAXAS_DIR/hermes-delphi/data"
RUNNER_DIR="$ABRAXAS_DIR/hermes-delphi/runner"
LOG_DIR="$DATA_DIR/logs"
LOG_FILE="$LOG_DIR/daily-pipeline.log"

# Ensure directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$DATA_DIR/runs"
mkdir -p "$DATA_DIR/checkpoints"
mkdir -p "$DATA_DIR/reports"

timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

log "═══════════════════════════════════════════════════════════"
log "🚀 HERMES-DELPHI DAILY PIPELINE TRIGGER"
log "═══════════════════════════════════════════════════════════"

# Check if pipeline is already running (idempotency)
IDEMPOTENCY_LOCK="$DATA_DIR/.pipeline_lock"

check_lock() {
    if [ -f "$IDEMPOTENCY_LOCK" ]; then {
        LOCK_PID=$(cat "$IDEMPOTENCY_LOCK" 2>/dev/null || echo "")
        LOCK_TIME=$(stat -c %Y "$IDEMPOTENCY_LOCK" 2>/dev/null || echo "0")
        CURRENT_TIME=$(date +%s)
        LOCK_AGE=$((CURRENT_TIME - LOCK_AGE))
        
        # If lock is older than 2 hours, consider it stale
        if [ "$LOCK_AGE" -gt 7200 ]; then
            log "⚠️  Stale lock file found (age: ${LOCK_AGE}s), removing"
            rm -f "$IDEMPOTENCY_LOCK"
        else
            # Check if process is still running
            if [ -n "$LOCK_PID" ] && ! kill -0 "$LOCK_PID" 2>/dev/null; then
                log "⚠️  Lock process died, removing stale lock"
                rm -f "$IDEMPOTENCY_LOCK"
            else
                log "⚠️  Pipeline already running (PID: $LOCK_PID), skipping"
                log "═══════════════════════════════════════════════════════════"
                return 1
            fi
        fi
    } fi
    return 0
}

# Acquire lock
acquire_lock() {
    echo $$ > "$IDEMPOTENCY_LOCK"
    log "🔒 Lock acquired (PID: $$)"
}

# Release lock
release_lock() {
    rm -f "$IDEMPOTENCY_LOCK"
    log "🔓 Lock released"
}

# Cleanup on exit
trap release_lock EXIT

# Run the pipeline
run_pipeline() {
    log "📦 Running Hermes-Delphi pipeline..."
    
    cd "$RUNNER_DIR"
    
    # Check Node.js availability
    if ! command -v node &> /dev/null; then
        log "❌ Node.js not found, cannot run pipeline"
        return 1
    fi
    
    # Run the pipeline
    node pipeline-runner.js run --force 2>&1 | tee -a "$LOG_FILE"
    PIPELINE_EXIT=$?
    
    if [ $PIPELINE_EXIT -eq 0 ]; then
        log "✅ Pipeline completed successfully"
    else
        log "⚠️  Pipeline exited with code: $PIPELINE_EXIT"
    fi
    
    return $PIPELINE_EXIT
}

# Send notification (placeholder - would integrate with email/slack)
send_notification() {
    local status=$1
    local message=$2
    
    # Check if notifications are configured
    NOTIFY_CONFIG="$DATA_DIR/config/notify.json"
    
    if [ -f "$NOTIFY_CONFIG" ]; then
        log "📬 Sending notification: $message"
        # In production, this would send via configured channel
    fi
}

# Main execution
main() {
    # Check for existing run
    if ! check_lock; then
        exit 0
    fi
    
    acquire_lock
    
    # Run pipeline
    if run_pipeline; then
        send_notification "success" "Daily research pipeline completed"
    else
        send_notification "warning" "Daily research pipeline completed with issues"
    fi
    
    log "═══════════════════════════════════════════════════════════"
    log "Pipeline trigger finished at $(timestamp)"
    log "═══════════════════════════════════════════════════════════"
}

main "$@"
