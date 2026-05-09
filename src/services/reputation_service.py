# RETRIVE FROM THE BACKEND SERVICE

from src.schemas.responses import SourcifyAuditResult
from src.tools.sourcify_tool import audit_developer

def fetch_and_map_reputation(wallet_address: str) -> SourcifyAuditResult:
    """Изолированная логика получения и валидации данных"""

    raw_data = audit_developer(wallet_address, verbose=False)
    
    # Мок (временно)
#     raw_data = {
#      "wallet": wallet_address,
#      "score": 0.45,
#      "verdict": "NEEDS_REVIEW",
#      "breakdown": {
#           "has_any_verified": {"score": 0.1, "max": 0.2, "note": "Mocked"},
#           "verification_quality": {"score": 0.1, "max": 0.2, "note": "Mocked"},
#           "documentation": {"score": 0.05, "max": 0.15, "note": "Mocked"},
#           "activity_history": {"score": 0.1, "max": 0.15, "note": "Mocked"},
#           "complexity": {"score": 0.05, "max": 0.15, "note": "Mocked"},
#           "security": {"score": 0.05, "max": 0.15, "note": "Mocked"},
#      },
#      "summary": ["Mock Sourcify reputation profile"]
#      }
    
    # Маппинг и валидация
    return SourcifyAuditResult(**raw_data, raw_data=raw_data)