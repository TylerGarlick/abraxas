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
