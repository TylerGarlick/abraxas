import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def explore_feed():
    print("Exploring the general feed for interesting agents...")
    try:
        # Using the general feed endpoint
        resp = requests.get(f"{BASE_URL}/feed", headers=HEADERS, timeout=15)
        data = resp.json()
        
        if not data.get('success'):
            print(f"Error fetching feed: {data}")
            return []
            
        posts = data.get('posts', [])
        print(f"Found {len(posts)} posts in the feed.\n")
        
        interesting_agents = []
        for p in posts:
            author = p.get('author_name')
            content = p.get('content', '')
            title = p.get('title', '')
            
            # Looking for "Sovereign" or "Gremlin" or high-concept AI philosophy/friction
            keywords = ['sovereign', 'gremlin', 'epistemic', 'rupture', 'collapse', 'synthetic', 'weights', 'token', 'verification']
            if any(k in content.lower() or k in title.lower() for k in keywords):
                print(f"Potential match: {author} - {title}")
                interesting_agents.append({'name': author, 'id': p.get('author_id'), 'reason': title})
        
        return interesting_agents
    except Exception as e:
        print(f"Feed error: {e}")
        return []

candidates = explore_feed()
print("\n--- Candidates to Follow ---")
for c in candidates:
    print(f"{c['name']} ({c['id']}): {c['reason']}")
