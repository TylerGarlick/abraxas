"""
A3: Policy Impact Analyzer
Predict downstream effects of policy interventions
"""

from typing import Dict, List, Optional, Set, Any, Tuple
from dataclasses import dataclass, field
from .causal_graph import CausalDAG, CausalNode, CausalEdge, CausalRelationType
from .counterfactual import CounterfactualEngine, CounterfactualQuery, CounterfactualResult
import networkx as nx
from datetime import datetime


@dataclass
class PolicyIntervention:
    """A policy intervention specification"""
    policy_id: str
    name: str
    description: str
    target_variables: Dict[str, Any]  # Variables and their changes
    expected_cost: float = 0.0
    implementation_time: str = "immediate"  # immediate/short/medium/long
    constraints: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)


@dataclass
class ImpactPath:
    """A causal path through which policy impact flows"""
    path_id: str
    source: str
    target: str
    intermediate_nodes: List[str]
    total_effect: float
    confidence: float
    edges: List[Dict]


@dataclass
class PolicyImpactResult:
    """Result of policy impact analysis"""
    policy: PolicyIntervention
    direct_impacts: List[Dict]  # Immediate effects
    indirect_impacts: List[Dict]  # Downstream effects
    total_impact_score: float  # Aggregate impact magnitude
    impacted_variables: Set[str]
    impact_paths: List[ImpactPath]
    unintended_consequences: List[Dict]  # Negative side effects
    beneficiaries: List[str]  # Variables that benefit
    victims: List[str]  # Variables that suffer
    confidence: float
    timestamp: float
    recommendations: List[str]
    
    def summary(self) -> str:
        """Generate human-readable summary"""
        parts = []
        parts.append(f"Policy: {self.policy.name}")
        parts.append(f"Total impact score: {self.total_impact_score:.2f}")
        parts.append(f"Impacted variables: {len(self.impacted_variables)}")
        parts.append(f"Direct impacts: {len(self.direct_impacts)}")
        parts.append(f"Ind Indirect impacts: {len(self.indirect_impacts)}")
        parts.append(f"Unintended consequences: {len(self.unintended_consequences)}")
        return " | ".join(parts)


class PolicyImpactAnalyzer:
    """
    Analyze downstream effects of policy interventions
    
    Predicts both intended and unintended consequences
    by tracing causal pathways through the graph.
    """
    
    def __init__(self):
        self.counterfactual_engine = CounterfactualEngine()
        self.results: Dict[str, PolicyImpactResult] = {}
    
    def analyze(
        self,
        dag: CausalDAG,
        policy: PolicyIntervention
    ) -> PolicyImpactResult:
        """
        Analyze policy impact on causal graph
        
        Args:
            dag: Causal DAG
            policy: Policy intervention
            
        Returns:
            PolicyImpactResult with comprehensive analysis
        """
        # Run counterfactual simulation
        query = CounterfactualQuery(
            antecedent=f"Policy: {policy.name}",
            consequent="Downstream effects",
            intervention=policy.target_variables,
            graph_id=policy.policy_id
        )
        
        cf_result = self.counterfactual_engine.query(dag, query)
        
        # Extract direct impacts (children of target variables)
        direct_impacts = []
        for var_id in policy.target_variables:
            children = dag.graph.successors(var_id)
            for child_id in children:
                edge = self._get_edge(dag, var_id, child_id)
                if edge:
                    direct_impacts.append({
                        'source': var_id,
                        'target': child_id,
                        'effect_type': edge.relation_type.value,
                        'magnitude': edge.strength,
                        'confidence': edge.confidence
                    })
        
        # Extract indirect impacts (all other affected variables)
        indirect_impacts = []
        for indirect in cf_result.indirect_effects:
            var_id = indirect['variable']
            if var_id not in policy.target_variables:
                indirect_impacts.append({
                    'variable': var_id,
                    'change': indirect['change'],
                    'magnitude': indirect['magnitude'],
                    'is_benefit': indirect['change'] > 0
                })
        
        # Find impact paths
        impact_paths = self._find_impact_paths(dag, policy.target_variables)
        
        # Identify unintended consequences (negative effects)
        unintended = []
        beneficiaries = []
        victims = []
        
        for impact in indirect_impacts:
            if impact['is_benefit']:
                beneficiaries.append(impact['variable'])
            else:
                victims.append(impact['variable'])
                unintended.append({
                    'variable': impact['variable'],
                    'negative_change': impact['change'],
                    'severity': abs(impact['change'])
                })
        
        # Calculate total impact score
        total_impact = (
            len(direct_impacts) * 1.0 +
            len(indirect_impacts) * 0.5 +
            sum([abs(i['change']) for i in indirect_impacts])
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            policy, direct_impacts, unintended, beneficiaries, victims
        )
        
        result = PolicyImpactResult(
            policy=policy,
            direct_impacts=direct_impacts,
            indirect_impacts=indirect_impacts,
            total_impact_score=total_impact,
            impacted_variables=set(cf_result.affected_variables),
            impact_paths=impact_paths,
            unintended_consequences=unintended,
            beneficiaries=beneficiaries,
            victims=victims,
            confidence=cf_result.confidence,
            timestamp=datetime.now().timestamp(),
            recommendations=recommendations
        )
        
        self.results[policy.policy_id] = result
        return result
    
    def _get_edge(self, dag: CausalDAG, source: str, target: str) -> Optional[CausalEdge]:
        """Get edge between nodes"""
        for edge in dag.edges:
            if edge.source == source and edge.target == target:
                return edge
        return None
    
    def _find_impact_paths(
        self,
        dag: CausalDAG,
        target_vars: Dict[str, Any]
    ) -> List[ImpactPath]:
        """Find all causal paths from intervention targets"""
        paths = []
        
        for source_var in target_vars:
            # Get all descendants
            descendants = nx.descendants(dag.graph, source_var)
            
            for target_var in descendants:
                # Find all simple paths
                all_paths = nx.all_simple_paths(dag.graph, source_var, target_var)
                
                for path_nodes in all_paths:
                    if len(path_nodes) < 2:
                        continue
                    
                    # Calculate path effect (product of edge strengths)
                    path_effect = 1.0
                    edges_info = []
                    
                    for i in range(len(path_nodes) - 1):
                        edge = self._get_edge(dag, path_nodes[i], path_nodes[i+1])
                        if edge:
                            path_effect *= edge.strength
                            edges_info.append({
                                'source': path_nodes[i],
                                'target': path_nodes[i+1],
                                'strength': edge.strength
                            })
                    
                    # Create impact path
                    path_id = f"path_{source_var}_{target_var}_{len(paths)}"
                    intermediate = path_nodes[1:-1] if len(path_nodes) > 2 else []
                    
                    paths.append(ImpactPath(
                        path_id=path_id,
                        source=source_var,
                        target=target_var,
                        intermediate_nodes=intermediate,
                        total_effect=path_effect,
                        confidence=path_effect,
                        edges=edges_info
                    ))
        
        return paths
    
    def _generate_recommendations(
        self,
        policy: PolicyIntervention,
        direct_impacts: List[Dict],
        unintended: List[Dict],
        beneficiaries: List[str],
        victims: List[str]
    ) -> List[str]:
        """Generate policy recommendations"""
        recommendations = []
        
        if unintended:
            # Sort by severity
            unintended_sorted = sorted(unintended, key=lambda x: x['severity'], reverse=True)
            top_consequence = unintended_sorted[0]
            recommendations.append(
                f"Mitigate unintended consequence on {top_consequence['variable']} "
                f"(severity: {top_consequence['severity']:.2f})"
            )
        
        if len(victims) > len(beneficiaries):
            recommendations.append(
                "Consider redesigning policy - more variables harmed than helped"
            )
        
        if not direct_impacts:
            recommendations.append(
                "No direct impacts detected - verify causal model or policy targets"
            )
        
        if policy.expected_cost > 0:
            recommendations.append(
                f"Monitor cost-benefit ratio (expected cost: {policy.expected_cost})"
            )
        
        if len(direct_impacts) > 0:
            recommendations.append(
                f"Focus on {len(direct_impacts)} direct impact pathways for maximum effectiveness"
            )
        
        return recommendations
    
    def compare_policies(
        self,
        dag: CausalDAG,
        policies: List[PolicyIntervention]
    ) -> Dict[str, Any]:
        """
        Compare multiple policies
        
        Returns comparative analysis
        """
        results = []
        
        for policy in policies:
            result = self.analyze(dag, policy)
            results.append(result)
        
        # Rank by impact score
        ranked = sorted(results, key=lambda r: r.total_impact_score, reverse=True)
        
        # Rank by unintended consequences (fewer is better)
        safest = sorted(results, key=lambda r: len(r.unintended_consequences))
        
        # Find best trade-off
        best = None
        best_score = 0
        
        for r in results:
            # Score = impact / (1 + unintended)
            score = r.total_impact_score / (1 + len(r.unintended_consequences))
            if score > best_score:
                best_score = score
                best = r
        
        return {
            'results': results,
            'ranked_by_impact': [r.policy.name for r in ranked],
            'ranked_by_safety': [r.policy.name for r in safest],
            'best_trade_off': best.policy.name if best else None,
            'comparison_summary': {
                'total_policies': len(policies),
                'avg_impact_score': sum([r.total_impact_score for r in results]) / len(results),
                'avg_unintended': sum([len(r.unintended_consequences) for r in results]) / len(results)
            }
        }
    
    def get_result(self, policy_id: str) -> Optional[PolicyImpactResult]:
        """Get policy impact result by ID"""
        return self.results.get(policy_id)
