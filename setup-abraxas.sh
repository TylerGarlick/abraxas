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
docker-compose up -d

# 4. Dependency Installation
echo "📦 Installing MCP dependencies..."
bun install

# 5. Skill Integration (Sovereign Bridge)
echo "🛠️ Integrating Skills into the Agent Framework..."
# Note: In a real deploy, this would symlink to the active agent's skill directory
# We assume the agent is running from the project root or a linked directory.
mkdir -p skills/
# (Specific symlink logic would go here based on the agent's current path)

# 6. Health Check
echo "🩺 Running System Health Audit..."
sleep 5 # Give containers time to start
SOTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health || echo "FAIL")
JANUS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health || echo "FAIL")

if [ "$SOTER_STATUS" == "200" ] && [ "$JANUS_STATUS" == "200" ]; then
    echo "✅ Sovereign Brain is ONLINE and verified."
else
    echo "⚠️ Some MCP services are not responding. Check 'docker logs'."
fi

echo "🌟 Abraxas v4 Setup Complete. You are now Sovereign."
