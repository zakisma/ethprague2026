from typing import Dict, Optional

from src.schemas.requests import GrantApplication
from src.schemas.responses import SourcifyAuditResult, OrchestratorResponse


APPLICATIONS: Dict[str, GrantApplication] = {}
SOURCIFY_AUDITS: Dict[str, SourcifyAuditResult] = {}
RESULTS: Dict[str, OrchestratorResponse] = {}


def normalize_wallet(wallet: str) -> str:
    return wallet.lower()


def save_application(app_data: GrantApplication) -> None:
    APPLICATIONS[normalize_wallet(app_data.applicant_wallet_address)] = app_data


def save_sourcify_audit(audit_data: SourcifyAuditResult) -> None:
    SOURCIFY_AUDITS[normalize_wallet(audit_data.wallet)] = audit_data


def save_result(wallet: str, result: OrchestratorResponse) -> None:
    RESULTS[normalize_wallet(wallet)] = result


def get_application(wallet: str) -> Optional[GrantApplication]:
    return APPLICATIONS.get(normalize_wallet(wallet))


def get_sourcify_audit(wallet: str) -> Optional[SourcifyAuditResult]:
    return SOURCIFY_AUDITS.get(normalize_wallet(wallet))


def get_result(wallet: str) -> Optional[OrchestratorResponse]:
    return RESULTS.get(normalize_wallet(wallet))