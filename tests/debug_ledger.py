import requests
import json

url = "http://localhost:9000/graphql"
mutation = """
mutation {
  createTask(input: {
    title: "Debug Task",
    project: "Debug",
    scope: "Debug",
    priority: "LOW"
  }) {
    id
    title
  }
}
"""

try:
    response = requests.post(url, json={'query': mutation})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
