"""Database seeding utilities for Abraxas."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

import click
from arango.database import StandardDatabase

from abraxas.database import ArangoDBClient

CollectionSummary = Dict[str, Any]


def _ensure_collection(db: StandardDatabase, name: str):
    """Create collection if it does not exist."""
    if db.has_collection(name):
        return db.collection(name)
    return db.create_collection(name)


def seed_database(db: StandardDatabase) -> dict[str, Any]:
    """
    Seed the database with initial collections and example CRUD/AQL usage.

    Returns a summary of operations.
    """
    topics = _ensure_collection(db, "topics")
    sources = _ensure_collection(db, "sources")
    users = _ensure_collection(db, "users")

    topic_docs: List[Dict[str, Any]] = [
        {"_key": "topic-ai", "name": "General AI", "description": "General-purpose AI topics"},
        {"_key": "topic-db", "name": "Databases", "description": "Storage and querying"},
    ]
    source_docs: List[Dict[str, Any]] = [
        {
            "_key": "source-arangodb",
            "topic_key": "topic-db",
            "name": "ArangoDB",
            "kind": "database",
            "url": "https://arangodb.com",
        },
        {
            "_key": "source-ollama",
            "topic_key": "topic-ai",
            "name": "Ollama",
            "kind": "model-host",
            "url": "https://ollama.ai",
        },
    ]
    user_docs: List[Dict[str, Any]] = [
        {"_key": "user-alex", "email": "alex@example.com", "topics": ["topic-ai"]},
        {"_key": "user-riley", "email": "riley@example.com", "topics": ["topic-ai", "topic-db"]},
    ]

    for doc in topic_docs:
        topics.insert(doc, overwrite=True)
    for doc in source_docs:
        sources.insert(doc, overwrite=True)
    for doc in user_docs:
        users.insert(doc, overwrite=True)

    # Update and delete examples
    topics.update_match({"_key": "topic-ai"}, {"description": "Updated general AI topics"})
    deleted_count = users.delete_match({"_key": "user-alex"})["deleted"]

    # AQL query example: fetch topics with sources
    query = """
    FOR t IN topics
        LET related = (FOR s IN sources FILTER s.topic_key == t._key RETURN s)
        RETURN { topic: t, sources: related }
    """
    aql_results = list(db.aql.execute(query))

    return {
        "collections": {
            "topics": topics.count(),
            "sources": sources.count(),
            "users": users.count(),
        },
        "deleted_users": deleted_count,
        "aql_results": aql_results,
    }


@click.command("seed")
@click.option("--host", default="localhost", help="ArangoDB host")
@click.option("--port", default=8529, help="ArangoDB port")
@click.option("--username", default="root", help="ArangoDB username")
@click.option("--password", default="", help="ArangoDB password")
@click.option("--database", default="_system", help="ArangoDB database name")
def seed_command(host: str, port: int, username: str, password: str, database: str) -> None:
    """Seed ArangoDB with demo data and show CRUD/AQL examples."""
    click.echo(f"Seeding database {database} at {host}:{port}...")
    client = ArangoDBClient(host=host, port=port, username=username, password=password, database=database)
    db = client.get_database()
    summary = seed_database(db)
    click.echo(json.dumps(summary, indent=2))
    client.close()


if __name__ == "__main__":
    seed_command()
