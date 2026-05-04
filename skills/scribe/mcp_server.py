from mcp.server.fastmcp import FastMCP
from python.logic import logic

mcp = FastMCP("Sovereign Scribe")


@mcp.tool()
def ingest_fragment(fragment: str, source: str) -> str:
    """
    Ingests a fragment of external data through the Sovereign Gauntlet.
    """
    import json

    result = logic.run_gauntlet(fragment, source)
    return json.dumps(result, indent=2)


if __name__ == "__main__":
    mcp.run()
