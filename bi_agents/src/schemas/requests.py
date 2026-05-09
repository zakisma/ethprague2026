from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import date


class RoadmapMilestone(BaseModel):
    title: str = Field(..., description="Milestone title, e.g. Mainnet Launch")
    verification_deadline: date = Field(..., description="Deadline for milestone verification")
    funding_needed: float = Field(..., description="Requested funding for this milestone in $PROOF")
    onchain_kpi_description: str = Field(
        ...,
        description="Applicant's promised KPI, e.g. Total volume > 1M ETH as verified by Etherscan"
    )


class GrantApplication(BaseModel):
    applicant_wallet_address: str = Field(..., description="Registered Ethereum wallet address (0x...)")
    project_title: str = Field(..., description="Name of the project")
    project_description: str = Field(..., description="Brief description of what the funds will be used for")
    website_url: Optional[str] = Field(None, description="Project website URL")
    repo_url: str = Field(..., description="Link to the applicant's GitHub repository")
    requested_amount: float = Field(..., description="Total amount of the grant requested")
    milestones: List[RoadmapMilestone] = Field(
        default_factory=list,
        description="Project roadmap milestones promised by the applicant"
    )