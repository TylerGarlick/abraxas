"""
Unit tests for FHIR Adapter Claim resource mapping.

Tests Claim parsing from Epic, Cerner, and Meditech EHR systems.
"""

import unittest
import sys
import os

# Add skills directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skills'))

from skills.fhir_adapter import FHIRAdapter
from skills.fhir_adapter.models import EHRSystem, Claim, ClaimStatus, ClaimType


class TestClaimMapping(unittest.TestCase):
    """Test Claim resource mapping from FHIR JSON."""
    
    def setUp(self):
        self.adapter = FHIRAdapter()
    
    # ==================== Basic Claim Tests ====================
    
    def test_claim_basic(self):
        """Test parsing basic Claim resource."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-001",
            "status": "active",
            "type": {
                "coding": [
                    {"code": "inpatient", "display": "Inpatient"}
                ]
            },
            "use": "claim",
            "patient": {"reference": "Patient/patient-123"},
            "created": "2024-01-15",
            "insurer": {"reference": "Organization/insurer-001"},
            "diagnosis": [
                {
                    "sequence": 1,
                    "diagnosisCodeableConcept": {
                        "coding": [
                            {"code": "J18.9", "display": "Pneumonia, unspecified"}
                        ]
                    }
                }
            ],
            "total": {
                "value": 15000.00,
                "currency": "USD"
            }
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Claim")
        
        parsed_claim = result.data
        self.assertEqual(parsed_claim.claim_id, "claim-001")
        self.assertEqual(parsed_claim.status, ClaimStatus.ACTIVE)
        self.assertEqual(parsed_claim.claim_type, ClaimType.INPATIENT)
        self.assertEqual(parsed_claim.claim_use, "claim")
        self.assertEqual(parsed_claim.patient_ref, "Patient/patient-123")
        self.assertEqual(parsed_claim.created_date, "2024-01-15")
        self.assertEqual(len(parsed_claim.diagnoses), 1)
        self.assertEqual(parsed_claim.diagnoses[0].code, "J18.9")
        self.assertEqual(parsed_claim.total_amount.value, 15000.00)
        self.assertEqual(parsed_claim.total_amount.currency, "USD")
    
    def test_claim_with_procedures(self):
        """Test Claim with procedures."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-002",
            "status": "active",
            "type": {"coding": [{"code": "outpatient"}]},
            "patient": {"reference": "Patient/patient-456"},
            "procedure": [
                {
                    "sequence": 1,
                    "procedureCodeableConcept": {
                        "coding": [{"code": "99213", "display": "Office visit"}]
                    },
                    "date": "2024-01-10"
                },
                {
                    "sequence": 2,
                    "procedureCodeableConcept": {
                        "coding": [{"code": "87880", "display": "Strep test"}]
                    },
                    "date": "2024-01-10"
                }
            ]
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)
        self.assertEqual(len(result.data.procedures), 2)
        self.assertEqual(result.data.procedures[0].code, "99213")
        self.assertEqual(result.data.procedures[1].code, "87880")
    
    def test_claim_with_line_items(self):
        """Test Claim with line items."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-003",
            "status": "active",
            "type": {"coding": [{"code": "outpatient"}]},
            "patient": {"reference": "Patient/patient-789"},
            "item": [
                {
                    "sequence": 1,
                    "service": {
                        "coding": [{"code": "99214", "display": "Office visit established"}]
                    },
                    "quantity": {"value": 1, "unitPrice": {"value": 150.00}},
                    "net": {"value": 150.00}
                },
                {
                    "sequence": 2,
                    "service": {
                        "coding": [{"code": "81002", "display": "Urinalysis"}]
                    },
                    "quantity": {"value": 1, "unitPrice": {"value": 25.00}},
                    "net": {"value": 25.00},
                    "diagnosisLink": [1]
                }
            ]
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)
        self.assertEqual(len(result.data.line_items), 2)
        self.assertEqual(result.data.line_items[0].service_code, "99214")
        self.assertEqual(result.data.line_items[0].net_amount, 150.00)
        self.assertEqual(result.data.line_items[1].diagnosis_links, [1])
    
    def test_claim_unknown_status(self):
        """Test Claim with unknown status."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-status-unknown",
            "status": "superceded",  # Not a valid FHIR Claim status
            "type": {"coding": [{"code": "inpatient"}]},
            "patient": {"reference": "Patient/patient-001"}
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)  # Should parse but with warning
        self.assertTrue(len(result.warnings) > 0)
        self.assertEqual(result.data.status, ClaimStatus.UNKNOWN)
    
    def test_claim_unknown_type(self):
        """Test Claim with unknown type."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-type-unknown",
            "status": "active",
            "type": {"coding": [{"code": "futuristic"}]},
            "patient": {"reference": "Patient/patient-001"}
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)
        self.assertTrue(len(result.warnings) > 0)
        self.assertEqual(result.data.claim_type, ClaimType.UNKNOWN)
    
    # ==================== Epic Claim Tests ====================
    
    def test_epic_claim_inpatient(self):
        """Test Epic inpatient Claim."""
        epic_claim = {
            "resourceType": "Claim",
            "id": "epic-claim-001",
            "meta": {
                "profile": ["http://Epic.com/fhir/Claim"]
            },
            "status": "active",
            "type": {"coding": [{"code": "inpatient"}]},
            "patient": {"reference": "Patient/epic-patient-001"},
            "created": "2024-02-01",
            "diagnosis": [
                {
                    "sequence": 1,
                    "diagnosisCodeableConcept": {
                        "coding": [{"code": "S72.001A", "display": "Femur fracture"}]
                    },
                    "type": [{"coding": [{"code": "admitting"}]}]
                }
            ],
            "procedure": [
                {
                    "sequence": 1,
                    "procedureCodeableConcept": {
                        "coding": [{"code": "27536", "display": "Open reduction femur fracture"}]
                    },
                    "outcome": "completed"
                }
            ],
            "total": {"value": 45000.00, "currency": "USD"}
        }
        
        result = self.adapter.parse(epic_claim)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        self.assertEqual(result.data.claim_type, ClaimType.INPATIENT)
        self.assertEqual(len(result.data.diagnoses), 1)
        self.assertEqual(result.data.diagnoses[0].code, "S72.001A")
    
    # ==================== Cerner Claim Tests ====================
    
    def test_cerner_claim_outpatient(self):
        """Test Cerner outpatient Claim."""
        cerner_claim = {
            "resourceType": "Claim",
            "id": "cerner-claim-001",
            "meta": {
                "profile": ["http://fhir.cerner.com/Claim"]
            },
            "status": "active",
            "type": {"coding": [{"code": "outpatient"}]},
            "use": "claim",
            "patient": {"reference": "Patient/cerner-patient-001"},
            "created": "2024-02-15",
            "diagnosis": [
                {
                    "sequence": 1,
                    "diagnosisCodeableConcept": {
                        "coding": [{"code": "J06.9", "display": "Upper respiratory infection"}]
                    }
                }
            ],
            "insurer": {"reference": "Organization/cerner-insurer"}
        }
        
        result = self.adapter.parse(cerner_claim)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        self.assertEqual(result.data.claim_type, ClaimType.OUTPATIENT)
    
    # ==================== Meditech Claim Tests ====================
    
    def test_meditech_claim(self):
        """Test Meditech Claim."""
        meditech_claim = {
            "resourceType": "Claim",
            "id": "meditech-claim-001",
            "identifier": [
                {
                    "system": "http://meditech.com/fhir/identifiers/claim",
                    "value": "MDT-CLM-001"
                }
            ],
            "status": "active",
            "type": {"coding": [{"code": "inpatient"}]},
            "patient": {"reference": "Patient/meditech-patient-001"},
            "created": "2024-03-01"
        }
        
        result = self.adapter.parse(meditech_claim)
        
        self.assertTrue(result.success)
        # Meditech detection may require extension or specific identifier
        self.assertEqual(result.resource_type, "Claim")
    
    # ==================== Error Handling Tests ====================
    
    def test_claim_invalid_resource(self):
        """Test error handling for non-Claim resource."""
        not_claim = {
            "resourceType": "Patient",
            "id": "patient-001"
        }
        
        result = self.adapter.parse(not_claim)
        
        self.assertFalse(result.success)
    
    def test_claim_missing_required_fields(self):
        """Test Claim with missing patient reference."""
        claim = {
            "resourceType": "Claim",
            "id": "claim-incomplete",
            "status": "active"
            # Missing patient, type
        }
        
        result = self.adapter.parse(claim)
        
        self.assertTrue(result.success)  # Should still parse, fields just empty
        self.assertIsNone(result.data.patient_ref)


if __name__ == "__main__":
    unittest.main()
