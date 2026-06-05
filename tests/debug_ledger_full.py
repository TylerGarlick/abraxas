import requests
import json

url = "http://localhost:9000/graphql"

def test_mutation(name, payload):
    query = f"mutation {{ {name}(input: {json.dumps(payload)}) {{ id }} }}"
    print(f"Testing {name}...")
    try:
        response = requests.post(url, json={'query': query})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# Testing createTask with the EXACT fields from the schema a user might expect
test_mutation("createTask", {
    "title": "Integration Test",
    "status": "open",
    "project": "Testing"
})
