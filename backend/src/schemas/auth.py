from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class NonceRequest(BaseModel):
    wallet_address: str

class NonceResponse(BaseModel):
    message: str

class VerifyRequest(BaseModel):
    message: str
    signature: str