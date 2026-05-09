from fastapi import APIRouter, HTTPException, status

from src.core.dependecies import CurrentUserIdDep, SessionDep
from src.schemas.project import ProjectCreate, ProjectOut
from src.services import project_service
from src.services.project_service import ProjectOwnerNotFoundException

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate, user_id: CurrentUserIdDep, session: SessionDep
):
    try:
        return project_service.create_project(session, user_id, body)
    except ProjectOwnerNotFoundException as ex:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ex),
        ) from ex
