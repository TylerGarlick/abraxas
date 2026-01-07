"""Extra tests for MCPServer to improve coverage."""

import asyncio
import json
from unittest.mock import MagicMock, patch

import pytest

from abraxas.mcp_server import MCPServer


def test_process_message_missing_fields():
    server = MCPServer()

    # Missing required 'id' and 'type'
    message = json.dumps({"content": {"x": "y"}})

    response = server._process_message(message)
    response_data = json.loads(response)

    assert response_data["type"] == "error"
    assert "error" in response_data["content"]


def test_start_calls_asyncio_run():
    server = MCPServer(host="127.0.0.1", port=9999)

    called = {}

    def fake_run(coro):
        # verify that a coroutine was passed
        assert hasattr(coro, "__await__")
        called["ran"] = True

    with patch("asyncio.run", fake_run):
        server.start()

    assert called.get("ran", False) is True


@pytest.mark.asyncio
async def test__start_server_uses_start_server(monkeypatch):
    server = MCPServer()

    # Create a fake server object with the required attributes
    class FakeServ:
        def __init__(self):
            self.sockets = [MagicMock(getsockname=lambda: ("127.0.0.1", 0))]

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def serve_forever(self):
            # just return immediately so test doesn't block
            return None

    async def fake_start_server(handler, host, port):
        assert handler is server.handle_client
        return FakeServ()

    monkeypatch.setattr(asyncio, "start_server", fake_start_server)

    # Running internal _start_server should not block thanks to fake
    await server._start_server()
