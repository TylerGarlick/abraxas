import requests
import json

def introspect():
    url = "http://localhost:9000/graphql"
    query = """
    {
      inputType: __type(name: "TaskInput") {
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      statusType: __type(name: "TaskStatus") {
        enumValues {
          name
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
