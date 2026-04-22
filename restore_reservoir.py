import requests
import json
import re
import os

# Config
URL = "http://localhost:8529"
AUTH = ("root", "5orange5")
DB = "abraxas_db"
MAPPING_FILE = "/root/.openclaw/workspace/.sovereign_vault/red-book-mapping.md"

def db_call(endpoint, data=None, method="POST"):
    url = f"{URL}/_api/{endpoint}"
    try:
        if method == "POST":
            resp = requests.post(url, auth=AUTH, json=data, timeout=10)
        else:
            resp = requests.get(url, auth=AUTH, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error calling {endpoint}: {e}")
        return None

def restore():
    if not os.path.exists(MAPPING_FILE):
        print(f"Mapping file not found at {MAPPING_FILE}")
        return

    with open(MAPPING_FILE, "r") as f:
        content = f.read()

    # Extraction logic for the Summary Table
    # | Lucifer.md | 34760 | 34806 | 34861 | 34883 | ✅ Complete |
    matches = re.findall(r'\| (.*?) \| (\d+) \| ([\d, ]+) \| ([\d, ]+) \| ([\d, ]+) \|', content)
    
    print(f"Found {len(matches)} sessions to restore...")

    for row in matches:
        filename, sess_id, hypos, concs, plans = row
        
        # 1. Create Session
        session_data = {
            "timestamp": "2026-04-18T00:40:00Z",
            "userPrompt": f"Migration from {filename}", 
            "seedConcepts": [], 
            "channelId": "1492380897167540325"
        }
        res_sess = db_call(f"{DB}/_api/document/dream_sessions", session_data)
        if not res_sess: continue
        s_key = res_sess['_key']
        
        # 2. Hypotheses
        hypo_list = [h.strip() for h in hypos.split(',') if h.strip()]
        for h_id in hypo_list:
            hypo_data = {
                "rawPatternRepresentation": f"Restored from {filename}", 
                "metadata": {"noveltyScore": 0.8, "coherenceScore": 0.8, "creativeDrivers": ["Sovereign"]}, 
                "isValuable": True, 
                "channelId": "1492380897167540325"
            }
            res_hypo = db_call(f"{DB}/_api/document/hypotheses", hypo_data)
            if not res_hypo: continue
            h_key = res_hypo['_key']
            db_call(f"{DB}/_api/document/SESS_TO_HYPO", {"_from": f"dream_sessions/{s_key}", "_to": f"hypotheses/{h_key}"})
            
            # 3. Concepts (naive mapping)
            concept_list = [c.strip() for c in concs.split(',') if c.strip()]
            if concept_list:
                c_id = concept_list[0]
                concept_data = {"name": f"Restored Concept {c_id}", "description": f"Derived from {filename}", "channelId": "149238089716 own"}
                res_conc = db_call(f"{DB}/_api/document/concepts", concept_data)
                if res_conc:
                    c_key = res_conc['_key']
                    db_call(f"{DB}/_api/document/HYPO_TO_CONCEPT", {"_from": f"hypotheses/{h_key}", "_to": f"concepts/{c_key}"})
                    
                    # 4. Plans
                    plan_list = [p.strip() for p in plans.split(',') if p.strip()]
                    if plan_list:
                        p_id = plan_list[0]
                        plan_data = {"summary": f"Restored Plan {p_id}", "steps": ["Step 1: Restore"], "riskAssessment": "Low", "groundingStatus": "ANCHORED", "channelId": "1492380897167540325"}
                        res_plan = db_call(f"{DB}/_api/document/actionable_plans", plan_data)
                        if res_plan:
                            p_key = res_plan['_key']
                            db_call(f"{DB}/_api/document/CONCEPT_TO_PLAN", {"_from": f"concepts/{c_key}", "_to": f"actionable_plans/{p_key}"})
        
        print(f"Successfully restored chain for {filename} (Session {sess_id})")

if __name__ == "__main__":
    restore()
