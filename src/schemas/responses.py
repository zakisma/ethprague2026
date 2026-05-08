from pydantic import BaseModel, Field
from typing import Dict, List

# breakdown criterias
class CriterionScore(BaseModel):
    score: float
    max: float
    note: str

# Full response from the Sourcify tool
class SourcifyAuditResult(BaseModel):
    wallet: str
    score: float
    verdict: str
    breakdown: Dict[str, CriterionScore]
    summary: List[str]