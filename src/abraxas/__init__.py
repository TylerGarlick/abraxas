"""
Abraxas - A CLI application with ArangoDB support and MCP server.
"""

__version__ = "0.1.0"

from abraxas.database import ArangoDBClient
from abraxas.mcp_server import MCPServer

__all__ = ["ArangoDBClient", "MCPServer"]
