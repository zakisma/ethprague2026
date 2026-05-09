from sqlmodel import Session, select

from src.db.models import User
from src.schemas.user import UserUpdate

class UserNotFoundException(Exception):
    def __init__(self, user_id: int, message: str | None = None):
        if message is None:
            message = f"User with id {user_id} not found"
        super().__init__(message)
        self.user_id = user_id

class UserAlreadyExistsEmailException(Exception):
    def __init__(self, message: str | None = None):
        if message is None:
            message = "User with this email already exists"
        super().__init__(message)

def get_user_by_id(session: Session, id: int) -> User | None:
    return session.get(User, id)

def get_user_by_email(sesssion: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return sesssion.exec(statement).first()

def create_user(session: Session, wallet_address: str) -> User:
    new_user = User(wallet_address=wallet_address)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user

def update_user(session: Session, id: int, data: UserUpdate) -> User:
    stored_user = get_user_by_id(session, id)
    if stored_user is None:
        raise UserNotFoundException(id)
    
    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data:
        existing_user = get_user_by_email(session, update_data['email'])
        if existing_user is not None and existing_user.id != id:
            raise UserAlreadyExistsEmailException()
    
    stored_user.sqlmodel_update(update_data)
    session.add(stored_user)
    session.commit()
    session.refresh(stored_user)

    return stored_user