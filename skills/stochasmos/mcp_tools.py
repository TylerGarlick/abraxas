from typing import Any, Dict, List
from skills.stochasmos.python.planner import StochasmosPlanner
from skills.stochasmos.python.risk import StochasmosRiskAssessor

planner: StochasmosPlanner = None
risk_assessor: StochasmosRiskAssessor = None

def initialize(mcp, context):
    global planner, risk_assessor
    planner = StochasmosPlanner(context.graph_client, context.krisis_client)
    risk_assessor = StochasmosRiskAssessor(context.krisis_client)

def register_tools(mcp: Any, context: Any):
    """Registers Stochasmos tools to the Abraxas MCP server."""
    global planner, risk_assessor
    initialize(mcp, context)

    @mcp.tool()
    async def stochasmos_pressure_point(args: Dict[str, Any]) -> str:
        """Identifies strategic pressure points in discourse."""
        return await stochasmos_pressure_point_impl(mcp, args)

    @mcp.tool()
    async def stochasmos_seed(args: Dict[str, Any]) -> str:
        """Generates a strategic disconfirmation seed."""
        return await stochasmos_seed_impl(mcp, args)

    @mcp.tool()
    async def stochasmos_assess_risk(args: Dict[str, Any]) -> str:
        """Assesses seed risk via Krisis frameworks."""
        return await stochasmos_assess_risk_impl(mcp, args)

async def stochasmos_pressure_point_impl(mcp, args: Dict[str, Any]):
    discourse_id = args.get("discourse_id")
    truths = args.get("truths", [])
    if not discourse_id:
        return "Error: discourse_id required."

    if not planner:
        initialize(mcp, context)


    pp_data = {"target": args.get("target", "undisclosed claim"), "tension_index": 0.65}
    seed = planner.generate_seed(pressure_point_id, pp_data)

    output = f"[STOCHASMOS SEED: {seed.id}]\n"
    output += f"Target Pressure Point: {seed.pressure_point_id}\n"
    output += f"Label: [{seed.epistemic_label}]\n\n"
    output += f"Seed Content:\n{seed.content}\n\n"
    output += f"Disconfirmation Criteria: {seed.disconfirmation_criteria}\n"
    output += f"Deployment Context: {seed.deployment_context}\n"

    return output

async def stochasmos_assess_risk_impl(mcp, args: Dict[str, Any]):
    seed_id = args.get("seed_id")
    if not seed_id:
        return "Error: seed_id required."

    if not risk_assessor:
        initialize(mcp)

    class MockSeed:
        def __init__(self, sid, content):
            self.id = sid
            self.content = content

    mock_seed = MockSeed(seed_id, args.get("seed_content", ""))
    assessment = risk_assessor.assess_seed_risk(mock_seed)

    output = f"[STOCHASMOS KRISIS ASSESSMENT: {seed_id}]\n"
    output += f"Frameworks Applied: {assessment.frameworks_applied}\n"
    output += f"Cleared for Deployment: {assessment.cleared_for_deployment}\n\n"

    if assessment.tensions:
        output += "Tensions:\n"
        for t in assessment.tensions:
            output += f"— {t}\n"

    if assessment.consensus:
        output += f"\nConsensus: {assessment.consensus}\n"

    output += f"\n{assessment.mandatory_note}\n"
    return output
