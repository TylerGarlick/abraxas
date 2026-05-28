from typing import List, Optional
import strawberry
from infra.api.graphql.context import get_graphql_context


@strawberry.type
class SearchResult:
    id: str
    _type: str = strawberry.field(name="type")
    label: str
    summary: str
    collection: str


@strawberry.type
class StatsResult:
    total_sessions: int = strawberry.field(name="totalSessions")
    total_hypotheses: int = strawberry.field(name="totalHypotheses")
    total_concepts: int = strawberry.field(name="totalConcepts")
    total_plans: int = strawberry.field(name="totalPlans")
    total_benchmarks: int = strawberry.field(name="totalBenchmarks")
    anchored_plans: int = strawberry.field(name="anchoredPlans")
    pending_plans: int = strawberry.field(name="pendingPlans")
    rejected_plans: int = strawberry.field(name="rejectedPlans")
    avg_novelty: float = strawberry.field(name="avgNovelty")
    avg_coherence: float = strawberry.field(name="avgCoherence")


def _count(collection: str, extra: str = "") -> int:
    ctx = get_graphql_context()
    try:
        if extra:
            return ctx.db.collection(collection).count()
        else:
            query = f"RETURN LENGTH(FOR d IN {collection} RETURN 1)"
            results = ctx.execute_aql(query)
            return results[0] if results else 0
    except Exception:
        return 0


def resolve_search(
    query: str,
    collections: Optional[List[str]] = None,
    limit: int = 10,
) -> List[SearchResult]:
    ctx = get_graphql_context()
    target_collections = collections or [
        "dream_sessions", "hypotheses", "concepts", "actionable_plans", "benchmark_results",
    ]
    results = []

    for coll_name in target_collections:
        try:
            aql = f"""
            FOR doc IN {coll_name}
                LET fields = ATTRIBUTES(doc)
                LET vals = fields[* RETURN TO_STRING(doc[CURRENT])]
                FILTER LENGTH(vals[* FILTER LIKE(CURRENT, CONCAT('%', @query, '%'), true)]) > 0
                LIMIT {limit}
                RETURN doc
            """
            docs = ctx.execute_aql(aql, {"query": query})
            for doc in docs:
                key = doc.get("_key", doc.get("_id", "").split("/")[-1])
                label = doc.get("name") or doc.get("summary") or doc.get("userPrompt") or doc.get("content") or key
                summary = doc.get("description") or doc.get("riskAssessment") or doc.get("rawPatternRepresentation") or ""
                results.append(SearchResult(
                    id=key,
                    _type=coll_name,
                    label=label[:120],
                    summary=summary[:200],
                    collection=coll_name,
                ))
        except Exception:
            continue

    return results[:limit]


def resolve_related_to(id: str, depth: int = 1) -> List[dict]:
    ctx = get_graphql_context()
    edge_collections = ["SESS_TO_HYPO", "HYPO_TO_CONCEPT", "CONCEPT_TO_PLAN"]

    results = []
    visited = set()

    for edge_coll in edge_collections:
        try:
            edges = ctx.execute_aql(
                f"""
                FOR e IN {edge_coll}
                    FILTER e._from == @id OR e._to == @id
                    RETURN e
                """,
                {"id": id},
            )
            for edge in edges:
                neighbor_id = edge["_to"] if edge["_from"] == id else edge["_from"]
                if neighbor_id in visited:
                    continue
                visited.add(neighbor_id)

                coll_name = neighbor_id.split("/")[0]
                doc = ctx.document(coll_name, neighbor_id.split("/")[-1])
                if doc:
                    results.append({
                        "id": neighbor_id,
                        "collection": coll_name,
                        "document": doc,
                        "edge_id": edge.get("_key", ""),
                    })
        except Exception:
            continue

    return results


def resolve_recent(limit: int = 10, collection: Optional[str] = None) -> List[dict]:
    ctx = get_graphql_context()
    target = [collection] if collection else [
        "dream_sessions", "hypotheses", "concepts", "actionable_plans", "benchmark_results",
    ]
    all_results = []

    for coll_name in target:
        try:
            docs = ctx.execute_aql(
                f"""
                FOR d IN {coll_name}
                    SORT d.timestamp DESC
                    LIMIT {limit}
                    RETURN d
                """
            )
            for doc in docs:
                key = doc.get("_key", "")
                all_results.append({
                    "id": key,
                    "collection": coll_name,
                    "document": doc,
                })
        except Exception:
            continue

    all_results.sort(key=lambda r: r["document"].get("timestamp", ""), reverse=True)
    return all_results[:limit]


def resolve_explore(name: str) -> List[dict]:
    ctx = get_graphql_context()
    paths = []

    concepts = ctx.execute_aql(
        "FOR c IN concepts FILTER LIKE(c.name, @name, true) RETURN c",
        {"name": f"%{name}%"},
    )

    for concept in concepts:
        concept_key = concept.get("_key", "")
        chain = ctx.execute_aql(
            """
            FOR concept, plan_edge IN 1..1 OUTBOUND @cid CONCEPT_TO_PLAN
                FOR hypothesis, concept_edge IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
                    FOR session, hypo_edge IN 1..1 INBOUND hypothesis._id SESS_TO_HYPO
                        RETURN {
                            session: session,
                            hypothesis: hypothesis,
                            concept: concept,
                            plan: MERGE(KEEP(concept, '_id', '_key'), {_isConcept: true}),
                            plan_edge: plan_edge,
                            concept_edge: concept_edge,
                            hypo_edge: hypo_edge,
                        }
            """,
            {"cid": f"concepts/{concept_key}"},
        )

        if chain:
            paths.extend(list(chain))
        else:
            hypo = ctx.execute_aql(
                "FOR v IN 1..1 INBOUND @cid HYPO_TO_CONCEPT RETURN v",
                {"cid": f"concepts/{concept_key}"},
            )
            sess = None
            if hypo:
                hypo = list(hypo)
                sess = ctx.execute_aql(
                    "FOR v IN 1..1 INBOUND @hid SESS_TO_HYPO RETURN v",
                    {"hid": hypo[0]["_id"]},
                )
                sess = list(sess)
            paths.append({
                "session": sess[0] if sess else None,
                "hypothesis": hypo[0] if hypo else None,
                "concept": concept,
                "plan": None,
            })

    return paths


def resolve_stats() -> StatsResult:
    ctx = get_graphql_context()

    def safe_count(coll: str) -> int:
        try:
            results = ctx.execute_aql(f"RETURN LENGTH(FOR d IN {coll} RETURN 1)")
            return results[0] if results else 0
        except Exception:
            return 0

    total_sessions = safe_count("dream_sessions")
    total_hypotheses = safe_count("hypotheses")
    total_concepts = safe_count("concepts")
    total_plans = safe_count("actionable_plans")
    total_benchmarks = safe_count("benchmark_results")

    anchored = 0
    pending = 0
    rejected = 0
    try:
        plans = ctx.execute_aql("FOR p IN actionable_plans RETURN p.groundingStatus")
        for s in plans:
            if s == "ANCHORED":
                anchored += 1
            elif s == "REJECTED":
                rejected += 1
            else:
                pending += 1
    except Exception:
        pass

    avg_novelty = 0.0
    avg_coherence = 0.0
    try:
        novelty_results = ctx.execute_aql(
            "FOR h IN hypotheses RETURN h.metadata.noveltyScore"
        )
        coherence_results = ctx.execute_aql(
            "FOR h IN hypotheses RETURN h.metadata.coherenceScore"
        )
        novelties = [x for x in novelty_results if x is not None]
        coherences = [x for x in coherence_results if x is not None]
        if novelties:
            avg_novelty = sum(novelties) / len(novelties)
        if coherences:
            avg_coherence = sum(coherences) / len(coherences)
    except Exception:
        pass

    return StatsResult(
        total_sessions=total_sessions,
        total_hypotheses=total_hypotheses,
        total_concepts=total_concepts,
        total_plans=total_plans,
        total_benchmarks=total_benchmarks,
        anchored_plans=anchored,
        pending_plans=pending,
        rejected_plans=rejected,
        avg_novelty=round(avg_novelty, 3),
        avg_coherence=round(avg_coherence, 3),
    )
