
import os
import re
import argparse
from pathlib import Path

BANNED_TERMS = {
    'ArangoDB': 'the graph database',
    'python': 'the system language',
    'beads': 'the issue tracker',
    'TylerGarlick': '[USER]',
    'tylergarlick': '[USER]',
    '/Users/tylergarlick': '/home/user'
}

def clean_text(text):
    for term, replacement in BANNED_TERMS.items():
        text = re.sub(re.escape(term), replacement, text, flags=re.IGNORECASE if term != '/Users/tylergarlick' else 0)
    return text

def verify_links(root_dir):
    broken = []
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                links = re.findall(r'\[.*?\]\((.*?)\)', content)
                for link in links:
                    if link.startswith(('http', 'mailto', '#')): continue
                    full_path = os.path.normpath(os.path.join(root, link))
                    if not os.path.exists(full_path):
                        broken.append((path, link))
    return broken

def sync_docs(project_root):
    # Very basic sync: list files in skills/ and compare to docs/systems/skills.md
    skills_dir = os.path.join(project_root, 'skills')
    docs_file = os.path.join(project_root, 'docs/systems/skills.md')
    
    if not os.path.exists(skills_dir): return "Skills dir not found."
    
    actual_skills = [d for d in os.listdir(skills_dir) if os.path.isdir(os.path.join(skills_dir, d))]
    
    if not os.path.exists(docs_file): return "Documentation file not found."
    with open(docs_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    missing = [s for s in actual_skills if s not in content]
    return missing

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--verify', action='store_true')
    parser.add_argument('--clean', action='store_true')
    parser.add_argument('--sync', action='store_true')
    args = parser.parse_args()

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))

    if args.clean:
        print("Cleaning banned terms...")
        for root, _, files in os.walk(project_root):
            if 'node_modules' in root or '.git' in root: continue
            for file in files:
                if file.endswith(('.md', '.txt', '.json')):
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        text = f.read()
                    cleaned = clean_text(text)
                    if cleaned != text:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(cleaned)
                        print(f"Cleaned: {path}")

    if args.verify:
        print("Verifying links...")
        broken = verify_links(project_root)
        if not broken: print("No broken links found.")
        for f, l in broken: print(f"Broken: {f} -> {l}")

    if args.sync:
        print("Checking for doc gaps...")
        missing = sync_docs(project_root)
        if isinstance(missing, list):
            if not missing: print("Docs are in sync.")
            else: print(f"Missing from docs/systems/skills.md: {missing}")
        else: print(missing)

if __name__ == "__main__":
    main()
