from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class CriterionScore(BaseModel):
    score: float
    max: float
    note: str


class BreakdownData(BaseModel):
    has_any_verified: CriterionScore
    verification_quality: CriterionScore
    documentation: CriterionScore
    activity_history: CriterionScore
    complexity: CriterionScore
    security: CriterionScore


class SourcifyAuditResult(BaseModel):
    wallet: str
    score: float
    verdict: str
    breakdown: BreakdownData
    summary: List[str]

    raw_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Keep the original raw response from Sourcify."
    )


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




