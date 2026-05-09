import os
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import Optional

class UserLLMConfig(BaseModel):
    """Configuration passed from the frontend UI for the User Terminal."""
    provider: str = Field(..., description="'openai', 'anthropic', or 'ollama'")
    api_key: Optional[str] = Field(None, description="User's personal API key (BYOK)")
    model_name: Optional[str] = Field(None, description="Specific model, e.g., 'llama3' for Ollama")
    local_url: Optional[str] = Field(None, description="E.g., 'http://localhost:11434/v1'")

class LLMFactory:
    @staticmethod
    def get_core_llm(temperature: float = 0.1) -> ChatOpenAI:
        """
        CORE PROTOCOL: Uses your secure backend environment variables.
        Funded by the 0.01 ETH App Fee. Used for Umpire and Orchestrator.
        """
        # +++ Assumes OPENAI_API_KEY is securely set in your server's .env
        return ChatOpenAI(
            model_name="gpt-4o", 
            temperature=temperature
        )

    @staticmethod
    def get_terminal_llm(user_config: Optional[UserLLMConfig] = None) -> ChatOpenAI:
        """
        USER TERMINAL: Dynamically configures the LLM based on user preference (BYOK/BYOM).
        """
        # Fallback to "Novice Mode" (Micro-fee applied in your backend logic)
        if not user_config or not user_config.api_key and not user_config.local_url:
            return LLMFactory.get_core_llm(temperature=0.3)

        # Pro Mode: User brings their own Local Model (Ollama)
        if user_config.provider == "ollama":
            return ChatOpenAI(
                base_url=user_config.local_url or "http://localhost:11434/v1",
                api_key="ollama", # Ollama doesn't need a real key, but Langchain requires the field
                model_name=user_config.model_name or "llama3",
                temperature=0.3
            )
        
        # Pro Mode: User brings their own OpenAI/Anthropic Key
        if user_config.provider == "openai":
            return ChatOpenAI(
                api_key=user_config.api_key,
                model_name=user_config.model_name or "gpt-4-turbo",
                temperature=0.3
            )
            
        raise ValueError(f"Unsupported provider: {user_config.provider}")