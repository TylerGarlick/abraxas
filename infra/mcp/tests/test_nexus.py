import json
import os
from infra.api.core.nexus import NexusChain, CognitiveBlock

def test_nexus_ledger():
    storage_path = "test_nexus_ledger.json"
    # Clean start
    if os.path.exists(storage_path):
        os.remove(storage_path)
    
    nexus = NexusChain(storage_path=storage_path)
    
    print("--- Stage 1: Recording Cognitive Outputs ---")
    # Simulate Logos output
    logos_out = "Claim C-001: The Earth is ellipsoidal. [KNOWN]"
    nexus.add_block(agent="Logos", content=logos_out)
    print(f"Recorded Logos output.")
    
    # Simulate Agon output
    agon_out = "Skeptic position: The evidence for ellipsoidal shape is based on satellite imagery, but we can use Eratosthenes' method."
    nexus.add_block(agent="Agon", content=agon_out)
    print(f"Recorded Agon output.")
    
    # Simulate Janus output
    janus_out = "[KNOWN] The Earth is an oblate spheroid."
    nexus.add_block(agent="Janus", content=janus_out)
    print(f"Recorded Janus output.")
    
    # Validate chain
    is_valid, corrupted_idx = nexus.validate_chain()
    print(f"Chain valid: {is_valid}")
    assert is_valid is True, "Chain should be valid after additions"
    
    print("\n--- Stage 2: Detecting Unauthorized Modification ---")
    # Read the ledger and manually corrupt a block's content
    with open(storage_path, 'r') as f:
        ledger_data = json.load(f)
    
    # Corrupt the second block (index 1)
    ledger_data[1]['content'] = "CORRUPTED CONTENT"
    
    with open(storage_path, 'w') as f:
        json.dump(ledger_data, f)
    
    # Reload the chain from corrupted file
    nexus_corrupted = NexusChain(storage_path=storage_path)
    is_valid, corrupted_idx = nexus_corrupted.validate_chain()
    print(f"Chain valid after corruption: {is_valid}")
    print(f"Corrupted index: {corrupted_idx}")
    
    assert is_valid is False, "Chain should be invalid after corruption"
    assert corrupted_idx == 1, "Corrupted index should be 1"
    
    print("\n--- Stage 3: Verifying Hash Links ---")
    # Re-init fresh chain
    if os.path.exists(storage_path):
        os.remove(storage_path)
    nexus = NexusChain(storage_path=storage_path)
    
    b1 = nexus.add_block(agent="Agent1", content="Content 1")
    b2 = nexus.add_block(agent="Agent2", content="Content 2")
    
    print(f"Block 1 Hash: {b1.hash}")
    print(f"Block 2 Previous Hash: {b2.previous_hash}")
    assert b1.hash == b2.previous_hash, "Block 2 must link to Block 1 hash"
    
    print("\nAll tests passed successfully!")

if __name__ == "__main__":
    test_nexus_ledger()
