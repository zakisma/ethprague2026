import logging
from typing import Any, Dict, List, Optional

from src.schemas.requests import GrantApplication
from src.schemas.responses import OrchestratorResponse
from src.core.config import settings
from src.services.reputation_service import fetch_and_map_reputation

# Import our synchronous worker functions from the new file
from src.services.deep_audit import (
    run_rejection_analysis_sync,
    run_star_profiler_sync,
    run_deep_audit
)

logger = logging.getLogger(__name__)

def process_grant_application(app_data: GrantApplication) -> OrchestratorResponse:
    """
    Production-ready Analytical Orchestrator (Synchronous).
    Responsibility: Pure routing and task delegation.
    """
    logger.info(f"Processing application for {app_data.applicant_wallet_address}")
    
    # 1. Fetch and validate data (SRP fulfilled)
    reputation = fetch_and_map_reputation(app_data.applicant_wallet_address)
    
    # 2. Config-based routing (No magic numbers)
    if reputation.score < settings.AUTO_REJECT_THRESHOLD:
        logger.info("Routing -> Agent-Roaster (Sync)")
        report = run_rejection_analysis_sync(app_data, reputation)
        
        return OrchestratorResponse(
            status="wallet_check_failed",
            message="Auto-rejected based on low on-chain reputation.",
            ai_audit_data=report
        )
        
    elif reputation.score >= settings.AUTO_APPROVE_THRESHOLD:
       logger.info("Routing -> Deep GitHub Audit despite strong reputation")
       ai_report = run_deep_audit(app_data, reputation)

       return OrchestratorResponse(
         status=ai_report.get("final_status", "project_ai_review_running"),
         message="Deep audit finished.",
         ai_audit_data=ai_report
    )
        
    else:
        logger.info("Routing -> Deep GitHub Audit (SYNC)")
        
        # Call the function synchronously. The backend will keep the connection open.
        ai_report = run_deep_audit(app_data, reputation)
        
        # Return the final status decided by the AI
        return OrchestratorResponse(
            status=ai_report.get("final_status", "project_ai_review_running"),
            message="Deep audit finished.",
            ai_audit_data=ai_report
        )