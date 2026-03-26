#!/bin/bash
#
# Evening Briefing - Cron Entry Point
# Runs the briefing via the cron wrapper
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the wrapper which handles everything
exec "$SCRIPT_DIR/cron-wrapper.sh" "$@"
