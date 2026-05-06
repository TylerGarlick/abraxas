from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.guardrail.python.logic import logic, GUARDRAIL_STANDARDS

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Guardrail tools to the Abraxas MCP server."""
    
    @mcp.tool()
    def guardrail_audit(output: str, consensus_level: int) -> str:
        """
        Perform a final audit of the synthesized output against the three-fold Sovereign Standard.
        """
        result = logic.verify_sovereign_seal(output, consensus_level)
        
        status = "✅ APPROVED" if result.pass_seal else "❌ VETOED"
        
        return (
            f"Guardrail Final Audit:\n"
            f"- Pathos Check: {GUARDRAIL_STANDARDS['PATHOS']}\n"
            f"- Pheme Check: {GUARDRAIL_STANDARDS['PHEME']}\n"
            f"- Kratos Check: {GUARDRAIL_STANDARDS['KRATOS']}\n"
            f"- Result: {status}\n"
            f"- Detail: {result.reason}"
        )

    @mcp.tool()
    def guardrail_veto(reason: str) -> str:
        """
        Issue a Sovereign Veto, blocking the output and triggering a la-logic retry.
        """
        return (
            f"Sovereign Veto Issued:\n"
            f"- Status: OUTPUT BLOCKED\n"
            f"- Reason: {reason}\n"
            f"- Action: Triggering corrective re-evaluation via Janus."
        )
