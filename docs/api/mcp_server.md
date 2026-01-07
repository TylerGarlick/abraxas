# MCP Server — `abraxas.mcp_server`

Implements a simple Model Context Protocol (MCP) server using `asyncio` and `pydantic` message models.

## Models

- `MCPMessage` (Pydantic `BaseModel`)
  - Fields:
    - `id` (str) — Unique message identifier
    - `type` (str) — Message type
    - `content` (dict) — Message content

## Class: MCPServer

Constructor arguments:
- `host` (str) — default `0.0.0.0`
- `port` (int) — default `8000`

### Important methods

- `start()`
  - Blocking call which starts the asyncio server using `asyncio.run(...)` and listens for TCP clients.

- `handle_client(reader, writer)`
  - Async coroutine that reads incoming bytes, decodes messages, processes them with `_process_message`, and writes responses.

- `_process_message(message: str)` -> str
  - Parses JSON into `MCPMessage`, validates via Pydantic, and returns a JSON-encoded response (echo by default).
  - On error returns an error JSON with details.

- `stop()`
  - Async method to close server sockets and client connections.

## Usage (example)

```python
from abraxas.mcp_server import MCPServer

server = MCPServer(host="127.0.0.1", port=8000)
server.start()  # Blocks
```

## Notes

- `pydantic` is used for message validation (v2 style). See: https://docs.pydantic.dev/
- The server expects newline-delimited JSON messages and returns JSON responses.
