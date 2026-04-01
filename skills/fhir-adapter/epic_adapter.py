"""
Epic FHIR Adapter

Adapter for Epic EHR system FHIR R4 resources.
"""

from typing import List, Dict, Any
import logging

from .base_adapter import FHIRBaseAdapter
from .models import EHRSystem, Identifier


logger = logging.getLogger(__name__)


class EpicFHIRAdapter(FHIRBaseAdapter):
    """
    Adapter for Epic EHR FHIR R4 resources.
    
    Epic-specific quirks:
    - Uses Epic-specific identifier extensions for MRN
    - Multiple MRN domains per patient
    - CUDA extensions for billing
    """
    
    # Epic-specific identifier systems
    EPIC_SYSTEMS = {
        "mrn": "http://Epic.com/fhir/identifiers/mrn",
        "epic_mrn": "urn:oid:2.16.840.1.113883.3.200",
        "cuda": "http://Epic.com/fhir/identifiers/cuda",
        "fhir": "http://hl7.org/fhir/sid/us-mrn",
    }
    
    def __init__(self):
        super().__init__()
        self.ehr_system = EHRSystem.EPIC
    
    def detect_ehr_system(self, resource: Dict[str, Any]) -> EHRSystem:
        """
        Detect if this is an Epic resource.
        
        Epic indicators:
        - Identifier with Epic-specific system URL
        - Extension containing Epic-specific data
        """
        # Check identifiers for Epic systems
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            if "Epic" in system or "epic" in system.lower():
                return EHRSystem.EPIC
            # Check extensions
            for ext in identifier.get("extension", []):
                if "Epic" in str(ext):
                    return EHRSystem.EPIC
        
        # Check for Epic-specific extensions on resource
        for ext in resource.get("extension", []):
            if "Epic" in str(ext) or "CUDA" in str(ext):
                return EHRSystem.EPIC
        
        # Check meta.profile for Epic
        for profile in resource.get("meta", {}).get("profile", []):
            if "Epic" in profile:
                return EHRSystem.EPIC
        
        return EHRSystem.UNKNOWN
    
    def parse_identifiers(self, resource: Dict[str, Any]) -> List[Identifier]:
        """
        Parse identifiers with Epic-specific logic.
        
        Epic stores MRN in identifier with extension.
        May have multiple MRNs in different domains.
        """
        identifiers = []
        
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            value = identifier.get("value", "")
            type_dict = identifier.get("type", {})
            
            # Check for Epic-specific systems
            if "Epic" in system or system in self.EPIC_SYSTEMS.values():
                # This is an Epic identifier
                id_type_code = type_dict.get("coding", [{}])[0].get("code") if type_dict.get("coding") else None
                id_type_display = type_dict.get("coding", [{}])[0].get("display") if type_dict.get("coding") else None
                
                identifiers.append(Identifier(
                    system=system,
                    value=value,
                    type_code=id_type_code,
                    type_display=id_type_display
                ))
            elif "mrn" in system.lower() or self._is_mrn_type(type_dict):
                # Standard MRN identifier
                identifiers.append(Identifier(
                    system=system,
                    value=value,
                    type_code="MRN",
                    type_display="Medical Record Number"
                ))
            else:
                # Other identifier
                id_type_code = type_dict.get("coding", [{}])[0].get("code") if type_dict.get("coding") else None
                id_type_display = type_dict.get("coding", [{}])[0].get("display") if type_dict.get("coding") else None
                
                identifiers.append(Identifier(
                    system=system,
                    value=value,
                    type_code=id_type_code,
                    type_display=id_type_display
                ))
        
        return identifiers
    
    def _is_mrn_type(self, type_dict: Dict[str, Any]) -> bool:
        """Check if identifier type is MRN."""
        coding = type_dict.get("coding", [])
        for code in coding:
            code_str = code.get("code", "")
            display = code.get("display", "")
            if "MRN" in code_str.upper() or "medical record" in display.lower():
                return True
        return False


def create_epic_adapter() -> EpicFHIRAdapter:
    """Factory function to create Epic adapter."""
    return EpicFHIRAdapter()
