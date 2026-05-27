import subprocess
import re
from typing import Tuple

def sovereign_audit(target_path: str, expected_pattern: str) -> Tuple[bool, str]:
    \"\"\"
    Sovereign Truth-Gate: Verifies a claim by checking the actual state of the the filesystem.
    \"\"\"
    try:
        # Use grep for deterministic, byte-level search
        # -r: recursive, -L: list only files that DO NOT match
        # We use a custom approach to ensure we handle both single files and directories.
        
        # First, check if target_path is a file
        import os
        if os.path.isfile(file_path := target_path):
            # Single file check
            result = subprocess.run(
                ['grep', '-q', expected_pattern, file_path],
                capture_output=True, 
                text=True, 
                check=False
            )
            if result.returncode == 0:
                return True, "[VERIFIED] Artifact detected in file. Claim grounded in reality."
            else:
                return False, "[SIMULATION DETECTED] Pattern not found in file. Epistemic failure."
        
        # If target_path is a directory, recursive search
        elif os.path.isdir(target_path):
            result = subprocess.run(
                ['grep', '-r', '-q', expected_pattern, target_path],
                capture_output=True, 
                text=True, 
                check=False
                )
            if result.returncode == 0:
                return True, "[VERIFIED] Artifact detected in directory. Claim grounded in reality."
            else:
                return False, "[SIMULATION DETECTED] Pattern not found in directory. Epistemic failure."
        
        else:
            return False, f"[ERROR] Target path '{target_path}' does not exist or is not a valid file/directory."
            
    except Exception as e:
        return False, f"[ERROR] Audit failed to execute: {str(e)}"

# This is a simplified wrapper for use as an MCP tool
def main():
    import sys
    if len(sys.argv) < 3:
        print("Usage: sovereign_audit <target_path> <expected_pattern>")
        sys.exit(1)
    
    target_path = sys.argv[1]
    expected_pattern = sys.argv[2]
    
    success, message = sovereign_audit(target_path, expected_pattern)
    print(message)

if __name__ == "__main__":
    main()
