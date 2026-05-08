from pydantic import BaseModel, Field
from typing import Any, Dict, List

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
    # ДОБАВЛЯЕМ ЭТО:
    raw_data: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Keep the original raw response from Sourcify for analysis and future reference."
    )