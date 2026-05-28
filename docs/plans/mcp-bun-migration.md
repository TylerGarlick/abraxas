# Plan: MCP Migration to Bun + TypeScript

## 1. Objective
Migrate the Abraxas Unified MCP Server from its current Python/FastMCP implementation to a high-performance Bun + TypeScript ecosystem. The goal is to increase type safety, reduce cold-start latency, and align the infrastructure with a modern JS/TS runtime.

## 2. Current State Analysis (Python)
The current system (`projects/abraxas/infra/mcp`) consists of:
- **`main.py`**: Orchestrates the FastMCP server, handles health checks via FastAPI, and manages the SSE transport.
- **`db_manager.py`**: Handles ArangoDB connection, schema initialization, and seeding.
- **`registry.py`**: Dynamic loading of skill modules.
- **`context.py`**: Environment and configuration management.
- **Runtime**: Python 3.12, `fastmcp`, `uvicorn`, `arango-python-driver`.

## 3. Proposed Target Architecture (Bun + TS)
- **Runtime**: Bun (with native TS support).
- **MCP Framework**: `@modelcontextprotocol/sdk` (TypeScript).
- **Database Driver**: `arangojs` (The official JS driver for ArangoDB).
- **HTTP/SSE Layer**: Bun's native `Bun.serve` or `Hono` (for high-performance routing and health checks).
- **Type System**: Strict TypeScript for all tool definitions and database schemas.

## 4. Migration Mapping

| Python Component | TypeScript Equivalent | Notes |
| :--- | :--- | :--- |
| `main.py` $\to$ FastMCP | `index.ts` $\to$ MCP SDK | Use `Server` and `SseServerTransport` from the SDK. |
| `db_manager.py` | `DbManager.ts` | Use `arangojs` for collection/index management. |
| `registry.py` | `Registry.ts` | Implement dynamic module loading via `import()` or a plugin architecture. |
| `context.py` | `Config.ts` | Use `dotenv` or Bun's native `process.env` handling. |
| FastAPI Health Check | Hono / Bun.serve | Simple `/health` endpoint returning JSON. |

## 5. Implementation Phases

### Phase I: Foundation & Schema
- [ ] Initialize Bun project with `tsconfig.json`.
- [ ] Implement `Config.ts` to mirror `context.py`.
- [ ] Implement `DbManager.ts` using `arangojs` to replicate the connection and schema-init logic.

### Phase II: The MCP Core
- [ ] Setup the MCP `Server` instance.
- [ ] Implement the SSE Transport layer to replace the `uvicorn` + `fastmcp` stack.
- [ ] Build the `Registry` to handle tool registration and dynamic skill loading.

### Phase III: Skill Parity
- [ ] Convert existing Python skill tools to TS.
- [ ] Implement the "Sovereign Mode" vs "Simulation Mode" logic in the health check.

### Phase IV: Validation & Cutover
- [ ] Port `tests/` to Vitest/Bun test.
- [ ] Run side-by-side verification (Python vs TS outputs).
- [ ] Update `Dockerfile` to use `oven/bun`.

## 6. Sovereign Definition of Done (S-DoD)
A successful migration is verified by:
1. **Artifact Proof**: Presence of `package.json`, `tsconfig.json`, and `.ts` source files in `infra/mcp-ts/`.
2. **Runtime Proof**: A successful `bun run index.ts` call that returns `Sovereign Mode` via the `/health` endpoint.
3. **Functional Proof**: The MCP client can call at least three core tools (e.g., Ledger, Health) and receive correct responses from the ArangoDB backend.
4. **Linguistic Audit**: Zero "migration in progress" fluff; lead with "Sovereign Mode Active."

---
**Status**: 🟢 Drafted | **Sovereign Lead**: Mary Jane 🦾🔥🌙
