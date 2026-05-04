from fastmcp import FastMCP
from python.logic import soter_logic

mcp = FastMCP("soter-verifier")

@mcp.tool()
def verify_claim(claim: str, context: str = "") -> str:
    """Run Soter's verification pipeline on a claim."""
    import json
    result = soter_logic.verify_claim(claim, context)
    return json.dumps(result, indent=2)

@mcp.tool()
def run_soter_query(query_type: str, input_text: str, options: dict = None) -> str:
    """
    Execute a custom Soter query. 
    Query types: assess, detect_patterns, get_pattern, list_patterns, ledger_view, ledger_stats, get_incident
    """
    import json
    options = options or {}
    
    if query_type == "assess":
        res = soter_logic.assess_risk_heuristic(input_text)
        return json.dumps({
            "type": "risk_assessment", 
            "result": {"score": res.score, "patterns": [p.id for p in res.patterns], "explanation": res.explanation},
            "timestamp": res.trigger
        }, indent=2)
    
    elif query_type == "detect_patterns":
        res = soter_logic.assess_risk_heuristic(input_text)
        return json.dumps({
            "type": "pattern_detection",
            "patterns": [p.__dict__ for p in res.patterns],
            "overallRisk": res.score,
        }, indent=2)
    
    elif query_type == "list_patterns":
        return json.dumps({
            "type": "pattern_library",
            "patterns": soter_logic.risk_keywords,
        }, indent=2)
    
    # Ledger functions would be implemented here via DB calls
    return json.dumps({"error": "Query type not yet fully implemented in Python logic layer"}, indent=2)

@mcp.tool()
def check_constitution_adherence(response: str, request: str = "") -> str:
    """Verify if a response adheres to the Abraxas Soter Constitution."""
    import json
    result = soter_logic.check_constitution_adherence(response, request)
    return json.dumps(result, indent=2)

@mcp.tool()
def soter_assess(query: str, attention_weights: dict) -> str:
    """Analyze query and attention weights to detect a potential epistemic crisis."""
    import json
    result = soter_logic.assess_risk_mechanistic(query, attention_weights)
    
    decision = "🚨 EPISTEMIC CRISIS DETECTED" if result["trigger"] == 1 else "✅ Stable"
    action = "Rerouting to Consensus Verification Pipeline" if result["trigger"] == 1 else "Continue Probabilistic Generation"
    
    return f"Soter Risk Assessment:\n- Trigger Value (T): {result['trigger']}\n- Risk Score (R): {result['risk']}\n- Reason: {result['reason']}\n- Decision: {decision}\n- Action: {action}"

@mcp.tool()
def soter_trigger(reason: str) -> str:
    """Manually trigger an Epistemic Crisis signal (T=1) to force SOL mode."""
    return f"Soter Manual Trigger:\n- Status: T=1 (FORCED)\n- Reason: {reason}\n- Action: Immediate transition to SOL mode and multi-path spawning."
