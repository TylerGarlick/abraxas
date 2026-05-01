from mcp.server.fastmcp import FastMCP
from skills.mnemosyne.python.logic import logic

mcp = FastMCP("Mnemosyne Memory")


@mcp.tool()
def mnemosyne_recall(query: str) -> str:
    """
    Retrieve a verified knowledge fragment from the Sovereign Vault.
    """
    fragment = logic.recall(query)
    if fragment:
        return (
            f"Recalled Fragment: {fragment.fragment}\nProvenance: {fragment.provenance}"
        )
    return "No matching fragment found in the Sovereign Vault."


@mcp.tool()
def mnemosyne_store(fragment: str, provenance: str) -> str:
    """
    Store a verified truth fragment into the Sovereign Vault.
    """
    frag_id = logic.store(fragment, provenance)
    return f"Sovereign Truth stored successfully. ID: {frag_id}"


if __name__ == "__main__":
    mcp.run()
