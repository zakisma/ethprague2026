import logging
from fastapi import APIRouter

from src.schemas.requests import GrantApplication
from src.services.application_store import (
    save_application,
    get_sourcify_audit,
)
from src.agents.orchestrator import process_grant_application_with_reputation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("")
def receive_application(app_data: GrantApplication):
    wallet = app_data.applicant_wallet_address.lower()

    save_application(app_data)

    sourcify_audit = get_sourcify_audit(wallet)

    if sourcify_audit is None:
        return {
            "status": "waiting_for_sourcify",
            "message": "Application received. Waiting for Sourcify audit.",
            "wallet": app_data.applicant_wallet_address,
        }

    result = process_grant_application_with_reputation(
        app_data=app_data,
        reputation=sourcify_audit,
    )

    return {
        "status": "processed",
        "message": "Application and Sourcify audit were merged and processed.",
        "wallet": app_data.applicant_wallet_address,
        "result": result.model_dump(),
    }