#!/bin/bash
# Run all MCP servers
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting MCP servers..."

# Abraxas Logos MCP
(cd "$SCRIPT_DIR/abraxas-logos" && bun src/index.ts &)

# Abraxas Mnemosyne MCP
(cd "$SCRIPT_DIR/abraxas-mnemosyne" && bun src/index.ts &)

# Abraxas Retrieval MCP
(cd "$SCRIPT_DIR/abraxas-retrieval" && bun src/index.ts &)

# Abraxas ArangoDB MCP (may need docker)
(cd "$SCRIPT_DIR/abraxas-arangodb" && docker compose up &)

echo "All MCP servers started."
wait
