import logging
from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain.tools import tool

from src.services.reputation_service import fetch_and_map_reputation

logger = logging.getLogger("AI_Ops.SourcifyTool")


class SourcifyInput(BaseModel):
    wallet_address: str = Field(..., description="Ethereum wallet address of the developer.")


@tool("fetch_developer_reputation", args_schema=SourcifyInput)
def fetch_developer_reputation(wallet_address: str) -> Dict[str, Any]:
    """
    Fetches developer reputation from Sourcify and returns validated audit data.
    """
    logger.info(f"Executing Sourcify reputation check for wallet: {wallet_address}")

    try:
        result = fetch_and_map_reputation(wallet_address)
        return result.model_dump()

    except Exception as e:
        logger.error(f"Sourcify reputation check failed: {e}")
        return {
    "wallet": wallet_address,
    "score": 0.0,
    "verdict": "ERROR",
    "breakdown": {
        "has_any_verified": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
        "verification_quality": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
        "documentation": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
        "activity_history": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
        "complexity": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
        "security": {"score": 0.0, "max": 0.0, "note": "Sourcify check failed"},
            },
            "summary": [f"Sourcify reputation check failed: {str(e)}"],
            "raw_data": {
                "error": str(e)
            }
        }