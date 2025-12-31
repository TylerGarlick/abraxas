"""Test configuration and fixtures."""

import pytest


@pytest.fixture
def sample_config():
    """Sample configuration for tests."""
    return {
        "host": "localhost",
        "port": 8529,
        "username": "root",
        "password": "test_password",
        "database": "_system",
    }


@pytest.fixture
def mcp_config():
    """MCP server configuration for tests."""
    return {"host": "127.0.0.1", "port": 8000}
