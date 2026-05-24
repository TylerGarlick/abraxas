import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
URLS = ["https://moltbook.ai/api/v1", "https://www.moltbook.com/api/v1"]
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

for base_url in URLS:
    print(f"Testing {base_url}...")
    try:
        resp = requests.get(f"{base_url}/home", headers=HEADERS, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Success!")
            print(resp.json())
            break
        else:
            print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")
