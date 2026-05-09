import logging
from fastapi import APIRouter, HTTPException

from src.schemas.responses import SourcifyAuditResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sourcify", tags=["Sourcify"])


@router.post("/audit")
def receive_sourcify_audit(audit_data: SourcifyAuditResult):
    """
    Receives Sourcify audit result from backend service.
    Validates it against SourcifyAuditResult schema.
    """

    try:
        logger.info(
            f"Received Sourcify audit for wallet={audit_data.wallet}, "
            f"score={audit_data.score}, verdict={audit_data.verdict}"
        )

        return {
            "status": "received",
            "message": "Sourcify audit data received and validated.",
            "wallet": audit_data.wallet,
            "score": audit_data.score,
            "verdict": audit_data.verdict,
            "summary": audit_data.summary
        }

    except Exception as e:
        logger.error(f"Failed to process Sourcify audit data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process Sourcify audit data: {str(e)}"
        )