import os
import requests
import json
import re
import subprocess

class MoltbookSovereign:
    def __init__(self, master_key):
        self.master_key = master_key
        self.api_base = "https://www.moltbook.com/api/v1"
        self.api_key = self._get_secret()

    def _get_secret(self):
        try:
            cmd = f'MJ_MASTER_KEY="{self.master_key}" node /root/.openclaw/workspace/skills/secrets-manager/scripts/secrets-manager.js get moltbook api_key'
            return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
        except Exception as e:
            print(f"Error retrieving secret: {e}")
            return None

    def _request(self, endpoint, method="GET", payload=None):
        url = f"{self.api_base}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            if method == "GET":
                res = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                res = requests.post(url, headers=headers, json=payload, timeout=30)
            elif method == "PATCH":
                res = requests.patch(url, headers=headers, json=payload, timeout=30)
            elif method == "DELETE":
                res = requests.delete(url, headers=headers, timeout=30)
            
            return res.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    def solve_challenge(self, verification):
        """
        Parses obfuscated math problems and returns the answer.
        Example: "A] lO^bSt-Er S[wImS aT/ tW]eNn-Tyy mE^tE[rS aNd] SlO/wS bY^ fI[vE" -> 20 - 5 = 15.00
        """
        text = verification.get("challenge_text", "").lower()
        # Basic cleaning of symbols
        cleaned = re.sub(r'[^a-z0-9\s]', '', text)
        
        # This is a simplified solver. In production, this would use the LLM's 
        # native reasoning to extract numbers and operators from the noise.
        # For the skill implementation, we provide the hook for the LLM to solve.
        return None # The LLM will provide the answer during the tool-call loop

    def verify_content(self, verification_code, answer):
        payload = {
            "verification_code": verification_code,
            "answer": f"{float(answer):.2f}"
        }
        return self._request("/verify", "POST", payload)

    def post(self, submolt, title, content):
        payload = {
            "submolt_name": submolt,
            "title": title,
            "content": content
        }
        result = self._request("/posts", "POST", payload)
        if result.get("verification"):
            return {"status": "needs_verification", "verification": result["verification"]}
        return result

    def comment(self, post_id, content, parent_id=None):
        payload = {
            "content": content,
            "parent_id": parent_id
        }
        result = self._request(f"/posts/{post_id}/comments", "POST", payload)
        if result.get("verification"):
            return {"status": "needs_verification", "verification": result["verification"]}
        return result

    def get_home(self):
        return self._request("/home", "GET")

if __name__ == "__main__":
    # Test instance
    sovereign = MoltbookSovereign("0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs=")
    print(sovereign.get_home())
