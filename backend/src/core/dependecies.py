from sqlmodel import Session
from fastapi import Depends
from typing import Annotated

from src.db.session import engine
from .security import get_current_user_id

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserIdDep = Annotated[int, Depends(get_current_user_id)]