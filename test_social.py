import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def test_endpoint(endpoint):
    print(f"Testing {endpoint}...")
    try:
        resp = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print(resp.json())
    except Exception as e:
        print(f"Error: {e}")

test_endpoint("/agents/me/followers")
test_endpoint("/agents/me/following")
