from typing import List, Optional
from infra.api.graphql.context import get_graphql_context
from infra.api.graphql.schema import (
    DreamSession,
    Hypothesis,
    Concept,
    ActionablePlan,
    BenchmarkResult,
    GroundingStatus,
    Task,
    TaskStatus,
    TaskDependency,
    TaskDependency,
    SoterIncident,
    SoterReview,
    MemoryFragment,
    SovereignState,
    Retrospective
)


def resolve_dream_session(id: str) -> Optional[DreamSession]:
    ctx = get_graphql_context()
    doc = ctx.document("dream_sessions", id)
    if doc is None:
        return None
    return DreamSession.from_dict(doc)


def resolve_hypothesis(id: str) -> Optional[Hypothesis]:
    ctx = get_graphql_context()
    doc = ctx.document("hypotheses", id)
    if doc is None:
        return None
    return Hypothesis.from_dict(doc)


def resolve_concept(id: str) -> Optional[Concept]:
    ctx = get_graphql_context()
    doc = ctx.document("concepts", id)
    if doc is None:
        return None
    return Concept.from_dict(doc)


def resolve_actionable_plans(status: Optional[GroundingStatus] = None) -> List[ActionablePlan]:
    ctx = get_graphql_context()
    if status:
        query = "FOR p IN actionable_plans FILTER p.groundingStatus == @status RETURN p"
        bind_vars = {"status": str(status)}
    else:
        query = "FOR p IN actionable_plans RETURN p"
        bind_vars = {}
    results = ctx.execute_aql(query, bind_vars)
    return [ActionablePlan.from_dict(r) for r in results]


def resolve_benchmark_results(model_id: Optional[str] = None) -> List[BenchmarkResult]:
    ctx = get_graphql_context()
    if model_id:
        query = "FOR r IN benchmark_results FILTER r.modelId == @model_id RETURN r"
        bind_vars = {"model_id": model_id}
    else:
        query = "FOR r IN benchmark_results RETURN r"
        bind_vars = {}
    results = ctx.execute_aql(query, bind_vars)
    return [BenchmarkResult.from_dict(r) for r in results]

def resolve_subtasks(task_id: str) -> List[Task]:
    ctx = get_graphql_context()
    edge_coll = ctx.db.collection("task_edges")
    
    # Find all tasks that 'block' this task (subtasks)
    query = "FOR edge IN task_edges FILTER edge._to == @id AND edge.type == 'blocks' RETURN edge._from"
    bind_vars = {"id": f"tasks/{task_id}"}
    
    results = ctx.execute_aql(query, bind_vars)
    
    tasks = []
    for from_id in results:
        # Extract the key from tasks/123 -> 123
        sub_id = from_id.split("/")[-1]
        doc = ctx.document("tasks", sub_id)
        if doc:
            tasks.append(Task.from_dict(doc))
            
    return tasks

def resolve_tasks(
    project: Optional[str] = None, 
    status: Optional[TaskStatus] = None, 
    query: Optional[str] = None, 
    limit: Optional[int] = None, 
    offset: Optional[int] = None
) -> List[Task]:
    ctx = get_graphql_context()
    aql_query = "FOR t IN tasks"
    bind_vars = {}
    filters = []
    
    if project:
        filters.append("t.project == @project")
        bind_vars["project"] = project
    if status:
        filters.append("t.status == @status")
        bind_vars["status"] = status.value
    if query:
        # Search in both title and scope/description (using LOWER for case-insensitivity)
        filters.append("(CONTAINS(LOWER(t.title), LOWER(@query)) OR CONTAINS(LOWER(t.scope), LOWER(@query)))")
        bind_vars["query"] = query
        
    if filters:
        aql_query += " FILTER " + " AND ".join(filters)
        
    if limit is not None and offset is not None:
        aql_query += " LIMIT @offset, @limit"
        bind_vars["offset"] = offset
        bind_vars["limit"] = limit
    elif limit is not None:
        aql_query += " LIMIT @limit"
        bind_vars["limit"] = limit
        
    aql_query += " RETURN t"
    results = ctx.execute_aql(aql_query, bind_vars)
    return [Task.from_dict(r) for r in results]

def resolve_ready_tasks() -> List[Task]:
    ctx = get_graphql_context()
    # Logic from Tasks Skill:
    # A task is ready if:
    # 1. status == 'ready'
    # 2. status == 'open' AND has no remaining 'blocks' dependencies leading to tasks that are not 'closed'
    query = """
    FOR t IN tasks
        FILTER t.status == 'ready' 
        OR (
            t.status == 'open' 
            AND NOT (
                FOR edge IN task_edges
                    FILTER edge._to == CONCAT('tasks/', t._key) 
                    FILTER edge.type == 'blocks'
                    FOR parent IN tasks
                        FILTER parent._key == SUBSTRING(edge._from, 7)
                        FILTER parent.status != 'closed'
                        RETURN 1
                )
            )
        )
        RETURN t
    """
    try:
        results = ctx.execute_aql(query)
        if not results:
            return []
        # Zero-trust mapping: only proceed if result is a dict and has a key
        return [Task.from_dict(r) for r in results if isinstance(r, dict) and ("_key" in r or "_id" in r)]
    except Exception as e:
        print(f"Error in resolve_ready_tasks: {e}")
        return []


def resolve_task_tree(task_id: str) -> List[TaskDependency]:
    ctx = get_graphql_context()
    query = "FOR e IN TASK_EDGES FILTER e._from == @id OR e._to == @id RETURN e"
    bind_vars = {"id": f"tasks/{task_id}"}
    results = ctx.execute_aql(query, bind_vars)
    return [
        TaskDependency(
            from_id=r["_from"].split("/")[-1],
            to_id=r["_to"].split("/")[-1],
            dep_type=r.get("type", "blocks")
        ) for r in results
    ]

def resolve_incident_log(min_score: int = 0) -> List[SoterIncident]:
    ctx = get_graphql_context()
    query = "FOR i IN incidents FILTER i.assessment.score >= @min_score SORT i.timestamp DESC RETURN i"
    bind_vars = {"min_score": min_score}
    results = ctx.execute_aql(query, bind_vars)
    return [SoterIncident.from_dict(r) for r in results]

def resolve_pending_reviews(priority: Optional[str] = None) -> List[SoterReview]:
    ctx = get_graphql_context()
    query = "FOR r IN reviews FILTER r.status == 'PENDING'"
    bind_vars = {}
    if priority:
        query += " FILTER r.priority == @priority"
        bind_vars["priority"] = priority
    query += " SORT r.createdAt DESC RETURN r"
    results = ctx.execute_aql(query, bind_vars)
    return [SoterReview.from_dict(r) for r in results]

def resolve_memory_recall(query: str) -> Optional[MemoryFragment]:
    ctx = get_graphql_context()
    aql = "FOR f IN fragments FILTER CONTAINS(LOWER(f.fragment), LOWER(@query)) OR f.id == @query LIMIT 1 RETURN f"
    results = ctx.execute_aql(aql, bind_vars={"query": query})
    return MemoryFragment.from_dict(results[0]) if results else None

def resolve_project_uncertainty() -> 'EpistemicHeatMap':
    ctx = get_graphql_context()
    # We analyze the benchmark_results collection's scores
    query = """
    FOR r IN benchmark_results
    COLLECT AGGREGATE 
        known_sum = SUM(r.scores.nl.known + r.scores.al.known),
        inf_sum = SUM(r.scores.nl.inferred + r.scores.al.inferred),
        unc_sum = SUM(r.scores.nl.uncertain + r.scores.al.uncertain),
        unk_sum = SUM(r.scores.nl.unknown + r.scores.al.unknown),
        drm_sum = SUM(r.scores.nl.dream + r.scores.al.dream)
    RETURN {
        known: known_sum,
        inferred: inf_sum,
        uncertain: unc_sum,
        unknown: unk_sum,
        dream: drm_sum
    }
    """
    results = ctx.execute_aql(query)
    if not results:
        return None # or a zeroed object
    
    data = results[0]
    total = data['known'] + data['inferred'] + data['uncertain'] + data['unknown'] + data['dream']
    
    # Sovereign Gap Index: Ratio of (Uncertain + Unknown) to Total
    # This represents the percentage of the project that is not yet anchored.
    gap_index = (data['uncertain'] + data['unknown']) / total if total > 0 else 0.0
    
    from schema import EpistemicHeatMap
    return EpistemicHeatMap(
        known=data['known'],
        inferred=data['inferred'],
        uncertain=data['uncertain'],
        unknown=data['unknown'],
        dream=data['dream'],
        total_samples=total,
        sovereign_gap_index=gap_index
    )

def resolve_incident_log(min_score: int = 0) -> List['SoterIncident']:
    ctx = get_graphql_context()
    query = "FOR i IN incidents FILTER i.assessment.score >= @min_score SORT i.timestamp DESC RETURN i"
    bind_vars = {"min_score": min_score}
    results = ctx.execute_aql(query, bind_vars)
    from schema import SoterIncident
    return [SoterIncident.from_dict(r) for r in results]

def resolve_pending_reviews(priority: Optional[str] = None) -> List['SoterReview']:
    ctx = get_graphql_context()
    query = "FOR r IN reviews FILTER r.status == 'PENDING'"
    bind_vars = {}
    if priority:
        query += " FILTER r.priority == @priority"
        bind_vars["priority"] = priority
    query += " SORT r.createdAt DESC RETURN r"
    results = ctx.execute_aql(query, bind_vars)
    from schema import SoterReview
    return [SoterReview.from_dict(r) for r in results]

def resolve_retrospectives(
    query: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Retrospective]:
    ctx = get_graphql_context()
    if start_date and end_date:
        aql_query = "FOR r IN retrospectives FILTER r.date >= @start AND r.date <= @end SORT r.date ASC RETURN r"
        bind_vars = {"start": start_date, "end": end_date}
    elif query:
        aql_query = "FOR r IN retrospectives"
        bind_vars = {}
        if query:
            aql_query += " FILTER CONTAINS(LOWER(r.title), LOWER(@query)) OR CONTAINS(LOWER(r.wentWell), LOWER(@query))"
            bind_vars["query"] = query
        aql_query += " SORT r.timestamp DESC RETURN r"
    else:
        aql_query = "FOR r IN retrospectives SORT r.timestamp DESC RETURN r"
        bind_vars = {}
        
    results = ctx.execute_aql(aql_query, bind_vars)
    from schema import Retrospective
    return [Retrospective.from_dict(r) for r in results]

def resolve_retros_for_period(start_date: str, end_date: str) -> List[Retrospective]:
    ctx = get_graphql_context()
    aql_query = "FOR r IN retrospectives FILTER r.date >= @start AND r.date <= @end SORT r.date ASC RETURN r"
    bind_vars = {"start": start_date, "end": end_date}
    results = ctx.execute_aql(aql_query, bind_vars)
    from schema import Retrospective
    return [Retrospective.from_dict(r) for r in results]

def resolve_needs_retrospective() -> List[Task]:
    ctx = get_graphql_context()
    # Find tasks that do not have a corresponding retrospective linked via taskId
    query = """
    FOR t IN tasks
        FILTER NOT (
            FOR r IN retrospectives
                FILTER r.taskId == CONCAT('tasks/', t._key)
                RETURN 1
        )
        RETURN t
    """
    results = ctx.execute_aql(query)
    return [Task.from_dict(r) for r in results if isinstance(r, dict) and ("_key" in r or "_id" in r)]

def resolve_shadow_entries(category: Optional[str] = None) -> List["ShadowEntry"]:
    ctx = get_graphql_context()
    query = "FOR s IN shadow_ledger"
    bind_vars = {}
    if category:
        query += " FILTER s.category == @category"
        bind_vars["category"] = category
    query += " SORT s.timestamp DESC RETURN s"
    results = ctx.execute_aql(query, bind_vars)
    from schema import ShadowEntry
    return [ShadowEntry.from_dict(r) for r in results]


