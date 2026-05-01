#!/bin/bash

# Ensure we are in the project root
PROJECT_ROOT=$(pwd)
cd "$PROJECT_ROOT"

VENV_DIR=".venv"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Install requirements
if [ -f "bootstrap/requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install --upgrade pip
    pip install -r bootstrap/requirements.txt
fi

# Execute the bootstrap script
echo "Running Abraxas bootstrap..."
python3 bootstrap/abraxas.py
python3 bootstrap/arangodb.py

echo "Bootstrap complete."
