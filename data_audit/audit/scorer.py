from typing import List
import re
from datetime import datetime, timezone

SOURCIFY_API = "https://sourcify.dev/server"

WEIGHTS = {
    "has_any_verified":    0.15,
    "verification_quality":0.25,
    "documentation":       0.20,
    "activity_history":    0.15,
    "complexity":          0.15,
    "security":            0.10,
}

CHAIN_WEIGHT = {
    1:  1.0, 8453: 0.9, 10: 0.9, 42161: 0.9,
    137: 0.8, 56: 0.7, 100: 0.7, 43114: 0.7,
    250: 0.6, 11155111: 0.1, 5: 0.05, 80001: 0.05,
}
PRODUCTION_CHAINS = {1, 8453, 10, 42161, 137, 56, 100, 43114, 250}

# Опасные паттерны в исходниках
DANGER_PATTERNS = [
    r"\bselfdestruct\b",
    r"\btx\.origin\b",
    r"\bblacklist\b",
    r"function\s+rug\b",
    r"emergencyWithdraw\s*\(",
    r"onlyOwner[^}]{0,200}withdraw",
]


def extract_features(data: dict, chain_id: int) -> dict:
    chain_w = CHAIN_WEIGHT.get(chain_id, 0.5)
    is_prod = chain_id in PRODUCTION_CHAINS

    # Match quality
    creation_match = data.get("creationMatch") == "match"
    runtime_match  = data.get("runtimeMatch")  == "match"
    runtime_meta   = bool((data.get("runtimeBytecode") or {}).get("metadataMatch"))
    creation_meta  = bool((data.get("creationBytecode") or {}).get("metadataMatch"))
    match_score    = (creation_match * 0.3 +
                      runtime_match  * 0.5 +
                      runtime_meta   * 0.1 +
                      creation_meta  * 0.1)

    # Documentation
    devdoc      = data.get("devdoc") or {}
    userdoc     = data.get("userdoc") or {}
    storage     = data.get("storageLayout") or {}
    has_devdoc  = len(devdoc.get("methods", {})) > 0
    has_userdoc = len(userdoc.get("methods", {})) > 0 or bool(userdoc.get("notice"))
    has_storage = bool(storage.get("storage"))
    doc_score   = has_devdoc * 0.4 + has_userdoc * 0.3 + has_storage * 0.3

    # ABI complexity
    abi      = data.get("abi") or []
    n_func   = len([x for x in abi if x.get("type") == "function"])
    n_events = len([x for x in abi if x.get("type") == "event"])
    n_errors = len([x for x in abi if x.get("type") == "error"])
    complexity = min(1.0, n_func * 0.05 + n_events * 0.08 + n_errors * 0.02)

    # Security (по исходникам)
    sources  = data.get("sources") or {}
    all_code = " ".join(str(v) for v in sources.values())
    danger   = [p for p in DANGER_PATTERNS if re.search(p, all_code, re.IGNORECASE)]
    security = max(0.0, 1.0 - len(danger) * 0.35)

    # Date
    verified_at = None
    raw_date = data.get("verifiedAt")
    if raw_date:
        try:
            verified_at = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
        except Exception:
            pass

    # Meta
    name  = (data.get("compilation") or {}).get("name", "Unknown")
    proxy = (data.get("proxyResolution") or {}).get("isProxy", False)

    return {
        "chain_id": chain_id,
        "chain_weight": chain_w,
        "is_production": is_prod,
        "match_score": match_score,
        "doc_score": doc_score,
        "complexity": complexity,
        "security_score": security,
        "danger_patterns": danger,
        "has_devdoc": has_devdoc,
        "has_userdoc": has_userdoc,
        "has_storage": has_storage,
        "n_func": n_func,
        "n_events": n_events,
        "n_errors": n_errors,
        "verified_at": verified_at,
        "is_proxy": proxy,
        "name": name,
    }

def aggregate(features_list: List[dict]) -> dict:
    if not features_list:
        return {}

    total = len(features_list)
    prod  = [f for f in features_list if f["is_production"]]

    def wavg(key: str) -> float:
        tw = sum(f["chain_weight"] for f in features_list)
        return sum(f[key] * f["chain_weight"] for f in features_list) / tw if tw else 0.0

    dates = [f["verified_at"] for f in features_list if f["verified_at"]]
    span_years = months_since = 0.0
    activity_score = 0.0
    if dates:
        now = datetime.now(timezone.utc)
        span_years   = (max(dates) - min(dates)).days / 365.0
        months_since = (now - max(dates)).days / 30.0
        span_score   = min(1.0, span_years / 2.0)
        recency_score = 1.0 if months_since < 12 else max(0.0, 1.0 - (months_since - 12) / 24)
        activity_score = span_score * 0.6 + recency_score * 0.4

    unique_prod_chains = sorted({f["chain_id"] for f in prod})
    multichain_bonus   = min(0.3, (len(unique_prod_chains) - 1) * 0.15) if prod else 0.0
    proxy_bonus        = 0.1 if any(f["is_proxy"] for f in features_list) else 0.0

    return {
        "total": total,
        "n_prod": len(prod),
        "unique_prod_chains": unique_prod_chains,
        "avg_match": wavg("match_score"),
        "avg_doc":   wavg("doc_score"),
        "avg_cx":    wavg("complexity"),
        "avg_sec":   wavg("security_score"),
        "activity_score": activity_score,
        "span_years": span_years,
        "months_since_last": months_since,
        "multichain_bonus": multichain_bonus,
        "proxy_bonus": proxy_bonus,
        "all_danger": list({p for f in features_list for p in f["danger_patterns"]}),
    }

# ================== SCORING ==================

def compute_score(agg: dict):
    if not agg or agg["total"] == 0:
        empty = {k: {"score": 0.0, "max": w, "note": "No data"} for k, w in WEIGHTS.items()}
        return 0.0, empty

    bk = {}

    # 1. has_any_verified
    count_factor = min(1.0, agg["total"] / 5.0)
    s1 = (0.6 + count_factor * 0.4) * WEIGHTS["has_any_verified"]
    bk["has_any_verified"] = {
        "score": round(s1, 4),
        "max": WEIGHTS["has_any_verified"],
        "note": f"{agg['total']} contracts ({agg['n_prod']} production)",
    }

    # 2. verification_quality
    s2 = agg["avg_match"] * WEIGHTS["verification_quality"]
    bk["verification_quality"] = {
        "score": round(s2, 4),
        "max": WEIGHTS["verification_quality"],
        "note": f"Weighted match quality: {agg['avg_match']:.2f}",
    }

    # 3. documentation
    s3 = agg["avg_doc"] * WEIGHTS["documentation"]
    bk["documentation"] = {
        "score": round(s3, 4),
        "max": WEIGHTS["documentation"],
        "note": f"Doc quality: {agg['avg_doc']:.2f} (devdoc/userdoc/storageLayout)",
    }

    # 4. activity_history
    s4 = agg["activity_score"] * WEIGHTS["activity_history"]
    bk["activity_history"] = {
        "score": round(s4, 4),
        "max": WEIGHTS["activity_history"],
        "note": f"{agg['span_years']:.1f}yr span, last {agg['months_since_last']:.0f}mo ago",
    }

    # 5. complexity (+ multichain)
    s5 = min(
        WEIGHTS["complexity"],
        (agg["avg_cx"] + agg["multichain_bonus"]) * WEIGHTS["complexity"],
    )
    bk["complexity"] = {
        "score": round(s5, 4),
        "max": WEIGHTS["complexity"],
        "note": f"Complexity: {agg['avg_cx']:.2f}, prod chains: {agg['unique_prod_chains']}",
    }

    # 6. security
    s6 = agg["avg_sec"] * WEIGHTS["security"]
    danger_note = (
        f"Danger found: {agg['all_danger']}" if agg["all_danger"] else "Clean — no dangerous patterns"
    )
    bk["security"] = {
        "score": round(s6, 4),
        "max": WEIGHTS["security"],
        "note": danger_note,
    }

    total = min(1.0, sum(v["score"] for v in bk.values()) + agg["proxy_bonus"] * 0.02)
    return round(total, 3), bk