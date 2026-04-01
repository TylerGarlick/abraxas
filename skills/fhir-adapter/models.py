"""
FHIR Adapter Models

Data models for FHIR resource mapping from Epic, Cerner, and Meditech EHR systems.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict, Any


class EHRSystem(Enum):
    """Supported EHR systems."""
    EPIC = "epic"
    CERNER = "cerner"
    MEDITECH = "meditech"
    UNKNOWN = "unknown"


class ClaimStatus(Enum):
    """FHIR Claim status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    DENIED = "denied"
    UNKNOWN = "unknown"


class ClaimType(Enum):
    """FHIR Claim type."""
    INPATIENT = "inpatient"
    OUTPATIENT = "outpatient"
    URGENT = "urgent"
    OBSOLETE = "obsolete"
    UNKNOWN = "unknown"


class CoverageStatus(Enum):
    """FHIR Coverage status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    UNKNOWN = "unknown"


@dataclass
class Address:
    """Address representation."""
    use: Optional[str] = None
    line: List[str] = field(default_factory=list)
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "use": self.use,
            "line": self.line,
            "city": self.city,
            "state": self.state,
            "postalCode": self.postalCode,
            "country": self.country
        }


@dataclass
class Contact:
    """Contact information."""
    system: Optional[str] = None  # phone, email, etc.
    value: Optional[str] = None
    use: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "system": self.system,
            "value": self.value,
            "use": self.use
        }


@dataclass
class Identifier:
    """Identifier representation."""
    system: Optional[str] = None
    value: Optional[str] = None
    type_code: Optional[str] = None
    type_display: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "system": self.system,
            "value": self.value,
            "type_code": self.type_code,
            "type_display": self.type_display
        }


@dataclass
class HumanName:
    """Human name representation."""
    use: Optional[str] = None
    family: Optional[str] = None
    given: List[str] = field(default_factory=list)
    prefix: List[str] = field(default_factory=list)
    suffix: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "use": self.use,
            "family": self.family,
            "given": self.given,
            "prefix": self.prefix,
            "suffix": self.suffix
        }
    
    def full_name(self) -> str:
        parts = []
        if self.prefix:
            parts.extend(self.prefix)
        parts.extend(self.given)
        if self.family:
            parts.append(self.family)
        if self.suffix:
            parts.extend(self.suffix)
        return " ".join(parts)


@dataclass
class Patient:
    """Patient resource mapped from FHIR."""
    patient_id: str
    identifiers: List[Identifier] = field(default_factory=list)
    name: Optional[HumanName] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    addresses: List[Address] = field(default_factory=list)
    contacts: List[Contact] = field(default_factory=list)
    ehr_system: EHRSystem = EHRSystem.UNKNOWN
    raw_resource: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> dict:
        return {
            "patient_id": self.patient_id,
            "identifiers": [i.to_dict() for i in self.identifiers],
            "name": self.name.to_dict() if self.name else None,
            "gender": self.gender,
            "dob": self.dob,
            "addresses": [a.to_dict() for a in self.addresses],
            "contacts": [c.to_dict() for c in self.contacts],
            "ehr_system": self.ehr_system.value,
            "raw_resource": self.raw_resource
        }


@dataclass
class Diagnosis:
    """Claim diagnosis."""
    sequence: int
    code: str
    display: Optional[str] = None
    type_code: Optional[str] = None
    use_code: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "code": self.code,
            "display": self.display,
            "type_code": self.type_code,
            "use_code": self.use_code
        }


@dataclass
class Procedure:
    """Claim procedure."""
    sequence: int
    code: str
    display: Optional[str] = None
    date: Optional[str] = None
    outcome: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "code": self.code,
            "display": self.display,
            "date": self.date,
            "outcome": self.outcome
        }


@dataclass
class LineItem:
    """Claim line item."""
    sequence: int
    service_code: str
    service_display: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    factor: Optional[float] = None
    net_amount: Optional[float] = None
    diagnosis_links: List[int] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "service_code": self.service_code,
            "service_display": self.service_display,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "factor": self.factor,
            "net_amount": self.net_amount,
            "diagnosis_links": self.diagnosis_links
        }


@dataclass
class Money:
    """Monetary amount."""
    value: Optional[float] = None
    currency: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "value": self.value,
            "currency": self.currency
        }


@dataclass
class Claim:
    """Claim resource mapped from FHIR."""
    claim_id: str
    status: ClaimStatus
    claim_type: ClaimType
    claim_use: Optional[str] = None
    patient_ref: Optional[str] = None
    created_date: Optional[str] = None
    insurer_ref: Optional[str] = None
    diagnoses: List[Diagnosis] = field(default_factory=list)
    procedures: List[Procedure] = field(default_factory=list)
    line_items: List[LineItem] = field(default_factory=list)
    total_amount: Optional[Money] = None
    ehr_system: EHRSystem = EHRSystem.UNKNOWN
    raw_resource: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> dict:
        return {
            "claim_id": self.claim_id,
            "status": self.status.value,
            "claim_type": self.claim_type.value,
            "claim_use": self.claim_use,
            "patient_ref": self.patient_ref,
            "created_date": self.created_date,
            "insurer_ref": self.insurer_ref,
            "diagnoses": [d.to_dict() for d in self.diagnoses],
            "procedures": [p.to_dict() for p in self.procedures],
            "line_items": [li.to_dict() for li in self.line_items],
            "total_amount": self.total_amount.to_dict() if self.total_amount else None,
            "ehr_system": self.ehr_system.value,
            "raw_resource": self.raw_resource
        }


@dataclass
class CoverageClass:
    """Coverage class (plan details)."""
    type_code: Optional[str] = None
    type_display: Optional[str] = None
    value: Optional[str] = None
    name: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "type_code": self.type_code,
            "type_display": self.type_display,
            "value": self.value,
            "name": self.name
        }


@dataclass
class Coverage:
    """Coverage resource mapped from FHIR."""
    coverage_id: str
    status: CoverageStatus
    coverage_type: Optional[str] = None
    subscriber_ref: Optional[str] = None
    beneficiary_ref: Optional[str] = None
    payer_name: Optional[str] = None
    coverage_classes: List[CoverageClass] = field(default_factory=list)
    ehr_system: EHRSystem = EHRSystem.UNKNOWN
    raw_resource: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> dict:
        return {
            "coverage_id": self.coverage_id,
            "status": self.status.value,
            "coverage_type": self.coverage_type,
            "subscriber_ref": self.subscriber_ref,
            "beneficiary_ref": self.beneficiary_ref,
            "payer_name": self.payer_name,
            "coverage_classes": [cc.to_dict() for cc in self.coverage_classes],
            "ehr_system": self.ehr_system.value,
            "raw_resource": self.raw_resource
        }


@dataclass
class ParseResult:
    """Result of parsing a FHIR resource."""
    success: bool
    resource_type: Optional[str] = None
    data: Optional[Any] = None
    ehr_system: EHRSystem = EHRSystem.UNKNOWN
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "resource_type": self.resource_type,
            "data": self.data.to_dict() if self.data else None,
            "ehr_system": self.ehr_system.value,
            "errors": self.errors,
            "warnings": self.warnings
        }
