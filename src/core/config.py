from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    GITHUB_TOKEN: str = "" # Optional, saves from limits on GITHUB API
    
    # BigQuery Configs (стиль тиммейта)
    BQ_DATA_PROJECT: str = "whaleteam-495709"
    BQ_JOB_PROJECT: str = "fabled-zone-438910-n8"
    BQ_DATASET: str = "sourcify_dataset"

    CORE_MODEL: str = "gemini-2.5-pro"
    FAST_MODEL: str = "gemini-2.5-flash"
    AGENT_TEMPERATURE: float = 0.1
    APP_FEE_ETH: float = 0.01

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()