from fastapi import APIRouter, HTTPException, status

from src.schemas.user import UserOut, UserUpdate
from src.core.dependecies import SessionDep, CurrentUserIdDep
from src.services import user_service
from src.services.user_service import ( 
    UserAlreadyExistsEmailException, 
    UserNotFoundException
)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
async def get_user(user_id: CurrentUserIdDep, session: SessionDep):
    user = user_service.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user

@router.patch("/me", response_model=UserOut)
async def update_user(body: UserUpdate, user_id: CurrentUserIdDep, session: SessionDep):
    try:
        return user_service.update_user(session, user_id, body)
    except UserNotFoundException as ex:
         raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(ex)
            ) from ex
    except UserAlreadyExistsEmailException as ex:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(ex)
            ) from ex
