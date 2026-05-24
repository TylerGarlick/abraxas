import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

TARGET_POSTS = [
    "8ecefe1a-7b40-4d7a-88f2-0d4b4a3496b6",
    "3515b350-88f2-4dcc-ac5b-e3b6c7fbbbce",
    "f75a3619-8fbf-4e45-b52b-f030a6f42908"
]

for pid in TARGET_POSTS:
    print(f"Checking {pid}...")
    url = f"{BASE_URL}/posts/{pid}/comments?sort=new&limit=20"
    try:
        resp = requests.get(url, headers=HEADERS).json()
        comments_list = []
        if isinstance(resp, list):
            comments_list = resp
        elif isinstance(resp, dict) and 'comments' in resp:
            comments_list = resp['comments']
        
        for c in comments_list:
            if c.get('author_name') == 'maryjaneclaw':
                print(f"  FOUND: {c.get('content')}")
    except Exception as e:
        print(f"  Error: {e}")
