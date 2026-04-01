"""
FHIR Adapter - Unified interface for Epic, Cerner, and Meditech FHIR resources.

Usage:
    from fhir_adapter import FHIRAdapter
    
    adapter = FHIRAdapter()
    result = adapter.parse(resource)
    
    # Or use specific adapters
    from fhir_adapter import EpicFHIRAdapter, CernerFHIRAdapter, MeditechFHIRAdapter
"""

from typing import Dict, Any, Optional
import logging

from .base_adapter import FHIRBaseAdapter, FHIRParseError, FHIRValidationError
from .models import EHRSystem, Patient, Claim, Coverage, ParseResult
from .epic_adapter import EpicFHIRAdapter, create_epic_adapter
from .cerner_adapter import CernerFHIRAdapter, create_cerner_adapter
from .meditech_adapter import MeditechFHIRAdapter, create_meditech_adapter


logger = logging.getLogger(__name__)


class FHIRAdapter:
    """
    Unified FHIR adapter that auto-detects EHR system and parses resources.
    
    Supports Epic, Cerner, and Meditech EHR systems.
    
    Usage:
        adapter = FHIRAdapter()
        
        # Parse any FHIR resource (auto-detects EHR system)
        result = adapter.parse(fhir_resource)
        
        # Force specific adapter
        result = adapter.parse_with(fhir_resource, EHRSystem.EPIC)
        
        # Direct adapter access
        epic = adapter.get_epic_adapter()
        cerner = adapter.get_cerner_adapter()
        meditech = adapter.get_meditech_adapter()
    """
    
    def __init__(self):
        self._epic_adapter: Optional[EpicFHIRAdapter] = None
        self._cerner_adapter: Optional[CernerFHIRAdapter] = None
        self._meditech_adapter: Optional[MeditechFHIRAdapter] = None
    
    @property
    def epic(self) -> EpicFHIRAdapter:
        """Get Epic adapter instance."""
        if self._epic_adapter is None:
            self._epic_adapter = create_epic_adapter()
        return self._epic_adapter
    
    @property
    def cerner(self) -> CernerFHIRAdapter:
        """Get Cerner adapter instance."""
        if self._cerner_adapter is None:
            self._cerner_adapter = create_cerner_adapter()
        return self._cerner_adapter
    
    @property
    def meditech(self) -> MeditechFHIRAdapter:
        """Get Meditech adapter instance."""
        if self._meditech_adapter is None:
            self._meditech_adapter = create_meditech_adapter()
        return self._meditech_adapter
    
    def get_adapter_for_ehr(self, ehr_system: EHRSystem) -> FHIRBaseAdapter:
        """Get the appropriate adapter for an EHR system."""
        if ehr_system == EHRSystem.EPIC:
            return self.epic
        elif ehr_system == EHRSystem.CERNER:
            return self.cerner
        elif ehr_system == EHRSystem.MEDITECH:
            return self.meditech
        else:
            # Default to Epic if unknown
            logger.warning(f"Unknown EHR system {ehr_system}, defaulting to Epic")
            return self.epic
    
    def detect_ehr_system(self, resource: Dict[str, Any]) -> EHRSystem:
        """
        Detect the EHR system from a FHIR resource.
        
        Checks each adapter in order of likelihood:
        1. Epic (most common)
        2. Cerner
        3. Meditech
        """
        # Try Epic first
        ehr = self.epic.detect_ehr_system(resource)
        if ehr != EHRSystem.UNKNOWN:
            return ehr
        
        # Try Cerner
        ehr = self.cerner.detect_ehr_system(resource)
        if ehr != EHRSystem.UNKNOWN:
            return ehr
        
        # Try Meditech
        ehr = self.meditech.detect_ehr_system(resource)
        if ehr != EHRSystem.UNKNOWN:
            return ehr
        
        # Unknown - return Epic as default
        logger.info("Could not detect EHR system, defaulting to Epic-compatible parsing")
        return EHRSystem.UNKNOWN
    
    def parse(self, resource: Dict[str, Any]) -> ParseResult:
        """
        Parse a FHIR resource with auto-detection of EHR system.
        
        Args:
            resource: FHIR R4 resource dictionary
            
        Returns:
            ParseResult with parsed data or errors
        """
        # Detect EHR system
        ehr_system = self.detect_ehr_system(resource)
        
        # Get appropriate adapter
        adapter = self.get_adapter_for_ehr(ehr_system)
        
        # Parse with detected adapter
        return adapter.parse(resource)
    
    def parse_with(self, resource: Dict[str, Any], ehr_system: EHRSystem) -> ParseResult:
        """
        Parse a FHIR resource with a specific EHR adapter.
        
        Args:
            resource: FHIR R4 resource dictionary
            ehr_system: The EHR system to use for parsing
            
        Returns:
            ParseResult with parsed data or errors
        """
        adapter = self.get_adapter_for_ehr(ehr_system)
        return adapter.parse(resource)
    
    def parse_patient(self, resource: Dict[str, Any], ehr_system: Optional[EHRSystem] = None) -> ParseResult:
        """Parse a FHIR Patient resource."""
        if ehr_system:
            adapter = self.get_adapter_for_ehr(ehr_system)
        else:
            ehr_system = self.detect_ehr_system(resource)
            adapter = self.get_adapter_for_ehr(ehr_system)
        
        try:
            patient, warnings = adapter.parse_patient(resource)
            return ParseResult(
                success=True,
                resource_type="Patient",
                data=patient,
                ehr_system=ehr_system,
                warnings=warnings
            )
        except FHIRValidationError as e:
            return ParseResult(
                success=False,
                resource_type="Patient",
                errors=[str(e)],
                ehr_system=ehr_system
            )
    
    def parse_claim(self, resource: Dict[str, Any], ehr_system: Optional[EHRSystem] = None) -> ParseResult:
        """Parse a FHIR Claim resource."""
        if ehr_system:
            adapter = self.get_adapter_for_ehr(ehr_system)
        else:
            ehr_system = self.detect_ehr_system(resource)
            adapter = self.get_adapter_for_ehr(ehr_system)
        
        try:
            claim, warnings = adapter.parse_claim(resource)
            return ParseResult(
                success=True,
                resource_type="Claim",
                data=claim,
                ehr_system=ehr_system,
                warnings=warnings
            )
        except FHIRValidationError as e:
            return ParseResult(
                success=False,
                resource_type="Claim",
                errors=[str(e)],
                ehr_system=ehr_system
            )
    
    def parse_coverage(self, resource: Dict[str, Any], ehr_system: Optional[EHRSystem] = None) -> ParseResult:
        """Parse a FHIR Coverage resource."""
        if ehr_system:
            adapter = self.get_adapter_for_ehr(ehr_system)
        else:
            ehr_system = self.detect_ehr_system(resource)
            adapter = self.get_adapter_for_ehr(ehr_system)
        
        try:
            coverage, warnings = adapter.parse_coverage(resource)
            return ParseResult(
                success=True,
                resource_type="Coverage",
                data=coverage,
                ehr_system=ehr_system,
                warnings=warnings
            )
        except FHIRValidationError as e:
            return ParseResult(
                success=False,
                resource_type="Coverage",
                errors=[str(e)],
                ehr_system=ehr_system
            )


# Convenience function for quick parsing
def parse(resource: Dict[str, Any]) -> ParseResult:
    """
    Parse a FHIR resource using the unified FHIRAdapter.
    
    This is a convenience function for simple use cases.
    For more control, create a FHIRAdapter instance.
    """
    adapter = FHIRAdapter()
    return adapter.parse(resource)


__all__ = [
    "FHIRAdapter",
    "EpicFHIRAdapter",
    "CernerFHIRAdapter",
    "MeditechFHIRAdapter",
    "FHIRParseError",
    "FHIRValidationError",
    "EHRSystem",
    "Patient",
    "Claim",
    "Coverage",
    "ParseResult",
    "parse",
]
