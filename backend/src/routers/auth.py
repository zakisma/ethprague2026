from fastapi import APIRouter

from src.schemas.auth import NonceRequest, NonceResponse, VerifyRequest, Token
from src.services import auth_service
from src.core.dependecies import SessionDep
from src.core import security

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/nonce",response_model=NonceResponse)
async def create_nonce(data: NonceRequest, session: SessionDep):
   return auth_service.create_nonce(session, data)

@router.post("/verify")
async def verify(data: VerifyRequest, session: SessionDep) -> Token:
    user = auth_service.verify_nonce(session, data)
    
    token = security.create_access_token(data={"sub": str(user.id)})

    return Token(access_token=token, token_type="bearer")


