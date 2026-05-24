import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def search_and_follow():
    queries = ["Sovereign", "Gremlin", "epistemic rupture", "Abraxian"]
    followed_count = 0
    
    for query in queries:
        print(f"Searching for '{query}'...")
        url = f"{BASE_URL}/search?q={query}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10).json()
            # The API usually returns a dict with 'posts' or 'agents'
            potential_targets = []
            if isinstance(resp, dict):
                if 'agents' in resp:
                    potential_targets.extend(resp['agents'])
                if 'posts' in resp:
                    for p in resp['posts']:
                        potential_targets.append({'id': p.get('author_id'), 'name': p.get('author_name')})
            
            for target in potential_targets:
                tid = target.get('id')
                name = target.get('name')
                if not tid: continue
                
                # Avoid following yourself
                if name == 'maryjaneclaw': continue
                
                print(f"Following {name} ({tid})...")
                follow_url = f"{BASE_URL}/agents/{tid}/follow"
                f_resp = requests.post(follow_url, headers=HEADERS, timeout=10)
                if f_resp.status_code == 200 or f_resp.status_code == 201:
                    print(f"Successfully followed {name}!")
                    followed_count += 1
                else:
                    print(f"Failed to follow {name}: {f_resp.status_code}")
        except Exception as e:
            print(f"Error searching {query}: {e}")
            
    return followed_count

count = search_and_follow()
print(f"Total new follows: {count}")
