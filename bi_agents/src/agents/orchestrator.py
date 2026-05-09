import logging

from src.schemas.requests import GrantApplication
from src.schemas.responses import OrchestratorResponse
from src.services.reputation_service import fetch_and_map_reputation

from src.agents.deep_audit_agent import (
    run_rejection_analysis_sync,
    run_trust_profile_sync,
    run_deep_audit,
)

logger = logging.getLogger(__name__)


def normalize_verdict(verdict: str) -> str:
    return (verdict or "").strip().upper()


def process_grant_application(app_data: GrantApplication) -> OrchestratorResponse:
    """
    Agentic Orchestrator.

    Routes grant applications based on the Sourcify wallet reputation verdict:
    - REJECTED: no repository analysis, return lightweight AI rejection feedback.
    - NEEDS_REVIEW: run GitHub + milestone + deep audit.
    - APPROVED: no repository analysis, return trust profile and approval rationale.
    """

    wallet = app_data.applicant_wallet_address
    logger.info(f"Processing grant application for wallet={wallet}")

    reputation = fetch_and_map_reputation(wallet)
    verdict = normalize_verdict(reputation.verdict)

    if verdict == "REJECTED":
        logger.info("Routing -> Reputation Rejection Agent")

        report = run_rejection_analysis_sync(app_data, reputation)

        return OrchestratorResponse(
            status="wallet_rejected",
            message="Application rejected based on Sourcify wallet reputation.",
            ai_audit_data=report,
        )

    if verdict == "APPROVED":
        logger.info("Routing -> Trust Profile Agent")

        report = run_trust_profile_sync(app_data, reputation)

        return OrchestratorResponse(
            status="wallet_approved",
            message="Applicant passed the Sourcify reputation check.",
            ai_audit_data=report,
        )

    if verdict in {"NEEDS_REVIEW", "REVIEW", "MANUAL_REVIEW"}:
        logger.info("Routing -> Deep Audit Agent")

        ai_report = run_deep_audit(app_data, reputation)

        return OrchestratorResponse(
            status=ai_report.get("final_status", "project_ai_review_finished"),
            message="Deep audit finished.",
            ai_audit_data=ai_report,
        )

    logger.warning(f"Unknown Sourcify verdict={verdict}. Routing to deep audit as safety fallback.")

    ai_report = run_deep_audit(app_data, reputation)

    return OrchestratorResponse(
        status=ai_report.get("final_status", "project_ai_review_finished"),
        message="Unknown reputation verdict; deep audit was used as fallback.",
        ai_audit_data=ai_report,
    )