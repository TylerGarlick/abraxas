"""Minimal Starlette UI for chatting with Ollama/docker models."""

from __future__ import annotations

import argparse
import json
from typing import Any, Dict, Optional

import uvicorn
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, JSONResponse
from starlette.routing import Route

from abraxas.ai import OllamaClient, load_genesis


async def _chat_endpoint(request: Request) -> JSONResponse:
    app_client: OllamaClient = request.app.state.ollama_client
    body = await request.json()
    message = body.get("message", "")
    history = body.get("history")
    model = body.get("model")

    if not message:
        return JSONResponse({"error": "message is required"}, status_code=400)

    result = await app_client.chat(user_message=message, history=history, model=model)
    return JSONResponse({"content": result["content"], "model": result["model"]})


async def _index_endpoint(request: Request) -> HTMLResponse:
    genesis_preview = request.app.state.genesis_prompt[:400]
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Abraxas Chat UI</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 24px; background: #f9fafb; }}
            #chat {{ border: 1px solid #ddd; padding: 16px; height: 320px; overflow-y: auto; background: #fff; }}
            #input {{ width: 100%; padding: 10px; margin-top: 12px; }}
            button {{ padding: 10px 16px; margin-top: 8px; }}
            .msg-user {{ color: #2563eb; }}
            .msg-ai {{ color: #16a34a; }}
            .meta {{ color: #555; font-size: 12px; }}
        </style>
    </head>
    <body>
        <h2>Abraxas Chat</h2>
        <p class="meta">Default model: mistral. Genesis loaded (preview): {genesis_preview}...</p>
        <div id="chat"></div>
        <textarea id="input" rows="3" placeholder="Type your message"></textarea><br />
        <button onclick="send()">Send</button>

        <script>
            const chatBox = document.getElementById('chat');
            async function send() {{
                const text = document.getElementById('input').value.trim();
                if (!text) return;
                append('You', text, 'msg-user');
                document.getElementById('input').value = '';
                const resp = await fetch('/api/chat', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ message: text }})
                }});
                const data = await resp.json();
                append('AI', data.content || data.error || 'No response', 'msg-ai');
            }}
            function append(sender, text, cls) {{
                const div = document.createElement('div');
                div.className = cls;
                div.innerText = sender + ': ' + text;
                chatBox.appendChild(div);
                chatBox.scrollTop = chatBox.scrollHeight;
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(html)


def create_app(ollama_client: Optional[OllamaClient] = None) -> Starlette:
    """Create the Starlette application, loading genesis at startup."""
    genesis_prompt = load_genesis()
    client = ollama_client or OllamaClient(system_prompt=genesis_prompt)
    routes = [
        Route("/", _index_endpoint, methods=["GET"]),
        Route("/api/chat", _chat_endpoint, methods=["POST"]),
    ]
    app = Starlette(routes=routes)
    app.state.ollama_client = client
    app.state.genesis_prompt = genesis_prompt
    return app


def run_ui(host: str = "0.0.0.0", port: int = 3000, reload: bool = False) -> None:
    """Run the UI server."""
    app = create_app()
    uvicorn.run(app, host=host, port=port, reload=reload)


def main() -> None:
    parser = argparse.ArgumentParser(description="Start the Abraxas chat UI.")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind")
    parser.add_argument("--port", type=int, default=3000, help="Port to bind")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    args = parser.parse_args()
    run_ui(host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
