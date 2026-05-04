#!/bin/bash
set -e

echo "Waiting for ArangoDB to be healthy..."
# Simple wait loop checking if the Arango port is open
while ! timeout 1 bash -c "echo > /dev/tcp/arangodb/8529" 2>/dev/null; do
  echo "ArangoDB is unavailable - sleeping"
  sleep 2
done

echo "ArangoDB is up! Running bootstrap..."
python bootstrap.py

echo "Starting MCP Server..."
exec python server.py
