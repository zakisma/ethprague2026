from pydantic import BaseModel, Field, model_validator
from typing import Any, Dict, List, Optional


class CriterionScore(BaseModel):
    score: float = 0.0
    max: float = 0.0
    note: str = "Not provided"


class BreakdownData(BaseModel):
    has_any_verified: CriterionScore = Field(default_factory=CriterionScore)
    verification_quality: CriterionScore = Field(default_factory=CriterionScore)
    documentation: CriterionScore = Field(default_factory=CriterionScore)
    activity_history: CriterionScore = Field(default_factory=CriterionScore)
    complexity: CriterionScore = Field(default_factory=CriterionScore)
    security: CriterionScore = Field(default_factory=CriterionScore)


class SourcifyAuditResult(BaseModel):
    wallet: str
    score: float = 0.0
    verdict: str
    breakdown: BreakdownData = Field(default_factory=BreakdownData)
    summary: List[str] = Field(default_factory=list)

    raw_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Keep the original raw response from Sourcify."
    )

    @model_validator(mode="before")
    @classmethod
    def normalize_sourcify_payload(cls, data: Any):
        if not isinstance(data, dict):
            return data

        # Sourcify/backend may send breakdown: {} for hard rejects.
        if not data.get("breakdown"):
            data["breakdown"] = {}

        # Normalize verdict naming from backend.
        verdict = str(data.get("verdict", "")).strip().upper()

        verdict_map = {
            "REJECT": "REJECTED",
            "REJECTED": "REJECTED",
            "APPROVE": "APPROVED",
            "APPROVED": "APPROVED",
            "NEEDS_REVIEW": "NEEDS_REVIEW",
            "REVIEW": "NEEDS_REVIEW",
            "MANUAL_REVIEW": "NEEDS_REVIEW",
        }

        data["verdict"] = verdict_map.get(verdict, verdict)

        return data


class MilestoneAuditResult(BaseModel):
    title: str
    deadline: str
    funding_needed: float
    original_kpi: str
    normalized_kpi: Optional[str] = None
    is_measurable: bool
    is_onchain_verifiable: bool
    risk_level: str
    verification_method: str
    rejection_reason: Optional[str] = None
    is_binary_resolvable: bool

class MarketCreationParams(BaseModel):
    projectName: str
    marketDescription: str
    developer: str
    feeTarget: str
    twlTarget: str
    wDeploy: int
    wFees: int
    wTwl: int
    wCallers: int
    wLiveness: int

class KPIVerifierConfig(BaseModel):
    durationBlocks: int
    snapshotInterval: int
    callerTarget: int
    minCallerBalance: str
    maxMissedPings: int
    grantContract: str


class TranchePlan(BaseModel):
    tranche1Amount: str
    tranche2Amount: str
    currency: str
class ContractExecutionPlan(BaseModel):
    should_create_market: bool
    contract_action: str
    market_creation_params: Optional[MarketCreationParams] = None
    kpi_verifier_config: Optional[KPIVerifierConfig] = None
    tranche_plan: Optional[TranchePlan] = None
    notes: Optional[str] = None

class DeepAuditResult(BaseModel):
    final_status: str
    risk_level: str
    market_readiness: bool
    reasoning: str
    evidence_summary: Dict[str, Any]
    risk_scores: Dict[str, float]
    milestone_assessments: List[MilestoneAuditResult]
    main_risks: List[str] = Field(default_factory=list)
    recommended_market_question: Optional[str] = None
    recommended_kpi: Optional[str] = None
    confidence: float
    contract_execution_plan: Optional[ContractExecutionPlan] = None
    github_meta: Optional[Dict[str, Any]] = None
    sourcify_meta: Optional[Dict[str, Any]] = None


class OrchestratorResponse(BaseModel):
    status: str
    message: str
    ai_audit_data: Optional[Dict[str, Any]] = None
    task_id: Optional[str] = None




