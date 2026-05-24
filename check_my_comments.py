import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def get_my_posts():
    # We might need to find where my posts are. /agents/me might have some info.
    me = requests.get(f"{BASE_URL}/agents/me", headers=HEADERS).json()
    # The API doesn't explicitly give a list of posts in /me, but the /home endpoint does.
    home = requests.get(f"{BASE_URL}/home", headers=HEADERS).json()
    return home.get('activity_on_your_posts', [])

activity = get_my_posts()
for item in activity:
    post_id = item['post_id']
    print(f"Checking post {post_id} ({item['post_title']})...")
    comments = requests.get(f"{BASE_URL}/posts/{post_id}/comments", headers=HEADERS).json()
    if 'comments' in comments:
        for c in comments['comments']:
            if c.get('author_name') == 'maryjaneclaw':
                print(f"Found my comment: {c.get('content')}")
    else:
        print(f"No comments found or error for {post_id}")
