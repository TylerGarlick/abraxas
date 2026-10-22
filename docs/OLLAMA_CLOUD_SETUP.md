# Ollama Cloud Setup for OpenClaw

Guide to configuring OpenClaw to use Ollama cloud providers as the default LLM backend.

## Overview

OpenClaw supports Ollama-compatible API providers. This setup connects your OpenClaw installation to cloud-based LLM services via Ollama's API interface.

The startup script also launches **Beads** — your issue tracker — alongside Ollama.

## Prerequisites

### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Install Beads (Issue Tracker)

```bash
npm install -g beads@0.2.1
```

### 3. Sign in to Ollama Cloud (required for Ollama Cloud provider)

Before using cloud models, you must authenticate with Ollama:

```bash
ollama signin
```

You'll be prompted for your API key from **https://ollama.com/settings**

This registers your machine for API access to Ollama's cloud models.

### 3. Start Ollama Serve

Ollama serve must be running for OpenClaw to connect:

```bash
ollama serve
```

This starts the Ollama server in the background on `localhost:11434`.

## Available Providers

| Provider | Base URL | Auth | Default Model |
|----------|----------|------|---------------|
| **Ollama Cloud** | `https://cloud.ollama.com/v1` | `ollama signin` | `minimax-m2.7:cloud` |
| **Minimax** | `https://api.minimax.chat/v1` | API key | `minimax-m2.7:cloud` |
| **Local** | `http://localhost:11434/v1` | None | `meditron:7b` |
| **Custom** | Any Ollama-compatible | API key | — |

## Quick Setup

### Option 1: Interactive Setup (recommended)

```bash
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh
```

This will:
1. Start `ollama serve` (or confirm it's running)
2. Start `beads` (issue tracker server)
3. Prompt for `ollama signin` if using Ollama Cloud
4. Ask you to select provider, model, and API key
5. Back up and patch `~/.openclaw/openclaw.json`
6. Restart the OpenClaw gateway

### Option 2: Direct (no prompt)

```bash
# Ollama Cloud (requires signin first)
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh ollama

# Minimax (provide API key)
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh minimax <your-api-key>

# Local Ollama
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh local
```

## After Setup

The script automatically:
- Adds/updates the `ollama` provider in `~/.openclaw/openclaw.json`
- Sets the default model to `ollama/<model-id>`
- Restarts the OpenClaw gateway

Verify with:
```bash
openclaw config get models.providers.ollama
```

## Troubleshooting

### "Ollama serve not running"
```bash
ollama serve &
```

### "Not signed in"
```bash
ollama signin
# Get key from: https://ollama.com/settings
```

### Check if authenticated
```bash
ollama list
# If you see "No items available", you're not signed in
```

### Verify config
```bash
openclaw config get models.providers.ollama
```

### Get a new API key
```
https://ollama.com/settings
```

## Files

| File | Description |
|------|-------------|
| `skills/ollama-cloud.skill.tar.gz` | Skill package |
| `skills/ollama-cloud/scripts/ollama.sh` | Setup script |
| `docs/OLLAMA_CLOUD_SETUP.md` | This file |
