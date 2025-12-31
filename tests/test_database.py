"""Tests for the database module."""

from unittest.mock import MagicMock, patch

import pytest

from abraxas.database import ArangoDBClient


class TestArangoDBClient:
    """Test cases for ArangoDBClient."""

    @patch("abraxas.database.ArangoClient")
    def test_initialization(self, mock_arango_client, sample_config):
        """Test ArangoDBClient initialization."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient(**sample_config)

        assert client.host == sample_config["host"]
        assert client.port == sample_config["port"]
        assert client.username == sample_config["username"]
        assert client.database_name == sample_config["database"]
        mock_arango_client.assert_called_once_with(
            hosts=f"http://{sample_config['host']}:{sample_config['port']}"
        )
        mock_client_instance.db.assert_called_once_with(
            sample_config["database"],
            username=sample_config["username"],
            password=sample_config["password"],
        )

    @patch("abraxas.database.ArangoClient")
    def test_get_version(self, mock_arango_client):
        """Test get_version method."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_db.version.return_value = "3.11.0"
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient()
        version = client.get_version()

        assert version == "3.11.0"
        mock_db.version.assert_called_once()

    @patch("abraxas.database.ArangoClient")
    def test_get_database(self, mock_arango_client):
        """Test get_database method."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient()
        db = client.get_database()

        assert db == mock_db

    @patch("abraxas.database.ArangoClient")
    def test_get_database_not_connected(self, mock_arango_client):
        """Test get_database when not connected."""
        mock_client_instance = MagicMock()
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = None

        client = ArangoDBClient()
        client._db = None

        with pytest.raises(RuntimeError, match="Database not connected"):
            client.get_database()

    @patch("abraxas.database.ArangoClient")
    def test_create_collection(self, mock_arango_client):
        """Test create_collection method."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_collection = MagicMock()
        mock_collection.name = "test_collection"
        mock_collection.count.return_value = 0
        mock_db.create_collection.return_value = mock_collection
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient()
        result = client.create_collection("test_collection")

        assert result["name"] == "test_collection"
        assert result["count"] == 0
        mock_db.create_collection.assert_called_once_with("test_collection")

    @patch("abraxas.database.ArangoClient")
    def test_has_collection(self, mock_arango_client):
        """Test has_collection method."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_db.has_collection.return_value = True
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient()
        exists = client.has_collection("test_collection")

        assert exists is True
        mock_db.has_collection.assert_called_once_with("test_collection")

    @patch("abraxas.database.ArangoClient")
    def test_close(self, mock_arango_client):
        """Test close method."""
        mock_client_instance = MagicMock()
        mock_db = MagicMock()
        mock_arango_client.return_value = mock_client_instance
        mock_client_instance.db.return_value = mock_db

        client = ArangoDBClient()
        client.close()

        assert client._db is None

    @patch("abraxas.database.ArangoClient")
    def test_connection_error(self, mock_arango_client):
        """Test connection error handling."""
        mock_client_instance = MagicMock()
        mock_client_instance.db.side_effect = Exception("Connection failed")
        mock_arango_client.return_value = mock_client_instance

        with pytest.raises(ConnectionError, match="Failed to connect to ArangoDB"):
            ArangoDBClient()
