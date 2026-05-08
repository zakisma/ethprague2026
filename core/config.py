import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Our keys only
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    
    # Economic parameters
    APP_FEE_ETH: float = 0.01 
    TREASURY_ADDRESS: str = "0xYourAgentTreasuryAddress"
    
    # Models: fixed for predictability
    CORE_MODEL: str = "gpt-4o"
    AGENT_TEMPERATURE: float = 0.0

settings = Settings()