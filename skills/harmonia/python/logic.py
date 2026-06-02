from typing import Dict, Any, Optional, List
import datetime
import logging

logger = logging.getLogger("harmonia-logic")

class HarmoniaLogic:
    def __init__(self):
        # In-memory storage for DAGs. In a full implementation, these would be in ArangoDB.
        self.workflows = {}

    def compose_workflow(self, workflow_id: str, sequence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Composes multiple Abraxas skills into unified workflows.
         sequence: List of steps, e.g. [{"step": 1, "skill": "logos", "tool": "map", "depends_on": None}]
        """
        # Basic DAG validation: Ensure steps are ordered and references exist
        if not sequence or not isinstance(sequence, list):
            return {"success": False, "error": "Invalid sequence format. Expected list of step objects."}

        # Check for circular dependencies (extremely basic check)
        step_ids = [step.get("id") for step in sequence if "id" in step]
        for step in sequence:
            dep = step.get("depends_on")
            if dep and dep == step.get("id"):
                return {"success": False, "error": f"Circular dependency detected in step {step.get('id')}"}

        self.workflows[workflow_id] = {
            "created_at": datetime.datetime.now().isoformat(),
            "sequence": sequence,
            "version": "1.0"
        }
        
        logger.info(f"Harmonia: Composed workflow {workflow_id} with {len(sequence)} steps.")
        return {
            "success": True,
            "action": "compose_workflow",
            "workflow_id": workflow_id,
            "steps_count": len(sequence),
            "status": "ACTIVE"
        }

    def execute_sequence(self, workflow_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a composed sequence of skill invocations.
        Currently simulates the execution by tracing the DAG.
        """
        if workflow_id not in self.workflows:
            return {"success": False, "error": f"Workflow {workflow_id} not found."}

        workflow = self.workflows[workflow_id]
        sequence = workflow["sequence"]
        execution_trace = []
        current_state = inputs.copy()

        try:
            for step in sequence:
                skill = step.get("skill")
                tool = step.get("tool")
                step_id = step.get("id", "unknown")
                
                # Simulate skill execution
                logger.info(f"Executing {skill}:{tool} for step {step_id}...")
                
                # In a real system, this would use the MCP Registry to call the actual tool
                mock_output = f"Result from {skill}:{tool} with inputs {current_state}"
                
                execution_trace.append({
                    "step_id": step_id,
                    "skill": skill,
                    "tool": tool,
                    "output": mock_output,
                    "timestamp": datetime.datetime.now().isoformat()
                })
                
                # Update state for next step
                current_state[f"{skill}_{tool}_out"] = mock_output

            return {
                "success": True,
                "action": "execute_sequence",
                "workflow_id": workflow_id,
                "final_state": current_state,
                "trace": execution_trace
            }
        except Exception as e:
            logger.error(f"Execution failure in {workflow_id}: {e}")
            return {"success": False, "error": str(e), "trace": execution_trace}

    def check_conflict(self, workflow_id: str) -> Dict[str, Any]:
        """
        Checks for state handoff conflicts in a DAG.
        Identifies if a step depends on a value that is never produced.
        """
        if workflow_id not in self.workflows:
            return {"success": False, "error": f"Workflow {workflow_id} not found."}

        workflow = self.workflows[workflow_id]
        sequence = workflow["sequence"]
        produced_outputs = set()
        conflicts = []

        for step in sequence:
            step_id = step.get("id", "unknown")
            skill = step.get("skill")
            tool = step.get("tool")
            
            # Record what this step produces
            produced_outputs.add(f"{skill}_{tool}_out")
            
            # Check dependencies
            deps = step.get("depends_on", [])
            if isinstance(deps, str):
                deps = [deps]
                
            for dep in deps:
                if dep not in produced_outputs:
                    conflicts.append({
                        "step_id": step_id,
                        "missing_dependency": dep,
                        "severity": "CRITICAL"
                    })

        return {
            "success": True,
            "action": "check_conflict",
            "workflow_id": workflow_id,
            "conflicts": conflicts,
            "conflict_count": len(conflicts)
        }

