from typing import Optional
import requests

from config import SOURCIFY_API


def fetch_sourcify(address: str, chain_id: int = 1) -> Optional[dict]:
    """
    Загружает полный JSON из Sourcify API v2 (?fields=all) для конкретного контракта.
    """
    url = f"{SOURCIFY_API}/v2/contract/{chain_id}/{address}"
    params = {"fields": "all"}

    try:
        r = requests.get(url, params=params, timeout=12)
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass

    return None