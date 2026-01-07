# Database — `abraxas.database`

`ArangoDBClient` is a thin wrapper around the `python-arango` client to make connection, simple operations, and testing easier.

## Class: ArangoDBClient

Constructor arguments:
- `host` (str) — default `localhost`
- `port` (int) — default `8529`
- `username` (str) — default `root`
- `password` (str)
- `database` (str) — default `_system`

### Methods

- `get_version()` -> str
  - Returns ArangoDB version information by calling the underlying database `version()`.
  - Raises `RuntimeError` if not connected.

- `get_database()` -> `StandardDatabase`
  - Returns the connected `python-arango` `StandardDatabase` instance.
  - Raises `RuntimeError` if not connected.

- `create_collection(name: str, **kwargs)` -> dict
  - Creates a collection and returns a dictionary with `name` and `count`.
  - Raises `RuntimeError` if not connected.

- `has_collection(name: str)` -> bool
  - Returns whether a collection exists in the database.
  - Raises `RuntimeError` if not connected.

- `close()` -> None
  - Close/disconnect (for this wrapper it clears the internal reference).

## Example

```python
from abraxas.database import ArangoDBClient

client = ArangoDBClient(host="localhost", port=8529, username="root", password="", database="_system")
version = client.get_version()
print(version)
client.create_collection("my_collection")
client.close()
```

## External

- python-arango docs: https://github.com/arangodb/pyarango and https://www.arangodb.com/docs/
