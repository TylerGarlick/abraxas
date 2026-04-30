FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if any (e.g., gcc for some numpy versions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default to the verification script, though the MCP server will override this in compose
CMD ["python", "python/verify.py"]
