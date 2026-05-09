from datetime import datetime, timezone
from json import JSONDecodeError
from typing import Any
from urllib.parse import quote

import httpx
from sqlmodel import Session, select

from src.core.config import settings
from src.db.enums import ProjectStatus
from src.db.models import Milestone, Project, User
from src.db.session import engine
from src.schemas.project import ProjectCreate

class ProjectOwnerNotFoundException(Exception):
    def __init__(self, user_id: int, message: str | None = None):
        if message is None:
            message = f"User with id {user_id} not found"
        super().__init__(message)
        self.user_id = user_id


def create_project(session: Session, user_id: int, data: ProjectCreate) -> Project:
    user = session.get(User, user_id)
    if user is None:
        raise ProjectOwnerNotFoundException(user_id)

    project_data = data.model_dump(exclude={"milestones"})
    project = Project(user_id=user_id, status=ProjectStatus.submitted, **project_data)
    session.add(project)
    session.flush()
    if project.id is None:
        raise RuntimeError("Failed to create project")

    milestones = [
        Milestone(project_id=project.id, **milestone.model_dump())
        for milestone in data.milestones
    ]
    if milestones:
        session.add_all(milestones)

    session.commit()
    session.refresh(project)

    project.milestones = list(
        session.exec(select(Milestone).where(Milestone.project_id == project.id)).all()
    )
    return project


def audit_project_in_background(project_id: int, user_id: int) -> None:
    wallet_address = _get_wallet_address(user_id)
    if wallet_address is None:
        _save_audit_error(project_id, "User wallet not found")
        return

    try:
        payload = _fetch_audit_payload(wallet_address)
    except (httpx.HTTPError, TimeoutError, JSONDecodeError, ValueError) as ex:
        _save_audit_error(project_id, f"Audit request failed: {ex}")
        return
    except Exception as ex:
        _save_audit_error(project_id, f"Unexpected audit error: {ex}")
        return

    _save_audit_result(project_id, payload)


def _get_wallet_address(user_id: int) -> str | None:
    with Session(engine) as session:
        user = session.get(User, user_id)
        if user is None:
            return None
        return user.wallet_address


def _fetch_audit_payload(wallet_address: str) -> dict[str, Any]:
    encoded_wallet = quote(wallet_address, safe="")
    url = f"{settings.DATA_AI_URI.rstrip('/')}/test/audit/{encoded_wallet}"
    with httpx.Client(timeout=30.0) as client:
        response = client.get(url)
        response.raise_for_status()
        payload = response.json()
    if not isinstance(payload, dict):
        raise ValueError("Audit API response must be a JSON object")
    return payload


def _save_audit_error(project_id: int, error_message: str) -> None:
    with Session(engine) as session:
        project = session.get(Project, project_id)
        if project is None:
            return

        project.audit_error = error_message
        project.audited_at = datetime.now(timezone.utc)
        session.add(project)
        session.commit()


def _save_audit_result(project_id: int, payload: dict[str, Any]) -> None:
    with Session(engine) as session:
        project = session.get(Project, project_id)
        if project is None:
            return

        verdict = str(payload.get("verdict", "")).strip().lower()
        if verdict in {"reject", "rejected"}:
            project.status = ProjectStatus.rejected
        elif verdict in {"approve", "approved"}:
            project.status = ProjectStatus.approved_for_market

        # Persist full response object for forwarding to another API.
        project.audit_response = payload
        project.audit_error = None
        project.audited_at = datetime.now(timezone.utc)

        session.add(project)
        session.commit()
