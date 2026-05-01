from mcp.server.fastmcp import FastMCP
from skills.guardrail_monitor.python.logic import GuardrailLogic

mcp = FastMCP("guardrail-monitor")
logic = GuardrailLogic()

@mcp.tool()
def check_value_saliency(topic: str, decision_context: str = None, user_values: list = None) -> str:
    """Check value saliency for a given topic or decision."""
    result = logic.pathos.check_value_saliency(topic, decision_context, user_values)
    return str(result)

@mcp.tool()
def verify_ground_truth(claim: str, sources: list = None, require_min_sources: int = 2) -> str:
    """Verify a claim against ground truth using source reliability and agreement."""
    result = logic.pheme.verify_ground_truth(claim, sources, require_min_sources)
    return str(result)

@mcp.tool()
def arbitrate_conflict(claimA: str, claimB: str, sourceA: str, sourceB: str, domain: str = "general") -> str:
    """Arbitrate a conflict between two claims using authority precedence and domain rules."""
    result = logic.kratos.arbitrate_conflict(claimA, claimB, sourceA, sourceB, domain)
    return str(result)
