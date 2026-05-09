import logging
from fastapi import APIRouter, HTTPException

from src.schemas.responses import SourcifyAuditResult
from src.services.application_store import (
    save_sourcify_audit,
    get_application,
)
from src.agents.orchestrator import process_grant_application_with_reputation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sourcify", tags=["Sourcify"])


@router.post("/audit")
def receive_sourcify_audit(audit_data: SourcifyAuditResult):
    try:
        wallet = audit_data.wallet.lower()

        logger.info(
            f"Received Sourcify audit for wallet={audit_data.wallet}, "
            f"score={audit_data.score}, verdict={audit_data.verdict}"
        )

        save_sourcify_audit(audit_data)

        app_data = get_application(wallet)

        if app_data is None:
            return {
                "status": "waiting_for_application",
                "message": "Sourcify audit received. Waiting for project application.",
                "wallet": audit_data.wallet,
                "score": audit_data.score,
                "verdict": audit_data.verdict,
                "summary": audit_data.summary,
            }

        result = process_grant_application_with_reputation(
            app_data=app_data,
            reputation=audit_data,
        )

        return {
            "status": "processed",
            "message": "Sourcify audit and application were merged and processed.",
            "wallet": audit_data.wallet,
            "score": audit_data.score,
            "verdict": audit_data.verdict,
            "summary": audit_data.summary,
            "result": result.model_dump(),
        }

    except Exception as e:
        logger.error(f"Failed to process Sourcify audit data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process Sourcify audit data: {str(e)}",
        )