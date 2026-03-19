"""
A1: Causal Graph Builder
Construct causal DAGs from claims
"""

import networkx as nx
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json
import hashlib


class CausalRelationType(Enum):
    """Types of causal relations"""
    DIRECT_CAUSE = "direct_cause"  # A directly causes B
    CONTRIBUTING = "contributing"  # A contributes to B
    PREVENTING = "preventing"  # A prevents B
    ENABLING = "enabling"  # A enables B to occur
    MEDIATING = "mediating"  # A mediates between B and C
    CONFOUNDING = "confounding"  # A confounds B and C
    NECESSARY = "necessary"  # A is necessary for B
    SUFFICIENT = "sufficient"  # A is sufficient for B


@dataclass
class CausalNode:
    """A node in the causal graph representing a variable/claim"""
    id: str
    label: str
    claim_text: str
    variable_type: str = "endogenous"  # endogenous/exogenous
    confidence: float = 0.5
    sources: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    
    def hash(self) -> str:
        """Generate unique hash for node"""
        return hashlib.md5(f"{self.label}:{self.claim_text}".encode()).hexdigest()[:12]


@dataclass
class CausalEdge:
    """A directed edge in the causal graph"""
    source: str
    target: str
    relation_type: CausalRelationType
    strength: float = 0.5  # 0.0-1.0 causal strength
    confidence: float = 0.5
    evidence: List[str] = field(default_factory=list)
    mechanism: Optional[str] = None  # Description of causal mechanism
    metadata: Dict = field(default_factory=dict)


@dataclass
class CausalDAG:
    """Complete causal directed acyclic graph"""
    graph: nx.DiGraph
    nodes: Dict[str, CausalNode]
    edges: List[CausalEdge]
    created_at: float
    updated_at: float
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary"""
        return {
            'nodes': {k: vars(v) for k, v in self.nodes.items()},
            'edges': [vars(e) for e in self.edges],
            'metadata': self.metadata,
            'is_dag': nx.is_directed_acyclic_graph(self.graph),
            'num_nodes': len(self.nodes),
            'num_edges': len(self.edges),
        }


class CausalGraphBuilder:
    """
    Build causal DAGs from claims
    
    Extracts causal structure from natural language claims,
    constructs directed acyclic graphs, and validates acyclicity.
    """
    
    def __init__(self):
        self.graphs: Dict[str, CausalDAG] = {}
        self.patterns = self._load_causal_patterns()
    
    def _load_causal_patterns(self) -> Dict[str, List[str]]:
        """Load linguistic patterns for causal extraction"""
        return {
            CausalRelationType.DIRECT_CAUSE: [
                "causes", "caused", "leads to", "results in", "produces",
                "brings about", "generates", "triggers", "induces"
            ],
            CausalRelationType.CONTRIBUTING: [
                "contributes to", "helps", "aids", "facilitates", "promotes",
                "increases likelihood of", "makes more likely"
            ],
            CausalRelationType.PREVENTING: [
                "prevents", "blocks", "inhibits", "reduces", "decreases",
                "stops", "protects against", "mitigates"
            ],
            CausalRelationType.ENABLING: [
                "enables", "allows", "permits", "makes possible",
                "provides opportunity for", "creates conditions for"
            ],
            CausalRelationType.NECESSARY: [
                "requires", "needs", "depends on", "is necessary for",
                "cannot occur without", "prerequisite for"
            ],
            CausalRelationType.SUFFICIENT: [
                "is sufficient for", "guarantees", "ensures", "always leads to",
                "necessarily produces"
            ],
        }
    
    def extract_causal_claims(self, text: str) -> List[Dict]:
        """
        Extract potential causal claims from text
        
        Returns list of (cause, effect, relation_type, confidence) tuples
        """
        claims = []
        text_lower = text.lower()
        
        for relation_type, patterns in self.patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    # Simple extraction - split on pattern
                    parts = text.split(pattern)
                    if len(parts) >= 2:
                        cause = parts[0].strip()
                        effect = parts[1].strip().split('.')[0].split(',')[0].strip()
                        
                        confidence = self._estimate_confidence(text, pattern)
                        
                        claims.append({
                            'cause': cause,
                            'effect': effect,
                            'relation_type': relation_type.value,
                            'pattern': pattern,
                            'confidence': confidence,
                            'full_text': text
                        })
        
        return claims
    
    def _estimate_confidence(self, text: str, pattern: str) -> float:
        """Estimate confidence of causal claim based on linguistic markers"""
        confidence = 0.5  # Base confidence
        
        # Boost for strong causal language
        strong_markers = ["definitely", "certainly", "always", "never", "proven"]
        weak_markers = ["might", "could", "possibly", "sometimes", "suggests"]
        
        text_lower = text.lower()
        for marker in strong_markers:
            if marker in text_lower:
                confidence += 0.1
        for marker in weak_markers:
            if marker in text_lower:
                confidence -= 0.1
        
        # Cap at 0.0-1.0
        return max(0.0, min(1.0, confidence))
    
    def build_dag(self, claims: List[Dict], graph_id: str = "default") -> CausalDAG:
        """
        Build causal DAG from extracted claims
        
        Args:
            claims: List of extracted causal claims
            graph_id: Unique identifier for this graph
            
        Returns:
            CausalDAG object
        """
        graph = nx.DiGraph()
        nodes: Dict[str, CausalNode] = {}
        edges: List[CausalEdge] = []
        
        # Create nodes for all variables
        variable_id_map: Dict[str, str] = {}
        
        for claim in claims:
            cause_var = self._normalize_variable(claim['cause'])
            effect_var = self._normalize_variable(claim['effect'])
            
            # Create nodes if they don't exist
            if cause_var not in nodes:
                node_id = f"var_{len(nodes)}"
                variable_id_map[cause_var] = node_id
                nodes[node_id] = CausalNode(
                    id=node_id,
                    label=cause_var,
                    claim_text=claim['cause'],
                    confidence=claim.get('confidence', 0.5)
                )
                graph.add_node(node_id, **vars(nodes[node_id]))
            
            if effect_var not in nodes:
                node_id = f"var_{len(nodes)}"
                variable_id_map[effect_var] = node_id
                nodes[node_id] = CausalNode(
                    id=node_id,
                    label=effect_var,
                    claim_text=claim['effect'],
                    confidence=claim.get('confidence', 0.5)
                )
                graph.add_node(node_id, **vars(nodes[node_id]))
            
            # Create edge
            source_id = variable_id_map[cause_var]
            target_id = variable_id_map[effect_var]
            
            edge = CausalEdge(
                source=source_id,
                target=target_id,
                relation_type=CausalRelationType(claim['relation_type']),
                strength=claim.get('confidence', 0.5),
                confidence=claim.get('confidence', 0.5),
                evidence=[claim.get('full_text', '')]
            )
            edges.append(edge)
            graph.add_edge(source_id, target_id, **vars(edge))
        
        # Validate DAG (check for cycles)
        if not nx.is_directed_acyclic_graph(graph):
            # Attempt to fix cycles by removing weakest edges
            graph = self._remove_cycles(graph, edges)
        
        dag = CausalDAG(
            graph=graph,
            nodes=nodes,
            edges=edges,
            created_at=0,
            updated_at=0,
            metadata={'source_claims': len(claims)}
        )
        
        self.graphs[graph_id] = dag
        return dag
    
    def _normalize_variable(self, text: str) -> str:
        """Normalize variable name"""
        return text.strip().lower().replace(' ', '_')[:50]
    
    def _remove_cycles(self, graph: nx.DiGraph, edges: List[CausalEdge]) -> nx.DiGraph:
        """Remove cycles by eliminating weakest edges"""
        cycles = list(nx.simple_cycles(graph))
        
        if not cycles:
            return graph
        
        # Find weakest edge in each cycle and remove
        for cycle in cycles:
            if len(cycle) < 2:
                continue
            
            # Find edge with lowest strength in cycle
            min_strength = float('inf')
            weakest_edge = None
            
            for i in range(len(cycle)):
                source = cycle[i]
                target = cycle[(i + 1) % len(cycle)]
                
                if graph.has_edge(source, target):
                    edge_data = graph[source][target]
                    strength = edge_data.get('strength', 0.5)
                    
                    if strength < min_strength:
                        min_strength = strength
                        weakest_edge = (source, target)
            
            if weakest_edge:
                graph.remove_edge(*weakest_edge)
        
        return graph
    
    def get_parents(self, graph_id: str, node_id: str) -> List[str]:
        """Get all causal parents of a node"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return []
        return list(dag.graph.predecessors(node_id))
    
    def get_children(self, graph_id: str, node_id: str) -> List[str]:
        """Get all causal children of a node"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return []
        return list(dag.graph.successors(node_id))
    
    def get_ancestors(self, graph_id: str, node_id: str) -> Set[str]:
        """Get all causal ancestors (transitive parents)"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return set()
        return nx.ancestors(dag.graph, node_id)
    
    def get_descendants(self, graph_id: str, node_id: str) -> Set[str]:
        """Get all causal descendants (transitive children)"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return set()
        return nx.descendants(dag.graph, node_id)
    
    def find_paths(self, graph_id: str, source: str, target: str) -> List[List[str]]:
        """Find all causal paths between two nodes"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return []
        return list(nx.all_simple_paths(dag.graph, source, target))
    
    def get_graph(self, graph_id: str) -> Optional[CausalDAG]:
        """Get causal DAG by ID"""
        return self.graphs.get(graph_id)
    
    def export_graph(self, graph_id: str, format: str = "json") -> str:
        """Export graph in specified format"""
        dag = self.graphs.get(graph_id)
        if not dag:
            return ""
        
        if format == "json":
            return json.dumps(dag.to_dict(), indent=2)
        elif format == "dot":
            return nx.nx_pydot.to_pydot(dag.graph).to_string()
        else:
            return json.dumps(dag.to_dict(), indent=2)
