"""AI helpers for Ollama/docker-hosted models and prompt loading."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import httpx

DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
DEFAULT_OLLAMA_URL = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GENESIS_PATH = os.getenv("ABRAXAS_GENESIS_PATH", "genesis.md")


def load_genesis(path: str | Path = GENESIS_PATH) -> str:
    """Load the genesis/system prompt from disk."""
    try:
        return Path(path).read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return "Follow the Abraxas constitution and act safely and transparently."


class OllamaClient:
    """Lightweight async client for Ollama/docker models."""

    def __init__(
        self,
        base_url: str = DEFAULT_OLLAMA_URL,
        model: str = DEFAULT_MODEL,
        system_prompt: Optional[str] = None,
        client_factory: Optional[Callable[[], httpx.AsyncClient]] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.system_prompt = system_prompt or load_genesis()
        self._client_factory = client_factory or (
            lambda: httpx.AsyncClient(base_url=self.base_url, timeout=30.0)
        )

    async def chat(
        self,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a chat message to the configured model."""
        messages: List[Dict[str, str]] = [{"role": "system", "content": self.system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": model or self.model,
            "messages": messages,
            "stream": False,
        }

        async with self._client_factory() as client:
            response = await client.post("/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()

        message = data.get("message") or {}
        content = message.get("content") or data.get("response") or ""
        return {"model": payload["model"], "content": content, "raw": data}


def chat_sync(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    model: Optional[str] = None,
    client: Optional[OllamaClient] = None,
) -> Dict[str, Any]:
    """Synchronous helper for environments that prefer blocking calls."""
    ollama = client or OllamaClient()
    return asyncio.run(ollama.chat(user_message=user_message, history=history, model=model))
