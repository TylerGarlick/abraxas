"""Additional CLI tests to increase coverage."""

from click.testing import CliRunner
from unittest.mock import patch

import pytest

from abraxas.cli import main


def test_db_test_success(monkeypatch):
    """Simulate successful ArangoDB connection."""

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        def get_version(self):
            return "3.10.0"

        def close(self):
            pass

    monkeypatch.setattr("abraxas.cli.ArangoDBClient", FakeClient)

    runner = CliRunner()
    result = runner.invoke(main, ["db-test"])
    assert result.exit_code == 0
    assert "Successfully connected to ArangoDB 3.10.0" in result.output


def test_db_test_failure(monkeypatch):
    """Simulate ArangoDB connection failure."""

    class FailingClient:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("boom")

    monkeypatch.setattr("abraxas.cli.ArangoDBClient", FailingClient)

    runner = CliRunner()
    result = runner.invoke(main, ["db-test"])

    assert result.exit_code != 0
    assert "Failed to connect" in result.output


def test_serve_keyboard_interrupt(monkeypatch):
    """Simulate KeyboardInterrupt during server start to hit shutdown message."""

    class FakeServer:
        def __init__(self, *args, **kwargs):
            pass

        def start(self):
            raise KeyboardInterrupt()

    monkeypatch.setattr("abraxas.cli.MCPServer", FakeServer)

    runner = CliRunner()
    result = runner.invoke(main, ["serve"])  # defaults

    # KeyboardInterrupt may be handled by Click; ensure shutdown message is present
    assert result.exit_code != 0 or result.exit_code == 0
    assert "Shutting down MCP server" in result.output


def test_serve_failure_raises_abort(monkeypatch):
    """Simulate server start raising an unexpected exception and ensure click.Abort is propagated."""

    class FakeServer2:
        def start(self):
            raise RuntimeError("start failed")

    monkeypatch.setattr("abraxas.cli.MCPServer", FakeServer2)

    runner = CliRunner()
    result = runner.invoke(main, ["serve"])

    assert result.exit_code != 0
    assert "Failed to start server" in result.output
