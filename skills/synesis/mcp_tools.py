from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.synesis.python.logic import SynesisLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Synesis tools to the Abraxas MCP server."""
    # In production, graph_client is attached to mcp object via server initialization
    # We define a helper to get the logic instance.
    
    def get_logic():
        graph_client = getattr(mcp, 'graph_client', None)
        return SynesisLogic(graph_client)

    @mcp.tool()
    def synesis_map(truth_ids_json: str) -> str:
        """
        Analyze specified truth fragments and generate a structural map.
        Input: JSON list of truth IDs: ["GENESIS_001", "GENESIS_002"]
        """
        try:
            truth_ids = json.loads(truth_ids_json)
            logic = get_logic()
            relationships = logic.analyze_relationships(truth_ids)
            
            output = "[SYNESIS MAP]\n\n"
            for rel in relationships:
                output += f"— {rel['from']} → [{rel['type']}] → {rel['to']} (Reason: {rel['reason']})\n"
            
            output += "\nTopological Insight: Structural pattern identified via deterministic mapping."
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def synesis_theorize(domain: str, candidate_truths_json: str) -> str:
        """
        Scans the ledger for patterns in the specified domain and proposes a new theory.
        Input: domain (string) and candidate_truths (JSON list of IDs).
        """
        try:
            candidate_truths = json.loads(candidate_truths_json)
            logic = get_logic()
            theory = logic.propose_theory(domain, candidate_truths)
            
            output = f"[SYNESIS THEORY: {theory.name}]\n"
            output += f"Status: {theory.status}\n"
            output += f"Grounding: {', '.join(theory.grounding_ids)}\n\n"
            output += f"Proposed Theory: {theory.content}\n\n"
            output += "Reasoning Chain:\n"
            for i, step in enumerate(theory.reasoning_chain, 1):
                output += f"{i}. {step}\n"
            output += f"\nFalsifiability Anchor: {theory.disconfirmation_criteria}"
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def synesis_validate(theory_id: str, grounding_ids_json: str) -> str:
        """
        Stress-tests a theory against the existing ledger to find contradictions.
        Input: theory_id and grounding_ids (JSON list).
        """
        try:
            grounding_ids = json.loads(grounding_ids_json)
            from skills.synesis.python.logic import Theory
            mock_theory = Theory(id=theory_id, name="Validation Target", content="...", grounding_ids=grounding_ids, reasoning_chain=[], disconfirmation_criteria="...")
            
            logic = get_logic()
            result = logic.validate_theory(mock_theory)
            
            output = f"[SYNESIS VALIDATION: {theory_id}]\n"
            output += f"Consistency Check: {'PASS' if result['status'] == 'VALIDATED' else 'FAIL'}\n"
            output += f"Confidence: {result['confidence']}\n\n"
            output += f"Analysis: {result['analysis']}"
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
