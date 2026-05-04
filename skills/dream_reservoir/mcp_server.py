from mcp.server.fastmcp import FastMCP
from python.logic import logic

mcp = FastMCP("Dream Reservoir")


@mcp.tool()
def query_provenance(entity_id: str, entity_type: str) -> str:
    """
    Retrieve provenance chain from the ArangoDB reservoir.
    """
    import json

    results = logic.query_provenance(entity_id, entity_type)
    return json.dumps(results, indent=2)


if __name__ == "__main__":
    mcp.run()
