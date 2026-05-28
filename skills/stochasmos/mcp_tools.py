from typing import Any, Dict, List
from skills.stochasmos.python.planner import StochasmosPlanner
from skills.stochasmos.python.risk import StochasmosRiskAssessor

planner: StochasmosPlanner = None
risk_assessor: StochasmosRiskAssessor = None

def initialize(mcp):
    global planner, risk_assessor
    planner = StochasmosPlanner(mcp.graph_client, mcp.krisis_client)
    risk_assessor = StochasmosRiskAssessor(mcp.krisis_client)

async def stochasmos_pressure_point(mcp, args: Dict[str, Any]):
    discourse_id = args.get("discourse_id")
    truths = args.get("truths", [])
    if not discourse_id:
        return "Error: discourse_id required."

    if not planner:
        initialize(mcp)

    report = planner.identify_pressure_points(discourse_id, truths)

    output = f"[STOCHASMOS PRESSURE POINT: {report.id}]\n"
    output += f"Discourse: {report.discourse_id}\n"
    output += f"Selection Rationale: {report.selection_rationale}\n\n"

    output += "Pressure Points (ranked):\n"
    for pp in report.pressure_points:
        output += f"{pp['rank']}. Target: {pp['target']}\n"
        output += f"   Centrality: {pp['centrality']:.2f} | Tension: {pp['tension_index']:.2f}\n"
        output += f"   Strategy: {pp['strategy']}\n\n"

    output += "Graph Trace:\n"
    for step in report.graph_trace:
        output += f"— {step}\n"

    return output

async def stochasmos_seed(mcp, args: Dict[str, Any]):
    pressure_point_id = args.get("pressure_point_id")
    if not pressure_point_id:
        return "Error: pressure_point_id required."

    if not planner:
        initialize(mcp)

    pp_data = {"target": args.get("target", "undisclosed claim"), "tension_index": 0.65}
    seed = planner.generate_seed(pressure_point_id, pp_data)

    output = f"[STOCHASMOS SEED: {seed.id}]\n"
    output += f"Target Pressure Point: {seed.pressure_point_id}\n"
    output += f"Label: [{seed.epistemic_label}]\n\n"
    output += f"Seed Content:\n{seed.content}\n\n"
    output += f"Disconfirmation Criteria: {seed.disconfirmation_criteria}\n"
    output += f"Deployment Context: {seed.deployment_context}\n"

    return output

async def stochasmos_assess_risk(mcp, args: Dict[str, Any]):
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
