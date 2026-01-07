"""Tests for the CLI module."""

from click.testing import CliRunner

from abraxas.cli import main


def test_cli_version():
    """Test CLI version command."""
    runner = CliRunner()
    result = runner.invoke(main, ["--version"])
    assert result.exit_code == 0
    assert "0.1.0" in result.output


def test_cli_help():
    """Test CLI help command."""
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    assert "Abraxas" in result.output
    assert "db-test" in result.output
    assert "serve" in result.output
    assert "info" in result.output


def test_info_command():
    """Test info command."""
    runner = CliRunner()
    result = runner.invoke(main, ["info"])
    assert result.exit_code == 0
    assert "Abraxas v0.1.0" in result.output
    assert "ArangoDB" in result.output
    assert "MCP server" in result.output


def test_db_test_command_help():
    """Test db-test command help."""
    runner = CliRunner()
    result = runner.invoke(main, ["db-test", "--help"])
    assert result.exit_code == 0
    assert "--host" in result.output
    assert "--port" in result.output
    assert "--username" in result.output
    assert "--password" in result.output
    assert "--database" in result.output


def test_serve_command_help():
    """Test serve command help."""
    runner = CliRunner()
    result = runner.invoke(main, ["serve", "--help"])
    assert result.exit_code == 0
    assert "--host" in result.output
    assert "--port" in result.output


def test_info_lists_new_commands():
    """Info should list seed and ui commands."""
    runner = CliRunner()
    result = runner.invoke(main, ["info"])
    assert result.exit_code == 0
    assert "seed" in result.output
    assert "ui" in result.output


def test_db_test_success(monkeypatch):
    """db-test reports success on healthy client."""
    class DummyClient:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

        def get_version(self):
            return "3.11.0"

        def close(self):
            self.closed = True

    monkeypatch.setattr("abraxas.cli.ArangoDBClient", DummyClient)
    runner = CliRunner()
    result = runner.invoke(main, ["db-test"])
    assert result.exit_code == 0
    assert "Successfully connected" in result.output


def test_db_test_failure(monkeypatch):
    """db-test aborts on connection failure."""
    class BrokenClient(Exception):
        pass

    def _ctor(**kwargs):
        raise BrokenClient("fail")

    monkeypatch.setattr("abraxas.cli.ArangoDBClient", _ctor)
    runner = CliRunner()
    result = runner.invoke(main, ["db-test"])
    assert result.exit_code != 0
    assert "Failed to connect" in result.output


def test_ui_command_invokes_runner(monkeypatch):
    """UI command should invoke run_ui with provided args."""
    called = {}

    def _run_ui(host, port):
        called["host"] = host
        called["port"] = port

    monkeypatch.setattr("abraxas.cli.run_ui", _run_ui)
    runner = CliRunner()
    result = runner.invoke(main, ["ui", "--host", "127.0.0.1", "--port", "5001"])
    assert result.exit_code == 0
    assert called == {"host": "127.0.0.1", "port": 5001}
