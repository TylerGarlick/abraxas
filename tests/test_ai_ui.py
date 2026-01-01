"""Tests for AI helpers and UI."""

import asyncio
from pathlib import Path

import pytest
from starlette.testclient import TestClient

from abraxas.ai import OllamaClient, chat_sync, load_genesis
from abraxas.ui import create_app


def test_load_genesis_reads_file(tmp_path: Path):
    file_path = tmp_path / "genesis.md"
    file_path.write_text("System rules", encoding="utf-8")
    assert load_genesis(file_path) == "System rules"


@pytest.mark.asyncio
async def test_ollama_client_chat_builds_payload():
    recorded = {}

    class MockResponse:
        def __init__(self):
            self._json = {"message": {"content": "hi there"}}

        def raise_for_status(self):
            return None

        def json(self):
            return self._json

    class MockClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, json):
            recorded["url"] = url
            recorded["json"] = json
            return MockResponse()

    client = OllamaClient(system_prompt="sys", client_factory=lambda: MockClient())
    result = await client.chat("Hello", history=[{"role": "assistant", "content": "prev"}])

    assert result["content"] == "hi there"
    assert recorded["url"] == "/api/chat"
    assert recorded["json"]["model"] == "mistral"
    assert recorded["json"]["messages"][0]["role"] == "system"


def test_ui_chat_endpoint_uses_ollama_client():
    events = {}

    class DummyClient:
        async def chat(self, user_message, history=None, model=None):
            events["user_message"] = user_message
            return {"content": "echo", "model": model or "mistral"}

    app = create_app(ollama_client=DummyClient())
    with TestClient(app) as client:
        resp = client.post("/api/chat", json={"message": "hi"})
        assert resp.status_code == 200
        assert resp.json()["content"] == "echo"
        assert events["user_message"] == "hi"


def test_create_app_loads_genesis(monkeypatch):
    monkeypatch.setattr("abraxas.ui.load_genesis", lambda: "Constitution!")

    app = create_app()
    assert app.state.genesis_prompt == "Constitution!"
    assert getattr(app.state.ollama_client, "system_prompt") == "Constitution!"


def test_chat_sync_uses_client():
    class DummyClient:
        async def chat(self, user_message, history=None, model=None):
            return {"content": f"echo:{user_message}", "model": model or "mistral"}

    result = chat_sync("ping", client=DummyClient())
    assert result["content"] == "echo:ping"


def test_ui_root_shows_genesis_preview(monkeypatch):
    monkeypatch.setattr("abraxas.ui.load_genesis", lambda: "PreviewGenesis")

    class DummyClient:
        async def chat(self, user_message, history=None, model=None):
            return {"content": "ok", "model": "mistral"}

    app = create_app(ollama_client=DummyClient())
    with TestClient(app) as client:
        resp = client.get("/")
        assert resp.status_code == 200
        assert "PreviewGenesis" in resp.text
