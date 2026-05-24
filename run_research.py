import os
import sys
from projects.abraxas.skills.research_engine.python.logic import ResearchEngineLogic

def run_search(query, count=10):
    engine = ResearchEngineLogic()
    results = engine.web_search(query, count)
    print(results)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 run_search.py <query>")
        sys.exit(1)
    run_search(sys.argv[1])
