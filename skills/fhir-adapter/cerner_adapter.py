"""
Cerner FHIR Adapter

Adapter for Cerner (Oracle Health) EHR system FHIR R4 resources.
"""

from typing import List, Dict, Any
import logging

from .base_adapter import FHIRBaseAdapter
from .models import EHRSystem, Identifier


logger = logging.getLogger(__name__)


class CernerFHIRAdapter(FHIRBaseAdapter):
    """
    Adapter for Cerner EHR FHIR R4 resources.
    
    Cerner-specific quirks:
    - Standard FHIR identifiers with CERNER system prefix
    - May use nested bundles for related resources
    - Coverage class includes FHIR and MEMBER types
    """
    
    # Cerner-specific identifier systems
    CERNER_SYSTEMS = {
        "mrn": "http://cerner.com/fhir/identifiers/mrn",
        "cerner": "urn:oid:2.16.840.1.113883.3.13.6",
        "oracle": "http://www.oracle.com/HealthcareOID",
    }
    
    def __init__(self):
        super().__init__()
        self.ehr_system = EHRSystem.CERNER
    
    def detect_ehr_system(self, resource: Dict[str, Any]) -> EHRSystem:
        """
        Detect if this is a Cerner resource.
        
        Cerner indicators:
        - Identifier with Cerner-specific system URL
        - Meta.profile containing Cerner
        """
        # Check identifiers for Cerner systems
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            if "Cerner" in system or "cerner" in system.lower() or "oracle" in system.lower():
                return EHRSystem.CERNER
        
        # Check meta.profile for Cerner
        for profile in resource.get("meta", {}).get("profile", []):
            if "Cerner" in profile or "Oracle" in profile:
                return EHRSystem.CERNER
        
        # Check for Cerner-specific extensions
        for ext in resource.get("extension", []):
            if "Cerner" in str(ext) or "Oracle" in str(ext):
                return EHRSystem.CERNER
        
        return EHRSystem.UNKNOWN
    
    def parse_identifiers(self, resource: Dict[str, Any]) -> List[Identifier]:
        """
        Parse identifiers with Cerner-specific logic.
        
        Cerner uses standard FHIR identifiers with CERNER system.
        May have multiple identifier types.
        """
        identifiers = []
        
        for identifier in resource.get("identifier", []):
            system = identifier.get("system", "")
            value = identifier.get("value", "")
            type_dict = identifier.get("type", {})
            
            # Check for Cerner-specific systems
            is_cerner = False
            for cerner_sys in self.CERNER_SYSTEMS.values():
                if cerner_sys in system:
                    is_cerner = True
                    break
            
            if is_cerner or "Cerner" in system or "cerner" in system.lower():
                id_type_code = type_dict.get("coding", [{}])[0].get("code") if type_dict.get("coding") else None
                id_type_display = type_dict.get("coding", [{}])[0].get("display") if type_dict.get("coding") else None
                
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


def create_cerner_adapter() -> CernerFHIRAdapter:
    """Factory function to create Cerner adapter."""
    return CernerFHIRAdapter()
