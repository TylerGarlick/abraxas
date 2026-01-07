# Quick Start Guide for Abraxas

Get up and running with Abraxas in minutes!

## Prerequisites

- Python 3.9 or higher installed
- Git installed

## Installation

### Option 1: Automated Setup (Recommended)

#### Linux/macOS
```bash
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas
./setup.sh
source .venv/bin/activate
```

#### Windows
```cmd
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas
setup.bat
.venv\Scripts\activate.bat
```

### Option 2: Manual Setup

```bash
# Clone and navigate
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas

# Create virtual environment
python3 -m venv .venv

# Activate (choose based on your OS)
source .venv/bin/activate              # Linux/macOS
# OR
.venv\Scripts\activate.bat             # Windows Command Prompt
# OR
.venv\Scripts\Activate.ps1             # Windows PowerShell

# Install
pip install -e ".[dev]"
```

## Verify Installation

```bash
abraxas --version
# Should output: abraxas, version 0.1.0
```

## Try It Out

### 1. Get Information
```bash
abraxas info
```

### 2. Test Database Connection (requires ArangoDB)
```bash
abraxas db-test --host localhost --port 8529 --username root --password ""
```

### 3. Start MCP Server
```bash
abraxas serve --host 127.0.0.1 --port 8000
```

Press `Ctrl+C` to stop the server.

## Run Tests

Run the unit and integration tests. The integration tests require Docker to be available and will automatically bring up a minimal stack when executed.

### Unit tests

```bash
pytest tests -k "not integration"
```

### Integration tests (requires Docker)

```bash
# Build and start infrastructure
docker compose -f docker-compose.yml up -d --build

# Run integration tests only
PYTEST_ADDOPTS= pytest tests/integration -q

# Tear down infra
docker compose -f docker-compose.yml down -v
```

## Next Steps

- Read the full [README.md](../README.md) for detailed documentation
- Install ArangoDB to use database features: https://www.arangodb.com/download/
- Explore the CLI commands: `abraxas --help`
- Check out the source code in `src/abraxas/`

## Getting Help

If you encounter any issues:

1. Make sure your virtual environment is activated (you should see `(.venv)` in your prompt)
2. Check that Python 3.9+ is installed: `python --version` or `python3 --version`
3. Try reinstalling: `pip install -e ".[dev]"`
4. Check the Troubleshooting section in [README.md](../README.md)

## Deactivating

When you're done:

```bash
deactivate
```

---

Happy coding! 🚀
