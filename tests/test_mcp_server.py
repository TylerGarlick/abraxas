"""Tests for the MCP server module."""

import asyncio
import json
from unittest.mock import MagicMock

import pytest

from abraxas.mcp_server import MCPMessage, MCPServer


class TestMCPMessage:
    """Test cases for MCPMessage."""

    def test_mcp_message_creation(self):
        """Test MCPMessage creation."""
        msg = MCPMessage(id="test-1", type="request", content={"action": "test"})

        assert msg.id == "test-1"
        assert msg.type == "request"
        assert msg.content == {"action": "test"}

    def test_mcp_message_default_content(self):
        """Test MCPMessage with default content."""
        msg = MCPMessage(id="test-2", type="request")

        assert msg.id == "test-2"
        assert msg.type == "request"
        assert msg.content == {}


class TestMCPServer:
    """Test cases for MCPServer."""

    def test_initialization(self, mcp_config):
        """Test MCPServer initialization."""
        server = MCPServer(**mcp_config)

        assert server.host == mcp_config["host"]
        assert server.port == mcp_config["port"]
        assert server._server is None
        assert server._clients == []

    def test_process_message_valid(self):
        """Test _process_message with valid message."""
        server = MCPServer()
        message = json.dumps({"id": "test-1", "type": "request", "content": {"data": "test"}})

        response = server._process_message(message)
        response_data = json.loads(response)

        assert response_data["id"] == "test-1"
        assert response_data["type"] == "response"
        assert response_data["content"]["status"] == "ok"
        assert response_data["content"]["echo"] == {"data": "test"}

    def test_process_message_invalid(self):
        """Test _process_message with invalid message."""
        server = MCPServer()
        message = "invalid json"

        response = server._process_message(message)
        response_data = json.loads(response)

        assert response_data["type"] == "error"
        assert "error" in response_data["content"]

    @pytest.mark.asyncio
    async def test_handle_client(self):
        """Test handle_client method."""
        server = MCPServer()

        # Mock reader and writer
        reader = asyncio.StreamReader()
        writer = MagicMock()

        # Mock the necessary methods
        writer.get_extra_info = lambda x: ("127.0.0.1", 12345)
        writer.write = lambda x: None

        async def mock_drain():
            pass

        async def mock_wait_closed():
            pass

        writer.drain = mock_drain
        writer.close = lambda: None
        writer.wait_closed = mock_wait_closed

        # Feed data to reader
        message = {"id": "test-1", "type": "request", "content": {"action": "test"}}
        reader.feed_data(json.dumps(message).encode())
        reader.feed_eof()

        # Test handle_client
        await server.handle_client(reader, writer)

        # Verify client was removed after handling
        assert writer not in server._clients

    @pytest.mark.asyncio
    async def test_stop(self):
        """Test stop method."""
        server = MCPServer()

        # Mock server
        server._server = MagicMock()
        server._server.close = lambda: None

        async def mock_server_wait_closed():
            pass

        server._server.wait_closed = mock_server_wait_closed

        # Mock client
        mock_writer = MagicMock()
        mock_writer.close = lambda: None

        async def mock_wait_closed():
            pass

        mock_writer.wait_closed = mock_wait_closed
        server._clients = [mock_writer]

        await server.stop()

        assert server._clients == []
