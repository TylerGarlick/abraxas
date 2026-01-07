# Project Dependencies

This file lists the main runtime and development dependencies with links to their documentation.

## Runtime

- **Python 3.9+** — https://www.python.org/downloads/
- **click** — CLI toolkit used for building the `abraxas` command: https://click.palletsprojects.com/
- **python-arango** — Official ArangoDB driver for Python: https://github.com/arangodb/pyarango or https://www.arangodb.com/docs/
- **pydantic** — Data validation for MCP message models (v2): https://docs.pydantic.dev/
- **mcp** — Model Context Protocol (used conceptually by the project): search PyPI for `mcp` (https://pypi.org/)

## Development

- **pytest** — Testing framework: https://docs.pytest.org/
- **pytest-asyncio** — Async tests: https://pytest-asyncio.readthedocs.io/
- **black** — Code formatting tool: https://black.readthedocs.io/
- **ruff** — Linter: https://beta.ruff.rs/
- **mypy** — Static type checking: http://mypy-lang.org/

> See `pyproject.toml` for full version pins used by the project.
