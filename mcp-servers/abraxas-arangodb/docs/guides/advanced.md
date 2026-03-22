# Advanced Guide

This guide covers performance optimization, index strategies, and complex traversals.

## Index Strategies

Indexes are critical for query performance. Without them, ArangoDB must scan every document.

### Primary Index

Every collection has a primary index on `_key`. Queries by `_id` or `_key` are always fast.

### Edge Index

Edge collections have an edge index on `_from` and `_to`. This makes graph traversals efficient.

### Hash Indexes

Best for equality comparisons:

```aql
// Create hash index on email
db.users.ensureIndex({
  type: "hash",
  fields: ["email"],
  unique: true
})
```

Use when:
- You frequently filter by exact value (` FILTER user.email == "x"`)
- You need uniqueness enforcement

### Skiplist Indexes

Best for range queries and sorting:

```aql
// Create skiplist index on age
db.users.ensureIndex({
  type: "skiplist",
  fields: ["age"]
})
```

Use when:
- You frequently sort results (`SORT user.age ASC`)
- You use range queries (`FILTER user.age >= 21`)

### Persistent Indexes

Best for large datasets with infrequent updates:

```aql
db.users.ensureIndex({
  type: "persistent",
  fields: ["city", "age"]
})
```

### View Indexes (ArangoSearch)

For full-text search and faceted search:

```aql
db._createView("users_view", "arangosearch", {
  links: {
    users: {
      fields: {
        name: { analyzers: ["text_en"] },
        bio: { analyzers: ["text_en"] }
      }
    }
  }
})
```

## Query Optimization

### Use EXPLAIN

Before running a query, analyze its execution plan:

```aql
EXPLAIN FOR user IN users
  FILTER user.city == "NYC"
  RETURN user
```

Look for:
- `INDEX` nodes (good - using an index)
- `COLLECTION SCAN` nodes (bad - full collection scan)

### Covering Indexes

Include all requested fields in the index to avoid fetching the full document:

```aql
// Index covers this query
db.users.ensureIndex({
  type: "hash",
  fields: ["city", "name", "email"]
})

// Query can be satisfied from index alone
FOR user IN users
  FILTER user.city == "NYC"
  RETURN { name: user.name, email: user.email }
```

### Limit Early

Reduce data as early as possible in the query:

```aql
// Good: Filter and limit before joining
FOR order IN orders
  FILTER order.status == "pending"
  LIMIT 100
  FOR customer IN customers
    FILTER customer._id == order.customerId
    RETURN { order, customer }
```

### Avoid COLLECT with many groups

Grouping large result sets is expensive. Consider:

```aql
// Instead of collecting all users
FOR user IN users
  COLLECT city = user.city INTO users
  RETURN { city, count: LENGTH(users) }

// Pre-aggregate with more memory
FOR user IN users
  COLLECT WITH COUNT INTO city
  SORT city.count DESC
  RETURN city
```

## Complex Graph Traversals

### Variable Length Traversal

Find all friends, friends-of-friends, etc. up to N degrees:

```aql
FOR user IN users
  FOR friend, edge, path
  IN 1..5 OUTBOUND user._id
  GRAPH "social_network"
  FILTER LENGTH(path.edges) <= 2  // Only up to 2nd degree
  RETURN {
    user,
    friend,
    degree: LENGTH(path.edges)
  }
```

### Shortest Path

Find the shortest path between two vertices:

```aql
FOR v, e, p
IN ANY SHORTEST_PATH
"users/alice" TO "users/charlie"
GRAPH "social_network"
RETURN p
```

### k-Path Queries

Find all paths of exactly K length:

```aql
FOR start IN users
  FOR end IN users
  FILTER start._key != end._key
  FOR vertex, edge, path
  IN 3..3 OUTBOUND start._id
  GRAPH "social_network"
  FILTER vertex._id == end._id
  RETURN {
    start: start.name,
    end: end.name,
    path: path.edges
  }
```

## Transactions

ArangoDB supports single-document and AQL transactions.

### Single Collection Transactions

```aql
LET doc = FIRST(FOR d IN coll FILTER d._key == "key" RETURN d)
IF (doc) {
  UPDATE doc WITH { updated: true } IN coll
}
RETURN doc
```

### Transaction Boundaries

For multi-collection operations, use JavaScript transactions via the `@arangodb` module:

```javascript
const db = require('@arangodb').db;

const tx = db._transaction({
  collections: {
    write: ['orders', 'inventory', 'audit']
  }
}, function() {
  const order = db.orders.insert({ item: 'widget', qty: 1 });
  db.inventory.update('widget', { qty: db.inventory.document('widget').qty - 1 });
  db.audit.insert({ action: 'order', orderId: order._key, ts: DATE_NOW() });
  return order;
});

return order;
```

## Performance Tuning

### Memory

Configure ArangoDB's memory limits:

```yaml
# arangod.conf
[server]
max-memory-usage = 4294967296  # 4GB
```

### Write Buffer Size

For write-heavy workloads:

```yaml
[rocksdb]
write-buffer-size = 67108864  # 64MB per write buffer
```

### Cache Size

For read-heavy workloads with small datasets:

```yaml
[rocksdb]
cache.size = 2147483648  # 2GB block cache
```

### Connection Pooling

Use connection pooling for high-throughput applications:

```javascript
const db = require('arangodb').db;

// Configure connection pool
db._createDatabase('myapp', {
  replicationFactor: 1,
  writeConcern: 1
});
```
