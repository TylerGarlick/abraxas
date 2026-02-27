# Architecture

This document describes the system architecture of the Abraxas project — both its current skills-and-agents configuration and the historical Python CLI application that preceded it.

Intended audience: developers contributing to or integrating with Abraxas.

---

## Table of Contents

- [Current Architecture](#current-architecture)
  - [Overview](#overview)
  - [Component Diagram](#component-diagram)
  - [Agent Lifecycle](#agent-lifecycle)
  - [Skill Lifecycle](#skill-lifecycle)
- [Historical Architecture](#historical-architecture)
  - [Python CLI Overview](#python-cli-overview)
  - [Module Dependency Graph](#module-dependency-graph)
  - [Data Flow: Chat UI to Ollama](#data-flow-chat-ui-to-ollama)
  - [Data Flow: Database Seed](#data-flow-database-seed)

---

## Current Architecture

### Overview

Abraxas is now a Claude Code project. Its runtime host is the Claude Code CLI, which reads the project's `.claude/` directory to discover agents, skills, and persistent memory.

The project's deliverables are:

- **Skill archives** (`.skill` files in `skills/`) — installed by Claude Code to add slash commands.
- **Agent definitions** (`.md` files in `.claude/agents/`) — loaded by Claude Code as named subagents.
- **Agent memory** (`.claude/agent-memory/<agent-name>/`) — persisted across sessions so agents accumulate project knowledge.

### Component Diagram

```mermaid
flowchart TD
    Developer["Developer\n(Claude Code user)"]
    CC["Claude Code CLI\n(host runtime)"]
    CLAUDE_MD[".claude/agents/\ndocs-architect.md"]
    MEMORY[".claude/agent-memory/\ndocs-architect/MEMORY.md"]
    SKILLS["skills/\n*.skill archives"]
    PLAN["PLAN.md\n(shared task board)"]
    DOCS["docs/\n*.md documentation files"]

    Developer -->|"uses"| CC
    CC -->|"loads agent definition"| CLAUDE_MD
    CC -->|"reads & writes"| MEMORY
    CC -->|"installs skills from"| SKILLS
    CC -->|"reads project instructions"| PLAN

    CLAUDE_MD -->|"agent produces"| DOCS
    CLAUDE_MD -->|"agent reads"| MEMORY
```

_The Claude Code CLI is the runtime that orchestrates all components. Agents and skills are discovered from the `.claude/` and `skills/` directories respectively._

### Agent Lifecycle

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CC as Claude Code
    participant Agent as docs-architect agent
    participant Memory as agent-memory/docs-architect/

    Dev->>CC: Sends documentation request
    CC->>CC: Matches request to docs-architect description
    CC->>Memory: Loads MEMORY.md into agent context
    CC->>Agent: Launches agent with full system prompt
    Agent->>Agent: Reads source files and existing docs
    Agent->>CC: Produces documentation files
    Agent->>Memory: Updates MEMORY.md with new discoveries
    CC->>Dev: Returns result
```

_An agent is a stateful Claude instance. Its persistent memory is loaded at launch and updated at the end of each session, building institutional knowledge over time._

### Skill Lifecycle

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CC as Claude Code
    participant Skill as Skill Archive (.skill)

    Dev->>CC: Invokes slash command (e.g. /abraxas-oneironautics)
    CC->>CC: Locates matching .skill archive in skills/
    CC->>Skill: Extracts SKILL.md and reference files
    CC->>CC: Injects skill instructions into active context
    CC->>Dev: Executes skill behavior
```

_Skills extend Claude Code's slash-command vocabulary. They are zip archives unpacked at invocation time._

---

## Historical Architecture

> **Note:** The Python CLI application has been retired. This section is preserved for reference only. No Python source files exist in the current working tree.

### Python CLI Overview

The original Abraxas was a Python 3.9+ CLI built with Click. It exposed five commands that integrated ArangoDB, an MCP server, and an Ollama-hosted AI model.

```mermaid
flowchart LR
    CLI["abraxas CLI\n(click)"]

    CLI --> INFO["info\nPrint version & commands"]
    CLI --> DBTEST["db-test\nTest ArangoDB connection"]
    CLI --> SERVE["serve\nStart MCP server"]
    CLI --> SEED["seed\nSeed ArangoDB with demo data"]
    CLI --> UI["ui\nStart Starlette chat UI"]

    DBTEST --> DB["ArangoDBClient\n(python-arango)"]
    SERVE --> MCP["MCPServer\n(asyncio TCP)"]
    SEED --> DB
    SEED --> SEEDFN["seed_database()\nTopics / Sources / Users"]
    UI --> WEBUI["Starlette app\n(uvicorn)"]
    WEBUI --> AI["OllamaClient\n(httpx async)"]
    AI --> OLLAMA["Ollama / Docker\nLLM host (mistral)"]
```

_The CLI was the single entry point for all subsystems. Each command delegated to a dedicated module._

### Module Dependency Graph

```mermaid
graph TD
    cli["cli.py"]
    db["database.py\nArangoDBClient"]
    mcp["mcp_server.py\nMCPServer"]
    ai["ai.py\nOllamaClient / chat_sync"]
    seed["seed.py\nseed_database()"]
    ui["ui.py\nStarlette app"]
    run_all["run_all.py\nUI + API runner"]

    cli --> db
    cli --> mcp
    cli --> seed
    cli --> ui
    seed --> db
    ui --> ai
    run_all --> ui
    run_all --> mcp
```

_Each module had a single responsibility. `cli.py` wired them together; `run_all.py` launched the UI and MCP server concurrently._

### Data Flow: Chat UI to Ollama

```mermaid
sequenceDiagram
    participant User as Browser User
    participant UI as Starlette UI (uvicorn)
    participant AI as OllamaClient
    participant Genesis as genesis.md
    participant Ollama as Ollama / Docker LLM

    User->>UI: POST /api/chat {"message": "..."}
    UI->>Genesis: load_genesis() — read system prompt
    UI->>AI: OllamaClient.chat(message, history)
    AI->>Ollama: POST /api/chat {model, messages}
    Ollama-->>AI: {message: {content: "..."}}
    AI-->>UI: {content, model, raw}
    UI-->>User: JSONResponse {content, model}
```

_The system prompt (Abraxas constitution) was loaded from `genesis.md` on startup and prepended to every conversation._

### Data Flow: Database Seed

```mermaid
sequenceDiagram
    participant CLI as abraxas seed
    participant Client as ArangoDBClient
    participant ArangoDB as ArangoDB

    CLI->>Client: Connect(host, port, user, password, database)
    Client->>ArangoDB: Authenticate
    CLI->>ArangoDB: Upsert topics collection (2 docs)
    CLI->>ArangoDB: Upsert sources collection (2 docs)
    CLI->>ArangoDB: Upsert users collection (2 docs)
    CLI->>ArangoDB: AQL query — join topics + sources
    ArangoDB-->>CLI: Query results
    CLI->>CLI: Print JSON summary
```

_The seed command was idempotent — it used `overwrite=True` on insert, so re-running it was safe._
