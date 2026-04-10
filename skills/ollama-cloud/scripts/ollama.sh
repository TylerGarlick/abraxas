#!/bin/bash
# Ollama Cloud Setup Script for OpenClaw
# Usage: bash ollama.sh [provider] [api-key] [model]
# Providers: ollama | minimax | local | custom
# If no args, runs in interactive mode

set -e

# ─── Paths ────────────────────────────────────────────────────────────────────
OPENCLAW_CONFIG="${OPENCLAW_CONFIG:-$HOME/.openclaw/openclaw.json}"
OPENCLAW_CONFIG_BAK="${OPENCLAW_CONFIG}.bak"
OLLAMA_PID_FILE="/tmp/ollama.pid"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Colors ───────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; BOLD=''; NC=''
fi

log() { echo -e "${GREEN}[OLLAMA]${NC} $1" >&2; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
error() { echo -e "${RED}[ERR]${NC} $1" >&2; }
info() { echo -e "${BLUE}[INFO]${NC} $1" >&2; }

# ─── Provider Configs ─────────────────────────────────────────────────────────
declare -A PROVIDER_BASE_URL
declare -A PROVIDER_DEFAULT_MODEL
PROVIDER_BASE_URL[ollama]="https://cloud.ollama.com/v1"
PROVIDER_BASE_URL[minimax]="https://api.minimax.chat/v1"
PROVIDER_BASE_URL[local]="http://localhost:11434/v1"
PROVIDER_BASE_URL[custom]=""

PROVIDER_DEFAULT_MODEL[ollama]="minimax-m2.7:cloud"
PROVIDER_DEFAULT_MODEL[minimax]="minimax-m2.7:cloud"
PROVIDER_DEFAULT_MODEL[local]="meditron:7b"
PROVIDER_DEFAULT_MODEL[custom]=""

# ─── Step 1: Start Ollama Serve ──────────────────────────────────────────────
start_ollama() {
  log "Checking if ollama serve is running..."

  if pgrep -x ollama > /dev/null 2>&1; then
    log "Ollama already running (PID: $(pgrep -x ollama))"
    return 0
  fi

  if command -v ollama &> /dev/null; then
    log "Starting ollama serve..."
    ollama serve &
    OLLAMA_PID=$!
    echo $OLLAMA_PID > "$OLLAMA_PID_FILE"
    sleep 2

    if curl -s --max-time 5 http://localhost:11434/api/tags > /dev/null 2>&1; then
      log "Ollama serve started successfully (PID: $OLLAMA_PID)"
    else
      error "Ollama serve started but not responding. Check: curl http://localhost:11434/api/tags"
      return 1
    fi
  else
    error "Ollama not found. Install: curl -fsSL https://ollama.com/install.sh | sh"
    return 1
  fi
}

# ─── Step 1b: Start Beads (Issue Tracker) ───────────────────────────────────
start_beads() {
  if ! command -v bd &> /dev/null; then
    warn "Beads not installed. Install: npm install -g beads@0.2.1"
    return 0
  fi

  if pgrep -x beads > /dev/null 2>&1; then
    log "Beads already running (PID: $(pgrep -x beads))"
    return 0
  fi

  log "Starting Beads..."
  export BEADS_DIR="${BEADS_DIR:-$HOME/.openclaw/workspace/mc/.beads}"
  export DOLT_AUTO_COMMIT=on

  # Start beads server in background
  nohup bd serve &>/dev/null &
  sleep 1

  if pgrep -x beads > /dev/null 2>&1; then
    log "Beads started successfully (PID: $(pgrep -x beads))"
  else
    warn "Beads may not have started cleanly"
  fi
}

# ─── Step 2: Ollama Signin (Cloud Auth) ─────────────────────────────────────
ollama_signin() {
  local provider="$1"

  if [ "$provider" != "ollama" ]; then
    return 0
  fi

  log "Checking Ollama Cloud authentication..."

  # Check if already authenticated
  if ollama list 2>/dev/null | grep -q "No items available"; then
    warn "Not signed in to Ollama Cloud."
    echo ""
    echo -e "${BOLD}To use Ollama Cloud models, you need to sign in:${NC}"
    echo "  1. Get your API key from: https://ollama.com/settings"
    echo "  2. Run: ollama signin"
    echo ""
    read -p "Press Enter after signing in, or skip to continue without auth: " dummy
  else
    log "Ollama Cloud: already authenticated"
  fi
}

# ─── Step 3: Backup Config ────────────────────────────────────────────────────
backup_config() {
  if [ -f "$OPENCLAW_CONFIG" ]; then
    cp "$OPENCLAW_CONFIG" "$OPENCLAW_CONFIG_BAK"
    log "Backed up config to $OPENCLAW_CONFIG_BAK"
  fi
}

# ─── Step 4: Get API Key ─────────────────────────────────────────────────────
get_api_key() {
  local provider="$1"
  local key=""

  # Try secrets-manager first
  if [ -f "$HOME/.openclaw/workspace/mission-control/scripts/secrets-manager.js" ]; then
    key=$(node "$HOME/.openclaw/workspace/mission-control/scripts/secrets-manager.js" get "ollama-cloud:${provider}-api-key" 2>/dev/null || echo "")
  fi

  # Fallback to env var
  if [ -z "$key" ]; then
    case "$provider" in
      ollama) key="${OLLAMA_API_KEY:-}" ;;
      minimax) key="${MINIMAX_API_KEY:-}" ;;
      local) key="ollama" ;;
      custom) key="${CUSTOM_OLLAMA_API_KEY:-}" ;;
    esac
  fi

  echo "$key"
}

# ─── Step 5: Configure Provider ──────────────────────────────────────────────
configure_provider() {
  local provider="$1"
  local api_key="$2"
  local model_id="$3"
  local base_url="${PROVIDER_BASE_URL[$provider]}"

  if [ -z "$base_url" ]; then
    read -p "Enter custom base URL: " base_url
  fi
  if [ -z "$api_key" ]; then
    api_key=$(get_api_key "$provider")
  fi
  if [ -z "$model_id" ]; then
    model_id="${PROVIDER_DEFAULT_MODEL[$provider]}"
    read -p "Model [${model_id}]: " model_input
    [ -n "$model_input" ] && model_id="$model_input"
  fi

  log "Provider: $provider"
  log "Base URL: $base_url"
  log "Model: $model_id"
  if [ -n "$api_key" ] && [ "$api_key" != "ollama" ]; then
    log "API Key: ${api_key:0:8}..."
  fi

  backup_config

  # Build provider JSON
  local provider_json
  provider_json=$(cat <<EOF
{
  "baseUrl": "$base_url",
  "apiKey": "$api_key",
  "api": "openai-completions",
  "models": [
    {
      "id": "$model_id",
      "name": "$provider/$model_id",
      "contextWindow": 32768,
      "maxTokens": 8192
    }
  ]
}
EOF
)

  # Use python for JSON patching (more reliable than jq on all systems)
  python3 << PYEOF
import json, sys

config_path = "$OPENCLAW_CONFIG"

try:
  with open(config_path, 'r') as f:
    config = json.load(f)
except:
  config = {"models": {"providers": {}}}

if "models" not in config:
  config["models"] = {"providers": {}}
if "providers" not in config["models"]:
  config["models"]["providers"] = {}

config["models"]["providers"]["ollama"] = json.loads('$provider_json')

if "agents" not in config:
  config["agents"] = {"defaults": {}}
if "defaults" not in config["agents"]:
  config["agents"]["defaults"] = {}
config["agents"]["defaults"]["model"] = {"primary": "ollama/$model_id"}

with open(config_path, 'w') as f:
  json.dump(config, f, indent=2)

print("Config updated successfully")
PYEOF

  log "Config written to $OPENCLAW_CONFIG"
}

# ─── Step 6: Restart Gateway ──────────────────────────────────────────────────
restart_gateway() {
  log "Restarting OpenClaw gateway..."

  if command -v openclaw &> /dev/null; then
    openclaw gateway restart 2>/dev/null && log "Gateway restarted" || warn "Could not restart gateway. Run: openclaw gateway restart"
  else
    warn "openclaw CLI not found. Run 'openclaw gateway restart' manually."
  fi

  sleep 2
  log "Done! Default model is now: ollama/${PROVIDER_DEFAULT_MODEL[$provider]:-$model_id}"
}

# ─── Interactive Mode ─────────────────────────────────────────────────────────
interactive() {
  echo ""
  echo -e "${BOLD}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║     Ollama Cloud Provider Setup            ║${NC}"
  echo -e "${BOLD}╚═══════════════════════════════════════════╝${NC}"
  echo ""

  echo "Select provider:"
  echo "  1) Ollama Cloud     (ollama.com - requires signin)"
  echo "  2) Minimax          (api.minimax.chat)"
  echo "  3) Local Ollama     (localhost:11434)"
  echo "  4) Custom           (Ollama-compatible endpoint)"
  echo ""
  read -p "Choice [1]: " choice
  choice="${choice:-1}"

  case "$choice" in
    1) provider="ollama" ;;
    2) provider="minimax" ;;
    3) provider="local" ;;
    4) provider="custom" ;;
    *) error "Invalid choice"; exit 1 ;;
  esac

  ollama_signin "$provider"

  api_key=$(get_api_key "$provider")
  if [ -z "$api_key" ] && [ "$provider" != "local" ]; then
    echo ""
    echo -e "${BOLD}Enter API key for $provider:${NC}"
    read -s -p "API Key: " api_key
    echo ""
  fi

  echo ""
  model_id="${PROVIDER_DEFAULT_MODEL[$provider]}"
  echo -e "Model [${model_id}]: "
  read -p "Model: " model_input
  [ -n "$model_input" ] && model_id="$model_input"

  echo ""
  echo -e "${BOLD}Ready to apply:${NC}"
  echo "  Provider:  $provider"
  echo "  Base URL:  ${PROVIDER_BASE_URL[$provider]:-custom}"
  echo "  Model:     $model_id"
  echo ""
  read -p "Apply changes? [y/N]: " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    configure_provider "$provider" "$api_key" "$model_id"
    restart_gateway
  else
    info "Aborted"
  fi
}

# ─── Main ──────────────────────────────────────────────────────────────────────
main() {
  local provider="${1:-}"
  local api_key="${2:-}"
  local model_id="${3:-}"

  start_ollama || exit 1
  start_beads

  if [ -n "$provider" ]; then
    ollama_signin "$provider"
  fi

  if [ -z "$provider" ]; then
    interactive
  else
    configure_provider "$provider" "$api_key" "$model_id"
    restart_gateway
  fi
}

main "$@"
