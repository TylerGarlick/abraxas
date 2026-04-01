"""
Meditech FHIR Adapter

Adapter for Meditech EHR system FHIR R4 resources.
"""

from typing import List, Dict, Any
import logging

from .base_adapter import FHIRBaseAdapter
from .models import EHRSystem, Identifier


logger = logging.getLogger(__name__)


class MeditechFHIRAdapter(FHIRBaseAdapter):
    """
    Adapter for Meditech EHR FHIR R4 resources.
    
    Meditech-specific quirks:
    - Uses Meditech extension system
    - BARBABANNER custom extension
    - Identifier patterns differ from standard MRN formats
    """
    
    # Meditech-specific identifier systems
    MEDITECH_SYSTEMS = {
        "mrn": "http://meditech.com/fhir/identifiers/mrn",
        "meditech": "urn:oid:2.16.840.1.113883.3.200",
        "barbabanner": "http://meditech.com/fhir/identifiers/barbabanner",
    }
    
    def __init__(self):
        super().__init__()
        self.ehr_system = EHRSystem.MEDITECH
    
    def detect_ehr_system(self, resource: Dict[str, Any]) -> EHRSystem:
        """
        Detect if this is a Meditech resource.
        
        Meditech indicators:
        - Identifier with Meditech-specific system URL
        - BARBABANNER extension
        - Meditech-specific extensions
        """
        # Check identifiers for Meditech systems
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            if "Meditech" in system or "meditech" in system.lower() or "BARBABANNER" in system:
                return EHRSystem.MEDITECH
            # Check extensions on identifier
            for ext in identifier.get("extension", []):
                if "Meditech" in str(ext) or "BARBABANNER" in str(ext):
                    return EHRSystem.MEDITECH
        
        # Check for Meditech-specific extensions on resource
        for ext in resource.get("extension", []):
            ext_str = str(ext)
            if "Meditech" in ext_str or "BARBABANNER" in ext_str:
                return EHRSystem.MEDITECH
        
        # Check meta.profile for Meditech
        for profile in resource.get("meta", {}).get("profile", []):
            if "Meditech" in profile:
                return EHRSystem.MEDITECH
        
        return EHRSystem.UNKNOWN
    
    def parse_identifiers(self, resource: Dict[str, Any]) -> List[Identifier]:
        """
        Parse identifiers with Meditech-specific logic.
        
        Meditech uses custom identifier patterns and extensions.
        BARBABANNER is a common Meditech identifier type.
        """
        identifiers = []
        
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            value = identifier.get("value", "")
            type_dict = identifier.get("type", {})
            
            # Check for Meditech-specific systems
            is_meditech = False
            for meditech_sys in self.MEDITECH_SYSTEMS.values():
                if meditech_sys in system:
                    is_meditech = True
                    break
            
            if is_meditech or "Meditech" in system or "BARBABANNER" in system:
                id_type_code = type_dict.get("coding", [{}])[0].get("code") if type_dict.get("coding") else None
                id_type_display = type_dict.get("coding", [{}])[0].get("display") if type_dict.get("coding") else None
                
                # Check for BARBABANNER in extensions
                if "BARBABANNER" in system or self._has_barbabanner_extension(identifier):
                    id_type_code = "BARBABANNER"
                    id_type_display = "Meditech BARBABANNER ID"
                
                identifiers.append(Identifier(
                    system=system,
                    value=value,
                    type_code=id_type_code,
                    type_display=id_type_display
                ))
            elif "mrn" in system.lower() or self._is_mrn_type(type_dict):
                identifiers.append(Identifier(
                    system=system,
                    value=value,
                    type_code="MRN",
                    type_display="Medical Record Number"
                ))
            else:
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
    
    def _has_barbabanner_extension(self, identifier: Dict[str, Any]) -> bool:
        """Check if identifier has BARBABANNER extension."""
        for ext in identifier.get("extension", []):
            if "BARBABANNER" in str(ext):
                return True
        return False


def create_meditech_adapter() -> MeditechFHIRAdapter:
    """Factory function to create Meditech adapter."""
    return MeditechFHIRAdapter()
