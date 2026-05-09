import logging
from fastapi import APIRouter

from src.schemas.requests import GrantApplication
from src.services.application_store import (
    save_application,
    get_sourcify_audit,
    save_result,
)
from src.agents.orchestrator import process_grant_application_with_reputation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("")
def receive_application(app_data: GrantApplication):
    wallet = app_data.applicant_wallet_address

    logger.info(f"Received application for wallet={wallet}")

    save_application(app_data)

    sourcify_audit = get_sourcify_audit(wallet)

    if sourcify_audit is None:
        return {
            "status": "waiting_for_sourcify",
            "message": "Application received. Waiting for Sourcify audit.",
            "wallet": wallet,
            "missing": ["sourcify_audit"],
            "received": ["application"],
        }

    result = process_grant_application_with_reputation(
        app_data=app_data,
        reputation=sourcify_audit,
    )

    save_result(wallet, result)

    return {
        "status": "processed",
        "message": "Application and Sourcify audit were merged and processed.",
        "wallet": wallet,
        "missing": [],
        "received": ["application", "sourcify_audit"],
        "result": result.model_dump(),
    }