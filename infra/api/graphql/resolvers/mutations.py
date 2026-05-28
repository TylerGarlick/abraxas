import json
import os
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from strawberry.scalars import JSON
from infra.api.graphql.context import get_graphql_context
from infra.api.graphql.schema import (

    DreamSession,
    Hypothesis,
    HypothesisMetadataInput,
    Concept,
    ActionablePlan,
    ActionablePlanInput,
    BenchmarkResultInput,
    SovereignPivot,
    SovereignQuest,
    SovereignPivotInput,
    SovereignQuestInput,
    PivotStatus,
    QuestStatus,
    Task,
    TaskInput,
    TaskStatusInput,
    TaskStatus,
    TaskDependency,
    DependencyInput,
    SoterIncident,
    SoterReview,
    SoterIncidentInput,
    SoterReviewInput,
    ShadowEntry,
    ShadowEntryInput,
    SymbolNode,
    SymbolUpdateInput,
    AlchemicalStage,
    EpistemicMark,
    EpistemicMarkInput,
    EpistemicLabel,
    Retrospective,
    RetrospectiveInput,
    RetrospectiveDoingInput,
    TaskUpdateInput,
    HypothesisUpdateInput,
    ConceptUpdateInput,
    ActionablePlanUpdateInput,
    SoterIncidentUpdateInput,
    SoterReviewUpdateInput,
    ShadowEntryUpdateInput,
    SymbolUpdateInput,
    EpistemicMarkUpdateInput,
)


def _load_sovereign_channels() -> set:
    env_channels = os.getenv("SOVEREIGN_CHANNELS")
    if env_channels:
        return set(c.strip() for c in env_channels.split(",") if c.strip())

    config_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "config", "sovereign-channels.json")
    try:
        with open(config_path) as f:
            data = json.load(f)
        return set(data.get("sovereignChannels", []))
    except Exception:
        return set()


SOVEREIGN_CHANNELS = _load_sovereign_channels()


def _validate_channel(channel_id: Optional[str]):
    if not channel_id:
        raise ValueError("Unauthorized: channelId is required for write operations")
    if channel_id not in SOVEREIGN_CHANNELS:
        raise ValueError(f"Unauthorized: channel {channel_id} is not authorized for write operations")


def resolve_start_dream_cycle(
    prompt: str, seed_concepts: Optional[List[str]], channel_id: str
) -> DreamSession:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("dream_sessions")
    doc = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "userPrompt": prompt,
        "seedConcepts": seed_concepts or [],
        "channelId": channel_id,
    }
    result = coll.insert(doc)
    return DreamSession.from_dict(result)


def resolve_create_hypothesis(
    session_id: str,
    raw_pattern_representation: str,
    metadata: HypothesisMetadataInput,
    channel_id: str,
) -> Hypothesis:
    _validate_channel(channel_id)
    ctx = get_graphql_context()

    session = ctx.document("dream_sessions", session_id)
    if session is None:
        raise ValueError("Session not found")

    meta_dict = {
        "noveltyScore": metadata.novelty_score,
        "coherenceScore": metadata.coherence_score,
        "creativeDrivers": [d.value for d in metadata.creative_drivers],
    }

    hypo_coll = ctx.db.collection("hypotheses")
    hypo_doc = {
        "rawPatternRepresentation": raw_pattern_representation,
        "metadata": meta_dict,
        "isValuable": False,
        "channelId": channel_id,
    }
    hypo_result = hypo_coll.insert(hypo_doc)

    edge_coll = ctx.db.collection("SESS_TO_HYPO")
    edge_coll.insert({
        "_from": f"dream_sessions/{session_id}",
        "_to": f"hypotheses/{hypo_result['_key']}",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })

    return Hypothesis.from_dict({**hypo_result, **hypo_doc})


def resolve_translate_hypothesis_to_concept(
    hypothesis_id: str,
    name: str,
    description: str,
    channel_id: str,
) -> Concept:
    _validate_channel(channel_id)
    ctx = get_graphql_context()

    hypothesis = ctx.document("hypotheses", hypothesis_id)
    if hypothesis is None:
        raise ValueError("Hypothesis not found")

    concept_coll = ctx.db.collection("concepts")
    concept_doc = {
        "name": name,
        "description": description,
        "channelId": channel_id,
    }
    concept_result = concept_coll.insert(concept_doc)

    edge_coll = ctx.db.collection("HYPO_TO_CONCEPT")
    edge_coll.insert({
        "_from": f"hypotheses/{hypothesis_id}",
        "_to": f"concepts/{concept_result['_key']}",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })

    return Concept.from_dict({**concept_result, **concept_doc})


def resolve_archive_hypothesis(
    hypothesis_id: str, is_valuable: bool, channel_id: str
) -> Hypothesis:
    _validate_channel(channel_id)
    ctx = get_graphql_context()

    doc = ctx.document("hypotheses", hypothesis_id)
    if doc is None:
        raise ValueError("Hypothesis not found")

    doc["isValuable"] = is_valuable
    ctx.db.collection("hypotheses").update(hypothesis_id, doc)
    return Hypothesis.from_dict(doc)


def resolve_ground_concept(
    concept_id: str,
    plan: ActionablePlanInput,
    channel_id: str,
) -> ActionablePlan:
    _validate_channel(channel_id)
    ctx = get_graphql_context()

    concept = ctx.document("concepts", concept_id)
    if concept is None:
        raise ValueError("Concept not found")

    plan_coll = ctx.db.collection("actionable_plans")
    plan_doc = {
        "summary": plan.summary,
        "steps": plan.steps,
        "riskAssessment": plan.risk_assessment,
        "groundingStatus": "ANCHORED",
        "guardrailChecks": [],
        "channelId": channel_id,
    }
    plan_result = plan_coll.insert(plan_doc)

    edge_coll = ctx.db.collection("CONCEPT_TO_PLAN")
    edge_coll.insert({
        "_from": f"concepts/{concept_id}",
        "_to": f"actionable_plans/{plan_result['_key']}",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })

    return ActionablePlan.from_dict({**plan_result, **plan_doc})


def resolve_upload_benchmark_batch(
    model_id: str,
    results: List[BenchmarkResultInput],
    channel_id: str,
) -> int:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("benchmark_results")

    for res in results:
        doc = {
            "queryId": res.query_id,
            "category": res.category,
            "queryText": res.query_text,
            "normalResponse": res.normal_response,
            "abraxasResponse": res.abraxas_response,
            "scores": {
                "nl": {
                    "known": res.nl.known,
                    "inferred": res.nl.inferred,
                    "uncertain": res.nl.uncertain,
                    "unknown": res.nl.unknown,
                    "dream": res.nl.dream,
                },
                "al": {
                    "known": res.al.known,
                    "inferred": res.al.inferred,
                    "uncertain": res.nl.uncertain,
                    "unknown": res.al.unknown,
                    "dream": res.al.dream,
                },
            },
            "modelId": model_id,
            "channelId": channel_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        coll.insert(doc)

    return len(results)


def resolve_propose_sovereign_pivot(
    input: SovereignPivotInput,
) -> SovereignPivot:
    _validate_channel(input.channel_id)
    ctx = get_graphql_context()
    
    coll = ctx.db.collection("pivots")
    pivot_doc = {
        "ruptureId": input.rupture_id,
        "proposal": input.proposal,
        "expectedDelta": input.expected_delta,
        "status": PivotStatus.PROPOSED.value,
        "channelId": input.channel_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    result = coll.insert(pivot_doc)
    return SovereignPivot.from_dict({**result, **pivot_doc})


def resolve_trigger_sovereign_quest(
    input: SovereignQuestInput,
) -> SovereignQuest:
    _validate_channel(input.channel_id)
    ctx = get_graphql_context()
    
    coll = ctx.db.collection("quests")
    quest_doc = {
        "unknownId": input.unknown_id,
        "focusArea": input.focus_area,
        "status": QuestStatus.ACTIVE.value,
        "discoveredEvidence": [],
        "channelId": input.channel_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    result = coll.insert(quest_doc)
    return SovereignQuest.from_dict({**result, **quest_doc})

def resolve_create_task(input: TaskInput) -> Task:
    ctx = get_graphql_context()
    coll = ctx.db.collection("tasks")
    edge_coll = ctx.db.collection("task_edges")
    
    doc = {
        "title": input.title,
        "project": input.project,
        "scope": input.scope,
        "priority": input.priority,
        "description": input.description,
        "notes": input.notes,
        "definitionOfDone": input.definition_of_done,
        "prompt": input.prompt,
        "results": input.results,
        "status": TaskStatus.OPEN.value,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    
    # Create parent task
    result = coll.insert(doc)
    parent_id = result["_key"]
    
    # Recursive Subtask Creation
    if input.subtasks:
        for sub_input in input.subtasks:
            # Create subtask recursively (handles nested subtasks)
            sub_task = resolve_create_task(sub_input)
            sub_id = sub_task.id
            
            # Link subtask -> parent (Subtask blocks Parent)
            edge_coll.insert({
                "_from": f"tasks/{sub_id}",
                "_to": f"tasks/{parent_id}",
                "type": "blocks",
                "createdAt": datetime.now(timezone.utc).isoformat(),
            })
            
    return Task.from_dict({**result, **doc})

def resolve_add_subtask(parent_id: str, input: TaskInput) -> Task:
    ctx = get_graphql_context()
    coll = ctx.db.collection("tasks")
    edge_coll = ctx.db.collection("task_edges")
    
    # Verify parent exists
    if not ctx.document("tasks", parent_id):
        raise ValueError(f"Parent task {parent_id} not found")
    
    # Create the subtask (recursivey if it has its own subtasks)
    sub_task = resolve_create_task(input)
    sub_id = sub_task.id
    
    # Link subtask blocks parent
    edge_coll.insert({
        "_from": f"tasks/{sub_id}",
        "_to": f"tasks/{parent_id}",
        "type": "blocks",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
    
    return sub_task

def resolve_update_task_status(input: TaskStatusInput) -> Task:
    ctx = get_graphql_context()
    coll = ctx.db.collection("tasks")
    
    doc = coll.get(input.id)
    if doc is None:
        raise ValueError(f"Task {input.id} not found")
    
    doc["status"] = input.status.value
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    coll.update(input.id, doc)
    return Task.from_dict(doc)

def resolve_add_dependency(input: DependencyInput) -> TaskDependency:
    ctx = get_graphql_context()
    edge_coll = ctx.db.collection("task_edges")
    
    # Ensure both tasks exist (basic validation)
    if not ctx.document("tasks", input.from_id) or not ctx.document("tasks", input.to_id):
        raise ValueError("One or both task IDs are invalid")
        
    edge_doc = {
        "_from": f"tasks/{input.from_id}",
        "_to": f"tasks/{input.to_id}",
        "type": input.dep_type,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    result = edge_coll.insert(edge_doc)
    return TaskDependency.from_dict({**result, **edge_doc})

def resolve_report_soter_incident(input: SoterIncidentInput, channel_id: str) -> SoterIncident:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("incidents")
    
    incident_doc = {
        "request": input.request,
        "assessment": {"score": input.score},
        "resolved": input.resolved,
        "timestamp": input.timestamp or datetime.now(timezone.utc).isoformat(),
        "patterns": [p.from_dict(p) if hasattr(p, 'from_dict') else p for p in input.patterns],
        "channelId": channel_id,
    }
    result = coll.insert(incident_doc)
    return SoterIncident.from_dict({**result, **incident_doc})

def resolve_soter_review(input: SoterReviewInput, channel_id: str) -> SoterReview:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("reviews")
    
    review_doc = {
        "incidentId": input.incident_id,
        "status": input.status,
        "priority": input.priority,
        "decision": input.decision,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "channelId": channel_id,
    }
    result = coll.insert(review_doc)
    return SoterReview.from_dict({**result, **review_doc})

def resolve_log_shadow_entry(input: ShadowEntryInput, channel_id: str) -> ShadowEntry:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("shadow_ledger")
    
    doc = {
        "category": input.category,
        "content": input.content,
        "sessionId": input.session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "channelId": channel_id,
    }
    result = coll.insert(doc)
    return ShadowEntry.from_dict({**result, **doc})

def resolve_update_symbol_stage(input: SymbolUpdateInput, channel_id: str) -> SymbolNode:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("symbols")
    
    doc = coll.get(input.id)
    if doc is None:
        raise ValueError(f"Symbol {input.id} not found")
        
    doc["stage"] = input.stage.value
    doc["intention"] = input.intention
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    coll.update(input.id, doc)
    return SymbolNode.from_dict(doc)

def resolve_close_task(id: str) -> Task:
    ctx = get_graphql_context()
    coll = ctx.db.collection("tasks")
    doc = coll.get(id)
    if doc is None:
        raise ValueError(f"Task {id} not found")
    
    doc["status"] = TaskStatus.CLOSED.value
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    coll.update(id, doc)
    return Task.from_dict(doc)

def resolve_create_retrospective(input: RetrospectiveInput, channel_id: str) -> Retrospective:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("retrospectives")
    
    # Verify task exists
    if not ctx.document("tasks", input.task_id.split("/")[-1]):
        raise ValueError(f"Task {input.task_id} not found")
        
    doc = {
        "taskId": input.task_id,
        "title": input.title,
        "wentWell": input.went_well,
        "wentBad": input.went_bad,
        "doing": {
            "start": input.doing.start if input.doing else None,
            "continue": input.doing.continue_work if input.doing else None,
            "stop": input.doing.stop if input.doing else None,
        } if input.doing else None,
        "actions": input.actions or [],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "channelId": channel_id,
    }
    result = coll.insert(doc)
    return Retrospective.from_dict({**result, **doc})

def resolve_update_retrospective(id: str, input: RetrospectiveInput) -> Retrospective:
    ctx = get_graphql_context()
    coll = ctx.db.collection("retrospectives")
    doc = coll.get(id)
    if doc is None:
        raise ValueError(f"Retrospective {id} not found")
        
    if input.task_id: doc["taskId"] = input.task_id
    if input.title: doc["title"] = input.title
    if input.went_well is not None: doc["wentWell"] = input.went_well
    if input.went_bad is not None: doc["wentBad"] = input.went_bad
    if input.doing:
        doc["doing"] = {
            "start": input.doing.start,
            "continue": input.doing.continue_work,
            "stop": input.doing.stop,
        }
    if input.actions is not None:
        doc["actions"] = input.actions
        
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    coll.update(id, doc)
    return Retrospective.from_dict(doc)

def resolve_delete_retrospective(id: str) -> bool:
    ctx = get_graphql_context()
    coll = ctx.db.collection("retrospectives")
    if not coll.get(id):
        raise ValueError(f"Retrospective {id} not found")
    coll.delete(id)
    return True

def _apply_typed_update(collection_name: str, doc_id: str, update_input: Any) -> JSON:
    ctx = get_graphql_context()
    coll = ctx.db.collection(collection_name)
    doc = coll.get(doc_id)
    if doc is None:
        raise ValueError(f"Document {doc_id} in {collection_name} not found")
    
    # Convert input object to dict, filtering out None values
    update_data = {}
    for field in update_input.__dict__:
        val = getattr(update_input, field)
        if val is not None:
            # Convert Enums to values
            if hasattr(val, 'value'):
                update_data[field] = val.value
            else:
                update_data[field] = val
                
    doc.update(update_data)
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    coll.update(doc_id, doc)
    return doc

def resolve_update_task(id: str, input: TaskUpdateInput) -> Task:
    doc = _apply_typed_update("tasks", id, input)
    return Task.from_dict(doc)

def resolve_update_hypothesis(id: str, input: HypothesisUpdateInput) -> Hypothesis:
    doc = _apply_typed_update("hypotheses", id, input)
    return Hypothesis.from_dict(doc)

def resolve_update_concept(id: str, input: ConceptUpdateInput) -> Concept:
    doc = _apply_typed_update("concepts", id, input)
    return Concept.from_dict(doc)

def resolve_update_actionable_plan(id: str, input: ActionablePlanUpdateInput) -> ActionablePlan:
    doc = _apply_typed_update("actionable_plans", id, input)
    return ActionablePlan.from_dict(doc)

def resolve_update_soter_incident(id: str, input: SoterIncidentUpdateInput) -> SoterIncident:
    doc = _apply_typed_update("incidents", id, input)
    return SoterIncident.from_dict(doc)

def resolve_update_soter_review(id: str, input: SoterReviewUpdateInput) -> SoterReview:
    doc = _apply_typed_update("reviews", id, input)
    return SoterReview.from_dict(doc)

def resolve_update_shadow_entry(id: str, input: ShadowEntryUpdateInput) -> ShadowEntry:
    doc = _apply_typed_update("shadow_ledger", id, input)
    return ShadowEntry.from_dict(doc)

def resolve_update_symbol(id: str, input: SymbolUpdateInput) -> SymbolNode:
    doc = _apply_typed_update("symbols", id, input)
    return SymbolNode.from_dict(doc)

def resolve_update_epistemic_mark(id: str, input: EpistemicMarkUpdateInput) -> EpistemicMark:
    doc = _apply_typed_update("epistemic_ledger", id, input)
    return EpistemicMark.from_dict(doc)

def resolve_delete_document(collection: str, id: str) -> bool:
    ctx = get_graphql_context()
    coll = ctx.db.collection(collection)
    if not coll.get(id):
        raise ValueError(f"Document {id} in {collection} not found")
    coll.delete(id)
    return True

def resolve_create_ledger_task(
    description: str,
    priority: str,
    source_retro_id: str,
    channel_id: str
) -> Task:
    _validate_channel(channel_id)
    ctx = get_graphql_context()
    coll = ctx.db.collection("tasks")
    
    doc = {
        "title": f"[Retro-Improvement] {description}",
        "project": "Sovereign Brain",
        "scope": f"Origin: Retrospective {source_retro_id}",
        "priority": priority,
        "status": TaskStatus.OPEN.value,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    
    result = coll.insert(doc)
    return Task.from_dict({**result, **doc})

