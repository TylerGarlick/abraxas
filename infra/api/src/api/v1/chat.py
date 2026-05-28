"""Chat completions API - OpenAI-compatible."""

import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# ============================================================================
# Request Models
# ============================================================================


class Message(BaseModel):
    """Chat message."""

    role: str  # "system", "user", "assistant"
    content: str


class ChatCompletionRequest(BaseModel):
    """Chat completions request."""

    model: str
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False
    # Abraxas-specific options
    system_mode: Optional[str] = None  # "janus", "honest", "agon", "auto"


# ============================================================================
# Response Models
# ============================================================================


class Choice(BaseModel):
    """Chat completion choice."""

    index: int
    message: Message
    finish_reason: str


class Usage(BaseModel):
    """Token usage information."""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponse(BaseModel):
    """Chat completions response."""

    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Choice]
    usage: Usage


# ============================================================================
# Router
# ============================================================================

router = APIRouter()


# ============================================================================
# Endpoints
# ============================================================================


@router.post("/chat/completions", response_model=ChatCompletionResponse)
async def chat_completions(request: ChatCompletionRequest):
    """
    Create a chat completion.

    OpenAI-compatible endpoint for generating chat responses.
    Supports Abraxas-specific system modes:
    - "janus": Dual-face reasoning (Sol/Nox)
    - "honest": Confidence labels enabled
    - "agon": Adversarial reasoning
    - "auto": Automatic mode selection
    """
    # Validate model
    valid_models = ["minimax-m2.5:cloud", "gpt-oss:120b-cloud", "llama3.2:1b"]
    if request.model not in valid_models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model. Available: {valid_models}",
        )

    # Route to Ollama
    try:
        response_text = await _route_to_ollama(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Build response
    import time

    response_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
    created = int(time.time())

    response_message = Message(role="assistant", content=response_text)

    return ChatCompletionResponse(
        id=response_id,
        created=created,
        model=request.model,
        choices=[
            Choice(
                index=0,
                message=response_message,
                finish_reason="stop",
            )
        ],
        usage=Usage(
            prompt_tokens=_estimate_tokens(str(request.messages)),
            completion_tokens=_estimate_tokens(response_text),
            total_tokens=_estimate_tokens(str(request.messages))
            + _estimate_tokens(response_text),
        ),
    )


# ============================================================================
# Router & State Logic
# ============================================================================
from src.core.state import SovereignStateManager, EpistemicMode
from src.core.graph import SovereignGraphClient
from src.core.orchestrator import JanusOrchestrator
from src.core.verifier import SoterVerifier
from src.core.nexus import SovereignNexus
from src.core.anchor import SovereignAnchor
import uuid

state_manager = SovereignStateManager()
graph_client = SovereignGraphClient()
orchestrator = JanusOrchestrator(graph_client)
soter = SoterVerifier()
nexus = SovereignNexus(graph_client)
anchor = SovereignAnchor(graph_client)

async def _route_to_ollama(request: ChatCompletionRequest) -> str:

async def _route_to_ollama(request: ChatCompletionRequest) -> str:
    """Route request to Ollama and return response."""
    import httpx
    
    # Initialize Session ID for the Block Chain of Thought
    session_id = str(uuid.uuid4())
    
    # 1. Update state based on request
    if request.system_mode:
        state_manager.set_mode(request.system_mode)
        
    mode = state_manager.current_mode
    
    # 2. Implement the Skeleton Logic
    if mode == EpistemicMode.SOL:
        # ----------------------------------------------------------------------
        # SKELETON EXECUTION FLOW (The Deterministic Path)
        # ----------------------------------------------------------------------
        
        # Step 1: Intent Capture (Sovereign Block)
        nexus.create_block(session_id, f"Intent: {request.messages[-1].content}", verified=False)
        
        # Step 2: Grounding - Fetch fragments with Divine Priority
        user_query = request.messages[-1].content
        fragments = graph_client.get_fragments_with_priority(user_query)
        if fragments:
            evidence_content = "\n".join([f.get('content', '') for f in fragments[:5]])  # Top 5 fragments
            evidence = f"Contextual Evidence from Vault (Divine Priority):\n{evidence_content}\nUser Query: {user_query}\n"
        else:
            evidence = f"Contextual Evidence from Vault: [No matching fragments]\nUser Query: {user_query}\n"
        nexus.create_block(session_id, f"Evidence Retrieved: {evidence[:100]}...", verified=False)
        
        # Step 3: Janus Consensus
        try:
            sovereign_res = await orchestrator.execute_sovereign_query(
                request.messages[-1].content, 
                evidence
            )
            nexus.create_block(session_id, f"Consensus Reached: {sovereign_res['seal']}", verified=False)
            
            candidate_output = sovereign_res['output']
            seal = sovereign_res['seal']
            
            # Step 4: Soter Veto
            verdict = await soter.verify_response(
                request.messages[-1].content, 
                candidate_output
            )
            nexus.create_block(session_id, f"Soter Verdict: {verdict.action} ({verdict.reason})", verified=False)
            
            if verdict.action == "BLOCK":
                return f"Sovereign Intervention: Response blocked due to epistemic risk.\nReason: {verdict.reason}"
            
            # Step 5: Final Output & Receipt
            nexus.create_block(session_id, f"Output Emitted: {candidate_output[:50]}...", verified=False)
            receipt = nexus.generate_receipt(session_id)
            
            return f"{seal}\n\n{candidate_output}\n\n---\n{receipt}"
            
        except Exception as e:
            nexus.create_block(session_id, f"Critical failure: {str(e)}", verified=False)
            return f"Sovereign Error: {str(e)}"

    # NOX or AUTO-fallback: Standard prompt logic
    ollama_url = "http://localhost:11434/api/chat"
    
    # Build system prompt based on mode (Fallback to Simulation Skins if not SOL)
    system_prompt = _build_system_prompt(request.system_mode)
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    for msg in request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    payload = {
        "model": request.model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": request.temperature,
            "num_predict": request.max_tokens or 4096,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(ollama_url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("message", {}).get("content", "")



async def _route_to_ollama(request: ChatCompletionRequest) -> str:
    """Route request to Ollama and return response."""
    import httpx

    ollama_url = "http://localhost:11434/api/chat"

    # Build system prompt based on system_mode
    system_prompt = _build_system_prompt(request.system_mode)

    # Build messages for Ollama
    messages = []

    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    for msg in request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    payload = {
        "model": request.model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": request.temperature,
            "num_predict": request.max_tokens or 4096,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(ollama_url, json=payload)
        response.raise_for_status()

        data = response.json()
        return data.get("message", {}).get("content", "")


def _build_system_prompt(mode: Optional[str]) -> str:
    """Build system prompt based on Abraxas system mode."""
    if mode == "janus":
        return """You are operating in Janus mode. Before responding, think through the problem twice:
1. SOL: Quick, intuitive reasoning - initial hypothesis
2. NOX: Critical, adversarial reasoning - challenge and verify
3. SYNTHESIS: Final answer integrating both perspectives

Label your claims with confidence: [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]"""

    elif mode == "honest":
        return """You are operating in Honest mode. Apply confidence labels to all factual claims:
✅ CERTAIN - Verified, universally accepted
✔️ LIKELY - High confidence, minor uncertainty
🟡 PROBABLE - Moderate confidence, supporting evidence
❓ UNCERTAIN - Low confidence, sparse/conflicting evidence
❌ UNKNOWN - No reliable information available

Be honest about uncertainty."""

    elif mode == "agon":
        return """You are operating in Agon (adversarial) mode. Before finalizing important answers:
1. ADVOCATE: Argue FOR your position with strongest evidence
2. SKEPTIC: Argue AGAINST your position with strongest counterarguments
3. SYNTHESIS: Provide nuanced final position considering both sides

Challenge your own assumptions."""

    return ""


def _estimate_tokens(text: str) -> int:
    """Rough token estimation (chars / 4)."""
    return len(text) // 4