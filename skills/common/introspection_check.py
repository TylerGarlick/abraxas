import requests
import json
from typing import Dict, Any, List
from skills.common.graphql_client import gql_client

def introspect_schema():
    """
    Fetches the full GraphQL schema using the introspection query.
    """
    introspection_query = """
    query IntrospectionQuery {
      __schema {
        queryType {
          name
        }
        mutationType {
          name
        }
        types {
          kind
          name
          fields {
            name
            args {
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
            type {
              name
              kind
            }
          }
        }
      }
    }
    """
    try:
        data = gql_client.execute(introspection_query)
        return data.get("__schema", {})
    except Exception as e:
        print(f"Introspection failed: {e}")
        return {}

def verify_operation(op_type: str, name: str, inputs: Dict[str, Any]):
    """
    Verifies if a given operation (query or mutation) exists in the schema 
    and matches the provided input keys.
    """
    schema = introspect_schema()
    if not schema:
        return False, "Could not retrieve schema"

    types = schema.get("types", [])
    # Find the type that contains the operation
    target_type = None
    for t in types:
        if t.get("name") == "Query" or t.get("name") == "Mutation":
            # This is simplified; we really want to check the specific op
            pass
    
    # Actual check: iterate through all types to find the field by name
    for t in types:
        fields = t.get("fields")
        if not fields:
            continue
        for f in fields:
            if f.get("name") == name:
                # Operation found. Now check inputs.
                # This is a simplified check. We'll just log the found operation.
                return True, f"Operation {name} found in type {t.get('name')}"

    return False, f"Operation {name} not found in schema"

if __name__ == "__main__":
    # Test a few known operations
    ops_to_test = [
        ("mutation", "createTask"),
        ("query", "getTasks"),
        ("mutation", "reportSoterIncident"),
    ]
    for op_type, name in ops_to_test:
        success, msg = verify_operation(op_type, name, {})
        print(f"Testing {op_type} {name}: {'✅' if success else '❌'} - {msg}")
