from fastapi import APIRouter, HTTPException

from src.services.application_store import get_result

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/{wallet}")
def get_analysis_result(wallet: str):
    result = get_result(wallet)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No processed result found for this wallet yet.",
        )

    return {
        "status": "found",
        "wallet": wallet,
        "result": result.model_dump(),
    }