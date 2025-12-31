# Abraxas

A Python CLI application with ArangoDB database support and an MCP (Model Context Protocol) server.

## Features

- **CLI Interface**: Command-line interface built with Click
- **ArangoDB Integration**: Connect to and interact with ArangoDB databases
- **MCP Server**: Model Context Protocol server implementation
- **Comprehensive Testing**: Full test suite with pytest
- **Modern Python**: Uses pyproject.toml for configuration

## Installation

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install the package in development mode:
```bash
pip install -e ".[dev]"
```

### Production Installation

```bash
pip install .
```

## Usage

### CLI Commands

#### Get Information
```bash
abraxas info
```

#### Test ArangoDB Connection
```bash
abraxas db-test --host localhost --port 8529 --username root --password your_password
```

#### Start MCP Server
```bash
abraxas serve --host 0.0.0.0 --port 8000
```

### Using as a Library

```python
from abraxas.database import ArangoDBClient
from abraxas.mcp_server import MCPServer

# Connect to ArangoDB
client = ArangoDBClient(
    host="localhost",
    port=8529,
    username="root",
    password="your_password",
    database="_system"
)

# Get database version
version = client.get_version()
print(f"ArangoDB version: {version}")

# Create a collection
client.create_collection("my_collection")

# Close connection
client.close()

# Start MCP Server
server = MCPServer(host="0.0.0.0", port=8000)
server.start()
```

## Development

### Running Tests

Run all tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=abraxas --cov-report=term-missing
```

Run specific test file:
```bash
pytest tests/test_cli.py
```

### Code Quality

Format code with Black:
```bash
black src tests
```

Lint with Ruff:
```bash
ruff check src tests
```

Type check with mypy:
```bash
mypy src
```

## Project Structure

```
abraxas/
├── src/
│   └── abraxas/
│       ├── __init__.py       # Package initialization
│       ├── cli.py            # CLI interface
│       ├── database.py       # ArangoDB client
│       └── mcp_server.py     # MCP server implementation
├── tests/
│   ├── conftest.py           # Test configuration
│   ├── test_cli.py           # CLI tests
│   ├── test_database.py      # Database tests
│   └── test_mcp_server.py    # MCP server tests
├── pyproject.toml            # Project configuration
├── README.md                 # This file
└── .gitignore               # Git ignore file
```

## Requirements

- Python 3.9 or higher
- ArangoDB server (for database functionality)

## Dependencies

### Core
- click: CLI interface
- python-arango: ArangoDB client
- mcp: Model Context Protocol
- pydantic: Data validation

### Development
- pytest: Testing framework
- pytest-cov: Coverage reporting
- pytest-asyncio: Async testing
- black: Code formatting
- ruff: Linting
- mypy: Type checking

## License

This project is open source.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.