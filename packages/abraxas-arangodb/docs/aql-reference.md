# AQL Reference

Quick reference for ArangoDB Query Language (AQL).

## Data Modification

### INSERT

```aql
INSERT {
  name: "Alice",
  age: 30
} INTO users
RETURN NEW
```

### UPDATE

```aql
FOR user IN users
  FILTER user._key == "alice123"
  UPDATE user WITH {
    age: 31
  } IN users
RETURN NEW
```

### REPLACE

```aql
FOR user IN users
  FILTER user._key == "alice123"
  REPLACE user WITH {
    _key: "alice123",
    name: "Alice Updated",
    age: 31
  } IN users
RETURN NEW
```

### REMOVE

```aql
FOR user IN users
  FILTER user._key == "alice123"
  REMOVE user IN users
RETURN OLD
```

## Reading Data

### FOR...RETURN

```aql
FOR user IN users
  RETURN user
```

### FILTER

```aql
FOR user IN users
  FILTER user.age >= 18
  FILTER user.active == true
  RETURN user
```

### SORT

```aql
FOR user IN users
  SORT user.name ASC
  RETURN user
```

### LIMIT

```aql
FOR user IN users
  LIMIT 10
  RETURN user
```

### DISTINCT

```aql
FOR user IN users
  RETURN DISTINCT user.city
```

### PAGINATION

```aql
FOR user IN users
  SORT user.name
  LIMIT 25
  OFFSET 50
  RETURN user
```

## Operators

### Comparison

| Operator | Description |
|----------|-------------|
| `==` | Equality |
| `!=` | Inequality |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |

### Logical

| Operator | Description |
|----------|-------------|
| `AND` | Logical AND |
| `OR` | Logical OR |
| `NOT` | Logical NOT |

### Arithmetic

```aql
LET x = 10 + 5    // 15
LET y = 10 - 3    // 7
LET z = 10 * 2    // 20
LET w = 10 / 2    // 5
LET v = 10 % 3    // 1
```

### String

```aql
CONCAT("Hello", " ", "World")  // "Hello World"
CONCAT_SEP(", ", "a", "b", "c") // "a, b, c"
LEFT("Hello", 2)                // "He"
RIGHT("Hello", 2)               // "lo"
SUBSTITUTE("Hello", "l", "x")   // "Hexxo"
LOWER("HELLO")                  // "hello"
UPPER("hello")                  // "HELLO"
TRIM("  hi  ")                  // "hi"
LIKE("hello", "h%")             // true
REGEX_TEST("hello", "^h")       // true
```

## Functions

### Array

```aql
LENGTH([1, 2, 3])                    // 3
FIRST([1, 2, 3])                     // 1
LAST([1, 2, 3])                      // 3
APPEND([1, 2], [3, 4])               // [1, 2, 3, 4]
FLAT([1, [2, [3]]])                  // [1, 2, 3]
UNIQUE([1, 2, 2, 3])                // [1, 2, 3]
INTERSECTION([1, 2], [2, 3])         // [2]
DIFFERENCE([1, 2], [2, 3])          // [1]
```

### Date

```aql
DATE_NOW()                           // Current timestamp
DATE_TIMESTAMP("2024-01-15")        // Timestamp
DATE_FORMAT(DATE_NOW(), "%y-%m-%d")  // "24-01-15"
DATE_ADD(DATE_NOW(), 86400, "second") // Tomorrow
DATE_DIFF(date1, date2, "day")      // Days between
```

### Type

```aql
IS_NULL(null)                        // true
IS_BOOL(true)                       // true
IS_NUMBER(42)                       // true
IS_STRING("hi")                     // true
IS_ARRAY([1,2])                     // true
IS_OBJECT({"a":1})                  // true
TYPE_NAME(42)                       // "number"
```

### String

```aql
LENGTH("hello")                     // 5
CONCAT("a", "b")                    // "ab"
SUBSTRING("hello", 1, 3)            // "ell"
LIKE("hello", "%ll%")               // true
REGEX_MATCHES("hello", "l+")        // ["ll"]
SPLIT("a-b-c", "-")                 // ["a", "b", "c"]
JOIN(["a", "b"], ",")               // "a,b"
```

### Numeric

```aql
ABS(-5)                             // 5
CEIL(5.3)                           // 6
FLOOR(5.7)                          // 5
ROUND(5.5)                          // 6
SQRT(16)                            // 4
POW(2, 8)                           // 256
LOG(100)                            // ~4.6
EXP(1)                              // ~2.7
PI()                                // 3.14159...
RAND()                              // 0-1 random
```

## Graph Traversal

### Syntax

```aql
FOR vertex, edge, path
IN startDepth..endDepth
DIRECTION
START_VERTEX
GRAPH "graphName"
OPTIONS { }
RETURN { vertex, edge, path }
```

### Directions

- `OUTBOUND`: Follow edges from `_from` to `_to`
- `INBOUND`: Follow edges from `_to` to `_from`
- `ANY`: Follow edges in either direction

### Example

```aql
FOR v, e, p
IN 1..3 OUTBOUND "users/alice"
GRAPH "social_network"
FILTER e.type == "friend"
RETURN {
  vertex: v,
  edge: e,
  depth: LENGTH(p.edges)
}
```

## COLLECT

### Group and Aggregate

```aql
FOR user IN users
  COLLECT city = user.city INTO group
  RETURN {
    city,
    count: LENGTH(group),
    users: group[*].user
  }
```

### With Aggregation

```aql
FOR order IN orders
  COLLECT 
    city = order.city,
    status = order.status
  AGGREGATE
    total = SUM(order.amount),
    avgAmount = AVERAGE(order.amount),
    count = COUNT()
  RETURN {
    city,
    status,
    total,
    avgAmount,
    count
  }
```

### GROUP BY with Rolling Calculations

```aql
FOR sale IN sales
  SORT sale.date ASC
  COLLECT month = DATE_FORMAT(sale.date, "%yyyy-%mm") INTO sales
  LET runningTotal = SUM(sales[*].amount)
  RETURN {
    month,
    monthlyTotal: runningTotal,
    salesCount: LENGTH(sales)
  }
```

## Subqueries

```aql
FOR user IN users
  LET orders = (
    FOR order IN orders
    FILTER order.userId == user._id
    LIMIT 5
    RETURN order
  )
  RETURN {
    user,
    recentOrders: orders,
    orderCount: LENGTH(orders)
  }
```

## Bind Parameters

Use `@` for collection names and `@` prefix for variables:

```aql
FOR doc IN @@collection
  FILTER doc.status == @status
  RETURN doc
```

With bind vars:
```javascript
{
  "@collection": "users",
  "status": "active"
}
```
