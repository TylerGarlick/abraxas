# Setup Guide

This guide will help you get started with the MCP ArangoDB server.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - Verify installation: `docker --version`

- **Bun** (version 1.0 or higher)
  - [Install Bun](https://bun.sh/)
  - Verify installation: `bun --version`

## Clone and Install

1. Clone the repository:
```bash
git clone https://github.com/TylerGarlick/mcp-arangodb.git
cd mcp-arangodb
```

2. Install dependencies:
```bash
bun install
```

## Docker Compose Setup

The project includes a `docker-compose.yml` file that sets up:
- **ArangoDB** database server (port 8529)
- **MCP Server** (port 3000 for HTTP transport)

### Start the services

```bash
docker compose up -d
```

### Verify ArangoDB is running

```bash
docker compose ps
```

Or connect to the ArangoDB web interface at `http://localhost:8529`

### Stop the services

```bash
docker compose down
```

### Stop and remove volumes

```bash
docker compose down -v
```

## Environment Variables

The MCP server uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ARANGO_HOST` | ArangoDB server URL | `http://localhost:8529` |
| `ARANGO_PASSWORD` | Root password for ArangoDB | (empty) |
| `PORT` | HTTP server port (HTTP transport only) | `3000` |
| `HOST` | HTTP server host (HTTP transport only) | `0.0.0.0` |
| `TRANSPORT` | Transport type: `stdio` or `http` | `stdio` |

### Using a `.env` file

Create a `.env` file in the project root:

```bash
ARANGO_HOST=http://localhost:8529
ARANGO_PASSWORD=your_secure_password
PORT=3000
TRANSPORT=stdio
```

## Building the MCP Server

### Development mode (stdio transport)

```bash
bun run dev
```

### Production build

```bash
bun run build
```

## Testing

### Run all tests

```bash
bun test
```

### Run specific test suites

```bash
bun run test:unit    # Unit tests only
bun run test:integration  # Integration tests (requires ArangoDB)
bun run test:e2e      # E2E tests
```

### Run with coverage

```bash
bun run test:coverage
```

## Next Steps

- Read the [Usage Guide](./usage.md) for running the server
- Check out the [Novice Guide](./guides/novice.md) to learn about ArangoDB and MCP
