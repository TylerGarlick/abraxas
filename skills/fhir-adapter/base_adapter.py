"""
FHIR Base Adapter

Base adapter class for parsing FHIR R4 resources from Epic, Cerner, and Meditech.
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import logging

from .models import (
    EHRSystem, Patient, Claim, Coverage, ParseResult,
    Identifier, HumanName, Address, Contact,
    Diagnosis, Procedure, LineItem, Money,
    CoverageClass, CoverageStatus, ClaimStatus, ClaimType
)


logger = logging.getLogger(__name__)


class FHIRError(Exception):
    """Base exception for FHIR adapter errors."""
    pass


class FHIRParseError(FHIRError):
    """Error parsing FHIR resource."""
    pass


class FHIRValidationError(FHIRError):
    """FHIR resource validation failed."""
    pass


class FHIRBaseAdapter(ABC):
    """Base adapter for FHIR resources."""
    
    # Common identifier system URLs
    SYSTEMS = {
        "mrn": "http://hl7.org/fhir/sid/us-mrn",
        "ssn": "http://hl7.org/fhir/sid/us-ssn",
        "dl": "http://hl7.org/fhir/sid/us-driver-license",
        " passport": "http://hl7.org/fhir/sid/passport",
    }
    
    def __init__(self):
        self.ehr_system: EHRSystem = EHRSystem.UNKNOWN
    
    @abstractmethod
    def detect_ehr_system(self, resource: Dict[str, Any]) -> EHRSystem:
        """Detect the EHR system from the resource."""
        pass
    
    @abstractmethod
    def parse_identifiers(self, resource: Dict[str, Any]) -> List[Identifier]:
        """Parse identifiers with EHR-specific logic."""
        pass
    
    def parse_patient(self, resource: Dict[str, Any]) -> Tuple[Patient, List[str]]:
        """
        Parse a FHIR Patient resource.
        
        Returns:
            Tuple of (Patient object, list of warnings)
        """
        warnings = []
        
        if resource.get("resourceType") != "Patient":
            raise FHIRValidationError(f"Expected Patient resource, got {resource.get('resourceType')}")
        
        patient_id = resource.get("id", "")
        name = self._parse_human_name(resource.get("name", [{}])[0] if resource.get("name") else {})
        gender = resource.get("gender", "")
        dob = resource.get("birthDate", "")
        
        # Parse identifiers
        identifiers = self.parse_identifiers(resource)
        
        # Parse addresses
        addresses = []
        for addr_dict in resource.get("address", []):
            addr = Address(
                use=addr_dict.get("use"),
                line=addr_dict.get("line", []),
                city=addr_dict.get("city"),
                state=addr_dict.get("state"),
                postalCode=addr_dict.get("postalCode"),
                country=addr_dict.get("country")
            )
            addresses.append(addr)
        
        # Parse contacts (telecom)
        contacts = []
        for telecom in resource.get("telecom", []):
            contact = Contact(
                system=telecom.get("system"),
                value=telecom.get("value"),
                use=telecom.get("use")
            )
            contacts.append(contact)
        
        patient = Patient(
            patient_id=patient_id,
            identifiers=identifiers,
            name=name,
            gender=gender,
            dob=dob,
            addresses=addresses,
            contacts=contacts,
            ehr_system=self.ehr_system,
            raw_resource=resource
        )
        
        return patient, warnings
    
    def parse_claim(self, resource: Dict[str, Any]) -> Tuple[Claim, List[str]]:
        """
        Parse a FHIR Claim resource.
        
        Returns:
            Tuple of (Claim object, list of warnings)
        """
        warnings = []
        
        if resource.get("resourceType") != "Claim":
            raise FHIRValidationError(f"Expected Claim resource, got {resource.get('resourceType')}")
        
        claim_id = resource.get("id", "")
        
        # Parse status
        status_str = resource.get("status", "unknown")
        try:
            status = ClaimStatus(status_str)
        except ValueError:
            status = ClaimStatus.UNKNOWN
            warnings.append(f"Unknown claim status: {status_str}")
        
        # Parse claim type
        type_coding = resource.get("type", {}).get("coding", [{}])[0] if resource.get("type", {}).get("coding") else {}
        claim_type_code = type_coding.get("code", "unknown")
        try:
            claim_type = ClaimType(claim_type_code)
        except ValueError:
            claim_type = ClaimType.UNKNOWN
            warnings.append(f"Unknown claim type: {claim_type_code}")
        
        claim_use = resource.get("use", "")
        patient_ref = self._get_reference(resource.get("patient", {}))
        created_date = resource.get("created", "")
        insurer_ref = self._get_reference(resource.get("insurer", {}))
        
        # Parse diagnoses
        diagnoses = []
        for idx, diag in enumerate(resource.get("diagnosis", [])):
            diagnosis = Diagnosis(
                sequence=idx + 1,
                code=self._get_code(diag.get("diagnosisCodeableConcept", {})),
                display=self._get_display(diag.get("diagnosisCodeableConcept", {})),
                type_code=self._get_code(diag.get("type", [{}])[0] if diag.get("type") else {}),
                use_code=self._get_code(diag.get("use", {}))
            )
            diagnoses.append(diagnosis)
        
        # Parse procedures
        procedures = []
        for idx, proc in enumerate(resource.get("procedure", [])):
            procedure = Procedure(
                sequence=idx + 1,
                code=self._get_code(proc.get("procedureCodeableConcept", {})),
                display=self._get_display(proc.get("procedureCodeableConcept", {})),
                date=proc.get("date", ""),
                outcome=proc.get("outcome", {})
            )
            procedures.append(procedure)
        
        # Parse line items
        line_items = []
        for idx, item in enumerate(resource.get("item", [])):
            service = item.get("service", {})
            quantity = item.get("quantity", {})
            net = item.get("net", {})
            
            line_item = LineItem(
                sequence=idx + 1,
                service_code=self._get_code(service),
                service_display=self._get_display(service),
                quantity=quantity.get("value"),
                unit_price=quantity.get("unitPrice", {}).get("value"),
                factor=item.get("factor"),
                net_amount=net.get("value"),
                diagnosis_links=item.get("diagnosisLink", [])
            )
            line_items.append(line_item)
        
        # Parse total amount
        total_dict = resource.get("total", {})
        total_amount = Money(
            value=total_dict.get("value"),
            currency=total_dict.get("currency")
        )
        
        claim = Claim(
            claim_id=claim_id,
            status=status,
            claim_type=claim_type,
            claim_use=claim_use,
            patient_ref=patient_ref,
            created_date=created_date,
            insurer_ref=insurer_ref,
            diagnoses=diagnoses,
            procedures=procedures,
            line_items=line_items,
            total_amount=total_amount,
            ehr_system=self.ehr_system,
            raw_resource=resource
        )
        
        return claim, warnings
    
    def parse_coverage(self, resource: Dict[str, Any]) -> Tuple[Coverage, List[str]]:
        """
        Parse a FHIR Coverage resource.
        
        Returns:
            Tuple of (Coverage object, list of warnings)
        """
        warnings = []
        
        if resource.get("resourceType") != "Coverage":
            raise FHIRValidationError(f"Expected Coverage resource, got {resource.get('resourceType')}")
        
        coverage_id = resource.get("id", "")
        
        # Parse status
        status_str = resource.get("status", "unknown")
        try:
            status = CoverageStatus(status_str)
        except ValueError:
            status = CoverageStatus.UNKNOWN
            warnings.append(f"Unknown coverage status: {status_str}")
        
        coverage_type = self._get_display(resource.get("type", {}))
        subscriber_ref = self._get_reference(resource.get("subscriber", {}))
        beneficiary_ref = self._get_reference(resource.get("beneficiary", {}))
        
        # Parse payer
        payer_ref = resource.get("payor", [{}])[0] if resource.get("payor") else {}
        payer_name = self._get_display(payer_ref)
        
        # Parse coverage classes
        coverage_classes = []
        for cost_class in resource.get("class", []):
            coverage_class = CoverageClass(
                type_code=cost_class.get("type", {}).get("coding", [{}])[0].get("code") if cost_class.get("type", {}).get("coding") else None,
                type_display=self._get_display(cost_class.get("type", {})),
                value=cost_class.get("value"),
                name=cost_class.get("name")
            )
            coverage_classes.append(coverage_class)
        
        coverage = Coverage(
            coverage_id=coverage_id,
            status=status,
            coverage_type=coverage_type,
            subscriber_ref=subscriber_ref,
            beneficiary_ref=beneficiary_ref,
            payer_name=payer_name,
            coverage_classes=coverage_classes,
            ehr_system=self.ehr_system,
            raw_resource=resource
        )
        
        return coverage, warnings
    
    def _parse_human_name(self, name_dict: Dict[str, Any]) -> Optional[HumanName]:
        """Parse a FHIR HumanName."""
        if not name_dict:
            return None
        return HumanName(
            use=name_dict.get("use"),
            family=name_dict.get("family"),
            given=name_dict.get("given", []),
            prefix=name_dict.get("prefix", []),
            suffix=name_dict.get("suffix", [])
        )
    
    def _get_reference(self, ref_dict: Dict[str, Any]) -> Optional[str]:
        """Extract reference string from FHIR reference."""
        return ref_dict.get("reference")
    
    def _get_code(self, codeable: Dict[str, Any]) -> Optional[str]:
        """Extract code from FHIR CodeableConcept."""
        coding = codeable.get("coding", [])
        if coding:
            return coding[0].get("code")
        return codeable.get("text")
    
    def _get_display(self, codeable: Dict[str, Any]) -> Optional[str]:
        """Extract display from FHIR CodeableConcept."""
        coding = codeable.get("coding", [])
        if coding:
            return coding[0].get("display")
        return codeable.get("text")
    
    def parse(self, resource: Dict[str, Any]) -> ParseResult:
        """
        Parse any FHIR resource.
        
        Detects resource type and delegates to appropriate parser.
        """
        resource_type = resource.get("resourceType", "")
        
        try:
            if resource_type == "Patient":
                data, warnings = self.parse_patient(resource)
                return ParseResult(
                    success=True,
                    resource_type=resource_type,
                    data=data,
                    ehr_system=self.ehr_system,
                    warnings=warnings
                )
            elif resource_type == "Claim":
                data, warnings = self.parse_claim(resource)
                return ParseResult(
                    success=True,
                    resource_type=resource_type,
                    data=data,
                    ehr_system=self.ehr_system,
                    warnings=warnings
                )
            elif resource_type == "Coverage":
                data, warnings = self.parse_coverage(resource)
                return ParseResult(
                    success=True,
                    resource_type=resource_type,
                    data=data,
                    ehr_system=self.ehr_system,
                    warnings=warnings
                )
            else:
                return ParseResult(
                    success=False,
                    resource_type=resource_type,
                    errors=[f"Unsupported resource type: {resource_type}"],
                    ehr_system=self.ehr_system
                )
        except FHIRError as e:
            return ParseResult(
                success=False,
                resource_type=resource_type,
                errors=[str(e)],
                ehr_system=self.ehr_system
            )
