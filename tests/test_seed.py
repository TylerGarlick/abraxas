"""Tests for the seed module."""

from unittest.mock import MagicMock

from abraxas.seed import seed_database


def test_seed_database_inserts_and_updates():
    db = MagicMock()
    topics = MagicMock()
    sources = MagicMock()
    users = MagicMock()

    db.has_collection.side_effect = [False, False, False]
    db.create_collection.side_effect = [topics, sources, users]
    topics.count.return_value = 2
    sources.count.return_value = 2
    users.count.return_value = 1
    users.delete_match.return_value = {"deleted": 1}
    db.aql.execute.return_value = [{"topic": {"_key": "topic-ai"}, "sources": []}]

    summary = seed_database(db)

    assert summary["collections"]["topics"] == 2
    assert summary["deleted_users"] == 1
    db.create_collection.assert_any_call("topics")
    db.create_collection.assert_any_call("sources")
    db.create_collection.assert_any_call("users")
    topics.update_match.assert_called_once()
    users.delete_match.assert_called_once()
