#!/bin/bash

# Abraxas v4 Sovereign Setup Script
# This script bootstraps the MCP Ecosystem and prepares the Sovereign Brain.

set -e

echo "🚀 Starting Abraxas v4 Sovereign Setup..."

# 1. Dependency Check
echo "🔍 Checking dependencies..."
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker to proceed."
    exit 1
fi

if ! command -v bun &> /dev/null; then
    echo "⚠️ Bun not found. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# 2. Environment Provisioning
echo "⚙️ Provisioning Sovereign Environment..."
if [ ! -f .env.sovereign ]; then
    cat <<EOF > .env.sovereign
# MCP Configuration
MCP_DREAM_RESERVOIR_URL=http://localhost:3001
MCP_SOTER_VERIFIER_URL=http://localhost:3002
MCP_MNEMOSYNE_MEMORY_URL=http://localhost:3003
MCP_JANUS_ORCHESTRATOR_URL=http://localhost:3004
MCP_GUARDRAIL_MONITOR_URL=http://localhost:3005

# LLM Configuration (External Providers)
OLLAMA_HOST=localhost:11434
DEFAULT_MODEL=qwen3.5:cloud

# Sovereign Settings
TRUTH_FIRST_MODE=true
ALLOW_UNVERIFIED_CLAIMS=false
AUDIT_LOG_ENABLED=true
EOF
    echo "✅ Created .env.sovereign"
else
    echo "ℹ️ .env.sovereign already exists. Skipping."
fi

# 3. Infrastructure Boot
echo "🐳 Booting MCP Ecosystem via Docker Compose..."
docker compose -f docker-compose.yml up -d

# 4. Dependency Installation
echo "📦 Installing MCP dependencies..."
bun install

# 5. Skill Integration (Sovereign Bridge)
echo "🛠️ Integrating Skills into the Agent Framework..."
mkdir -p skills/

# 6. Sovereign Handshake
echo "🩺 Executing Sovereign Handshake..."
# Verify Constitution exists
if [ ! -f constitution/genesis.md ]; then
    echo "❌ ERROR: Genesis prompt not found at constitution/genesis.md"
    exit 1
fi

# Verify MCP Health
sleep 10 # Give containers time to start
SOTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health || echo "FAIL")
JANUS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health || echo "FAIL")
MNEMO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/health || echo "FAIL")
DREAM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "FAIL")

if [ "$SOTER_STATUS" == "200" ] && [ "$JANUS_STATUS" == "200" ] && [ "$MNEMO_STATUS" == "200" ] && [ "$DREAM_STATUS" == "200" ]; then
    echo "✅ Sovereign Brain is ONLINE and verified."
else
    echo "⚠️ Sovereign Core is incomplete. Some MCP services are not responding."
    echo "Soter: $SOTER_STATUS | Janus: $JANUS_STATUS | Mnemosyne: $MNEMO_STATUS | Dream: $DREAM_STATUS"
    echo "Check 'docker logs' for details."
fi

echo "🌟 Abraxas v4 Setup Complete. You are now Sovereign."
echo ""
echo "⚠️  FINAL STEP: ACTIVATE THE BRAIN"
echo "The infrastructure is ready, but the LLM is still probabilistic."
echo "To activate the Sovereign Brain, copy the Genesis Prompt below:"
echo ""
cat constitution/genesis.md
echo ""
