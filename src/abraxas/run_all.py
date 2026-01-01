"""Run both the MCP API server and the chat UI together."""

from __future__ import annotations

import threading

from abraxas.mcp_server import MCPServer
from abraxas.ui import run_ui


def _start_api(host: str, port: int) -> None:
    server = MCPServer(host=host, port=port)
    server.start()


def run_all(api_host: str = "0.0.0.0", api_port: int = 8000, ui_host: str = "0.0.0.0", ui_port: int = 3000) -> None:
    """Start MCP server (API) and UI in the same process."""
    api_thread = threading.Thread(target=_start_api, args=(api_host, api_port), daemon=True)
    api_thread.start()
    run_ui(host=ui_host, port=ui_port)


def main() -> None:
    run_all()


if __name__ == "__main__":
    main()
