---
name: ollama-cloud
description: Configure OpenClaw to use Ollama cloud providers (Ollama Cloud, Minimax, or local) as the default LLM backend. Use when: (1) setting up a new Ollama cloud model, (2) switching between cloud backends, (3) adding a custom Ollama-compatible API endpoint, (4) user asks to "setup ollama cloud", "connect ollama providers", "use ollama cloud in myclaw". Triggers on: "ollama cloud", "ollama provider", "myclaw ollama", "setup ollama cloud".
---

# Ollama Cloud Setup Skill

Configures OpenClaw to use Ollama-compatible cloud providers as the default LLM.

## Quick Start

```bash
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh
```

## Available Providers

| Provider | Base URL | Auth | Default Model |
|----------|----------|------|---------------|
| **Ollama Cloud** | `https://cloud.ollama.com/v1` | `ollama signin` | `minimax-m2.7:cloud` |
| **Minimax** | `https://api.minimax.chat/v1` | API key | `minimax-m2.7:cloud` |
| **Local** | `http://localhost:11434/v1` | None | `meditron:7b` |
| **Custom** | Any Ollama-compatible | API key | — |

## Prerequisites

### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Install Beads (Issue Tracker)

```bash
npm install -g beads@0.2.1
```

### 3. Sign in to Ollama Cloud (for Ollama Cloud provider)

```bash
ollama signin
```

You'll be prompted for your API key from https://ollama.com/settings

### 3. Start Ollama Serve

```bash
ollama serve
```

The setup script handles this automatically, but you can also run it separately:

```bash
# In background
ollama serve &

# Or use the startup script
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh
```

## Usage

### Interactive Setup (recommended first time)

```bash
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh
```

### Direct (no prompt)

```bash
# Ollama Cloud (requires signin)
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh ollama

# Minimax
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh minimax <api-key>

# Local Ollama
bash ~/.openclaw/workspace/skills/ollama-cloud/scripts/ollama.sh local
```

## What the Script Does

1. **Starts `ollama serve`** — confirms or launches the Ollama server
2. **Starts `beads`** — launches the Beads issue tracker server (if installed)
3. **Handles authentication** — for Ollama Cloud, runs `ollama signin` flow
4. **Backs up config** — saves `~/.openclaw/openclaw.json` to `~/.openclaw/openclaw.json.bak`
5. **Patches the config** — adds/updates the `ollama` provider with base URL, API key, and model
6. **Sets default model** — sets `ollama/<model>` as the primary model
7. **Restarts gateway** — reloads OpenClaw config

## Config Changes

Updates `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/<model-id>"
      }
    }
  },
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "<provider-base-url>",
        "apiKey": "<api-key>",
        "api": "openai-completions",
        "models": [
          {
            "id": "<model-id>",
            "name": "<provider>/<model-id>",
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

**Ollama serve won't start:**
```bash
ollama serve &
```

**Check if running:**
```bash
curl -s http://localhost:11434/api/tags
```

**Verify config:**
```bash
openclaw config get models.providers.ollama
```

**Check authenticated accounts:**
```bash
ollama list
```

**Get a new API key:**
```
https://ollama.com/settings
```
