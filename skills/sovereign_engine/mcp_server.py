from mcp.server.fastmcp import FastMCP
from skills.sovereign_engine.python.logic import SovereignEngineLogic

mcp = FastMCP("sovereign-engine")
logic = SovereignEngineLogic()

@mcp.tool()
def calculate_sovereign_weight(risk_scores: list[float], target_index: int, lambda_val: float = None) -> str:
    """Calculate sovereign weight using softmax-like distribution of risk scores."""
    result = logic.calculate_sovereign_weight(risk_scores, target_index, lambda_val)
    return str(result)

@mcp.tool()
def compute_integrated_confidence(arch_conf: float, rlcr_score: float, alpha: float = None) -> str:
    """Compute integrated confidence using linear combination of architecture confidence and RLCR."""
    result = logic.compute_integrated_confidence(arch_conf, rlcr_score, alpha)
    return str(result)

@mcp.tool()
def calculate_rlcr(history: list[bool]) -> str:
    """Calculate Reliability-Lattice Confidence Rate (RLCR) based on historical correctness."""
    result = logic.calculate_rlcr(history)
    return str(result)

@mcp.tool()
def verify_consensus(answers: list[str], threshold: int = None) -> str:
    """Verify if a consensus has been reached across multiple answers."""
    result = logic.verify_consensus(answers, threshold)
    return str(result)

@mcp.tool()
def get_epistemic_label(confidence: float) -> str:
    """Map confidence score to an epistemic label."""
    result = logic.get_epistemic_label(confidence)
    return str(result)
