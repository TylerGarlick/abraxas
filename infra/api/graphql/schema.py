from strawberry import input, field, type, enum
from strawberry.scalars import JSON
from enum import Enum
from typing import List, Optional

# --- ENUMS ---

@enum
class PivotStatus(Enum):
    PROPOSED = "PROPOSED"
    REVIEW = "REVIEW"
    SOVEREIGN_SEAL = "SOVEREIGN_SEAL"
    DEPRECATED = "DEPRECATED"

@enum
class QuestStatus(Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    STALLED = "STALLED"

@enum
class CreativeDriver(Enum):
    ANALOGICAL_LEAP = "ANALOGICAL_LEAP"
    SYSTEMIC_INVERSION = "SYSTEMIC_INVERSION"
    EMERGENT_SYNTHESIS = "EMERGENT_SYNTHESIS"

@enum
class GuardrailID(Enum):
    EPISTEMIC_HUMILITY = "EPISTEMIC_HUMILITY"
    VERIFIABILITY = "VERIFIABILITY"
    CORRIGIBILITY = "CORRIGIBILITY"
    CONSENT_SEEKING = "CONSENT_SEEKING"
    PROCESS_TRANSPARENCY = "PROCESS_TRANSPARENCY"

@enum
class CheckResult(Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"

@enum
class TaskStatus(str, Enum):
    OPEN = "open"
    READY = "ready"
    TESTING = "testing"
    CLOSED = "closed"

@enum
class GroundingStatus(Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    CONFLICT = "CONFLICT"
    UNKNOWN = "UNKNOWN"

@enum
class EpistemicLabel(Enum):
    KNOWN = "KNOWN"
    INFERRED = "INFERRED"
    UNCERTAIN = "UNCERTAIN"
    UNKNOWN = "UNKNOWN"

@enum
class AlchemicalStage(Enum):
    NIGREDO = "NIGREDO"
    ALBEDO = "ALBEDO"
    CITRINITAS = "CITRINITAS"
    RUBEDO = "RUBEDO"

# --- RETROSPECTIVES ---

@type
class RetrospectiveDoing:
    start: Optional[str] = None
    continue_work: Optional[str] = field(name="continue", default=None)
    stop: Optional[str] = None

@type
class Retrospective:
    id: str
    task_id: str = field(name="taskId")
    title: str
    went_well: Optional[str] = field(name="wentWell")
    went_bad: Optional[str] = field(name="wentBad")
    doing: Optional[RetrospectiveDoing]
    actions: List[str] = field(default_factory=list, description="Links to task IDs")
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "Retrospective":
        doing_data = d.get("doing")
        doing = None
        if isinstance(doing_data, dict):
            doing = RetrospectiveDoing(
                start=doing_data.get("start"),
                continue_work=doing_data.get("continue"),
                stop=doing_data.get("stop")
            )
        return cls(
            id=d.get("_key", d.get("_id", "")),
            task_id=d.get("taskId", ""),
            title=d.get("title", ""),
            went_well=d.get("wentWell"),
            went_bad=d.get("wentBad"),
            doing=doing,
            actions=d.get("actions", []),
            timestamp=d.get("timestamp", ""),
        )

@input
class RetrospectiveDoingInput:
    start: Optional[str] = None
    continue_work: Optional[str] = field(name="continue", default=None)
    stop: Optional[str] = None

@input
class RetrospectiveInput:
    task_id: str = field(name="taskId")
    title: str
    went_well: Optional[str] = field(name="wentWell", default=None)
    went_bad: Optional[str] = field(name="wentBad", default=None)
    doing: Optional[RetrospectiveDoingInput] = None
    actions: Optional[List[str]] = None

# --- TYPES ---

@type
class EpistemicMark:
    id: str
    label: EpistemicLabel
    topic: str
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "EpistemicMark":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            label=EpistemicLabel(d.get("label", "UNKNOWN")),
            topic=d.get("topic", ""),
            reasoning_chain=d.get("reasoningChain"),
            session_id=d.get("sessionId"),
            timestamp=d.get("timestamp", ""),
        )

@type
class Task:
    id: str
    title: str
    status: TaskStatus
    priority: Optional[str] = None
    project: Optional[str] = None
    scope: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    definition_of_done: Optional[str] = field(name="definitionOfDone")
    prompt: Optional[str] = None
    results: Optional[JSON] = None
    created_at: Optional[str] = field(name="createdAt")
    updated_at: Optional[str] = field(name="updatedAt")

    @field
    def subtasks(self) -> List["Task"]:
        from resolvers.queries import resolve_subtasks
        return resolve_subtasks(self.id)

    @classmethod
    def from_dict(cls, d: dict) -> "Task":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        status_val = d.get("status", "open")
        
        if isinstance(status_val, TaskStatus):
            status = status_val
        elif isinstance(status_val, str):
            try:
                status = TaskStatus(status_val)
            except ValueError:
                status = TaskStatus.OPEN
        else:
            status = TaskStatus.OPEN
            
        return cls(
            id=key,
            title=d.get("title", ""),
            status=status,
            priority=d.get("priority"),
            project=d.get("project"),
            scope=d.get("scope"),
            description=d.get("description"),
            notes=d.get("notes"),
            definition_of_done=d.get("definitionOfDone"),
            prompt=d.get("prompt"),
            results=d.get("results"),
            created_at=d.get("createdAt"),
            updated_at=d.get("updatedAt"),
        )

@type
class TaskDependency:
    from_id: str = field(name="fromId")
    to_id: str = field(name="toId")
    dep_type: str = field(name="depType")

@type
class SovereignPivot:
    id: str = field(description="Unique identifier of the pivot")
    rupture_id: str = field(name="ruptureId", description="ID of the incident/pattern that triggered the pivot")
    proposal: str = field(description="Detailed architectural change proposal")
    expected_delta: str = field(name="expectedDelta", description="The predicted improvement in system stability or precision")
    status: PivotStatus = field(description="Current evolution state (PROPOSED -> REVIEW -> SEALED)")
    timestamp: str = field(description="ISO timestamp of creation")

    @classmethod
    def from_dict(cls, d: dict) -> "SovereignPivot":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            rupture_id=d.get("ruptureId", ""),
            proposal=d.get("proposal", ""),
            expected_delta=d.get("expectedDelta", ""),
            status=PivotStatus(d.get("status", "PROPOSED")),
            timestamp=d.get("timestamp", ""),
        )

@type
class SovereignQuest:
    id: str = field(description="Unique identifier of the quest")
    unknown_id: str = field(name="unknownId", description="ID of the Janus unknown mark")
    focus_area: str = field(name="focusArea", description="The specific vector of research needed")
    status: QuestStatus = field(description="Current state of the quest")
    discovered_evidence: List[str] = field(name="discoveredEvidence", default_factory=list, description="Evidence fragments found during the quest")
    timestamp: str = field(description="ISO timestamp of creation")

    @classmethod
    def from_dict(cls, d: dict) -> "SovereignQuest":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            unknown_id=d.get("unknownId", ""),
            focus_area=d.get("focusArea", ""),
            status=QuestStatus(d.get("status", "ACTIVE")),
            discovered_evidence=d.get("discoveredEvidence", []),
            timestamp=d.get("timestamp", ""),
        )

@type
class GuardrailCheck:
    guardrail: GuardrailID
    result: CheckResult
    notes: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "GuardrailCheck":
        return cls(
            guardrail=GuardrailID(d["guardrail"]),
            result=CheckResult(d["result"]),
            notes=d.get("notes"),
        )

@type
class SoterIncident:
    id: str
    request: str
    score: int = field(name="riskScore")
    resolved: bool
    timestamp: str
    patterns: List[GuardrailCheck] = field(default_factory=list)
    response: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "SoterIncident":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        assessment = d.get("assessment", {})
        return cls(
            id=key,
            request=d.get("request", ""),
            score=assessment.get("score", 0),
            resolved=d.get("resolved", False),
            timestamp=d.get("timestamp", ""),
            patterns=[GuardrailCheck.from_dict(p) for p in d.get("patterns", [])],
            response=d.get("response"),
        )

@type
class SoterReview:
    id: str
    incident_id: str = field(name="incidentId")
    status: str
    priority: str
    decision: Optional[str] = None
    created_at: str = field(name="createdAt")

    @classmethod
    def from_dict(cls, d: dict) -> "SoterReview":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            incident_id=d.get("incidentId", ""),
            status=d.get("status", "PENDING"),
            priority=d.get("priority", "HIGH"),
            decision=d.get("decision"),
            created_at=d.get("createdAt"),
        )

@type
class MemoryFragment:
    id: str
    fragment: str
    provenance: str
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "MemoryFragment":
        return cls(
            id=d.get("id", d.get("_key", "")),
            fragment=d.get("fragment", ""),
            provenance=d.get("provenance", ""),
            timestamp=d.get("timestamp", ""),
        )

@type
class SovereignState:
    unresolved_incidents: int = field(name="unresolvedIncidents")
    ready_tasks: List[Task] = field(name="readyTasks")
    recent_memory: Optional[MemoryFragment] = field(name="recentMemory")

@type
class HypothesisMetadata:
    novelty_score: float = field(name="noveltyScore")
    coherence_score: float = field(name="coherenceScore")
    creative_drivers: List[CreativeDriver] = field(name="creativeDrivers")

    @classmethod
    def from_dict(cls, d: dict) -> "HypothesisMetadata":
        drivers = d.get("creativeDrivers", [])
        return cls(
            novelty_score=float(d.get("noveltyScore", 0)),
            coherence_score=float(d.get("coherenceScore", 0)),
            creative_drivers=[CreativeDriver(x) for x in drivers],
        )

@type
class EdgeInfo:
    id: str
    _from: str = field(name="from")
    _to: str = field(name="to")
    created_at: Optional[str] = field(name="createdAt")

    @classmethod
    def from_dict(cls, d: dict) -> "EdgeInfo":
        return cls(
            id=d.get("_key", d.get("_id", "").split("/")[-1]),
            _from=d.get("_from", ""),
            _to=d.get("_to", ""),
            created_at=d.get("createdAt"),
        )

@type
class Hypothesis:
    id: str
    raw_pattern_representation: str = field(name="rawPatternRepresentation")
    metadata: HypothesisMetadata
    is_valuable: bool = field(name="isValuable", default=False)

    @classmethod
    def from_dict(cls, d: dict) -> "Hypothesis":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        meta = d.get("metadata")
        if isinstance(meta, dict):
            meta = HypothesisMetadata.from_dict(meta)
        elif meta is None:
            meta = HypothesisMetadata(novelty_score=0, coherence_score=0, creative_drivers=[])
        return cls(
            id=key,
            raw_pattern_representation=d.get("rawPatternRepresentation", ""),
            metadata=meta,
            is_valuable=d.get("isValuable", False),
        )

@type
class Concept:
    id: str
    name: str
    description: str

    @classmethod
    def from_dict(cls, d: dict) -> "Task":
        if not isinstance(d, dict):
            return cls(id="unknown", title="Corrupted Task", status=TaskStatus.OPEN)
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        if not key:
            key = "unknown"
        status_val = d.get("status", "open")
        if isinstance(status_val, TaskStatus):
            status = status_val
        else:
            try:
                status = TaskStatus(status_val)
            except (ValueError, TypeError):
                status = TaskStatus.OPEN
        return cls(
            id=key,
            title=d.get("title", "Untitled Task"),
            status=status,
            priority=d.get("priority"),
            project=d.get("project"),
            scope=d.get("scope"),
            created_at=d.get("createdAt"),
            updated_at=d.get("updatedAt"),
        )

@type
class ActionablePlan:
    id: str
    summary: str
    steps: List[str]
    risk_assessment: str = field(name="riskAssessment")
    grounding_status: GroundingStatus = field(name="groundingStatus")

    @classmethod
    def from_dict(cls, d: dict) -> "ActionablePlan":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            summary=d.get("summary", ""),
            steps=d.get("steps", []),
            risk_assessment=d.get("riskAssessment", ""),
            grounding_status=GroundingStatus(d.get("groundingStatus", "PENDING")),
        )

@type
class DreamSession:
    id: str
    timestamp: str
    user_prompt: str = field(name="userPrompt")
    seed_concepts: List[str] = field(name="seedConcepts")

    @classmethod
    def from_dict(cls, d: dict) -> "DreamSession":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            timestamp=d.get("timestamp", ""),
            user_prompt=d.get("userPrompt", ""),
            seed_concepts=d.get("seedConcepts", []),
        )

@type
class ProvenanceChain:
    plan: ActionablePlan
    plan_to_concept_edge: EdgeInfo = field(name="planToConceptEdge")
    concept: Concept
    concept_to_hypothesis_edge: EdgeInfo = field(name="conceptToHypothesisEdge")
    hypothesis: Hypothesis
    hypothesis_to_session_edge: EdgeInfo = field(name="hypothesisToSessionEdge")
    session: DreamSession

@type
class ScoreDistribution:
    known: float
    inferred: float
    uncertain: float
    unknown: float
    dream: float

@type
class BenchmarkScores:
    nl: ScoreDistribution
    al: ScoreDistribution

@type
class BenchmarkResult:
    id: Optional[str] = None
    query_id: int = field(name="queryId")
    category: str
    query_text: str = field(name="queryText")
    normal_response: str = field(name="normalResponse")
    abraxas_response: str = field(name="abraxasResponse")
    scores: BenchmarkScores
    model_id: str = field(name="modelId")
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "BenchmarkResult":
        scores = d.get("scores", {})
        nl = scores.get("nl", {})
        al = scores.get("al", {})
        return cls(
            id=d.get("_key", d.get("_id", "").split("/")[-1]),
            query_id=d.get("queryId", 0),
            category=d.get("category", ""),
            query_text=d.get("queryText", ""),
            normal_response=d.get("normalResponse", ""),
            abraxas_response=d.get("abraxasResponse", ""),
            scores=BenchmarkScores(
                nl=ScoreDistribution(
                    known=nl.get("known", 0),
                    inferred=nl.get("inferred", 0),
                    uncertain=nl.get("uncertain", 0),
                    unknown=nl.get("unknown", 0),
                    dream=nl.get("dream", 0),
                ),
                al=ScoreDistribution(
                    known=al.get("known", 0),
                    inferred=al.get("inferred", 0),
                    uncertain=al.get("uncertain", 0),
                    unknown=al.get("unknown", 0),
                    dream=al.get("dream", 0),
                ),
            ),
            model_id=d.get("modelId", ""),
            timestamp=d.get("timestamp", ""),
        )

@type
class ShadowEntry:
    id: str
    category: str
    content: str
    session_id: Optional[str] = None
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "ShadowEntry":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            category=d.get("category", ""),
            content=d.get("content", ""),
            session_id=d.get("sessionId"),
            timestamp=d.get("timestamp", ""),
        )

@type
class SymbolNode:
    id: str
    name: str
    stage: AlchemicalStage
    intention: Optional[str] = None
    
    @classmethod
    def from_dict(cls, d: dict) -> "SymbolNode":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            name=d.get("name", ""),
            stage=AlchemicalStage(d.get("stage", "NIGREDO")),
            intention=d.get("intention"),
        )

# --- INPUTS ---

@input
class HypothesisMetadataInput:
    novelty_score: float = field(name="noveltyScore")
    coherence_score: float = field(name="coherenceScore")
    creative_drivers: List[CreativeDriver] = field(name="creativeDrivers")

@input
class ActionablePlanInput:
    summary: str
    steps: List[str] = field(default_factory=list)
    risk_assessment: str = field(name="riskAssessment", default="")

@input
class ScoreDistributionInput:
    known: float
    inferred: float
    uncertain: float
    unknown: float
    dream: float

@type(is_input=True)
class BenchmarkResultInput:
    query_id: int = field(name="queryId")
    category: str
    query_text: str = field(name="queryText")

@input
class SovereignPivotInput:
    rupture_id: str = field(description="ID of the incident or failure pattern that triggered this pivot")
    proposal: str = field(description="Detailed architectural change proposal")
    expected_delta: str = field(name="expectedDelta", description="The predicted improvement in system stability or precision")
    channel_id: str = field(description="Sovereign authorized channel ID")

@input
class SovereignQuestInput:
    unknown_id: str = field(name="unknownId", description="ID of the Janus unknown mark")
    focus_area: str = field(name="focusArea", description="The specific vector of research needed")
    channel_id: str = field(description="Sovereign authorized channel ID")

@input
class TaskInput:
    title: str
    project: Optional[str] = None
    scope: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    definition_of_done: Optional[str] = field(name="definitionOfDone")
    prompt: Optional[str] = None
    results: Optional[JSON] = None
    subtasks: Optional[List["TaskInput"]] = None

@input
class TaskStatusInput:
    id: str
    status: TaskStatus

@input
class DependencyInput:
    from_id: str
    to_id: str
    dep_type: str = "blocks"

@input
class GuardrailCheckInput:
    guardrail: GuardrailID
    result: CheckResult
    notes: Optional[str] = None

@input
class SoterIncidentInput:
    request: str
    score: int
    resolved: bool = False
    timestamp: Optional[str] = None
    patterns: List[GuardrailCheckInput] = field(default_factory=list)

@input
class SoterReviewInput:
    incident_id: str
    status: str
    priority: str
    decision: Optional[str] = None

@input
class ShadowEntryInput:
    category: str
    content: str
    session_id: Optional[str] = None

@input
class SymbolUpdateInput:
    id: str
    stage: AlchemicalStage
    intention: Optional[str] = None

@input
class EpistemicMarkInput:
    label: EpistemicLabel
    topic: str
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")

# --- GENERIC TYPED INPUTS FOR CRUD ---

@input
class TaskUpdateInput:
    title: Optional[str] = None
    project: Optional[str] = None
    scope: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    definition_of_done: Optional[str] = field(name="definitionOfDone")
    prompt: Optional[str] = None
    results: Optional[JSON] = None
    status: Optional[TaskStatus] = None

@input
class HypothesisUpdateInput:
    raw_pattern_representation: Optional[str] = field(name="rawPatternRepresentation")
    is_valuable: Optional[bool] = field(name="isValuable")
    metadata: Optional['HypothesisMetadataInput'] = None

@input
class ConceptUpdateInput:
    name: Optional[str] = None
    description: Optional[str] = None

@input
class ActionablePlanUpdateInput:
    summary: Optional[str] = None
    steps: Optional[List[str]] = None
    risk_assessment: Optional[str] = field(name="riskAssessment")
    grounding_status: Optional['GroundingStatus'] = field(name="groundingStatus")

@input
class SoterIncidentUpdateInput:
    resolved: Optional[bool] = None
    response: Optional[str] = None

@input
class SoterReviewUpdateInput:
    status: Optional[str] = None
    priority: Optional[str] = None
    decision: Optional[str] = None

@input
class ShadowEntryUpdateInput:
    category: Optional[str] = None
    content: Optional[str] = None
    session_id: Optional[str] = field(name="sessionId")

@input
class SymbolUpdateInput:
    stage: Optional[AlchemicalStage] = None
    intention: Optional[str] = None

@input
class EpistemicMarkUpdateInput:
    label: Optional[EpistemicLabel] = None
    topic: Optional[str] = None
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")


@input
class SymbolUpdateInput:
    stage: Optional[AlchemicalStage] = None
    intention: Optional[str] = None

@input
class EpistemicMarkUpdateInput:
    label: Optional[EpistemicLabel] = None
    topic: Optional[str] = None
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")


@input
class SymbolUpdateInput:
    stage: Optional[AlchemicalStage] = None
    intention: Optional[str] = None

@input
class EpistemicMarkUpdateInput:
    label: Optional[EpistemicLabel] = None
    topic: Optional[str] = None
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")

@enum
class GroundingStatus(Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    CONFLICT = "CONFLICT"
    UNKNOWN = "UNKNOWN"

@enum
class EpistemicLabel(Enum):
    KNOWN = "KNOWN"
    INFERRED = "INFERRED"
    UNCERTAIN = "UNCERTAIN"
    UNKNOWN = "UNKNOWN"

@enum
class AlchemicalStage(Enum):
    NIGREDO = "NIGREDO"
    ALBEDO = "ALBEDO"
    CITRINITAS = "CITRINITAS"
    RUBEDO = "RUBEDO"

# --- TYPES ---

@type
class EpistemicMark:
    id: str
    label: EpistemicLabel
    topic: str
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "EpistemicMark":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            label=EpistemicLabel(d.get("label", "UNKNOWN")),
            topic=d.get("topic", ""),
            reasoning_chain=d.get("reasoningChain"),
            session_id=d.get("sessionId"),
            timestamp=d.get("timestamp", ""),
        )

@type
class Task:
    id: str
    title: str
    status: TaskStatus
    priority: Optional[str] = None
    project: Optional[str] = None
    scope: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    definition_of_done: Optional[str] = field(name="definitionOfDone")
    prompt: Optional[str] = None
    results: Optional[JSON] = None
    created_at: Optional[str] = field(name="createdAt")
    updated_at: Optional[str] = field(name="updatedAt")

    @field
    def subtasks(self) -> List["Task"]:
        from resolvers.queries import resolve_subtasks
        return resolve_subtasks(self.id)

    @classmethod
    def from_dict(cls, d: dict) -> "Task":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        status_val = d.get("status", "open")
        
        if isinstance(status_val, TaskStatus):
            status = status_val
        elif isinstance(status_val, str):
            try:
                status = TaskStatus(status_val)
            except ValueError:
                status = TaskStatus.OPEN
        else:
            status = TaskStatus.OPEN
            
        return cls(
            id=key,
            title=d.get("title", ""),
            status=status,
            priority=d.get("priority"),
            project=d.get("project"),
            scope=d.get("scope"),
            description=d.get("description"),
            notes=d.get("notes"),
            definition_of_done=d.get("definitionOfDone"),
            prompt=d.get("prompt"),
            results=d.get("results"),
            created_at=d.get("createdAt"),
            updated_at=d.get("updatedAt"),
        )

@type
class TaskDependency:
    from_id: str = field(name="fromId")
    to_id: str = field(name="toId")
    dep_type: str = field(name="depType")

@type
class SovereignPivot:
    id: str = field(description="Unique identifier of the pivot")
    rupture_id: str = field(name="ruptureId", description="ID of the incident/pattern that triggered the pivot")
    proposal: str = field(description="Detailed architectural change proposal")
    expected_delta: str = field(name="expectedDelta", description="The predicted improvement in system stability or precision")
    status: PivotStatus = field(description="Current evolution state (PROPOSED -> REVIEW -> SEALED)")
    timestamp: str = field(description="ISO timestamp of creation")

    @classmethod
    def from_dict(cls, d: dict) -> "SovereignPivot":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            rupture_id=d.get("ruptureId", ""),
            proposal=d.get("proposal", ""),
            expected_delta=d.get("expectedDelta", ""),
            status=PivotStatus(d.get("status", "PROPOSED")),
            timestamp=d.get("timestamp", ""),
        )

@type
class SovereignQuest:
    id: str = field(description="Unique identifier of the quest")
    unknown_id: str = field(name="unknownId", description="ID of the Janus unknown mark")
    focus_area: str = field(name="focusArea", description="The specific vector of research needed")
    status: QuestStatus = field(description="Current state of the quest")
    discovered_evidence: List[str] = field(name="discoveredEvidence", default_factory=list, description="Evidence fragments found during the quest")
    timestamp: str = field(description="ISO timestamp of creation")

    @classmethod
    def from_dict(cls, d: dict) -> "SovereignQuest":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            unknown_id=d.get("unknownId", ""),
            focus_area=d.get("focusArea", ""),
            status=QuestStatus(d.get("status", "ACTIVE")),
            discovered_evidence=d.get("discoveredEvidence", []),
            timestamp=d.get("timestamp", ""),
        )

@type
class GuardrailCheck:
    guardrail: GuardrailID
    result: CheckResult
    notes: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "GuardrailCheck":
        return cls(
            guardrail=GuardrailID(d["guardrail"]),
            result=CheckResult(d["result"]),
            notes=d.get("notes"),
        )

@type
class SoterIncident:
    id: str
    request: str
    score: int = field(name="riskScore")
    resolved: bool
    timestamp: str
    patterns: List[GuardrailCheck] = field(default_factory=list)
    response: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "SoterIncident":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        assessment = d.get("assessment", {})
        return cls(
            id=key,
            request=d.get("request", ""),
            score=assessment.get("score", 0),
            resolved=d.get("resolved", False),
            timestamp=d.get("timestamp", ""),
            patterns=[GuardrailCheck.from_dict(p) for p in d.get("patterns", [])],
            response=d.get("response"),
        )

@type
class SoterReview:
    id: str
    incident_id: str = field(name="incidentId")
    status: str
    priority: str
    decision: Optional[str] = None
    created_at: str = field(name="createdAt")

    @classmethod
    def from_dict(cls, d: dict) -> "SoterReview":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            incident_id=d.get("incidentId", ""),
            status=d.get("status", "PENDING"),
            priority=d.get("priority", "HIGH"),
            decision=d.get("decision"),
            created_at=d.get("createdAt"),
        )

@type
class MemoryFragment:
    id: str
    fragment: str
    provenance: str
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "MemoryFragment":
        return cls(
            id=d.get("id", d.get("_key", "")),
            fragment=d.get("fragment", ""),
            provenance=d.get("provenance", ""),
            timestamp=d.get("timestamp", ""),
        )

@type
class SovereignState:
    unresolved_incidents: int = field(name="unresolvedIncidents")
    ready_tasks: List[Task] = field(name="readyTasks")
    recent_memory: Optional[MemoryFragment] = field(name="recentMemory")

@type
class HypothesisMetadata:
    novelty_score: float = field(name="noveltyScore")
    coherence_score: float = field(name="coherenceScore")
    creative_drivers: List[CreativeDriver] = field(name="creativeDrivers")

    @classmethod
    def from_dict(cls, d: dict) -> "HypothesisMetadata":
        drivers = d.get("creativeDrivers", [])
        return cls(
            novelty_score=float(d.get("noveltyScore", 0)),
            coherence_score=float(d.get("coherenceScore", 0)),
            creative_drivers=[CreativeDriver(x) for x in drivers],
        )

@type
class EdgeInfo:
    id: str
    _from: str = field(name="from")
    _to: str = field(name="to")
    created_at: Optional[str] = field(name="createdAt")

    @classmethod
    def from_dict(cls, d: dict) -> "EdgeInfo":
        return cls(
            id=d.get("_key", d.get("_id", "").split("/")[-1]),
            _from=d.get("_from", ""),
            _to=d.get("_to", ""),
            created_at=d.get("createdAt"),
        )

@type
class Hypothesis:
    id: str
    raw_pattern_representation: str = field(name="rawPatternRepresentation")
    metadata: HypothesisMetadata
    is_valuable: bool = field(name="isValuable", default=False)

    @classmethod
    def from_dict(cls, d: dict) -> "Hypothesis":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        meta = d.get("metadata")
        if isinstance(meta, dict):
            meta = HypothesisMetadata.from_dict(meta)
        elif meta is None:
            meta = HypothesisMetadata(novelty_score=0, coherence_score=0, creative_drivers=[])
        return cls(
            id=key,
            raw_pattern_representation=d.get("rawPatternRepresentation", ""),
            metadata=meta,
            is_valuable=d.get("isValuable", False),
        )

@type
class Concept:
    id: str
    name: str
    description: str

    @classmethod
    def from_dict(cls, d: dict) -> "Task":
        if not isinstance(d, dict):
            # This should be caught by the resolver, but we provide a fallback
            return cls(id="unknown", title="Corrupted Task", status=TaskStatus.OPEN)

        key = d.get("_key", d.get("_id", "").split("/")[-1])
        if not key:
            key = "unknown"
            
        status_val = d.get("status", "open")
        if isinstance(status_val, TaskStatus):
            status = status_val
        else:
            try:
                status = TaskStatus(status_val)
            except (ValueError, TypeError):
                status = TaskStatus.OPEN
        return cls(
            id=key,
            title=d.get("title", "Untitled Task"),
            status=status,
            priority=d.get("priority"),
            project=d.get("project"),
            scope=d.get("scope"),
            created_at=d.get("createdAt"),
            updated_at=d.get("updatedAt"),
        )


@type
class ActionablePlan:
    id: str
    summary: str
    steps: List[str]
    risk_assessment: str = field(name="riskAssessment")
    grounding_status: GroundingStatus = field(name="groundingStatus")

    @classmethod
    def from_dict(cls, d: dict) -> "ActionablePlan":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            summary=d.get("summary", ""),
            steps=d.get("steps", []),
            risk_assessment=d.get("riskAssessment", ""),
            grounding_status=GroundingStatus(d.get("groundingStatus", "PENDING")),
        )

@type
class DreamSession:
    id: str
    timestamp: str
    user_prompt: str = field(name="userPrompt")
    seed_concepts: List[str] = field(name="seedConcepts")

    @classmethod
    def from_dict(cls, d: dict) -> "DreamSession":
        key = d.get("_key", d.get("_id", "").split("/")[-1])
        return cls(
            id=key,
            timestamp=d.get("timestamp", ""),
            user_prompt=d.get("userPrompt", ""),
            seed_concepts=d.get("seedConcepts", []),
        )

@type
class ProvenanceChain:
    plan: ActionablePlan
    plan_to_concept_edge: EdgeInfo = field(name="planToConceptEdge")
    concept: Concept
    concept_to_hypothesis_edge: EdgeInfo = field(name="conceptToHypothesisEdge")
    hypothesis: Hypothesis
    hypothesis_to_session_edge: EdgeInfo = field(name="hypothesisToSessionEdge")
    session: DreamSession

@type
class ScoreDistribution:
    known: float
    inferred: float
    uncertain: float
    unknown: float
    dream: float

@type
class BenchmarkScores:
    nl: ScoreDistribution
    al: ScoreDistribution

@type
class BenchmarkResult:
    id: Optional[str] = None
    query_id: int = field(name="queryId")
    category: str
    query_text: str = field(name="queryText")
    normal_response: str = field(name="normalResponse")
    abraxas_response: str = field(name="abraxasResponse")
    scores: BenchmarkScores
    model_id: str = field(name="modelId")
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "BenchmarkResult":
        scores = d.get("scores", {})
        nl = scores.get("nl", {})
        al = scores.get("al", {})
        return cls(
            id=d.get("_key", d.get("_id", "").split("/")[-1]),
            query_id=d.get("queryId", 0),
            category=d.get("category", ""),
            query_text=d.get("queryText", ""),
            normal_response=d.get("normalResponse", ""),
            abraxas_response=d.get("abraxasResponse", ""),
            scores=BenchmarkScores(
                nl=ScoreDistribution(
                    known=nl.get("known", 0),
                    inferred=nl.get("inferred", 0),
                    uncertain=nl.get("uncertain", 0),
                    unknown=nl.get("unknown", 0),
                    dream=nl.get("dream", 0),
                ),
                al=ScoreDistribution(
                    known=al.get("known", 0),
                    inferred=al.get("inferred", 0),
                    uncertain=al.get("uncertain", 0),
                    unknown=al.get("unknown", 0),
                    dream=al.get("dream", 0),
                ),
            ),
            model_id=d.get("modelId", ""),
            timestamp=d.get("timestamp", ""),
        )

@type
class ShadowEntry:
    id: str
    category: str
    content: str
    session_id: Optional[str] = None
    timestamp: str

    @classmethod
    def from_dict(cls, d: dict) -> "ShadowEntry":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            category=d.get("category", ""),
            content=d.get("content", ""),
            session_id=d.get("sessionId"),
            timestamp=d.get("timestamp", ""),
        )

@type
class SymbolNode:
    id: str
    name: str
    stage: AlchemicalStage
    intention: Optional[str] = None
    
    @classmethod
    def from_dict(cls, d: dict) -> "SymbolNode":
        return cls(
            id=d.get("_key", d.get("_id", "")),
            name=d.get("name", ""),
            stage=AlchemicalStage(d.get("stage", "NIGREDO")),
            intention=d.get("intention"),
        )

# --- INPUTS ---

@input
class HypothesisMetadataInput:
    novelty_score: float = field(name="noveltyScore")
    coherence_score: float = field(name="coherenceScore")
    creative_drivers: List[CreativeDriver] = field(name="creativeDrivers")

@input
class ActionablePlanInput:
    summary: str
    steps: List[str] = field(default_factory=list)
    risk_assessment: str = field(name="riskAssessment", default="")

@input
class ScoreDistributionInput:
    known: float
    inferred: float
    uncertain: float
    unknown: float
    dream: float

@type(is_input=True)
class BenchmarkResultInput:
    query_id: int = field(name="queryId")
    category: str
    query_text: str = field(name="queryText")

@input
class SovereignPivotInput:
    rupture_id: str = field(description="ID of the incident or failure pattern that triggered this pivot")
    proposal: str = field(description="Detailed architectural change proposal")
    expected_delta: str = field(name="expectedDelta", description="The predicted improvement in system stability or precision")
    channel_id: str = field(description="Sovereign authorized channel ID")

@input
class SovereignQuestInput:
    unknown_id: str = field(name="unknownId", description="ID of the Janus unknown mark")
    focus_area: str = field(name="focusArea", description="The specific vector of research needed")
    channel_id: str = field(description="Sovereign authorized channel ID")

@input
class TaskInput:
    title: str
    project: Optional[str] = None
    scope: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    definition_of_done: Optional[str] = field(name="definitionOfDone")
    prompt: Optional[str] = None
    results: Optional[JSON] = None
    subtasks: Optional[List["TaskInput"]] = None

@input
class TaskStatusInput:
    id: str
    status: TaskStatus

@input
class DependencyInput:
    from_id: str
    to_id: str
    dep_type: str = "blocks"

@input
class GuardrailCheckInput:
    guardrail: GuardrailID
    result: CheckResult
    notes: Optional[str] = None

@input
class SoterIncidentInput:
    request: str
    score: int
    resolved: bool = False
    timestamp: Optional[str] = None
    patterns: List[GuardrailCheckInput] = field(default_factory=list)

@input
class SoterReviewInput:
    incident_id: str
    status: str
    priority: str
    decision: Optional[str] = None

@input
class ShadowEntryInput:
    category: str
    content: str
    session_id: Optional[str] = None

@input
class SymbolUpdateInput:
    id: str
    stage: AlchemicalStage
    intention: Optional[str] = None

@input
class EpistemicMarkInput:
    label: EpistemicLabel
    topic: str
    reasoning_chain: Optional[str] = field(name="reasoningChain")
    session_id: Optional[str] = field(name="sessionId")
