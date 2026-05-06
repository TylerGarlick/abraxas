FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Update pip to ensure the latest wheels are available
RUN pip install --upgrade pip

# Install Python dependencies
COPY infra/mcp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV PYTHONPATH=/workspace
ENV ABRAXAS_ROOT=/workspace
ENV PYTHONUNBUFFERED=1

# Start the unified MCP server
CMD ["python", "infra/mcp/main.py"]
