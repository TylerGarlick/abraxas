import subprocess
import json
import os
import time

# List of MCP servers to verify
# Format: (Server Name, Path to entry point, Command)
SERVERS = [
    ("Episteme", "/root/.openclaw/workspace/abraxas/mcps/episteme/src/index.ts", ["npx", "ts-node"]),
    ("Ethos", "/root/.openclaw/workspace/abraxas/mcps/ethos/src/index.ts", ["npx", "ts-node"]),
    ("Kairos", "/root/.openclaw/workspace/abraxas/mcps/kairos/src/index.ts", ["npx", "ts-node"]),
    ("Sovereign-Scribe", "/root/.openclaw/workspace/abraxas/mcps/sovereign-scribe/dist/index.js", ["node"]),
    ("Soter", "/root/.openclaw/workspace/abraxas/mcps/soter-verifier/src/index.ts", ["npx", "ts-node"]),
    ("Mnemosyne", "/root/.openclaw/workspace/abraxas/mcps/mnemosyne-memory/src/index.ts", ["npx", "ts-node"]),
    ("Janus", "/root/.openclaw/workspace/abraxas/mcps/janus-orchestrator/src/server.ts", ["npx", "ts-node"]),
    ("Guardrail", "/root/.openclaw/workspace/abraxas/mcps/guardrail-monitor/src/server.ts", ["npx", "ts-node"]),
]

INIT_REQUEST = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {
            "name": "Sovereign-Health-Check",
            "version": "1.0.0"
        }
    }
}

def check_server(name, path, cmd):
    if not os.path.exists(path):
        return "MISSING", "File not found"

    try:
        # Use a subprocess with a pipe for stdin/stdout
        process = subprocess.Popen(
            cmd + [path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1 # Line buffered
        )

        # Step 1: Send initialize request
        process.stdin.write(json.dumps(INIT_REQUEST) + "\n")
        process.stdin.flush()

        # Wait for the initialization response
        start_time = time.time()
        init_success = False
        while time.time() - start_time < 5:
            line = process.stdout.readline()
            if line:
                try:
                    response = json.loads(line)
                    if response.get("id") == 1:
                        init_success = True
                        break
                except json.JSONDecodeError:
                    continue
        
        if not init_success:
            process.terminate()
            return "FAIL", "Initialization Timeout"

        # Step 2: Verify Tool Functionality (if it's a known tool server)
        # For this health check, we just verify the server can handle a basic tool list
        LIST_TOOLS_REQUEST = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "list_tools",
            "params": {}
        }
        process.stdin.write(json.dumps(LIST_TOOLS_REQUEST) + "\n")
        process.stdin.flush()

        start_time = time.time()
        tool_success = False
        while time.time() - start_time < 5:
            line = process.stdout.readline()
            if line:
                try:
                    response = json.loads(line)
                    if response.get("id") == 2:
                        tool_success = True
                        break
                except json.JSONDecodeError:
                    continue
        
        process.terminate()
        
        if tool_success:
            return "PASS", "Initialized & Tools Responsive"
        else:
            return "FAIL", "Tool List Timeout"

    except Exception as e:
        return "FAIL", str(e)

def main():
    print(f"{'Server':<20} | {'Status':<10} | {'Details'}")
    print("-" * 60)
    
    results = []
    for name, path, cmd in SERVERS:
        status, detail = check_server(name, path, cmd)
        print(f"{name:<20} | {status:<10} | {detail}")
        results.append((name, status))

    print("-" * 60)
    passed = sum(1 for r in results if r[1] == "PASS")
    print(f"Total: {len(SERVERS)} | Passed: {passed} | Failed: {len(SERVERS) - passed}")

if __name__ == "__main__":
    main()
