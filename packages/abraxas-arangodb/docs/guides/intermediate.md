# Intermediate Guide

This guide covers working with AQL, edges, and graph traversal.

## AQL Basics

ArangoDB Query Language (AQL) is a declarative language for querying ArangoDB. While the MCP server provides simple tools like `query_by_example`, AQL gives you full power.

### Basic Query Structure

```aql
FOR doc IN collection
  FILTER condition
  RETURN doc
```

### Filtering

```aql
// Simple equality
FOR user IN users
  FILTER user.city == "NYC"
  RETURN user

// Multiple conditions
FOR user IN users
  FILTER user.city == "NYC" AND user.age >= 21
  RETURN user

// Range query
FOR user IN users
  FILTER user.age >= 21 AND user.age <= 65
  RETURN user
```

### Sorting and Limiting

```aql
FOR user IN users
  SORT user.name ASC
  LIMIT 10
  RETURN user
```

### Projection

```aql
// Return only specific fields
FOR user IN users
  RETURN {
    name: user.name,
    email: user.email
  }
```

## Working with Edges

Edges represent relationships between documents. They're stored in edge collections.

### Creating an Edge Collection

```json
{
  "name": "create_edge_collection",
  "arguments": {
    "name": "friendships"
  }
}
```

### Creating Vertices

First, create the vertex documents:

```json
{
  "name": "create_document",
  "arguments": {
    "collection": "users",
    "data": { "name": "Alice" }
  }
}
```

Response: `{ "_id": "users/alice123" }`

```json
{
  "name": "create_document",
  "arguments": {
    "collection": "users",
    "data": { "name": "Bob" }
  }
}
```

Response: `{ "_id": "users/bob456" }`

### Creating an Edge

Connect Alice and Bob as friends:

```json
{
  "name": "create_edge",
  "arguments": {
    "collection": "friendships",
    "from": "users/alice123",
    "to": "users/bob456",
    "data": {
      "since": "2024-01-15",
      "type": "friend"
    }
  }
}
```

### Querying Edges

Find all of Alice's outgoing edges:

```aql
FOR edge IN friendships
  FILTER edge._from == "users/alice123"
  RETURN edge
```

## Graph Traversal

Graph traversals follow edges through your data.

### Simple Traversal

```json
{
  "name": "traverse_graph",
  "arguments": {
    "graphName": "my_graph",
    "startVertex": "users/alice123",
    "direction": "outbound",
    "maxDepth": 3
  }
}
```

### Traversal Directions

- `outbound`: Follow edges from source to target
- `inbound`: Follow edges from target to source  
- `any`: Follow edges in either direction

### AQL Traversal

For more control, use AQL directly:

```aql
FOR vertex, edge, path
IN 1..3 OUTBOUND "users/alice123"
GRAPH "my_graph"
RETURN {
  vertex,
  edge,
  path
}
```

This returns:
- `vertex`: The current vertex
- `edge`: The edge leading to this vertex
- `path`: The full path from start

### Traversal with Filters

```aql
FOR vertex, edge
IN 1..3 OUTBOUND "users/alice123"
GRAPH "my_graph"
FILTER edge.type == "friend"
RETURN vertex
```

## Creating a Graph

A graph in ArangoDB consists of edge definitions that specify which edge collections connect which vertex collections.

```json
{
  "name": "create_graph",
  "arguments": {
    "name": "social_network",
    "edgeDefinitions": [
      {
        "collection": "friendships",
        "from": ["users"],
        "to": ["users"]
      },
      {
        "collection": "follows",
        "from": ["users"],
        "to": ["users"]
      }
    ]
  }
}
```

## Common Patterns

### Friend of a Friend

```aql
FOR user IN users
  LET friends = (
    FOR f, e IN 1..1 OUTBOUND user._id GRAPH "social_network"
    RETURN f
  )
  RETURN {
    user,
    friendCount: LENGTH(friends)
  }
```

### Mutual Friends

```aql
FOR user IN users
  LET mutual = (
    FOR friend1, edge1 IN 1..1 OUTBOUND user._id GRAPH "social_network"
    FOR friend2, edge2 IN 1..1 OUTBOUND friend1._id GRAPH "social_network"
    FILTER friend2._key == user._key AND friend1._key != user._key
    RETURN friend1
  )
  RETURN {
    user,
    mutualFriends: mutual
  }
```
