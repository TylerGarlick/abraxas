# Novice Guide

Welcome! This guide will introduce you to ArangoDB and the Model Context Protocol (MCP).

## What is ArangoDB?

ArangoDB is a multi-model database that supports three data models in a single engine:

- **Documents** (like MongoDB) - JSON-like objects
- **Graphs** (like Neo4j) - Vertices and edges for relationships
- **Key-Value** (like Redis) - Simple key-value pairs

This flexibility makes ArangoDB an excellent choice for applications that need to work with both structured and unstructured data, especially when relationships matter.

### Key Concepts

**Collections** are like tables in relational databases. There are two types:
- **Document Collections**: Store JSON documents
- **Edge Collections**: Store relationships between documents

**Documents** have:
- `_id`: Unique identifier (e.g., `users/12345`)
- `_key`: The document's key part (e.g., `12345`)
- `_rev`: Revision ID for versioning
- Custom attributes you define

**Edges** connect documents and have:
- `_from`: Source vertex ID
- `_to`: Target vertex ID
- Plus any custom attributes

## What is MCP?

The Model Context Protocol (MCP) is a standardized way for AI tools to connect to external data sources and services.

Think of it as a "USB port for AI tools" - just as USB provides a standard way to connect devices to computers, MCP provides a standard way for AI models to connect to databases, APIs, and other services.

MCP servers expose **tools** that AI models can call. Each tool:
- Has a name (e.g., `create_document`)
- Accepts structured input
- Returns structured output

## Your First Steps

### 1. List Collections

Let's start by listing what collections exist in your database:

```json
{
  "name": "list_collections",
  "arguments": {}
}
```

This returns all collections, including system collections that start with `_`.

### 2. Create a Collection

Create a new document collection called `users`:

```json
{
  "name": "create_collection",
  "arguments": {
    "name": "users",
    "type": "document"
  }
}
```

### 3. Create Your First Document

Add a user document to your collection:

```json
{
  "name": "create_document",
  "arguments": {
    "collection": "users",
    "data": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "age": 28
    }
  }
}
```

The response will include the document's `_id` (e.g., `users/12345`).

### 4. Query Your Document

Retrieve the document you just created:

```json
{
  "name": "get_document",
  "arguments": {
    "collection": "users",
    "id": "users/12345"
  }
}
```

### 5. Count Documents

See how many documents are in your collection:

```json
{
  "name": "count_documents",
  "arguments": {
    "collection": "users"
  }
}
```

## What's Next?

- Learn about [AQL](./aql-reference.md) to perform complex queries
- Explore the [Intermediate Guide](./intermediate.md) to work with edges and graphs
- Check out the [Advanced Guide](./advanced.md) for performance tuning
