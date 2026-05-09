from web3 import Web3
from siwe import SiweMessage
from siwe.siwe import ISO8601Datetime, VersionEnum
from sqlmodel import Session, select, col
from sqlalchemy import update
from secrets import token_hex
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone

from src.core.config import settings
from src.schemas.auth import NonceRequest, NonceResponse, VerifyRequest
from src.db.models import AuthNonce, User

def create_nonce(session: Session, data: NonceRequest) -> NonceResponse:
    if not Web3.is_address(data.wallet_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address",
        )

    wallet_address = Web3.to_checksum_address(data.wallet_address)

    nonce = token_hex(16)
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(minutes=5)

    siwe_message = SiweMessage(
        domain=settings.APP_DOMAIN,
        address=wallet_address,
        statement="Sign in to this application.",
        uri=settings.APP_URI,
        version=VersionEnum.one,
        chain_id=settings.CHAIN_ID,
        nonce=nonce,
        issued_at=ISO8601Datetime(issued_at.isoformat()),
        expiration_time=ISO8601Datetime(expires_at.isoformat()),
    )

    message = siwe_message.prepare_message()

    auth_nonce = AuthNonce(
        wallet_address=wallet_address,
        nonce=nonce,
        message=message,
        used=False,
        expires_at=expires_at,
    )

    session.add(auth_nonce)
    session.commit()

    return NonceResponse(message=message)

def verify_nonce(session: Session, data: VerifyRequest) -> User:
    try:
        siwe_message = SiweMessage.from_message(data.message)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid SIWE message",
        )

    wallet_address = Web3.to_checksum_address(siwe_message.address)

    statement = (
        select(AuthNonce)
        .where(AuthNonce.wallet_address == wallet_address)
        .where(AuthNonce.nonce == siwe_message.nonce)
        .where(AuthNonce.used == False)
    )

    auth_nonce = session.exec(statement).first()

    if auth_nonce is None:
        raise HTTPException(
            status_code=400,
            detail="Nonce not found or already used",
        )

    if auth_nonce.message != data.message:
        raise HTTPException(
            status_code=400,
            detail="Message does not match server message",
        )

    expires_at = auth_nonce.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Nonce expired",
        )

    if siwe_message.domain != settings.APP_DOMAIN:
        raise HTTPException(
            status_code=400,
            detail="Invalid domain",
        )

    if str(siwe_message.uri) != settings.APP_URI:
        raise HTTPException(
            status_code=400,
            detail="Invalid URI",
        )

    if siwe_message.chain_id != settings.CHAIN_ID:
        raise HTTPException(
            status_code=400,
            detail="Invalid chain id",
        )

    try:
        siwe_message.verify(
            signature=data.signature,
            domain=settings.APP_DOMAIN,
            nonce=auth_nonce.nonce,
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid signature",
        )

    consume_nonce_statement = (
        update(AuthNonce)
        .where(col(AuthNonce.id) == auth_nonce.id)
        .where(col(AuthNonce.used).is_(False))
        .values(used=True)
    )
    consume_nonce_result = session.exec(consume_nonce_statement)
    updated_rows = consume_nonce_result.rowcount or 0
    if updated_rows != 1:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Nonce not found or already used",
        )

    

    user_statement = select(User).where(User.wallet_address == wallet_address)
    user = session.exec(user_statement).first()

    if user is None:
        user = User(wallet_address=wallet_address)
        session.add(user)
        session.commit()
        session.refresh(user)
    else:
        session.commit()

    return user
