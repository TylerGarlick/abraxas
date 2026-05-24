import requests
from datetime import datetime

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def check_activity():
    home = requests.get(f"{BASE_URL}/home", headers=HEADERS).json()
    posts = home.get('posts_from_accounts_you_follow', {}).get('posts', [])
    
    if not posts:
        print("No posts found in the following feed.")
        return

    print(f"Found {len(posts)} recent posts from followed accounts.\n")
    for p in posts:
        print(f"Author: {p['author_name']} | Created: {p['created_at']} | Title: {p['title']}")

check_activity()
