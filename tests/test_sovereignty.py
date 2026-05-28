import pytest
import os
import httpx
from infra.api.src.core.graph import SovereignGraphClient
from infra.api.src.core.state import SovereignStateManager, EpistemicMode
from infra.api.src.core.orchestrator import JanusOrchestrator

# --- Fixtures ---

@pytest.fixture
def graph_client():
    return SovereignGraphClient()

@pytest.fixture
def state_manager():
    return SovereignStateManager()

@pytest.fixture
def orchestrator(graph_client):
    return JanusOrchestrator(graph_client)

# --- Phase 1: Bedrock Tests ---

def test_graph_initialization(graph_client):
    """PROVE: The Sovereign Graph is structurally present."""
    graph_client.ensure_skeleton_collections()
    assert graph_client.db.has_collection("fragments")
    assert graph_client.db.has_collection("claims")
    assert graph_client.db.has_collection("events")

def test_provenance_traversal_integrity(graph_client):
    """PROVE: A claim can be traced back to its root evidence."""
    frag_id = graph_client.add_fragment("The server is physically offline.", "ROOT_001")
    claim_id = graph_client.create_claim("The API is unreachable", [frag_id])
    chain = graph_client.get_provenance_chain(claim_id)
    
    fragment_ids = [node['node']['_id'] for node in chain]
    assert frag_id in fragment_ids

def test_vacuum_determinism(graph_client):
    """PROVE: System identifies total absence of evidence."""
    dummy_query = "Unknown query " + os.urandom(8).hex()
    fragments = graph_client.db.collection("fragments").find({"content": dummy_query})
    assert len(list(fragments)) == 0

# --- Phase 1.2: State Machine Tests ---

def test_state_transitions(state_manager):
    """PROVE: Mode transitions are deterministic."""
    state_manager.set_mode("sol")
    assert state_manager.current_mode == EpistemicMode.SOL
    
    state_manager.set_mode("nox")
    assert state_manager.current_mode == EpistemicMode.NOX
    
    state_manager.set_mode("invalid_mode")
    assert state_manager.current_mode == EpistemicMode.AUTO

def test_pipeline_enforcement(state_manager):
    """PROVE: SOL mode mandates the Sovereign pipeline."""
    state_manager.set_mode("sol")
    pipeline = state_manager.get_required_pipeline()
    assert "JANUS_CONSENSUS" in pipeline
    assert "SOTER_VETO" in pipeline

# --- Phase 2.1: Janus Orchestrator Tests ---

@pytest.mark.asyncio
async def test_janus_consensus_logic(orchestrator):
    """PROVE: The orchestrator generates a Sovereign Seal and lapped monologues."""
    query = "Is 2+2=4?"
    evidence = "Math Proofs 101: 2+2 equals 4."
    
    result = await orchestrator.execute_sovereign_query(query, evidence)
    
    assert "seal" in result
    assert "Sovereign Consensus" in result["seal"]
    assert len(result["receipt"]) == 5 # Verify all 5 lenses were spawned
    assert result["status"] == "VERIFIED"

# --- End-to-End Integration Test ---

@pytest.mark.asyncio
async def test_e2e_sol_flow(graph_client, state_manager, orchestrator):
    """
    PROVE: The complete path from Evidence -> Mode -> Orchestrator -> Seal.
    """
    # 1. Setup Evidence
    frag_id = graph_client.add_fragment("Sovereignty is deterministic.", "GENESIS_001")
    
    # 2. Set Mode to SOL
    state_manager.set_mode("sol")
    
    # 3. Execute through Orchestrator
    query = "What is Sovereignty?"
    evidence = f"Fragment {frag_id}: Sovereignty is deterministic."
    res = await orchestrator.execute_sovereign_query(query, evidence)
    
    assert res["status"] == "VERIFIED"
    assert "Sovereign Consensus" in res["seal"]
