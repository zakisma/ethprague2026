from sqlmodel import SQLModel, Field
from pydantic import EmailStr
from datetime import datetime, timezone

class User(SQLModel, table=True):
    __tablename__ = "users" # type: ignore[assignment]
    
    id: int | None = Field(default=None, primary_key=True)
    first_name: str | None = Field(default=None, nullable=True)
    last_name: str | None = Field(default=None, nullable=True)
    email: EmailStr | None = Field(default=None, unique=True, index=True, nullable=True)
    wallet_address: str = Field(unique=True, index=True, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuthNonce(SQLModel, table=True):
    __tablename__ = "auth_nonces" # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    wallet_address: str = Field(index=True, nullable=False)
    nonce: str = Field(index=True, unique=True, nullable=False)
    message: str = Field(nullable=False)
    used: bool = Field(default=False)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))