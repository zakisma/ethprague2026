from sqlmodel import Session, select

from src.db.enums import ProjectStatus
from src.db.models import Milestone, Project, User
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
