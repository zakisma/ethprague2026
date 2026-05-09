from datetime import date, datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from src.db.enums import ProjectStatus

class MilestoneCreate(BaseModel):
    title: str = Field(max_length=50)
    deadline: date
    funding_needed_proof: Decimal
    description: str = Field(max_length=3000)

class ProjectCreate(BaseModel):
    title: str = Field(max_length=50)
    website_url: str | None = None
    github_repository: str
    description: str = Field(max_length=3000)
    milestones: list[MilestoneCreate] = Field(min_length=1, max_length=5)

class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    deadline: date
    funding_needed_proof: Decimal
    description: str
    created_at: datetime

class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    website_url: str | None = None
    github_repository: str
    description: str
    status: ProjectStatus
    audit_response: dict[str, Any] | None = None
    audited_at: datetime | None = None
    audit_error: str | None = None
    created_at: datetime
    milestones: list[MilestoneOut] = Field(default_factory=list) # type: ignore
