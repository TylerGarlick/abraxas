import threading
from fastapi import FastAPI, Response
import uvicorn
from mcp.server.fastmcp import FastMCP
from infra.mcp.context import get_context
from infra.mcp.registry import MCPRegistry
from infra.mcp.db_manager import DBManager

mcp = FastMCP("abraxas-os", host="0.0.0.0")
context = get_context()
registry = MCPRegistry(mcp, context)
db_manager = DBManager(context)

health_app = FastAPI(title="Abraxas Sovereign Monitor")


@health_app.get("/health")
async def health_check():
    db_ok = db_manager.connect()
    skills_loaded = len(registry.get_registered_modules()) > 0

    root_ok = True
    try:
        import os
        root_ok = os.path.exists(context.root_dir)
    except Exception:
        root_ok = False

    if db_ok and skills_loaded and root_ok:
        return {
            "status": "Sovereign Mode",
            "db": "connected",
            "skills_count": len(registry.get_registered_modules()),
            "filesystem": "verified",
        }

    return Response(
        content='{"status": "Simulation Mode", "db": "disconnected", "skills": "incomplete"}',
        status_code=503,
        media_type="application/json",
    )


@mcp.tool()
def system_mode_health_check() -> str:
    db_ok = db_manager.connect()
    skills_loaded = len(registry.get_registered_modules()) > 0
    root_ok = True
    try:
        import os
        root_ok = os.path.exists(context.root_dir)
    except Exception:
        root_ok = False

    if db_ok and skills_loaded and root_ok:
        return "Sovereign Mode"
    return "Simulation Mode"


def _start_health_server():
    uvicorn.run(health_app, host="0.0.0.0", port=9901, log_level="info")


def main():
    print("Starting Abraxas Unified MCP Server...")

    if db_manager.connect():
        print("Database connection established. Running schema checks...")
        db_manager.initialize_schema([])
    else:
        print("Warning: Database connection failed. Server will start in Simulation Mode.")

    registry.load_skills()
    print(f"Successfully loaded {len(registry.get_registered_modules())} skill modules.")

    threading.Thread(target=_start_health_server, daemon=True).start()
    print("Health monitor running on port 9901.")

    print("Launching MCP SSE transport on port 9900...")
    sse_app = mcp.streamable_http_app()
    uvicorn.run(sse_app, host="0.0.0.0", port=9900, log_level="info")


if __name__ == "__main__":
    main()
