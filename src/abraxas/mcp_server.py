"""
MCP (Model Context Protocol) server implementation.
"""

import asyncio
import json
from typing import Any, Optional

from pydantic import BaseModel, Field


class MCPMessage(BaseModel):
    """Model for MCP messages."""

    id: str = Field(description="Unique message identifier")
    type: str = Field(description="Message type")
    content: dict[str, Any] = Field(default_factory=dict, description="Message content")


class MCPServer:
    """MCP Server implementation."""

    def __init__(self, host: str = "0.0.0.0", port: int = 8000) -> None:
        """
        Initialize MCP server.

        Args:
            host: Server host address
            port: Server port number
        """
        self.host = host
        self.port = port
        self._server: Optional[asyncio.AbstractServer] = None
        self._clients: list[asyncio.StreamWriter] = []

    async def handle_client(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        """
        Handle client connection.

        Args:
            reader: Stream reader for receiving data
            writer: Stream writer for sending data
        """
        addr = writer.get_extra_info("peername")
        print(f"New connection from {addr}")
        self._clients.append(writer)

        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break

                message = data.decode()
                print(f"Received: {message}")

                # Echo back the message
                response = self._process_message(message)
                writer.write(response.encode())
                await writer.drain()

        except Exception as e:
            print(f"Error handling client {addr}: {e}")
        finally:
            print(f"Closing connection from {addr}")
            self._clients.remove(writer)
            writer.close()
            await writer.wait_closed()

    def _process_message(self, message: str) -> str:
        """
        Process incoming message.

        Args:
            message: Raw message string

        Returns:
            Response string
        """
        try:
            data = json.loads(message)
            msg = MCPMessage(**data)

            # Simple echo response
            response = {
                "id": msg.id,
                "type": "response",
                "content": {"status": "ok", "echo": msg.content},
            }
            return json.dumps(response) + "\n"
        except Exception as e:
            error_response = {"type": "error", "content": {"error": str(e)}}
            return json.dumps(error_response) + "\n"

    async def _start_server(self) -> None:
        """Start the async server."""
        self._server = await asyncio.start_server(self.handle_client, self.host, self.port)

        addr = self._server.sockets[0].getsockname() if self._server.sockets else None
        print(f"MCP Server listening on {addr}")

        async with self._server:
            await self._server.serve_forever()

    def start(self) -> None:
        """Start the MCP server (blocking)."""
        asyncio.run(self._start_server())

    async def stop(self) -> None:
        """Stop the MCP server."""
        if self._server:
            self._server.close()
            await self._server.wait_closed()

        # Close all client connections
        for writer in self._clients:
            writer.close()
            await writer.wait_closed()

        self._clients.clear()
