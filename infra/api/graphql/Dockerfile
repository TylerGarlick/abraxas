FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

RUN pip install --upgrade pip

COPY infra/api/graphql/pyproject.toml .
RUN pip install --no-cache-dir strawberry-graphql[fastapi] python-arango uvicorn python-dotenv

ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1

EXPOSE 4000

CMD ["python", "-m", "infra.api.graphql.main"]
