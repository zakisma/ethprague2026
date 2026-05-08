import logging
from src.schemas.requests import GrantApplication
from src.schemas.responses import SourcifyAuditResult

# from pharukh.sourcify import output # Hypothetical import for the Sourcify tool

logger = logging.getLogger(__name__)

def process_grant_application(app_data: GrantApplication):
     """
     Main function to process incoming grant applications.
     This is where the VentureApplicationEngine would be invoked.
     """
     logger.info(f"Received grant application from {app_data.wallet_address}")
     
     # Here we would instantiate and run the VentureApplicationEngine
     # For demonstration, we'll just log the received data
     logger.debug(f"Application Data: {app_data.json()}")
     
     # Mocking a response for testing
     raw_sourcify_dict = SourcifyAuditResult(
          wallet=app_data.wallet_address,
          score=0.45,
          verdict="REVIEW",
          breakdown={"complexity": {"score": 0.05, "max": 0.15, "note": "Moderate complexity"}},
          summary=["10 verified contracts", "Moderate complexity", "Clean code"]
     )
     # automatically convert dict to Pydantic model for better type safety and validation
     sourcify_result = SourcifyAuditResult(**raw_sourcify_dict)

     if sourcify_result.score < 0.35:
        logger.info("Auto-Reject: Score below 0.3")
        return {"status": "REJECTED"}
        
     elif sourcify_result.score > 0.65:
        logger.info("Auto-Approve: Fast-track to Umia Market")
        return {"status": "APPROVED", "next_step": "create_market"}
        
     else:
        logger.info(f"Score is {sourcify_result.score}. Initiating Deep Audit on GitHub: {app_data.github_url}")
        # Agent №2 call
        # Giving app_data and sourcify_result
        return run_deep_audit(app_data, sourcify_result)

def run_deep_audit(app_data: GrantApplication, sourcify_data: SourcifyAuditResult):
    # Agent №2 call
    pass