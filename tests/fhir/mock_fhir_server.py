"""
Mock FHIR Server for Integration Testing

A simple HTTP server that simulates Epic, Cerner, and Meditech FHIR endpoints.
"""

import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Sample FHIR Resources
EPIC_PATIENT = {
    "resourceType": "Patient",
    "id": "epic-patient-001",
    "meta": {
        "profile": ["http://Epic.com/fhir/identifiers/Patient"]
    },
    "identifier": [
        {
            "type": {"coding": [{"code": "MR", "display": "Medical Record Number"}]},
            "system": "http://Epic.com/fhir/identifiers/mrn",
            "value": "EPIC-MRN-12345"
        }
    ],
    "name": [
        {
            "use": "official",
            "family": "Smith",
            "given": ["John", "Robert"],
            "prefix": ["Mr."]
        }
    ],
    "gender": "male",
    "birthDate": "1980-05-15",
    "address": [
        {
            "use": "home",
            "line": ["123 Main St", "Apt 4B"],
            "city": "Boston",
            "state": "MA",
            "postalCode": "02101",
            "country": "USA"
        }
    ],
    "telecom": [
        {"system": "phone", "value": "617-555-0100", "use": "home"},
        {"system": "email", "value": "john.smith@email.com"}
    ]
}

EPIC_CLAIM = {
    "resourceType": "Claim",
    "id": "epic-claim-001",
    "meta": {
        "profile": ["http://Epic.com/fhir/Claim"]
    },
    "status": "active",
    "type": {
        "coding": [{"code": "inpatient", "display": "Inpatient"}]
    },
    "use": "claim",
    "patient": {"reference": "Patient/epic-patient-001"},
    "created": "2024-01-15",
    "insurer": {"reference": "Organization/insurer-001"},
    "diagnosis": [
        {
            "sequence": 1,
            "diagnosisCodeableConcept": {
                "coding": [{"code": "J18.9", "display": "Pneumonia, unspecified"}]
            }
        },
        {
            "sequence": 2,
            "diagnosisCodeableConcept": {
                "coding": [{"code": "R05", "display": "Cough"}]
            }
        }
    ],
    "procedure": [
        {
            "sequence": 1,
            "procedureCodeableConcept": {
                "coding": [{"code": "99291", "display": "Critical care, first hour"}]
            },
            "date": "2024-01-15"
        }
    ],
    "item": [
        {
            "sequence": 1,
            "service": {
                "coding": [{"code": "99291", "display": "Critical care"}]
            },
            "quantity": {"value": 1, "unitPrice": {"value": 500.00}},
            "net": {"value": 500.00},
            "diagnosisLink": [1]
        }
    ],
    "total": {"value": 500.00, "currency": "USD"}
}

EPIC_COVERAGE = {
    "resourceType": "Coverage",
    "id": "epic-coverage-001",
    "meta": {
        "profile": ["http://Epic.com/fhir/Coverage"]
    },
    "status": "active",
    "type": {
        "coding": [{"code": "HI", "display": "Health Insurance"}]
    },
    "subscriber": {"reference": "Patient/epic-patient-001"},
    "beneficiary": {"reference": "Patient/epic-patient-001"},
    "payor": [
        {"reference": "Organization/epic-insurer", "display": "Epic Health Insurance"}
    ],
    "class": [
        {
            "type": {"coding": [{"code": "PLAN"}]},
            "value": "EPIC-GOLD-PLAN",
            "name": "Epic Gold Health Plan"
        }
    ]
}

CERNER_PATIENT = {
    "resourceType": "Patient",
    "id": "cerner-patient-001",
    "meta": {
        "profile": ["http://fhir.cerner.com/Patient"]
    },
    "identifier": [
        {
            "type": {"coding": [{"code": "MR", "display": "Medical Record"}]},
            "system": "http://cerner.com/fhir/identifiers/mrn",
            "value": "CERN-MRN-67890"
        }
    ],
    "name": [
        {
            "use": "official",
            "family": "Johnson",
            "given": ["Sarah", "Marie"],
            "prefix": ["Dr."]
        }
    ],
    "gender": "female",
    "birthDate": "1985-09-22",
    "telecom": [
        {"system": "email", "value": "sarah.johnson@hospital.org"}
    ]
}

CERNER_CLAIM = {
    "resourceType": "Claim",
    "id": "cerner-claim-001",
    "meta": {
        "profile": ["http://fhir.cerner.com/Claim"]
    },
    "status": "active",
    "type": {
        "coding": [{"code": "outpatient", "display": "Outpatient"}]
    },
    "use": "claim",
    "patient": {"reference": "Patient/cerner-patient-001"},
    "created": "2024-02-01",
    "diagnosis": [
        {
            "sequence": 1,
            "diagnosisCodeableConcept": {
                "coding": [{"code": "J06.9", "display": "Upper respiratory infection"}]
            }
        }
    ],
    "total": {"value": 250.00, "currency": "USD"}
}

CERNER_COVERAGE = {
    "resourceType": "Coverage",
    "id": "cerner-coverage-001",
    "meta": {
        "profile": ["http://fhir.cerner.com/Coverage"]
    },
    "status": "active",
    "type": {
        "coding": [{"code": "HI", "display": "Health Insurance"}]
    },
    "subscriber": {"reference": "Patient/cerner-patient-001"},
    "beneficiary": {"reference": "Patient/cerner-patient-001"},
    "payor": [{"display": "Cerner Health Network"}],
    "class": [
        {
            "type": {"coding": [{"code": "FHIR"}]},
            "value": "FHIR-CLASS-001"
        },
        {
            "type": {"coding": [{"code": "MEMBER"}]},
            "value": "MEMBER-789012",
            "name": "Primary Member Plan"
        }
    ]
}

MEDITECH_PATIENT = {
    "resourceType": "Patient",
    "id": "meditech-patient-001",
    "identifier": [
        {
            "type": {"coding": [{"code": "MR", "display": "Medical Record"}]},
            "system": "http://meditech.com/fhir/identifiers/mrn",
            "value": "MDT-MRN-11111"
        },
        {
            "system": "http://meditech.com/fhir/identifiers/barbabanner",
            "value": "BB-PAT-001",
            "extension": [
                {
                    "url": "http://meditech.com/fhir/extension/barbabanner",
                    "valueString": "BARBABANNER"
                }
            ]
        }
    ],
    "name": [
        {
            "family": "Chen",
            "given": ["David", "Wei"]
        }
    ],
    "gender": "male",
    "birthDate": "1970-12-01"
}

MEDITECH_CLAIM = {
    "resourceType": "Claim",
    "id": "meditech-claim-001",
    "status": "active",
    "type": {
        "coding": [{"code": "inpatient", "display": "Inpatient"}]
    },
    "patient": {"reference": "Patient/meditech-patient-001"},
    "created": "2024-03-01",
    "diagnosis": [
        {
            "sequence": 1,
            "diagnosisCodeableConcept": {
                "coding": [{"code": "E11.9", "display": "Type 2 diabetes"}]
            }
        }
    ],
    "total": {"value": 12000.00, "currency": "USD"}
}

MEDITECH_COVERAGE = {
    "resourceType": "Coverage",
    "id": "meditech-coverage-001",
    "status": "active",
    "type": {
        "coding": [{"code": "HI", "display": "Health Insurance"}]
    },
    "subscriber": {"reference": "Patient/meditech-patient-001"},
    "beneficiary": {"reference": "Patient/meditech-patient-001"},
    "payor": [{"display": "MediCare Plus"}],
    "class": [
        {
            "type": {"coding": [{"code": "MEDITECH-PLAN"}]},
            "value": "MDT-PLAN-2024"
        }
    ]
}

# Resource index
RESOURCES = {
    ("Patient", "epic-patient-001"): EPIC_PATIENT,
    ("Patient", "cerner-patient-001"): CERNER_PATIENT,
    ("Patient", "meditech-patient-001"): MEDITECH_PATIENT,
    ("Claim", "epic-claim-001"): EPIC_CLAIM,
    ("Claim", "cerner-claim-001"): CERNER_CLAIM,
    ("Claim", "meditech-claim-001"): MEDITECH_CLAIM,
    ("Coverage", "epic-coverage-001"): EPIC_COVERAGE,
    ("Coverage", "cerner-coverage-001"): CERNER_COVERAGE,
    ("Coverage", "meditech-coverage-001"): MEDITECH_COVERAGE,
}


class MockFHIRHandler(BaseHTTPRequestHandler):
    """HTTP handler for mock FHIR server."""
    
    # Class-level server reference
    server_version = "MockFHIR/1.0"
    
    def log_message(self, format, *args):
        """Log HTTP requests."""
        logger.info(f"{self.address_string()} - {format % args}")
    
    def _send_json_response(self, data: Dict[str, Any], status: int = 200):
        """Send JSON response."""
        self.send_response(status)
        self.send_header("Content-Type", "application/fhir+json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def _send_bundle_response(self, resources: list, resource_type: str) -> Dict[str, Any]:
        """Create and return a FHIR Bundle response."""
        entries = []
        for resource in resources:
            entries.append({
                "resource": resource,
                "fullUrl": f"http://localhost:8888/{resource_type}/{resource['id']}"
            })
        
        bundle = {
            "resourceType": "Bundle",
            "id": f"{resource_type.lower()}-bundle",
            "type": "searchset",
            "total": len(entries),
            "entry": entries
        }
        return bundle
    
    def do_GET(self):
        """Handle GET requests."""
        path = self.path.strip("/")
        parts = path.split("/")
        
        # Root FHIR endpoint
        if not path or path == "metadata":
            capability = {
                "resourceType": "CapabilityStatement",
                "status": "active",
                "date": "2024-01-01",
                "kind": "instance",
                "fhirVersion": "4.0.1",
                "format": ["json"],
                "rest": [{
                    "mode": "server",
                    "resource": [
                        {"type": "Patient", "interaction": [{"code": "read"}, {"code": "search-type"}]},
                        {"type": "Claim", "interaction": [{"code": "read"}, {"code": "search-type"}]},
                        {"type": "Coverage", "interaction": [{"code": "read"}, {"code": "search-type"}]}
                    ]
                }]
            }
            return self._send_json_response(capability)
        
        # Resource type listing (search)
        if len(parts) == 1 and parts[0] in ["Patient", "Claim", "Coverage"]:
            resource_type = parts[0]
            resources = [r for (rt, _), r in RESOURCES.items() if rt == resource_type]
            bundle = self._send_bundle_response(resources, resource_type)
            return self._send_json_response(bundle)
        
        # Specific resource by ID
        if len(parts) == 2:
            resource_type, resource_id = parts
            key = (resource_type, resource_id)
            
            if key in RESOURCES:
                return self._send_json_response(RESOURCES[key])
            else:
                return self._send_json_response(
                    {"resourceType": "OperationOutcome", "issue": [{"severity": "error", "code": "not_found"}]},
                    status=404
                )
        
        # Patient search by identifier
        if len(parts) == 3 and parts[0] == "Patient" and parts[1] == "_search":
            # Parse query parameters from POST body (simplified)
            return self._send_json_response({"resourceType": "Bundle", "type": "searchset", "entry": []})
        
        # Default: not found
        return self._send_json_response(
            {"resourceType": "OperationOutcome", "issue": [{"severity": "error", "code": "not_found"}]},
            status=404
        )
    
    def do_POST(self):
        """Handle POST requests (for search)."""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length > 0 else ""
        
        path = self.path.strip("/")
        parts = path.split("/")
        
        # Search with POST
        if len(parts) == 3 and parts[1] == "_search":
            resource_type = parts[0]
            resources = [r for (rt, _), r in RESOURCES.items() if rt == resource_type]
            bundle = self._send_bundle_response(resources, resource_type)
            return self._send_json_response(bundle)
        
        # Validate resource
        if path == "":
            try:
                data = json.loads(body) if body else {}
                resource_type = data.get("resourceType", "Unknown")
                return self._send_json_response({
                    "resourceType": "OperationOutcome",
                    "issue": [{"severity": "info", "code": "informational", "diagnostics": f"Valid {resource_type}"}]
                })
            except json.JSONDecodeError:
                return self._send_json_response(
                    {"resourceType": "OperationOutcome", "issue": [{"severity": "error", "code": "invalid"}]},
                    status=400
                )
        
        return self._send_json_response(
            {"resourceType": "OperationOutcome", "issue": [{"severity": "error", "code": "not_supported"}]},
            status=501
        )
    
    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        self.end_headers()


def create_mock_server(port: int = 8888) -> HTTPServer:
    """Create a mock FHIR server."""
    return HTTPServer(("localhost", port), MockFHIRHandler)


def start_mock_server(port: int = 8888, background: bool = False):
    """Start the mock FHIR server."""
    server = create_mock_server(port)
    logger.info(f"Mock FHIR server starting on http://localhost:{port}")
    logger.info(f"Available endpoints:")
    logger.info(f"  GET  /metadata - CapabilityStatement")
    logger.info(f"  GET  /Patient/{id} - Get patient by ID")
    logger.info(f"  GET  /Claim/{id} - Get claim by ID")
    logger.info(f"  GET  /Coverage/{id} - Get coverage by ID")
    logger.info(f"  GET  /Patient - Search all patients (bundle)")
    logger.info(f"  GET  /Claim - Search all claims (bundle)")
    logger.info(f"  GET  /Coverage - Search all coverage (bundle)")
    
    if background:
        import threading
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        logger.info("Mock FHIR server running in background")
        return server
    else:
        logger.info("Press Ctrl+C to stop")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            logger.info("\nShutting down...")
            server.shutdown()


if __name__ == "__main__":
    start_mock_server()
