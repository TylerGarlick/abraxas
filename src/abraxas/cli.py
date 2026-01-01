"""
CLI interface for Abraxas.
"""

import click

from abraxas import __version__
from abraxas.database import ArangoDBClient
from abraxas.mcp_server import MCPServer
from abraxas.seed import seed_command
from abraxas.ui import run_ui


@click.group()
@click.version_option(version=__version__)
@click.pass_context
def main(ctx: click.Context) -> None:
    """Abraxas - A CLI application with ArangoDB support and MCP server."""
    ctx.ensure_object(dict)


@main.command()
@click.option("--host", default="localhost", help="ArangoDB host")
@click.option("--port", default=8529, help="ArangoDB port")
@click.option("--username", default="root", help="ArangoDB username")
@click.option("--password", default="", help="ArangoDB password")
@click.option("--database", default="_system", help="ArangoDB database name")
def db_test(host: str, port: int, username: str, password: str, database: str) -> None:
    """Test the ArangoDB connection."""
    click.echo(f"Connecting to ArangoDB at {host}:{port}...")
    try:
        client = ArangoDBClient(
            host=host, port=port, username=username, password=password, database=database
        )
        version = client.get_version()
        click.echo(f"✓ Successfully connected to ArangoDB {version}")
        client.close()
    except Exception as e:
        click.echo(f"✗ Failed to connect: {e}", err=True)
        raise click.Abort()


@main.command()
@click.option("--host", default="0.0.0.0", help="MCP server host")
@click.option("--port", default=8000, help="MCP server port")
def serve(host: str, port: int) -> None:
    """Start the MCP server."""
    click.echo(f"Starting MCP server on {host}:{port}...")
    try:
        server = MCPServer(host=host, port=port)
        server.start()
    except KeyboardInterrupt:
        click.echo("\nShutting down MCP server...")
    except Exception as e:
        click.echo(f"✗ Failed to start server: {e}", err=True)
        raise click.Abort()


@main.command()
def info() -> None:
    """Display application information."""
    click.echo(f"Abraxas v{__version__}")
    click.echo("A CLI application with ArangoDB support and MCP server")
    click.echo("\nAvailable commands:")
    click.echo("  db-test  - Test ArangoDB connection")
    click.echo("  serve    - Start the MCP server")
    click.echo("  seed     - Seed ArangoDB with demo data")
    click.echo("  ui       - Start the Ollama chat UI")
    click.echo("  info     - Display this information")


# Expose seed command
main.add_command(seed_command)


@main.command()
@click.option("--host", default="0.0.0.0", help="UI server host")
@click.option("--port", default=3000, help="UI server port")
def ui(host: str, port: int) -> None:
    """Start the chat UI (loads genesis.md and targets Ollama)."""
    click.echo(f"Starting UI on {host}:{port} with model mistral...")
    try:
        run_ui(host=host, port=port)
    except KeyboardInterrupt:
        click.echo("\nShutting down UI...")
    except Exception as e:
        click.echo(f"✗ Failed to start UI: {e}", err=True)
        raise click.Abort()


if __name__ == "__main__":
    main()
