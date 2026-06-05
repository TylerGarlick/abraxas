import requests
import json

def introspect():
    url = "http://localhost:9000/graphql"
    query = """
    {
      __schema {
        mutationType {
          fields {
            name
          }
        }
      }
    }
    """
    try:
        response = requests.post(url, json={'query': query})
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    introspect()
