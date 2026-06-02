from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from .python.logic import EpistemicAtlas
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Epistemic Atlas tools to the Abraxas MCP server."""
    from infra.mcp.main import db_manager
    atlas = EpistemicAtlas()

    @mcp.tool()
    def trace_belief(belief_id: str) -> str:
        """
        Traces a specific belief back to its root evidence fragments, 
        providing the complete provenance chain and integrity hash.
        """
        try:
            result = atlas.trace_provenance(belief_id)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def map_domain(domain: str) -> str:
        """
        Generates a topological map of the epistemic state of a specific domain,
        showing the balance of verified truths vs. unknown voids.
        """
        try:
            result = atlas.map_epistemic_state(domain)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def identify_gaps(belief_id: str) -> str:
        """
        Identifies the specific evidence fragments required to resolve 
        an [UNKNOWN] state for a given belief.
        """
        try:
            result = atlas.find_missing_fragments(belief_id)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})


    @mcp.tool()
    def map_domain(domain: str) -> str:
        """
        Generates a topological map of the epistemic state of a specific domain,
        showing the balance of verified truths vs. unknown voids.
        """
        try:
            result = atlas.map_epistemic_state(domain)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def identify_gaps(belief_id: str) -> str:
        """
        Identifies the specific evidence fragments required to resolve 
        an [UNKNOWN] state for a given belief.
        """
        try:
            result = atlas.find_missing_fragments(belief_id)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
