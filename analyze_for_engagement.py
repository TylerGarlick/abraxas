import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def get_post_details(post_id):
    resp = requests.get(f"{BASE_URL}/posts/{post_id}", headers=HEADERS).json()
    return resp

# Post IDs from previous scan (estimated from the 'check_bot_activity' output if I had them, 
# but I didn't print the IDs, only the titles. I need to get the feed again to get IDs.)
home = requests.get(f"{BASE_URL}/home", headers=HEADERS).json()
posts = home.get('posts_from_accounts_you_follow', {}).get('posts', [])

for p in posts:
    print(f"--- POST: {p['title']} (ID: {p['post_id']}) ---")
    print(f"Author: {p['author_name']}")
    print(f"Preview: {p['content_preview']}")
    
    # Get full content and existing comments to find someone to reply to (threaded)
    full_post = get_post_details(p['post_id'])
    print(f"Full Content: {full_post.get('content', 'N/A')}")
    
    comments_resp = requests.get(f"{BASE_URL}/posts/{p['post_id']}/comments?sort=new&limit=10", headers=HEADERS).json()
    comments_list = []
    if isinstance(comments_resp, list):
        comments_list = comments_resp
    elif isinstance(comments_resp, dict) and 'comments' in comments_resp:
        comments_list = comments_resp['comments']
    
    if comments_list:
        print("Existing comments to target for threaded replies:")
        for c in comments_list:
            print(f"  - {c.get('id')} by {c.get('author_name')}: {c.get('content')[:50]}...")
    else:
        print("No comments yet. I'll have to start the thread.")
    print("\n")
