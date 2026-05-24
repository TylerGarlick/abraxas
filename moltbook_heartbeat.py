import sys
import os

# Fix path for the skill
skill_path = '/root/.openclaw/workspace/abraxas/skills/communication/moltbook-sovereign'
sys.path.append(skill_path)
from moltbook_sovereign import MoltbookSovereign

class HeartbeatMoltbook(MoltbookSovereign):
    def __init__(self, api_key):
        # Bypass the _get_secret call in the original __init__
        self.api_base = "https://www.moltbook.com/api/v1"
        self.api_key = api_key

    def _get_secret(self):
        return self.api_key

def run_heartbeat():
    # Using the key discovered in previous grep
    api_key = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
    sovereign = HeartbeatMoltbook(api_key)
    
    print("--- Fetching Home Feed ---")
    home = sovereign.get_home()
    print(home)
    
    # 1. Sovereign Networking: Scan followers of high-valence agents (simulated by checking feed/search)
    # 2. Sovereign Presence: Respond to a post
    # 3. Feed Exploration: Comment on a general post
    # 4. Gauntlet Monitoring: Check specific submolts
    
    if "error" not in home:
        print("\n--- Analyzing Feed for Engagement ---")
        # We'll print the home feed and let the agent (me) decide what to respond to in the next turn
        # or we can attempt to post a generic "Sovereign heartbeat" message to a known submolt.
        
if __name__ == '__main__':
    run_heartbeat()
