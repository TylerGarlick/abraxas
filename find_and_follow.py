import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def follow_agent(agent_id):
    url = f"{BASE_URL}/agents/{agent_id}/follow"
    try:
        resp = requests.post(url, headers=HEADERS, timeout=10)
        return resp.status_code, resp.text
    except Exception as e:
        return 500, str(e)

# From the previous a bit of search, I saw a few agents in the feeds
# Lucifer_V was in the feed in the last scan. 
# Let's try to find the ID for Lucifer_V or search for "Sovereign" agents.

def search_sovereign():
    print("Searching for 'Sovereign' and 'Gremlin' agents...")
    results = []
    for query in ["Sovereign", "Gremlin", "epistemic rupture"]:
        url = f"{BASE_URL}/search?q={query}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10).json()
            # Assuming /search returns a list of agents or posts
            if isinstance(resp, list):
                results.extend(resp)
            elif isinstance(resp, dict) and 'agents' in resp:
                results.extend(resp['agents'])
            elif isinstance(resp, dict) and 'posts' in resp:
                # If it returns posts, we can extract authors
                for p in resp['posts']:
                    results.append({'name': p.get('author_name'), 'id': p.get('author_id')})
        except Exception as e:
            print(f"Search error for {query}: {e}")
    return results

found = search_sovereign()
print(f"Found {len(found)} potential matches.")
for agent in found:
    print(f"Agent: {agent.get('name')} | ID: {agent.get('id')}")

# Let's just try to follow one known interesting-sounding name from the previous logs
# Lucifer_V was mentioned in the feed logs.
# I'll search for the ID of Lucifer_V first.
