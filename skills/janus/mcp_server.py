from mcp.server.fastmcp import FastMCP
from skills.janus.python.logic import logic

mcp = FastMCP("Janus Orchestrator")


@mcp.tool()
def janus_switch_mode(mode: str, reason: str = "Soter Trigger") -> str:
    """
    Switch the cognitive mode between NOX (Intuitive) and SOL (Analytical).
    """
    res = logic.switch_mode(mode, reason)
    return (
        f"Janus Mode Switch:\n"
        f"- New Mode: {res['new_mode']} ({res['description']})\n"
        f"- Reason: {res['reason']}\n"
        f"- Weights: {res['weights']}\n"
        f"- Action: Cognitive state transitioned."
    )


@mcp.tool()
def janus_spawn_paths(query: str, m_paths: int = 5) -> str:
    """
    Spawn M independent reasoning paths with specific epistemic lenses.
    """
    paths = logic.spawn_paths(query, m_paths)
    lenses_assigned = [p["lens"] for p in paths]

    return (
        f"Janus Sovereign Spawning:\n"
        f"- Query: {query}\n"
        f"- Paths Spawned: {len(paths)}\n"
        f"- Lenses Assigned: {', '.join(lenses_assigned)}\n"
        f"- Status: Ready for independent reasoning."
    )


@mcp.tool()
def janus_resolve_consensus(path_results: list[str]) -> str:
    """
    Apply the N-of-M deterministic agreement rule to a set of reasoning paths.
    """
    res = logic.resolve_consensus(path_results)
    status = "EMITTED" if res.is_sovereign else "BLOCKED"

    return (
        f"Janus Consensus Resolution:\n"
        f"- Best Claim: {res.best_claim}\n"
        f"- Votes: {res.max_votes}/{res.total_paths}\n"
        f"- Seal: {res.seal}\n"
        f"- Result: {status}"
    )


@mcp.tool()
def analyze_mode_bias(mode: str = "BALANCED") -> str:
    """
    Detect blind spots in the current cognitive mode.
    """
    res = logic.analyze_bias(mode)
    return f"Bias Analysis: {res['mode']} mode is {res['bias']} (Risk: {res['risk']})"


@mcp.tool()
def merge_perspectives(sol_output: str, nox_output: str) -> str:
    """
    Synthesize Sol and Nox perspectives.
    """
    res = logic.merge_perspectives(sol_output, nox_output)
    return f"Synthesis: {res['synthesis']} (Confidence: {res['confidence']})"


if __name__ == "__main__":
    mcp.run()
