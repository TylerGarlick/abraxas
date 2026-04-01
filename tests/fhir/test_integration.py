"""
Integration tests for FHIR Adapter against mock FHIR server.

Tests the adapter with real HTTP requests to a mock FHIR server.
"""

import unittest
import sys
import os
import json
import time
import threading
from http.server import HTTPServer

# Add skills directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skills'))

from skills.fhir_adapter import FHIRAdapter
from skills.fhir_adapter.models import EHRSystem, Patient, Claim, Coverage
from mock_fhir_server import create_mock_server, RESOURCES


class TestFHIRAdapterIntegration(unittest.TestCase):
    """Integration tests for FHIR Adapter with mock FHIR server."""
    
    @classmethod
    def setUpClass(cls):
        """Start mock FHIR server."""
        cls.server = create_mock_server(port=8888)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.5)  # Wait for server to start
        cls.base_url = "http://localhost:8888"
        cls.adapter = FHIRAdapter()
    
    @classmethod
    def tearDownClass(cls):
        """Stop mock FHIR server."""
        cls.server.shutdown()
    
    def _fetch_resource(self, resource_type: str, resource_id: str) -> dict:
        """Fetch a resource from the mock FHIR server."""
        import urllib.request
        
        url = f"{self.base_url}/{resource_type}/{resource_id}"
        req = urllib.request.Request(url)
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            self.fail(f"Failed to fetch {resource_type}/{resource_id}: {e}")
    
    def _search_resource(self, resource_type: str) -> dict:
        """Search for resources from the mock FHIR server."""
        import urllib.request
        
        url = f"{self.base_url}/{resource_type}"
        req = urllib.request.Request(url)
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            self.fail(f"Failed to search {resource_type}: {e}")
    
    # ==================== Epic Integration Tests ====================
    
    def test_epic_patient_integration(self):
        """Test Epic Patient parsing via mock FHIR server."""
        resource = self._fetch_resource("Patient", "epic-patient-001")
        
        # Verify raw resource
        self.assertEqual(resource["resourceType"], "Patient")
        self.assertIn("Epic", str(resource.get("meta", {}).get("profile", [])))
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "epic-patient-001")
        self.assertEqual(patient.name.family, "Smith")
        self.assertEqual(patient.name.given, ["John", "Robert"])
        self.assertEqual(len(patient.identifiers), 1)
        self.assertEqual(patient.identifiers[0].value, "EPIC-MRN-12345")
        self.assertEqual(len(patient.addresses), 1)
        self.assertEqual(patient.addresses[0].city, "Boston")
        self.assertEqual(len(patient.contacts), 2)
    
    def test_epic_claim_integration(self):
        """Test Epic Claim parsing via mock FHIR server."""
        resource = self._fetch_resource("Claim", "epic-claim-001")
        
        # Verify raw resource
        self.assertEqual(resource["resourceType"], "Claim")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        
        claim = result.data
        self.assertEqual(claim.claim_id, "epic-claim-001")
        self.assertEqual(claim.patient_ref, "Patient/epic-patient-001")
        self.assertEqual(len(claim.diagnoses), 2)
        self.assertEqual(claim.diagnoses[0].code, "J18.9")
        self.assertEqual(claim.diagnoses[1].code, "R05")
        self.assertEqual(len(claim.procedures), 1)
        self.assertEqual(claim.procedures[0].code, "99291")
        self.assertEqual(len(claim.line_items), 1)
        self.assertEqual(claim.line_items[0].net_amount, 500.00)
        self.assertEqual(claim.total_amount.value, 500.00)
    
    def test_epic_coverage_integration(self):
        """Test Epic Coverage parsing via mock FHIR server."""
        resource = self._fetch_resource("Coverage", "epic-coverage-001")
        
        # Verify raw resource
        self.assertEqual(resource["resourceType"], "Coverage")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.EPIC)
        
        coverage = result.data
        self.assertEqual(coverage.coverage_id, "epic-coverage-001")
        self.assertEqual(coverage.subscriber_ref, "Patient/epic-patient-001")
        self.assertEqual(coverage.payer_name, "Epic Health Insurance")
        self.assertEqual(len(coverage.coverage_classes), 1)
        self.assertEqual(coverage.coverage_classes[0].value, "EPIC-GOLD-PLAN")
    
    # ==================== Cerner Integration Tests ====================
    
    def test_cerner_patient_integration(self):
        """Test Cerner Patient parsing via mock FHIR server."""
        resource = self._fetch_resource("Patient", "cerner-patient-001")
        
        # Verify raw resource
        self.assertEqual(resource["resourceType"], "Patient")
        self.assertIn("Cerner", str(resource.get("meta", {}).get("profile", [])))
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "cerner-patient-001")
        self.assertEqual(patient.name.family, "Johnson")
        self.assertEqual(patient.name.prefix, ["Dr."])
        self.assertEqual(len(patient.contacts), 1)
        self.assertEqual(patient.contacts[0].value, "sarah.johnson@hospital.org")
    
    def test_cerner_claim_integration(self):
        """Test Cerner Claim parsing via mock FHIR server."""
        resource = self._fetch_resource("Claim", "cerner-claim-001")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        
        claim = result.data
        self.assertEqual(claim.claim_id, "cerner-claim-001")
        self.assertEqual(claim.patient_ref, "Patient/cerner-patient-001")
        self.assertEqual(len(claim.diagnoses), 1)
        self.assertEqual(claim.diagnoses[0].code, "J06.9")
        self.assertEqual(claim.total_amount.value, 250.00)
    
    def test_cerner_coverage_integration(self):
        """Test Cerner Coverage parsing via mock FHIR server."""
        resource = self._fetch_resource("Coverage", "cerner-coverage-001")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.CERNER)
        
        coverage = result.data
        self.assertEqual(coverage.coverage_id, "cerner-coverage-001")
        self.assertEqual(coverage.payer_name, "Cerner Health Network")
        self.assertEqual(len(coverage.coverage_classes), 2)
        class_types = [c.type_code for c in coverage.coverage_classes]
        self.assertIn("FHIR", class_types)
        self.assertIn("MEMBER", class_types)
    
    # ==================== Meditech Integration Tests ====================
    
    def test_meditech_patient_integration(self):
        """Test Meditech Patient parsing via mock FHIR server."""
        resource = self._fetch_resource("Patient", "meditech-patient-001")
        
        # Verify raw resource
        self.assertEqual(resource["resourceType"], "Patient")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
        
        patient = result.data
        self.assertEqual(patient.patient_id, "meditech-patient-001")
        self.assertEqual(patient.name.family, "Chen")
        self.assertEqual(patient.name.full_name(), "David Wei Chen")
        self.assertEqual(len(patient.identifiers), 2)
        
        # Check BARBABANNER identifier
        barbabanner_ids = [i for i in patient.identifiers if i.type_code == "BARBABANNER"]
        self.assertEqual(len(barbabanner_ids), 1)
    
    def test_meditech_claim_integration(self):
        """Test Meditech Claim parsing via mock FHIR server."""
        resource = self._fetch_resource("Claim", "meditech-claim-001")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        
        claim = result.data
        self.assertEqual(claim.claim_id, "meditech-claim-001")
        self.assertEqual(claim.patient_ref, "Patient/meditech-patient-001")
        self.assertEqual(len(claim.diagnoses), 1)
        self.assertEqual(claim.diagnoses[0].code, "E11.9")
        self.assertEqual(claim.total_amount.value, 12000.00)
    
    def test_meditech_coverage_integration(self):
        """Test Meditech Coverage parsing via mock FHIR server."""
        resource = self._fetch_resource("Coverage", "meditech-coverage-001")
        
        # Parse with adapter
        result = self.adapter.parse(resource)
        
        self.assertTrue(result.success)
        self.assertEqual(result.ehr_system, EHRSystem.MEDITECH)
        
        coverage = result.data
        self.assertEqual(coverage.coverage_id, "meditech-coverage-001")
        self.assertEqual(coverage.payer_name, "MediCare Plus")
    
    # ==================== Bundle Tests ====================
    
    def test_patient_bundle_integration(self):
        """Test parsing a bundle of patients."""
        bundle = self._search_resource("Patient")
        
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertEqual(bundle["type"], "searchset")
        self.assertGreater(bundle["total"], 0)
        
        patients = []
        for entry in bundle.get("entry", []):
            result = self.adapter.parse(entry["resource"])
            self.assertTrue(result.success)
            patients.append(result.data)
        
        self.assertEqual(len(patients), 3)  # epic, cerner, meditech
        
        # Verify each EHR system
        ehr_systems = {p.ehr_system for p in patients}
        self.assertIn(EHRSystem.EPIC, ehr_systems)
        self.assertIn(EHRSystem.CERNER, ehr_systems)
        self.assertIn(EHRSystem.MEDITECH, ehr_systems)
    
    def test_claim_bundle_integration(self):
        """Test parsing a bundle of claims."""
        bundle = self._search_resource("Claim")
        
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertEqual(bundle["type"], "searchset")
        self.assertGreater(bundle["total"], 0)
        
        claims = []
        for entry in bundle.get("entry", []):
            result = self.adapter.parse(entry["resource"])
            self.assertTrue(result.success)
            claims.append(result.data)
        
        self.assertEqual(len(claims), 3)
    
    # ==================== Capability Statement Test ====================
    
    def test_capability_statement(self):
        """Test fetching CapabilityStatement from mock server."""
        import urllib.request
        
        url = f"{self.base_url}/metadata"
        req = urllib.request.Request(url)
        
        with urllib.request.urlopen(req) as response:
            capability = json.loads(response.read().decode())
        
        self.assertEqual(capability["resourceType"], "CapabilityStatement")
        self.assertEqual(capability["status"], "active")
        self.assertEqual(capability["fhirVersion"], "4.0.1")
        
        # Check resource types
        rest = capability["rest"][0]
        resource_types = {r["type"] for r in rest["resource"]}
        self.assertIn("Patient", resource_types)
        self.assertIn("Claim", resource_types)
        self.assertIn("Coverage", resource_types)


if __name__ == "__main__":
    unittest.main()
