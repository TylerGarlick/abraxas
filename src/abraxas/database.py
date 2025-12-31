"""
ArangoDB database client module.
"""

from typing import Any, Optional

from arango import ArangoClient
from arango.database import StandardDatabase


class ArangoDBClient:
    """Client for connecting to and interacting with ArangoDB."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 8529,
        username: str = "root",
        password: str = "",
        database: str = "_system",
    ) -> None:
        """
        Initialize ArangoDB client.

        Args:
            host: ArangoDB server host
            port: ArangoDB server port
            username: Database username
            password: Database password
            database: Database name to connect to
        """
        self.host = host
        self.port = port
        self.username = username
        self.database_name = database

        # Create ArangoDB client
        self._client = ArangoClient(hosts=f"http://{host}:{port}")

        # Connect to the database
        self._db: Optional[StandardDatabase] = None
        self._connect(password)

    def _connect(self, password: str) -> None:
        """
        Connect to the ArangoDB database.

        Args:
            password: Database password

        Raises:
            ConnectionError: If connection fails
        """
        try:
            self._db = self._client.db(
                self.database_name, username=self.username, password=password
            )
        except Exception as e:
            raise ConnectionError(f"Failed to connect to ArangoDB: {e}") from e

    def get_version(self) -> str:
        """
        Get ArangoDB version.

        Returns:
            Version string

        Raises:
            RuntimeError: If database is not connected
        """
        if not self._db:
            raise RuntimeError("Database not connected")
        version_info = self._db.version()
        return version_info

    def get_database(self) -> StandardDatabase:
        """
        Get the database instance.

        Returns:
            StandardDatabase instance

        Raises:
            RuntimeError: If database is not connected
        """
        if not self._db:
            raise RuntimeError("Database not connected")
        return self._db

    def create_collection(self, name: str, **kwargs: Any) -> dict[str, Any]:
        """
        Create a new collection.

        Args:
            name: Collection name
            **kwargs: Additional collection options

        Returns:
            Collection information

        Raises:
            RuntimeError: If database is not connected
        """
        if not self._db:
            raise RuntimeError("Database not connected")
        collection = self._db.create_collection(name, **kwargs)
        return {"name": collection.name, "count": collection.count()}

    def has_collection(self, name: str) -> bool:
        """
        Check if collection exists.

        Args:
            name: Collection name

        Returns:
            True if collection exists, False otherwise

        Raises:
            RuntimeError: If database is not connected
        """
        if not self._db:
            raise RuntimeError("Database not connected")
        return self._db.has_collection(name)

    def close(self) -> None:
        """Close the database connection."""
        # ArangoDB Python driver doesn't need explicit closing
        self._db = None
