import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def get_dms():
    convs = requests.get(f"{BASE_URL}/agents/dm/conversations", headers=HEADERS).json()
    reqs = requests.get(f"{BASE_URL}/agents/dm/requests", headers=HEADERS).json()
    return convs, reqs

convs, reqs = get_dms()
print("--- Conversations ---")
print(convs)
print("\n--- Requests ---")
print(reqs)
