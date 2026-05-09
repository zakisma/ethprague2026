from typing import Dict, Optional

from src.schemas.requests import GrantApplication
from src.schemas.responses import SourcifyAuditResult


APPLICATIONS: Dict[str, GrantApplication] = {}
SOURCIFY_AUDITS: Dict[str, SourcifyAuditResult] = {}


def save_application(app_data: GrantApplication) -> None:
    APPLICATIONS[app_data.applicant_wallet_address.lower()] = app_data


def save_sourcify_audit(audit_data: SourcifyAuditResult) -> None:
    SOURCIFY_AUDITS[audit_data.wallet.lower()] = audit_data


def get_application(wallet: str) -> Optional[GrantApplication]:
    return APPLICATIONS.get(wallet.lower())


def get_sourcify_audit(wallet: str) -> Optional[SourcifyAuditResult]:
    return SOURCIFY_AUDITS.get(wallet.lower())