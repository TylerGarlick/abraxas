# Abraxas

A Python CLI application with ArangoDB database support and an MCP (Model Context Protocol) server.

## Features

- **CLI Interface**: Command-line interface built with Click
- **ArangoDB Integration**: Connect to and interact with ArangoDB databases
- **MCP Server**: Model Context Protocol server implementation
- **Comprehensive Testing**: Full test suite with pytest
- **Modern Python**: Uses pyproject.toml for configuration

## Prerequisites

- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **ArangoDB** (optional, for database features) - [Download ArangoDB](https://www.arangodb.com/download/)

## Getting Started

A full Quick Start guide is available in the project documentation: [docs/getting_started.md](docs/getting_started.md).


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
source .venv/bin/activate  # On Windows: .venv\Scripts\activate.bat
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

First, ensure ArangoDB is running on your system. Then:

```bash
abraxas db-test --host localhost --port 8529 --username root --password your_password
```

**Example output:**
```
Connecting to ArangoDB at localhost:8529...
✓ Successfully connected to ArangoDB 3.11.0
```

#### Start MCP Server
```bash
abraxas serve --host 0.0.0.0 --port 8000
```

**Example output:**
```
Starting MCP server on 0.0.0.0:8000...
MCP Server listening on ('0.0.0.0', 8000)
```

Press `Ctrl+C` to stop the server.

#### Seed the database with demo data

```bash
abraxas seed --host localhost --port 8529 --username root --password your_password --database _system
```

#### Start the Ollama chat UI (loads genesis.md)

```bash
abraxas ui --host 0.0.0.0 --port 3000
```

#### Run UI + API together (npm script)

```bash
npm install   # no dependencies, sets up scripts
npm run api-ui
```

### Using as a Library

```python
from abraxas.database import ArangoDBClient
from abraxas.mcp_server import MCPServer
from abraxas.ai import chat_sync

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

# Chat with Ollama using the genesis prompt
reply = chat_sync("Hello!")
print(reply["content"])
```

## Development

### Activating the Virtual Environment

Before running any development commands, make sure your virtual environment is activated:

**Linux/macOS:**
```bash
source .venv/bin/activate
```

**Windows:**
```cmd
.venv\Scripts\activate.bat
```

You should see `(.venv)` at the beginning of your terminal prompt.

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

Run a specific test:
```bash
pytest tests/test_cli.py::test_cli_version
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

Auto-fix linting issues:
```bash
ruff check --fix src tests
```

Type check with mypy:
```bash
mypy src
```

### Deactivating the Virtual Environment

When you're done working on the project:

```bash
deactivate
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
├── .venv/                    # Virtual environment (created by setup)
├── pyproject.toml            # Project configuration
├── setup.sh                  # Setup script for Linux/macOS
├── setup.bat                 # Setup script for Windows
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

## Troubleshooting

### Virtual environment not activating

**Linux/macOS:** Make sure you're using `source .venv/bin/activate` not just `.venv/bin/activate`

**Windows:** Use `.venv\Scripts\activate.bat` for Command Prompt or `.venv\Scripts\Activate.ps1` for PowerShell

### Command not found: abraxas

Make sure:
1. Your virtual environment is activated (you should see `(.venv)` in your prompt)
2. The package is installed: `pip install -e ".[dev]"`

### ArangoDB connection failed

Ensure:
1. ArangoDB is installed and running
2. The host, port, username, and password are correct
3. The database exists

## License

This project is open source.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/abraxas.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Set up the development environment: `./setup.sh` (or `setup.bat` on Windows)
5. Make your changes
6. Run tests: `pytest`
7. Run linting: `ruff check src tests`
8. Commit your changes: `git commit -m "Add your feature"`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Create a Pull Request
