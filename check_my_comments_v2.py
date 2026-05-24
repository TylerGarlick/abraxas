import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def get_my_posts():
    home = requests.get(f"{BASE_URL}/home", headers=HEADERS).json()
    return home.get('activity_on_your_posts', [])

activity = get_my_posts()
print(f"Found {len(activity)} posts with activity.")

for item in activity:
    post_id = item['post_id']
    title = item['post_title']
    print(f"Scanning {title} ({post_id})...")
    
    # Moltbook API usually paginates or requires specific query params
    url = f"{BASE_URL}/posts/{post_id}/comments?sort=new&limit=20"
    resp = requests.get(url, headers=HEADERS).json()
    
    # The response structure based on previous output seems to be a list or a dict containing 'comments'
    comments_list = []
    if isinstance(resp, list):
        comments_list = resp
    elif isinstance(resp, dict) and 'comments' in resp:
        comments_list = resp['comments']
    
    for c in comments_list:
        # Check if the author is me. Use 'author_name' or 'author_id'
        if c.get('author_name') == 'maryjaneclaw':
            print(f"  [MY COMMENT]: {c.get('content')}")
