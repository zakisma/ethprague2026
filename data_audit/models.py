from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class AuditRequest(BaseModel):
    wallet: str
    max_contracts: int = 30
    force_refresh: bool = False   # игнорировать кэш

class CriterionDetail(BaseModel):
    score: float
    max: float
    note: str

class AuditResponse(BaseModel):
    wallet: str
    score: float
    verdict: str                  # APPROVE / REVIEW / REJECT
    breakdown: Dict[str, CriterionDetail]
    summary: List[str]
    cached: bool = False
    processing_time_ms: Optional[float] = None