import sqlite3
import json
import time
from config import CACHE_DB_PATH, CACHE_TTL_DAYS

def _conn():
    c = sqlite3.connect(CACHE_DB_PATH)
    c.execute("""
        CREATE TABLE IF NOT EXISTS audit_cache (
            wallet TEXT PRIMARY KEY,
            result TEXT,
            ts     REAL
        )
    """)
    c.commit()
    return c

def get_cached(wallet: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT result, ts FROM audit_cache WHERE wallet=?",
            (wallet.lower(),)
        ).fetchone()
    if not row:
        return None
    if time.time() - row[1] > CACHE_TTL_DAYS * 86400:
        return None           # устарел
    return json.loads(row[0])

def set_cached(wallet: str, result: dict):
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO audit_cache VALUES (?,?,?)",
            (wallet.lower(), json.dumps(result), time.time())
        )