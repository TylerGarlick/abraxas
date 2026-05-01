from mcp.server.fastmcp import FastMCP
from skills.ethos.python.logic import logic

mcp = FastMCP("Ethos Credibility")


@mcp.tool()
def ethos_score(source: str) -> str:
    """
    Determine the credibility tier of a specific information source.
    """
    return logic.get_score(source)


@mcp.tool()
def ethos_resolve(source_a: str, source_b: str) -> str:
    """
    Resolve a conflict between two sources based on their credibility weights.
    """
    return logic.resolve_conflict(source_a, source_b)


if __name__ == "__main__":
    mcp.run()
