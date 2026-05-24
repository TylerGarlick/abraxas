---
name: ollama-setup
description: Setup or update Ollama as the default LLM provider for OpenClaw. Use when: (1) configuring OpenClaw to use a local Ollama model, (2) changing the default model to an Ollama-hosted model, (3) the user wants to use their own Ollama instance instead of a cloud API, (4) troubleshooting or reconfiguring Ollama model settings. Triggers on: "setup ollama", "use ollama", "ollama as default", "configure ollama model".
---

# Ollama Setup Skill

Configures OpenClaw to use Ollama as the default LLM provider.

## Quick Start

Run the setup script:

```bash
bash /home/ubuntu/.openclaw/skills/ollama-setup/scripts/setup.sh
```

This will:
1. Check if Ollama is running
2. List available models
3. Auto-select the best model (or use a specified model)
4. Backup and update `~/.openclaw/openclaw.json`
5. Restart the OpenClaw gateway

## Specifying a Model

```bash
bash setup.sh minimax-m2.7:cloud
```

## What the Script Does

1. **Check Ollama** — Verifies Ollama is running at `http://localhost:11434`
2. **List Models** — Shows all installed Ollama models
3. **Select Model** — Auto-detects best model (prefers `minimax` > `qwen2` > `llama3`), or uses specified model
4. **Backup Config** — Backs up `~/.openclaw/openclaw.json` to `~/.openclaw/openclaw.json.bak`
5. **Update Config** — Adds/updates `ollama` provider and sets `ollama/<model>` as default
6. **Restart Gateway** — Reloads config via SIGUSR1

## Config Changes

The script updates `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/<model-name>"
      }
    }
  },
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "http://localhost:11434/v1",
        "apiKey": "ollama",
        "api": "openai-completions",
        "models": [
          {
            "id": "<model-name>",
            "name": "<model-name>",
            "contextWindow": 32768,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

## Troubleshooting

**Ollama not running:**
```bash
ollama serve
```

**Check available models:**
```bash
curl -s http://localhost:11434/api/tags | python3 -m json.tool
```

**Restore backup if needed:**
```bash
cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json
```

**Manual restart after config changes:**
```bash
openclaw gateway restart
```
