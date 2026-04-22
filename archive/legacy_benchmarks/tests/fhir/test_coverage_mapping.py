"""
Unit tests for FHIR Adapter Coverage resource mapping.

Tests Coverage parsing from Epic, Cerner, and Meditech EHR systems.
"""

import unittest
import sys
import os

# Add skills directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skills'))

from skills.fhir_adapter import FHIRAdapter
from skills.fhir_adapter.models import EHRSystem, Coverage, CoverageStatus


class TestCoverageMapping(unittest.TestCase):
    """Test Coverage resource mapping from FHIR JSON."""
    
    def setUp(self):
        self.adapter = FHIRAdapter()
    
    # ==================== Basic Coverage Tests ====================
    
    def test_coverage_basic(self):
        """Test parsing basic Coverage resource."""
        coverage = {
            "resourceType": "Coverage",
            "id": "coverage-001",
            "status": "active",
            "type": {
                "coding": [
                    {"code": "HI", "display": "Health Insurance"}
                ]
            },
            "subscriber": {"reference": "Patient/patient-123"},
            "beneficiary": {"reference": "Patient/patient-123"},
            "payor": [
                {"reference": "Organization/insurer-001", "display": "Blue Cross Blue Shield"}
            ],
            "class": [
                {
                    "type": {
                        "coding": [{"code": "PLAN", "display": "Plan"}]
                    },
                    "value": "GOLD-PLAN",
                    "name": "Gold Health Plan"
                }
            ]
        }
        
        result = self.adapter.parse(coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.resource_type, "Coverage")
        
        parsed = result.data
        self.assertEqual(parsed.coverage_id, "coverage-001")
        self.assertEqual(parsed.status, CoverageStatus.ACTIVE)
        self.assertEqual(parsed.subscriber_ref, "Patient/patient-123")
        self.assertEqual(parsed.beneficiary_ref, "Patient/patient-123")
        self.assertEqual(parsed.payer_name, "Blue Cross Blue Shield")
        self.assertEqual(len(parsed.coverage_classes), 1)
        self.assertEqual(parsed.coverage_classes[0].value, "GOLD-PLAN")
    
    def test_coverage_cancelled(self):
        """Test Coverage with cancelled status."""
        coverage = {
            "resourceType": "Coverage",
            "id": "coverage-cancelled",
            "status": "cancelled",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/patient-001"},
            "beneficiary": {"reference": "Patient/patient-001"},
            "payor": [{"display": "Aetna"}]
        }
        
        result = self.adapter.parse(coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.data.status, CoverageStatus.CANCELLED)
    
    def test_coverage_multiple_classes(self):
        """Test Coverage with multiple class elements."""
        coverage = {
            "resourceType": "Coverage",
            "id": "coverage-multi-class",
            "status": "active",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/patient-001"},
            "beneficiary": {"reference": "Patient/patient-001"},
            "payor": [{"display": "United Healthcare"}],
            "class": [
                {
                    "type": {"coding": [{"code": "PLAN"}]},
                    "value": "SILVER-PLUS"
                },
                {
                    "type": {"coding": [{"code": "GROUP"}]},
                    "value": "GRP-12345",
                    "name": "Acme Corp Group"
                },
                {
                    "type": {"coding": [{"code": "FHIR"}]},
                    "value": "MEMBER-ID-001"
                }
            ]
        }
        
        result = self.adapter.parse(coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(len(result.data.coverage_classes), 3)
    
    def test_coverage_unknown_status(self):
        """Test Coverage with unknown status."""
        coverage = {
            "resourceType": "Coverage",
            "id": "coverage-unknown",
            "status": "pending",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/patient-001"}
        }
        
        result = self.adapter.parse(coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.data.status, CoverageStatus.UNKNOWN)
    
    # ==================== Epic Coverage Tests ====================
    
    def test_epic_coverage_with_cuda(self):
        """Test Epic Coverage with CUDA extension."""
        epic_coverage = {
            "resourceType": "Coverage",
            "id": "epic-coverage-001",
            "meta": {
                "profile": ["http://Epic.com/fhir/Coverage"]
            },
            "status": "active",
            "type": {"coding": [{"code": "HI", "display": "Health Insurance"}]},
            "subscriber": {"reference": "Patient/epic-patient-001"},
            "beneficiary": {"reference": "Patient/epic-patient-001"},
            "payor": [{"display": "Epic Health Plan"}],
            "extension": [
                {
                    "url": "http://Epic.com/fhir/extension/cuda",
                    "valueString": "CUDA-12345"
                }
            ],
            "class": [
                {
                    "type": {"coding": [{"code": "EPIC-PLAN"}]},
                    "value": "EPIC-GOLD-2024"
                }
            ]
        }
        
        result = self.adapter.parse(epic_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        self.assertEqual(result.data.status, CoverageStatus.ACTIVE)
    
    def test_epic_coverage_multi_mrn(self):
        """Test Epic Coverage linked to multi-MRN patient."""
        epic_coverage = {
            "resourceType": "Coverage",
            "id": "epic-coverage-multi",
            "status": "active",
            "identifier": [
                {
                    "system": "http://Epic.com/fhir/identifiers/coverage",
                    "value": "EPIC-COV-001"
                }
            ],
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/epic-multi-mrn"},
            "payor": [{"display": "Medicare"}]
        }
        
        result = self.adapter.parse(epic_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
    
    # ==================== Cerner Coverage Tests ====================
    
    def test_cerner_coverage_fhir_member(self):
        """Test Cerner Coverage with FHIR and MEMBER class types."""
        cerner_coverage = {
            "resourceType": "Coverage",
            "id": "cerner-coverage-001",
            "meta": {
                "profile": ["http://fhir.cerner.com/Coverage"]
            },
            "status": "active",
            "type": {"coding": [{"code": "HI", "display": "Health Insurance"}]},
            "subscriber": {"reference": "Patient/cerner-patient-001"},
            "beneficiary": {"reference": "Patient/cerner-patient-001"},
            "payor": [{"display": "Cerner Health Plan"}],
            "class": [
                {
                    "type": {"coding": [{"code": "FHIR"}]},
                    "value": "FHIR-CLASS-001"
                },
                {
                    "type": {"coding": [{"code": "MEMBER"}]},
                    "value": "MEMBER-123456",
                    "name": "Primary Member"
                }
            ]
        }
        
        result = self.adapter.parse(cerner_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        self.assertEqual(len(result.data.coverage_classes), 2)
    
    def test_cerner_coverage_oracle(self):
        """Test Cerner Coverage with Oracle profile."""
        cerner_coverage = {
            "resourceType": "Coverage",
            "id": "cerner-coverage-oracle",
            "meta": {
                "profile": ["http://oracle.com/fhir/Coverage"]
            },
            "status": "active",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/oracle-patient-001"},
            "payor": [{"display": "Oracle Health"}]
        }
        
        result = self.adapter.parse(cerner_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
    
    # ==================== Meditech Coverage Tests ====================
    
    def test_meditech_coverage_barbabanner(self):
        """Test Meditech Coverage with BARBABANNER extension."""
        meditech_coverage = {
            "resourceType": "Coverage",
            "id": "meditech-coverage-001",
            "identifier": [
                {
                    "system": "http://meditech.com/fhir/identifiers/barbabanner",
                    "value": "BB-COV-001",
                    "extension": [
                        {
                            "url": "http://meditech.com/fhir/extension/barbabanner",
                            "valueString": "BARBABANNER"
                        }
                    ]
                }
            ],
            "status": "active",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/meditech-patient-001"},
            "beneficiary": {"reference": "Patient/meditech-patient-001"},
            "payor": [{"display": "Meditech Insurance"}]
        }
        
        result = self.adapter.parse(meditech_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
        self.assertEqual(len(result.data.identifiers), 1)
    
    def test_meditech_coverage_standard(self):
        """Test standard Meditech Coverage."""
        meditech_coverage = {
            "resourceType": "Coverage",
            "id": "meditech-coverage-std",
            "status": "active",
            "type": {"coding": [{"code": "HI"}]},
            "subscriber": {"reference": "Patient/meditech-patient-std"},
            "payor": [{"display": "MediCare Plus"}],
            "class": [
                {
                    "type": {"coding": [{"code": "MEDITECH-PLAN"}]},
                    "value": "MDT-PLAN-001",
                    "name": "Meditech Standard Plan"
                }
            ]
        }
        
        result = self.adapter.parse(meditech_coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
    
    # ==================== Error Handling Tests ====================
    
    def test_coverage_invalid_resource(self):
        """Test error handling for non-Coverage resource."""
        not_coverage = {
            "resourceType": "Patient",
            "id": "patient-001"
        }
        
        result = self.adapter.parse(not_coverage)
        
        self.assertFalse(result.success)
    
    def test_coverage_minimal(self):
        """Test Coverage with minimal fields."""
        coverage = {
            "resourceType": "Coverage",
            "id": "coverage-minimal",
            "status": "active"
        }
        
        result = self.adapter.parse(coverage)
        
        self.assertTrue(result.success)
        self.assertEqual(result.data.coverage_id, "coverage-minimal")


if __name__ == "__main__":
    unittest.main()
