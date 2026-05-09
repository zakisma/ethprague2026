from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from sqlalchemy import Column, Enum, JSON

from src.db.enums import ProjectStatus, enum_values


class User(SQLModel, table=True):
    __tablename__ = "users" # type: ignore[assignment]
    
    id: int | None = Field(default=None, primary_key=True)

    first_name: str | None = Field(default=None, nullable=True)
    last_name: str | None = Field(default=None, nullable=True)
    email: EmailStr | None = Field(default=None, unique=True, index=True, nullable=True)
    wallet_address: str = Field(unique=True, index=True, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    projects: list["Project"] = Relationship(back_populates="user")

class AuthNonce(SQLModel, table=True):
    __tablename__ = "auth_nonces" # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)

    wallet_address: str = Field(index=True, nullable=False)
    nonce: str = Field(index=True, unique=True, nullable=False)
    message: str = Field(nullable=False)
    used: bool = Field(default=False)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Project(SQLModel, table=True):
    __tablename__ = "projects"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    title: str = Field(max_length=50, nullable=False)
    website_url: str | None = Field(default=None, nullable=True)
    github_repository: str = Field(nullable=False)
    description: str = Field(max_length=3000, nullable=False)

    status: ProjectStatus = Field(
        default=ProjectStatus.submitted,
        sa_column=Column(
            Enum(
                ProjectStatus,
                name="project_status",
                values_callable=enum_values
            ),
            nullable=False,
        ),
    )
    audit_response: dict[str, Any] | None = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
    )
    audited_at: datetime | None = Field(default=None, nullable=True)
    audit_error: str | None = Field(default=None, nullable=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    user: User | None = Relationship(back_populates="projects")   
    milestones: list["Milestone"] = Relationship(back_populates="project")


class Milestone(SQLModel, table=True):
    __tablename__ = "milestones"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)

    project_id: int = Field(foreign_key="projects.id", nullable=False)

    title: str = Field(max_length=50, nullable=False)
    deadline: date = Field(nullable=False)
    funding_needed_proof: Decimal = Field(nullable=False)
    description: str = Field(max_length=3000, nullable=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    project: Project | None = Relationship(back_populates="milestones")
