from typing import Any, Dict
from skills.auto_agon.python.logic import AutoAgonLogic
from skills.harmonia.python.orchestrator import HarmoniaOrchestrator

async def metanoia_agon_audit(mcp, args: Dict[str, Any]):
    logic = AutoAgonLogic(mcp)
    report = logic.self_audit()

    output = f"[METANOIA AGON AUDIT: {report.id}]\n\n"
    output += "Weakness Patterns:\n"
    for p in report.weakness_patterns:
        output += f"— {p}\n"
    output += "\nBlind Spots:\n"
    for b in report.blind_spots:
        output += f"— {b}\n"
    output += "\nSoft Spots:\n"
    for s in report.soft_spots:
        output += f"— {s}\n"
    output += f"\nRecommendation:\n{report.recommendation}\n"
    return output

async def metanoia_agon_evolve(mcp, args: Dict[str, Any]):
    target = args.get("target", "promotion_threshold")
    logic = AutoAgonLogic(mcp)
    evolution = logic.evolve_parameters(target)

    output = f"[METANOIA EVOLUTION: {evolution.parameter}]\n"
    output += f"Previous: {evolution.previous_value}\n"
    output += f"New: {evolution.new_value}\n"
    output += f"Reasoning: {evolution.reasoning}\n"
    output += "Status: Logged to modification ledger.\n"
    return output

async def metanoia_harmonia_audit(mcp, args: Dict[str, Any]):
    composition_id = args.get("composition_id")
    if not composition_id:
        return "Error: composition_id required."

    orchestrator = HarmoniaOrchestrator(mcp)
    report = orchestrator.audit_dag(composition_id)

    if "error" in report:
        return f"Error: {report['error']}"

    output = f"[METANOIA HARMONIA AUDIT: {composition_id}]\n"
    output += f"Step Count: {report['step_count']}\n"
    output += f"Efficiency Score: {report['efficiency_score']:.2f}\n\n"

    if report["bottlenecks"]:
        output += "Bottlenecks:\n"
        for b in report["bottlenecks"]:
            output += f"— {b['step']}: {b['reason']}\n"
    if report["redundancy"]:
        output += "Redundancy:\n"
        for r in report["redundancy"]:
            output += f"— {r['step']}: {r['reason']}\n"
    return output

async def metanoia_harmonia_refine(mcp, args: Dict[str, Any]):
    composition_id = args.get("composition_id")
    if not composition_id:
        return "Error: composition_id required."

    orchestrator = HarmoniaOrchestrator(mcp)
    refinement = orchestrator.propose_refinement(composition_id)

    if "error" in refinement:
        return f"Error: {refinement['error']}"

    output = f"[METANOIA HARMONIA REFINEMENT: {composition_id}]\n"
    output += f"Current Efficiency: {refinement['current_efficiency']:.2f}\n"
    output += f"Proposed Efficiency: {refinement['proposed_efficiency']:.2f}\n"
    output += f"Delta: +{refinement['efficiency_delta']:.2f}\n"
    output += f"Status: [{refinement['status']}]\n\n"

    for p in refinement.get("proposals", []):
        output += f"— {p['action']} {p.get('target', '')}: {p['description']}\n"
    return output
