from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from .python.logic import AutoAgonLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Auto-Agon tools to the Abraxas MCP server."""
    logic = AutoAgonLogic(mcp)

    @mcp.tool()
    def stress_test_claim(claim_id: str, content: str) -> str:
        """
        Triggers an adversarial 'Red Team' attack on a claim to test its epistemic hardness.
        Returns a hardening score and a detailed attack log.
        """
        try:
            result = logic.trigger_stress_test(claim_id, content)
            status = "HARDENED" if logic.promote_to_truth(result) else "FRAGILE"
            
            output = {
                "claim_id": result.claim_id,
                "status": status,
                "hardening_score": result.hardening_score,
                "attack_log": result.logs,
                "residual_uncertainty": result.residual_uncertainty
            }
            return json.dumps(output, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def audit_hardening_parameters(void_id: str = "all") -> str:
        """
        Audits the internal stress-test thresholds and patterns to identify systemic blind spots.
        """
        try:
            result = logic.self_audit()
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})


    @mcp.tool()
    def audit_hardening_parameters(void_id: str = "all") -> str:
        """
        Audits the internal stress-test thresholds and patterns to identify systemic blind spots.
        """
        try:
            result = logic.self_audit()
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
