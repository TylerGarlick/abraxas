#!/bin/bash
# Hermes-Delphi Cron Setup Script
#
# Usage:
#   ./setup-cron.sh           # Show help
#   ./setup-cron.sh --install # Install cron job
#   ./setup-cron.sh --remove  # Remove cron job
#   ./setup-cron.sh --status  # Check cron status

set -e

ABRAXAS_DIR="/root/.openclaw/workspace/abraxas"
HERMES_DIR="$ABRAXAS_DIR/hermes-delphi"
CRON_SCRIPT="$HERMES_DIR/runner/daily-pipeline.sh"
LOG_DIR="$HERMES_DIR/data/logs"

# Default schedule: 14:00 UTC (7AM MST)
DEFAULT_CRON_TIME="0 14 * * *"

install_cron() {
    echo "Installing Hermes-Delphi daily cron job..."
    
    # Ensure directories exist
    mkdir -p "$LOG_DIR"
    
    # Make script executable
    chmod +x "$CRON_SCRIPT"
    
    # Remove existing Hermes-Delphi cron entries
    remove_cron || true
    
    # Add new cron entry
    (crontab -l 2>/dev/null; echo "$DEFAULT_CRON_TIME $CRON_SCRIPT >> $LOG_DIR/cron.log 2>&1") | crontab -
    
    echo "✅ Cron job installed!"
    echo "   Schedule: Daily at 14:00 UTC (7AM MST)"
    echo "   Script: $CRON_SCRIPT"
    echo ""
    echo "To verify, run: crontab -l"
}

remove_cron() {
    echo "Removing Hermes-Delphi cron jobs..."
    # Remove any lines containing hermes-delphi or daily-pipeline
    crontab -l 2>/dev/null | grep -v -E "(hermes-delphi|daily-pipeline)" | crontab - || true
    echo "✅ Cron job removed."
}

show_status() {
    echo "=== Hermes-Delphi Cron Status ==="
    echo ""
    echo "Active crontab entries for Hermes-Delphi:"
    crontab -l 2>/dev/null | grep -E "(hermes-delphi|daily-pipeline)" || echo "  (none)"
    echo ""
    echo "Recent pipeline logs:"
    if [ -f "$LOG_DIR/cron.log" ]; then
        tail -10 "$LOG_DIR/cron.log" 2>/dev/null || echo "  (empty)"
    else
        echo "  (no log file yet - cron may not have run)"
    fi
    echo ""
    echo "Pipeline status:"
    cd "$HERMES_DIR" && node runner/pipeline-runner.js status 2>/dev/null || echo "  (could not get status)"
}

case "${1:-}" in
    --install|-i)
        install_cron
        ;;
    --remove|-r)
        remove_cron
        ;;
    --status|-s)
        show_status
        ;;
    *)
        echo "Hermes-Delphi Cron Setup"
        echo ""
        echo "Usage: $0 [--install|--remove|--status]"
        echo ""
        echo "  --install   Install daily cron job (runs at 14:00 UTC / 7AM MST)"
        echo "  --remove    Remove all Hermes-Delphi cron jobs"
        echo "  --status    Show cron and pipeline status"
        echo ""
        echo "Default (no args): Show this help"
        ;;
esac
