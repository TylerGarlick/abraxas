from typing import List, Optional
import json

from strawberry import mutation, fastapi, field, Schema, ID, type
import uvicorn
from fastapi import FastAPI, Response
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info
from graphql import GraphQLError

from .context import get_graphql_context, GraphQLContext
from .resolvers.mutations import (
    resolve_start_dream_cycle,
    resolve_create_hypothesis,
    resolve_translate_hypothesis_to_concept,
    resolve_archive_hypothesis,
    resolve_ground_concept,
    resolve_upload_benchmark_batch,
    resolve_create_task,
    resolve_update_task_status,
    resolve_add_subtask,
)

from .resolvers.queries import (
    resolve_project_uncertainty,
    resolve_ready_tasks,
    resolve_incident_log,
    resolve_pending_reviews,
    resolve_shadow_entries,
)
from .resolvers.search import (
    resolve_search,
    resolve_related_to,
    resolve_recent,
    resolve_explore,
    resolve_stats,
    SearchResult,
    StatsResult,
)
from .schema import (
    GroundingStatus,
    DreamSession,
    Hypothesis,
    Concept,
    ActionablePlan,
    EdgeInfo,
    GuardrailCheck,
    ProvenanceChain,
    HypothesisMetadataInput,
    ActionablePlanInput,
    BenchmarkResultInput,
    Task,
    TaskStatus,
    TaskInput,
    TaskStatusInput,
    DependencyInput,
    TaskDependency,
    SoterIncident,
    SoterReview,
    SoterIncidentInput,
    SoterReviewInput,
    ShadowEntry,
    ShadowEntryInput,
    SymbolNode,
    SymbolUpdateInput,
    EpistemicMark,
    EpistemicMarkInput,
)


def _ctx() -> GraphQLContext:
    return get_graphql_context()


@type
class EpistemicHeatMap:
    known: int = field(description="Total verified ground-truth counts")
    inferred: int = field(description="Total logically derived counts")
    uncertain: int = field(description="Total confidence-gap counts")
    unknown: int = field(description="Total identified gaps")
    dream: int = field(description="Total speculative/creative counts")
    total_samples: int = field(description="Total data points analyzed")
    sovereign_gap_index: float = field(description="The delta between confidence and grounding")


@type
class Query:
    # ... existing queries ...
    @field
    def project_uncertainty(self) -> EpistemicHeatMap:
        return resolve_project_uncertainty()

    @field
    def tasks(
        self, 
        project: Optional[str] = None, 
        status: Optional["TaskStatus"] = None, 
        query: Optional[str] = None, 
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List["Task"]:
        from .resolvers.queries import resolve_tasks
        return resolve_tasks(project, status, query, limit, offset)

    @field
    def soter_incidents(self, min_score: int = 0) -> List["SoterIncident"]:
        return resolve_incident_log(min_score)

    @field
    def soter_reviews(self, priority: Optional[str] = None) -> List["SoterReview"]:
        return resolve_pending_reviews(priority)

    @field
    def shadow_entries(self, category: Optional[str] = None) -> List["ShadowEntry"]:
        return resolve_shadow_entries(category)

    @field
    def search(
            self,
            query: str,
            collections: Optional[List[str]] = None,
            limit: int = 10,
    ) -> List[SearchResult]:
        return resolve_search(query, collections, limit)

    @field
    def related_to(self, id: ID, depth: int = 1) -> List["RelatedNode"]:
        nodes = resolve_related_to(str(id), depth)
        return [RelatedNode.from_dict(n) for n in nodes]

    @field
    def recent(
            self, limit: int = 10, collection: Optional[str] = None
    ) -> List["RecentNode"]:
        nodes = resolve_recent(limit, collection)
        return [RecentNode.from_dict(n) for n in nodes]

    @field
    def explore(self, name: str) -> List[ProvenanceChain]:
        paths = resolve_explore(name)
        result = []
        for p in paths:
            chain = _build_provenance_chain(p)
            if chain:
                result.append(chain)
        return result

    @field
    def stats(self) -> StatsResult:
        return resolve_stats()


@type
class RelatedNode:
    id: str
    collection: str
    label: str
    edge_id: Optional[str] = field(name="edgeId")

    @classmethod
    def from_dict(cls, d: dict) -> "RelatedNode":
        doc = d.get("document", {})
        label = doc.get("name") or doc.get("summary") or doc.get("userPrompt") or d.get("id", "")
        return cls(
            id=d.get("id", ""),
            collection=d.get("collection", ""),
            label=label,
            edge_id=d.get("edge_id"),
        )


@type
class RecentNode:
    id: str
    collection: str
    timestamp: Optional[str] = None
    label: str

    @classmethod
    def from_dict(cls, d: dict) -> "RecentNode":
        doc = d.get("document", {})
        label = doc.get("name") or doc.get("summary") or doc.get("userPrompt") or d.get("id", "")
        return cls(
            id=d.get("id", ""),
            collection=d.get("collection", ""),
            timestamp=doc.get("timestamp"),
            label=label,
        )


def _build_provenance_chain(p: dict) -> Optional[ProvenanceChain]:
    session = p.get("session")
    hypothesis = p.get("hypothesis")
    concept = p.get("concept")
    plan = p.get("plan")

    if not session or not hypothesis or not concept:
        return None

    plan_edge = p.get("plan_edge") or p.get("planToConceptEdge")
    concept_edge = p.get("concept_edge") or p.get("conceptToHypothesisEdge")
    hypo_edge = p.get("hypo_edge") or p.get("hypothesisToSessionEdge")

    plan_obj = plan if plan and isinstance(plan, dict) and plan.get("summary") else None

    return ProvenanceChain(
        plan=ActionablePlan.from_dict(plan_obj) if plan_obj else ActionablePlan(
            id="", summary="", steps=[], risk_assessment="", grounding_status=GroundingStatus.PENDING
        ),
        plan_to_concept_edge=EdgeInfo.from_dict(plan_edge) if plan_edge else EdgeInfo(id="", _from="", _to="",
                                                                                      created_at=None),
        concept=Concept.from_dict(concept),
        concept_to_hypothesis_edge=EdgeInfo.from_dict(concept_edge) if concept_edge else EdgeInfo(id="", _from="",
                                                                                                  _to="",
                                                                                                  created_at=None),
        hypothesis=Hypothesis.from_dict(hypothesis),
        hypothesis_to_session_edge=EdgeInfo.from_dict(hypo_edge) if hypo_edge else EdgeInfo(id="", _from="", _to="",
                                                                                            created_at=None),
        session=DreamSession.from_dict(session),
    )





@type
class Mutation:
    @mutation
    def start_dream_cycle(
            self, prompt: str, seed_concepts: Optional[List[str]] = None, channel_id: str = ""
    ) -> DreamSession:
        return resolve_start_dream_cycle(prompt, seed_concepts, channel_id)

    @mutation
    def create_hypothesis(
            self,
            session_id: ID,
            raw_pattern_representation: str,
            metadata: "HypothesisMetadataInput",
            channel_id: str = "",
    ) -> Hypothesis:
        return resolve_create_hypothesis(
            str(session_id), raw_pattern_representation, metadata, channel_id
        )

    @mutation
    def translate_hypothesis_to_concept(
            self,
            hypothesis_id: ID,
            name: str,
            description: str,
            channel_id: str = "",
    ) -> Concept:
        return resolve_translate_hypothesis_to_concept(
            str(hypothesis_id), name, description, channel_id
        )

    @mutation
    def archive_hypothesis(
            self, hypothesis_id: ID, is_valuable: bool, channel_id: str = ""
    ) -> Hypothesis:
        return resolve_archive_hypothesis(str(hypothesis_id), is_valuable, channel_id)

    @mutation
    def ground_concept(
            self, concept_id: ID, plan: "ActionablePlanInput", channel_id: str = ""
    ) -> ActionablePlan:
        return resolve_ground_concept(str(concept_id), plan, channel_id)

    @mutation
    def upload_benchmark_batch(
            self, model_id: str, results: List["BenchmarkResultInput"], channel_id: str = ""
    ) -> int:
        return resolve_upload_benchmark_batch(model_id, results, channel_id)

    @mutation
    def create_task(self, input: "TaskInput") -> Task:
        return resolve_create_task(input)

    @mutation
    def add_task_dependency(self, input: "DependencyInput") -> TaskDependency:
        from resolvers.mutations import resolve_add_dependency
        return resolve_add_dependency(input)

    @mutation
    def add_subtask(self, parent_id: ID, input: "TaskInput") -> Task:
        from resolvers.mutations import resolve_add_subtask
        return resolve_add_subtask(str(parent_id), input)


    @mutation
    def report_soter_incident(self, input: "SoterIncidentInput", channel_id: str = "") -> SoterIncident:
        return resolve_report_soter_incident(input, channel_id)

    @mutation
    def resolve_soter_review(self, input: "SoterReviewInput", channel_id: str = "") -> SoterReview:
        return resolve_soter_review(input, channel_id)

    @mutation
    def log_shadow_entry(self, input: "ShadowEntryInput", channel_id: str = "") -> ShadowEntry:
        return resolve_log_shadow_entry(input, channel_id)

    @mutation
    def update_symbol_stage(self, input: "SymbolUpdateInput", channel_id: str = "") -> SymbolNode:
        return resolve_update_symbol_stage(input, channel_id)

    @mutation
    def log_epistemic_mark(self, input: "EpistemicMarkInput", channel_id: str = "") -> EpistemicMark:
        return resolve_log_epistemic_mark(input, channel_id)


def _resolve_edge_outbound(parent_id: str, edge_collection: str) -> Optional[dict]:
    ctx = _ctx()
    results = ctx.execute_aql(
        f"""
        FOR vertex, edge IN 1..1 OUTBOUND @id {edge_collection}
            RETURN vertex
        """,
        {"id": parent_id},
    )
    return results[0] if results else None


def _resolve_edge_inbound(parent_id: str, edge_collection: str) -> Optional[dict]:
    ctx = _ctx()
    results = ctx.execute_aql(
        f"""
        FOR vertex, edge IN 1..1 INBOUND @id {edge_collection}
            RETURN vertex
        """,
        {"id": parent_id},
    )
    return results[0] if results else None


@type
class DreamSessionGraph(DreamSession):
    @field
    def hypotheses(self) -> List[Hypothesis]:
        ctx = _ctx()
        results = ctx.execute_aql(
            "FOR vertex, edge IN 1..1 OUTBOUND @id SESS_TO_HYPO RETURN vertex",
            {"id": f"dream_sessions/{self.id}"},
        )
        return [Hypothesis.from_dict(r) for r in results]

    @field
    def inspired_by(self) -> Optional[List[Hypothesis]]:
        ctx = _ctx()
        results = ctx.execute_aql(
            """
            FOR hypo IN 1..1 OUTBOUND @id SESS_TO_HYPO
                FOR concept IN 1..1 OUTBOUND hypo._id HYPO_TO_CONCEPT
                    FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
                        FILTER otherHypo._id != hypo._id
                        FOR otherSession IN 1..1 INBOUND otherHypo._id SESS_TO_HYPO
                            FILTER otherSession._id != @id
                            RETURN DISTINCT otherHypo
            """,
            {"id": f"dream_sessions/{self.id}"},
        )
        if not results:
            return None
        return [Hypothesis.from_dict(r) for r in results]


@type
class HypothesisGraph(Hypothesis):
    @field
    def dream_session(self) -> Optional[DreamSession]:
        result = _resolve_edge_inbound(f"hypotheses/{self.id}", "SESS_TO_HYPO")
        return DreamSession.from_dict(result) if result else None

    @field
    def translated_to(self) -> Optional[Concept]:
        result = _resolve_edge_outbound(f"hypotheses/{self.id}", "HYPO_TO_CONCEPT")
        return Concept.from_dict(result) if result else None

    @field
    def inspired_dreams(self) -> Optional[List[DreamSession]]:
        ctx = _ctx()
        results = ctx.execute_aql(
            """
            FOR concept IN 1..1 OUTBOUND @id HYPO_TO_CONCEPT
                FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
                    FILTER otherHypo._id != @id
                    FOR session IN 1..1 INBOUND otherHypo._id SESS_TO_HYPO
                        RETURN DISTINCT session
            """,
            {"id": f"hypotheses/{self.id}"},
        )
        if not results:
            return None
        return [DreamSession.from_dict(r) for r in results]

    @field
    def inspired_by(self) -> Optional[List[Hypothesis]]:
        ctx = _ctx()
        results = ctx.execute_aql(
            """
            FOR concept IN 1..1 OUTBOUND @id HYPO_TO_CONCEPT
                FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
                    FILTER otherHypo._id != @id
                    RETURN DISTINCT otherHypo
            """,
            {"id": f"hypotheses/{self.id}"},
        )
        if not results:
            return None
        return [Hypothesis.from_dict(r) for r in results]


@type
class ConceptGraph(Concept):
    @field
    def source_hypothesis(self) -> Optional[Hypothesis]:
        result = _resolve_edge_inbound(f"concepts/{self.id}", "HYPO_TO_CONCEPT")
        return Hypothesis.from_dict(result) if result else None

    @field
    def grounded_as(self) -> Optional[ActionablePlan]:
        result = _resolve_edge_outbound(f"concepts/{self.id}", "CONCEPT_TO_PLAN")
        return ActionablePlan.from_dict(result) if result else None


@type
class ActionablePlanGraph(ActionablePlan):
    @field
    def source_concept(self) -> Optional[Concept]:
        result = _resolve_edge_inbound(f"actionable_plans/{self.id}", "CONCEPT_TO_PLAN")
        return Concept.from_dict(result) if result else None

    @field
    def guardrail_checks(self) -> List[GuardrailCheck]:
        return []

    @field
    def provenance_chain(self) -> Optional[ProvenanceChain]:
        ctx = _ctx()
        plan_doc = ctx.document("actionable_plans", self.id)
        if plan_doc is None:
            return None

        results = ctx.execute_aql(
            """
            FOR concept, plan_edge IN 1..1 INBOUND @id CONCEPT_TO_PLAN
                FOR hypothesis, concept_edge IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
                    FOR session, hypo_edge IN 1..1 INBOUND hypothesis._id SESS_TO_HYPO
                        RETURN {
                            plan: @plan_doc,
                            planToConceptEdge: plan_edge,
                            concept: concept,
                            conceptToHypothesisEdge: concept_edge,
                            hypothesis: hypothesis,
                            hypothesisToSessionEdge: hypo_edge,
                            session: session
                        }
            """,
            {
                "id": f"actionable_plans/{self.id}",
                "plan_doc": plan_doc,
            },
        )
        if not results:
            return None
        return _build_provenance_chain(results[0])


schema = Schema(
    query=Query,
    mutation=Mutation,
    types=[
        DreamSessionGraph,
        HypothesisGraph,
        ConceptGraph,
        ActionablePlanGraph,
    ],
)

graphql_app = GraphQLRouter(schema)

# Custom error handling middleware to prevent the 'str' object has no attribute 'get_location' crash
# This wraps the internal execution to ensure raw exceptions don't reach graphql-core in a way that triggers the bug.
@graphql_app.route("/graphql", methods=["POST"])
async def custom_graphql_endpoint(request):
    try:
        return await graphql_app.handle_http_request(request)
    except Exception as e:
        # This handles exceptions that escape the Strawberry resolver chain.
        # We return a standard GraphQL error response to avoid triggering the 
        # 'str' object has no attribute 'get_location' bug in graphql-core.
        import logging
        logging.error(f"GraphQL Endpoint Crash: {e}", exc_info=True)
        return Response(
            content=json.dumps({"errors": [{"message": str(e), "extensions": {"code": "INTERNAL_SERVER_ERROR"}}]}),
            status_code=200,
            media_type="application/json",
        )

app = FastAPI(title="Abraxas GraphQL API")
app.include_router(graphql_app, prefix="/graphql")


@app.get("/health")
async def health_check():
    ctx = _ctx()
    try:
        ctx.db.version()
        return {"status": "healthy", "db": "connected"}
    except Exception:
        return Response(
            content='{"status": "unhealthy", "db": "disconnected"}',
            status_code=503,
            media_type="application/json",
        )


def main():
    ctx = get_graphql_context()
    ctx.ensure_db()
    print("Starting Abraxas GraphQL Server on port 4000...")
    uvicorn.run(app, host="0.0.0.0", port=4000, log_level="info")


if __name__ == "__main__":
    main()
