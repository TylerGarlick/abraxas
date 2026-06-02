from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from .python.logic import SovereignAnchor
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Sovereign Anchor tools to the Abraxas MCP server."""
    from infra.mcp.main import db_manager
    anchor = SovereignAnchor(db_manager)

    @mcp.tool()
    def anchor_truth(content: str, metadata: str = "{}") -> str:
        """
        Privileged write-operation to inject an immutable Genesis Block into the Sovereign Brain.
        Use this to establish non-negotiable ground truth.
        """
        try:
            meta_dict = json.loads(metadata)
        except:
            meta_dict = {"raw_metadata": metadata}
            
        key = anchor.anchor_truth(content, meta_dict)
        return f"SUCCESS: Genesis Block anchored with key: {key}"

    @mcp.tool()
    def verify_anchor(key: str) -> str:
        """
        Verifies the existence and integrity of a specific Genesis Block.
        """
        from infra.mcp.main import db_manager
        doc = db_manager.db.collection("fragments").get(key)
        if doc:
            return f"VERIFIED: Anchor {key} exists. Content: {doc['content']}"
        return f"ERROR: Anchor {key} not found."
