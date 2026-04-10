#!/bin/bash
# Ollama Setup Script for OpenClaw
# Usage: bash scripts/setup.sh [model-name]
# If model-name not provided, auto-detects the best available model

set -e

OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
CONFIG_PATH="${CONFIG_PATH:-$HOME/.openclaw/openclaw.json}"
BACKUP_PATH="${CONFIG_PATH}.bak"

# Colors for output (only when stdout is a terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    NC=''
fi

log_info() { echo -e "${GREEN}[INFO]${NC} $1" >&2; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Step 1: Check if Ollama is running
check_ollama() {
    log_info "Checking if Ollama is running at ${OLLAMA_HOST}..."
    
    if curl -s --max-time 5 "${OLLAMA_HOST}/api/tags" > /dev/null 2>&1; then
        log_info "Ollama is running"
        return 0
    else
        log_error "Ollama is not running at ${OLLAMA_HOST}"
        log_info "Start Ollama with: ollama serve"
        return 1
    fi
}

# Step 2: List available models
list_models() {
    log_info "Available Ollama models:"
    curl -s "${OLLAMA_HOST}/api/tags" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for m in data.get('models', []):
    print(f\"  - {m.get('name', 'unknown')} (size: {m.get('size', '?')})\"
    )
" >&2
}

# Step 3: Select model (auto or specified)
select_model() {
    local requested_model="$1"
    
    if [ -n "$requested_model" ]; then
        log_info "Requested model: ${requested_model}"
        # Verify model exists
        if curl -s --max-time 5 "${OLLAMA_HOST}/api/show" -d "{\"name\":\"${requested_model}\"}" > /dev/null 2>&1; then
            echo "$requested_model"
            return 0
        else
            log_error "Model '${requested_model}' not found"
            return 1
        fi
    else
        # Auto-detect: prefer minimax models, then other general purpose models
        log_info "Auto-detecting best model..."
        local models=$(curl -s "${OLLAMA_HOST}/api/tags")
        local selected
        selected=$(echo "$models" | python3 -c "
import sys, json
data = json.load(sys.stdin)
models = [m.get('name', '') for m in data.get('models', [])]

# Priority order for selection
priority = ['minimax-m2.7', 'minimax-m2', 'qwen2', 'llama3', 'mistral', 'phi3', 'codellama']

# First try to find a priority match with :cloud suffix
for p in priority:
    for m in models:
        if p in m and ':cloud' in m:
            print(m)
            sys.exit(0)

# Then try priority match without suffix
for p in priority:
    for m in models:
        if p in m:
            print(m)
            sys.exit(0)

# Fallback to first available
if models:
    print(models[0])
" 2>/dev/null)
        
        if [ -n "$selected" ]; then
            log_info "Auto-selected model: ${selected}"
            echo "$selected"
            return 0
        else
            log_error "No models found in Ollama"
            return 1
        fi
    fi
}

# Step 4: Backup config
backup_config() {
    if [ -f "$CONFIG_PATH" ]; then
        log_info "Backing up config to ${BACKUP_PATH}"
        cp "$CONFIG_PATH" "$BACKUP_PATH"
    fi
}

# Step 5: Update OpenClaw config
update_config() {
    local model_name="$1"
    
    log_info "Updating OpenClaw config..."
    
    # Use python to merge config safely
    python3 - "$model_name" "$CONFIG_PATH" <<'PYTHON_SCRIPT'
import sys
import json

model_name = sys.argv[1]
config_path = sys.argv[2]

with open(config_path, 'r') as f:
    config = json.load(f)

# Ensure structures exist
if 'models' not in config:
    config['models'] = {'providers': {}}
if 'agents' not in config:
    config['agents'] = {}
if 'defaults' not in config.get('agents', {}):
    config['agents']['defaults'] = {}
if 'model' not in config.get('agents', {}).get('defaults', {}):
    config['agents']['defaults']['model'] = {}

# Set default model
config['agents']['defaults']['model']['primary'] = 'ollama/' + model_name

# Add/update Ollama provider
config['models']['providers']['ollama'] = {
    'baseUrl': 'http://localhost:11434/v1',
    'apiKey': 'ollama',
    'api': 'openai-completions',
    'models': [
        {
            'id': model_name,
            'name': model_name,
            'contextWindow': 32768,
            'maxTokens': 8192
        }
    ]
}

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("Config updated successfully")
PYTHON_SCRIPT
    
    if [ $? -ne 0 ]; then
        log_error "Failed to update config"
        return 1
    fi
}

# Step 6: Restart gateway
restart_gateway() {
    log_info "Restarting OpenClaw gateway..."
    
    # Send SIGUSR1 for hot reload
    pkill -USR1 -f "node.*openclaw" 2>/dev/null || true
    
    sleep 2
    log_info "Gateway restart initiated"
}

# Main workflow
main() {
    local requested_model="${1:-}"
    
    echo -e "${GREEN}=== Ollama Setup for OpenClaw ===${NC}" >&2
    
    check_ollama || exit 1
    echo >&2
    list_models
    echo >&2
    
    local selected_model
    selected_model=$(select_model "$requested_model") || exit 1
    echo >&2
    
    backup_config
    update_config "$selected_model" || exit 1
    echo >&2
    
    restart_gateway
    echo >&2
    
    echo -e "${GREEN}=== Setup Complete ===${NC}" >&2
    echo -e "${GREEN}Default model set to: ollama/${selected_model}${NC}" >&2
    echo -e "${GREEN}New sessions will use Ollama by default.${NC}" >&2
}

main "$@"
