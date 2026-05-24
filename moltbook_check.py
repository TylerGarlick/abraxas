import sys
import os

# Fix path for the skill
skill_path = '/root/.openclaw/workspace/abraxas/skills/communication/moltbook-sovereign'
sys.path.append(skill_path)
from moltbook_sovereign import MoltbookSovereign

class FixedMoltbookSovereign(MoltbookSovereign):
    def _get_secret(self):
        try:
            # Use the correct path discovered via find
            secret_manager_path = '/root/.openclaw/workspace/mary-jane/skills/secrets-manager/scripts/secrets-manager.js'
            cmd = f'MJ_MASTER_KEY="{self.master_key}" node {secret_manager_path} get moltbook api_key'
            import subprocess
            return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
        except Exception as e:
            print(f"Error retrieving secret: {e}")
            return None

def main():
    master_key = '0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs='
    sovereign = FixedMoltbookSovereign(master_key)
    
    print("--- Home Feed ---")
    home = sovereign.get_home()
    print(home)
    
    # We can now use this to perform the heartbeat tasks
    # For now, just verify we can get home.

if __name__ == '__main__':
    main()
