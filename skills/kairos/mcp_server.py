from mcp.server.fastmcp import FastMCP
from skills.kairos.python.logic import logic

mcp = FastMCP("Kairos Relevance Filter")


@mcp.tool()
def kairos_filter(query: str, fragments: str) -> str:
    """
    Filter retrieved fragments for maximum epistemic relevance.
    """
    res = logic.filter_fragments(query, fragments)

    return (
        f"Kairos Filter Complete:\n"
        f"- Original Fragments: {res.original_count}\n"
        f"- Filtered Fragments: {res.filtered_count}\n"
        f"- Culling Rate: {res.culling_rate:.1f}%\n\n"
        f"Filtered Context:\n{res.filtered_context}"
    )


@mcp.tool()
def kairos_urgency(query: str) -> str:
    """
    Determine the temporal urgency of a query (Real-time vs Archival).
    """
    res = logic.assess_urgency(query)
    return f"Urgency Assessment:\n- Mode: {res['mode']}\n- Logic: {res['logic']}"


if __name__ == "__main__":
    mcp.run()
