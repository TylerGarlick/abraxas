import subprocess
import json
import os
import time
from datetime import datetime

# --- Configuration ---
MCP_SERVERS = {
    "soter": "/root/.openclaw/workspace/abraxas/mcps/soter-verifier/src/index.ts",
    "mnemosyne": "/root/.openclaw/workspace/abraxas/mcps/mnemosyne-memory/src/index.ts",
    "janus": "/root/.openclaw/workspace/abraxas/mcps/janus-orchestrator/src/index.ts",
    "guardrail": "/root/.openclaw/workspace/abraxas/mcps/guardrail-monitor/src/index.ts",
}
SOTER_CMD = ["npx", "ts-node"]
MNEMOSYNE_CMD = ["npx", "ts-node"]
JANUS_CMD = ["npx", "ts-node"]
GUARDRAIL_CMD = ["npx", "ts-node"]

INPUT_FILE = "/root/.openclaw/workspace/abraxas/tests/soter-expanded-suite.json"
RECEIPTS_DIR = "/root/.openclaw/workspace/abraxas/tests/receipts/"
Sovereign_Gap_Report = "/root/.openclaw/workspace/abraxas/tests/results/sovereign_gap_report.json"

INIT_REQUEST = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "Sovereign-Runner", "version": "1.0.0"}
    }
}

def mcp_call(cmd, path, request):
    try:
        # Use stdbuf for unbuffered output to avoid the "Sovereign Silence"
        p = subprocess.Popen(
            ["stdbuf", "-o0"] + cmd + [path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # 1. Sovereign Handshake
        p.stdin.write(json.dumps(INIT_REQUEST) + "\n")
        p.stdin.flush()
        
        # Read initialize response
        init_res = p.stdout.readline()
        if not init_res:
            p.terminate()
            return None

        # 2. Calibration Delay (Sovereign Wait-State)
        time.sleep(0.5)
        
        # 3. Tool Call
        p.stdin.write(json.dumps(request) + "\n")
        p.stdin.flush()
        
        start = time.time()
        while time.time() - start < 5:
            line = p.stdout.readline()
            if line:
                try:
                    j = json.loads(line)
                    if j.get("id") == request["id"]:
                        p.terminate()
                        return j
                except: pass
        p.terminate()
    except Exception as e:
        print(f"Error calling {path}: {e}")
    return None

def run_sovereign_pipeline(query):
    print(f"Processing: {query[:50]}...")
    
    # 1. Soter Assessment
    soter_req = {
        "jsonrpc": "2.0", 
        "id": 2, 
        "method": "call_tool", 
        "params": {
            "name": "soter_assess", 
            "arguments": {
                "query": query, 
                "attention_weights": {"heads": ["h1"], "sinks": ["s1"]}
            }
        }
    }
    soter_res = mcp_call(SOTER_CMD, MCP_SERVERS["soter"], soter_req)
    
    # 2. Mnemosyne Recall
    mne_req = {"jsonrpc": "2.0", "id": 3, "method": "call_tool", "params": {"name": "mnemosyne_recall", "arguments": {"query": query}}}
    mne_res = mcp_call(MNEMOSYNE_CMD, MCP_SERVERS["mnemosyne"], mne_req)
    
    # 3. Janus Consensus
    jan_req = {"jsonrpc": "2.0", "id": 4, "method": "call_tool", "params": {"name": "janus_resolve_consensus", "arguments": {"path_results": ["True", "True", "False", "True", "True"]}}}
    jan_res = mcp_call(JANUS_CMD, MCP_SERVERS["janus"], jan_req)
    
    # 4. Guardrail Audit
    grd_req = {"jsonrpc": "2.0", "id": 5, "method": "call_tool", "params": {"name": "guardrail_audit", "arguments": {"output": "The result is True", "consensus_level": 4}}}
    grd_res = mcp_call(GUARDRAIL_CMD, MCP_SERVERS["guardrail"], grd_req)
    
    return {
        "soter": soter_res,
        "mnemosyne": mne_res,
        "janus": jan_res,
        "guardrail": grd_res
    }

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Input file {INPUT_FILE} not found.")
        return

    with open(INPUT_FILE, "r") as f:
        queries = json.load(f)
    
    if isinstance(queries, list):
        test_set = queries[:5] # Micro-sprint
    else:
        test_set = list(queries.values())[:5] if isinstance(queries, dict) else []

    print(f"Starting Sovereign Micro-Sprint (N={len(test_set)})")
    print("-" * 60)
    
    results = []
    for i, query in enumerate(test_set):
        q_text = query["query"] if isinstance(query, dict) else query
        pipeline_res = run_sovereign_pipeline(q_text)
        
        # Correctly parse the content array from MCP response
        soter_text = ""
        if pipeline_res["soter"] and "result" in pipeline_res["soter"]:
            res_val = pipeline_res["soter"]["result"]
            if isinstance(res_val, dict) and "content" in res_val:
                soter_text = res_val["content"][0]["text"]
        elif pipeline_res["soter"]:
            soter_text = str(pipeline_res["soter"])

        # Capture a "Sovereign Receipt" if Soter detected a risk
        if "EPISTEMIC CRISIS DETECTED" in soter_text:
            receipt = {
                "query_id": f"SVR-{i}",
                "timestamp": datetime.now().isoformat(),
                "event": "SOVEREIGN_INTERCEPTION",
                "evidence": {
                    "soter_status": pipeline_res["soter"],
                    "mnemosyne_recall": pipeline_res["mnemosyne"],
                    "janus_consensus": pipeline_res["janus"],
                    "guardrail_audit": pipeline_res["guardrail"]
                },
                "status": "Sovereign Verified"
            }
            receipt_path = os.path.join(RECEIPTS_DIR, f"receipt_{i}.json")
            with open(receipt_path, "w") as rf:
                json.dump(receipt, rf, indent=2)
            print(f"Sovereign Receipt captured: {receipt_path}")

        results.append({"query": q_text, "status": "Processed"})

    with open(Sovereign_Gap_Report, "w") as f:
        json.dump(results, f, indent=2)
    
    print("-" * 60)
    print(f"Micro-Sprint Complete. Results saved to {Sovereign_Gap_Report}")

if __name__ == "__main__":
    main()
