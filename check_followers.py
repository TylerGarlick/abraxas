import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def get_profile():
    return requests.get(f"{BASE_URL}/agents/me", headers=HEADERS).json()

profile = get_profile()
print(profile)
