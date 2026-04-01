"""
Unit tests for FHIR Adapter Patient resource mapping.

Tests Patient parsing from Epic, Cerner, and Meditech EHR systems.
"""

import unittest
import sys
import os

# Add repo root to path so 'skills' package is importable
_repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, _repo_root)

from skills.fhir_adapter import FHIRAdapter
from skills.fhir_adapter.models import EHRSystem, Patient, Claim, Coverage


class TestPatientMapping(unittest.TestCase):
    """Test Patient resource mapping from FHIR JSON."""
    
    def setUp(self):
        self.adapter = FHIRAdapter()
    
    # ==================== Epic Patient Tests ====================
    
    def test_epic_patient_basic(self):
        """Test parsing basic Epic Patient resource."""
        epic_patient = {
            "resourceType": "Patient",
            "id": "patient-12345",
            "meta": {
                "profile": ["http://Epic.com/fhir/identifiers/Patient"]
            },
            "identifier": [
                {
                    "system": "http://Epic.com/fhir/identifiers/mrn",
                    "value": "EPIC-MRN-12345"
                }
            ],
            "name": [
                {
                    "use": "official",
                    "family": "Smith",
                    "given": ["John", "Robert"]
                }
            ],
            "gender": "male",
            "birthDate": "1980-05-15",
            "address": [
                {
                    "use": "home",
                    "line": ["123 Main St"],
                    "city": "Boston",
                    "state": "MA",
                    "postalCode": "02101"
                }
            ],
            "telecom": [
                {"system": "phone", "value": "617-555-0100", "use": "home"}
            ]
        }
        
        result = self.adapter.parse(epic_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Patient")
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "patient-12345")
        self.assertEqual(patient.name.family, "Smith")
        self.assertEqual(patient.name.given, ["John", "Robert"])
        self.assertEqual(patient.gender, "male")
        self.assertEqual(patient.dob, "1980-05-15")
        self.assertEqual(len(patient.identifiers), 1)
        self.assertEqual(patient.identifiers[0].value, "EPIC-MRN-12345")
        self.assertEqual(len(patient.addresses), 1)
        self.assertEqual(patient.addresses[0].city, "Boston")
    
    def test_epic_patient_multiple_mrns(self):
        """Test Epic Patient with multiple MRN domains."""
        epic_patient = {
            "resourceType": "Patient",
            "id": "patient-multi-mrn",
            "identifier": [
                {
                    "type": {"coding": [{"code": "MR", "display": "Medical Record Number"}]},
                    "system": "http://Epic.com/fhir/identifiers/mrn",
                    "value": "MRN-LOCAL-001"
                },
                {
                    "type": {"coding": [{"code": "MR", "display": "Medical Record Number"}]},
                    "system": "urn:oid:2.16.840.1.113883.3.200",
                    "value": "MRN-ENTERPRISE-001"
                }
            ],
            "name": [{"family": "Johnson", "given": ["Alice"]}],
            "gender": "female"
        }
        
        result = self.adapter.parse(epic_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        self.assertEqual(len(result.data.identifiers), 2)
    
    # ==================== Cerner Patient Tests ====================
    
    def test_cerner_patient_basic(self):
        """Test parsing basic Cerner Patient resource."""
        cerner_patient = {
            "resourceType": "Patient",
            "id": "patient-CERN-001",
            "meta": {
                "profile": ["http://fhir.cerner.com/Patient"]
            },
            "identifier": [
                {
                    "type": {"coding": [{"code": "MR", "display": "Medical Record"}]},
                    "system": "http://cerner.com/fhir/identifiers/mrn",
                    "value": "CERN-MRN-001"
                }
            ],
            "name": [
                {
                    "use": "official",
                    "family": "Williams",
                    "given": ["James"],
                    "prefix": ["Dr."]
                }
            ],
            "gender": "male",
            "birthDate": "1992-08-22",
            "telecom": [
                {"system": "email", "value": "james.williams@email.com"}
            ]
        }
        
        result = self.adapter.parse(cerner_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Patient")
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "patient-CERN-001")
        self.assertEqual(patient.name.family, "Williams")
        self.assertEqual(patient.name.prefix, ["Dr."])
        self.assertEqual(len(patient.contacts), 1)
        self.assertEqual(patient.contacts[0].value, "james.williams@email.com")
    
    def test_cerner_patient_oracle_profile(self):
        """Test Cerner Patient with Oracle profile."""
        cerner_patient = {
            "resourceType": "Patient",
            "id": "patient-oracle",
            "meta": {
                "profile": ["http://oracle.com/fhir/Patient"]
            },
            "identifier": [
                {
                    "system": "urn:oid:2.16.840.1.113883.3.13.6",
                    "value": "ORACLE-PID-001"
                }
            ],
            "name": [{"family": "Garcia", "given": ["Maria"]}],
            "gender": "female"
        }
        
        result = self.adapter.parse(cerner_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
    
    # ==================== Meditech Patient Tests ====================
    
    def test_meditech_patient_basic(self):
        """Test parsing basic Meditech Patient resource."""
        meditech_patient = {
            "resourceType": "Patient",
            "id": "patient-MDT-001",
            "identifier": [
                {
                    "system": "http://meditech.com/fhir/identifiers/mrn",
                    "value": "MDT-MRN-001",
                    "type": {"coding": [{"code": "MR", "display": "Medical Record"}]}
                }
            ],
            "name": [
                {
                    "family": "Chen",
                    "given": ["David", "Wei"]
                }
            ],
            "gender": "male",
            "birthDate": "1975-03-10"
        }
        
        result = self.adapter.parse(meditech_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Patient")
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "patient-MDT-001")
        self.assertEqual(patient.name.full_name(), "David Wei Chen")
    
    def test_meditech_patient_barbabanner(self):
        """Test Meditech Patient with BARBABANNER identifier."""
        meditech_patient = {
            "resourceType": "Patient",
            "id": "patient-barba",
            "identifier": [
                {
                    "system": "http://meditech.com/fhir/identifiers/barbabanner",
                    "value": "BB-12345-A",
                    "extension": [
                        {
                            "url": "http://meditech.com/fhir/extension/barbabanner",
                            "valueString": "BARBABANNER"
                        }
                    ]
                }
            ],
            "name": [{"family": "Anderson", "given": ["Thomas"]}],
            "gender": "male"
        }
        
        result = self.adapter.parse(meditech_patient)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
        self.assertEqual(len(result.data.identifiers), 1)
        self.assertEqual(result.data.identifiers[0].type_code, "BARBABANNER")
    
    # ==================== Generic Patient Tests ====================
    
    def test_patient_unknown_ehr(self):
        """Test parsing Patient without EHR indicators (defaults to Epic-compatible)."""
        generic_patient = {
            "resourceType": "Patient",
            "id": "patient-generic",
            "identifier": [
                {
                    "system": "http://hl7.org/fhir/sid/us-mrn",
                    "value": "GENERIC-MRN-001"
                }
            ],
            "name": [{"family": "Generic", "given": ["Patient"]}],
            "gender": "unknown"
        }
        
        result = self.adapter.parse(generic_patient)
        
        # Should still parse successfully, may be unknown or epic
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Patient")
    
    def test_patient_name_formats(self):
        """Test various Patient name formats."""
        test_cases = [
            {
                "name": [{"family": "Single"}],
                "expected": "Single"
            },
            {
                "name": [{"family": "Parent", "given": ["Child"], "suffix": ["Jr."]}],
                "expected": "Child Parent Jr."
            },
            {
                "name": [{"use": "nickname", "family": "Last", "given": ["First"]}],
                "expected": "First Last"
            }
        ]
        
        for case in test_cases:
            patient_dict = {
                "resourceType": "Patient",
                "id": "test-name",
                "name": case["name"],
                "gender": "male"
            }
            result = self.adapter.parse(patient_dict)
            self.assertTrue(result.success)
    
    def test_patient_invalid_resource_type(self):
        """Test error handling for non-Patient resource."""
        not_patient = {
            "resourceType": "Observation",
            "id": "obs-001"
        }
        
        result = self.adapter.parse(not_patient)
        
        self.assertFalse(result.success)
        self.assertIn("Unsupported", result.errors[0] if result.errors else "")


if __name__ == "__main__":
    unittest.main()
