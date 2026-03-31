"""
A2: Counterfactual Engine
What-if reasoning over causal graphs
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from .causal_graph import CausalDAG, CausalNode, CausalEdge, CausalRelationType
import networkx as nx
import copy


@dataclass
class CounterfactualQuery:
    """A counterfactual query specification"""
    antecedent: str  # "If X had been different..."
    consequent: str  # "...then what would happen to Y?"
    intervention: Dict[str, Any]  # Variable changes
    graph_id: str
    query_id: str = ""
    
    def __post_init__(self):
        if not self.query_id:
            self.query_id = f"cfq_{abs(hash(str(self.intervention))) % 10000}"


@dataclass
class CounterfactualResult:
    """Result of counterfactual reasoning"""
    query: CounterfactualQuery
    outcome: Dict[str, Any]  # Variable changes
    effect_magnitude: float  # Size of effect
    confidence: float
    reasoning_trace: List[str]  # Step-by-step reasoning
    affected_variables: List[str]
    direct_effects: List[Dict]
    indirect_effects: List[Dict]
    
    def summary(self) -> str:
        """Generate human-readable summary"""
        parts = []
        parts.append(f"Counterfactual: {self.query.antecedent}")
        parts.append(f"Effect: {self.query.consequent}")
        parts.append(f"Magnitude: {self.effect_magnitude:.2f}")
        parts.append(f"Confidence: {self.confidence:.2f}")
        parts.append(f"Affected variables: {', '.join(self.affected_variables)}")
        return " | ".join(parts)


class CounterfactualEngine:
    """
    Perform counterfactual reasoning over causal graphs
    
    Answers "what if" questions by simulating interventions
    and propagating effects through the causal structure.
    """
    
    def __init__(self):
        self.results: Dict[str, CounterfactualResult] = {}
    
    def intervene(
        self,
        dag: CausalDAG,
        variable_id: str,
        new_value: Any,
        intervention_type: str = "set"
    ) -> Dict[str, Any]:
        """
        Apply intervention to causal graph
        
        Args:
            dag: Causal DAG
            variable_id: Variable to intervene on
            new_value: New value for variable
            intervention_type: "set" (do-operator) or "add" (incremental)
            
        Returns:
            State after intervention
        """
        # Clone the graph state
        state = self._extract_state(dag)
        
        # Apply intervention
        if intervention_type == "set":
            # Do-operator: set variable to specific value
            state[variable_id] = new_value
        elif intervention_type == "add":
            # Incremental change
            old_value = state.get(variable_id, 0)
            state[variable_id] = old_value + new_value
        
        return state
    
    def _extract_state(self, dag: CausalDAG) -> Dict[str, Any]:
        """Extract current state from DAG"""
        state = {}
        for node_id, node in dag.nodes.items():
            # Use confidence as proxy for variable value
            state[node_id] = node.confidence
        return state
    
    def propagate_effects(
        self,
        dag: CausalDAG,
        initial_state: Dict[str, Any],
        intervention_var: str,
        new_value: Any
    ) -> Dict[str, Any]:
        """
        Propagate causal effects through graph
        
        Uses topological ordering to ensure proper causal propagation.
        """
        # Get topological order
        topo_order = list(nx.topological_sort(dag.graph))
        
        # Initialize state
        state = initial_state.copy()
        state[intervention_var] = new_value
        
        # Track changes
        changes: Dict[str, float] = {intervention_var: abs(new_value - initial_state.get(intervention_var, 0))}
        
        # Propagate in topological order
        for node_id in topo_order:
            if node_id == intervention_var:
                continue
            
            # Get parents
            parents = list(dag.graph.predecessors(node_id))
            
            if not parents:
                continue
            
            # Calculate new value based on parent changes
            parent_effects = []
            for parent_id in parents:
                if parent_id in changes:
                    edge = self._get_edge(dag, parent_id, node_id)
                    if edge:
                        effect = changes[parent_id] * edge.strength
                        parent_effects.append(effect)
            
            # Aggregate parent effects
            if parent_effects:
                total_effect = sum(parent_effects) / len(parent_effects)
                old_value = state.get(node_id, 0.5)
                new_value = old_value + total_effect * 0.1  # Dampen effect
                state[node_id] = max(0.0, min(1.0, new_value))
                changes[node_id] = abs(new_value - old_value)
        
        return state
    
    def _get_edge(self, dag: CausalDAG, source: str, target: str) -> Optional[CausalEdge]:
        """Get edge between two nodes"""
        for edge in dag.edges:
            if edge.source == source and edge.target == target:
                return edge
        return None
    
    def query(
        self,
        dag: CausalDAG,
        query: CounterfactualQuery
    ) -> CounterfactualResult:
        """
        Answer counterfactual query
        
        Args:
            dag: Causal DAG
            query: Counterfactual query
            
        Returns:
            CounterfactualResult with outcomes and reasoning
        """
        # Extract initial state
        initial_state = self._extract_state(dag)
        
        # Parse intervention from query
        # Expected format: {"variable_id": new_value}
        interventions = query.intervention
        
        reasoning_trace = []
        reasoning_trace.append(f"Initial state: {len(initial_state)} variables")
        reasoning_trace.append(f"Applying intervention: {interventions}")
        
        # Apply each intervention
        affected_vars = []
        direct_effects = []
        
        for var_id, new_value in interventions.items():
            reasoning_trace.append(f"Intervening on {var_id}: {initial_state.get(var_id, 'N/A')} → {new_value}")
            
            # Get children (direct effects)
            children = list(dag.graph.successors(var_id))
            for child_id in children:
                edge = self._get_edge(dag, var_id, child_id)
                if edge:
                    direct_effects.append({
                        'cause': var_id,
                        'effect': child_id,
                        'relation': edge.relation_type.value,
                        'strength': edge.strength
                    })
            
            affected_vars.append(var_id)
        
        # Propagate effects
        for var_id, new_value in interventions.items():
            initial_state = self.propagate_effects(
                dag, initial_state, var_id, new_value
            )
        
        # Calculate final changes
        final_state = initial_state
        indirect_effects = []
        
        for var_id in final_state:
            if var_id not in interventions:
                old_val = self._extract_state(dag).get(var_id, 0.5)
                new_val = final_state[var_id]
                if abs(new_val - old_val) > 0.01:
                    indirect_effects.append({
                        'variable': var_id,
                        'change': new_val - old_val,
                        'magnitude': abs(new_val - old_val)
                    })
                    if var_id not in affected_vars:
                        affected_vars.append(var_id)
        
        # Calculate effect magnitude
        total_magnitude = sum([e['magnitude'] for e in indirect_effects])
        
        # Estimate confidence (lower for longer causal chains)
        confidence = 0.8 - (len(affected_vars) * 0.05)
        confidence = max(0.3, min(0.95, confidence))
        
        reasoning_trace.append(f"Affected variables: {len(affected_vars)}")
        reasoning_trace.append(f"Direct effects: {len(direct_effects)}")
        reasoning_trace.append(f"Indirect effects: {len(indirect_effects)}")
        reasoning_trace.append(f"Total effect magnitude: {total_magnitude:.3f}")
        
        result = CounterfactualResult(
            query=query,
            outcome=final_state,
            effect_magnitude=total_magnitude,
            confidence=confidence,
            reasoning_trace=reasoning_trace,
            affected_variables=affected_vars,
            direct_effects=direct_effects,
            indirect_effects=indirect_effects
        )
        
        self.results[result.query.query_id] = result
        return result
    
    def compare_counterfactuals(
        self,
        dag: CausalDAG,
        scenarios: List[Dict[str, Any]]
    ) -> List[CounterfactualResult]:
        """
        Compare multiple counterfactual scenarios
        
        Args:
            dag: Causal DAG
            scenarios: List of intervention dicts
            
        Returns:
            List of results for comparison
        """
        results = []
        
        for i, intervention in enumerate(scenarios):
            query = CounterfactualQuery(
                antecedent=f"Scenario {i+1}",
                consequent="Outcome comparison",
                intervention=intervention,
                graph_id="comparison",
                query_id=f"scenario_{i}"
            )
            result = self.query(dag, query)
            results.append(result)
        
        return results
    
    def get_result(self, query_id: str) -> Optional[CounterfactualResult]:
        """Get counterfactual result by ID"""
        return self.results.get(query_id)
    
    def get_all_results(self) -> List[CounterfactualResult]:
        """Get all counterfactual results"""
        return list(self.results.values())
