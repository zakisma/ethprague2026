import time
import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import GOOGLE_CREDENTIALS
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDENTIALS

from models import AuditRequest, AuditResponse
from audit.cache import get_cached, set_cached
from audit.bq_client import get_contracts_for_deployer_bq
from audit.sourcify_client import fetch_sourcify
from audit.scorer import extract_features, aggregate, compute_score

app = FastAPI(title="Sourcify Reliability Audit API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # на прод замени на свой домен
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/audit", response_model=AuditResponse)
async def audit_endpoint(req: AuditRequest):
    wallet = req.wallet.lower()

    # 1. Проверяем кэш
    if not req.force_refresh:
        cached = get_cached(wallet)
        if cached:
            return AuditResponse(**cached, cached=True)

    t0 = time.time()

    # 2. BigQuery
    contracts = get_contracts_for_deployer_bq(wallet, max_contracts=req.max_contracts)

    if not contracts:
        result = {
            "wallet": wallet,
            "score": 0.0,
            "verdict": "REJECT",
            "breakdown": {},
            "summary": ["No verified contracts found in Sourcify"],
        }
        set_cached(wallet, result)
        return AuditResponse(**result, cached=False, processing_time_ms=(time.time()-t0)*1000)

    # 3. Sourcify API (параллельно!)
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, fetch_sourcify, c["address"], c["chain_id"])
        for c in contracts
    ]
    sourcify_results = await asyncio.gather(*tasks)

    # 4. Извлекаем фичи
    features_list = []
    for c, data in zip(contracts, sourcify_results):
        if data:
            features_list.append(extract_features(data, c["chain_id"]))

    # 5. Скор
    agg = aggregate(features_list)
    score, breakdown = compute_score(agg)
    verdict = "APPROVE" if score >= 0.65 else ("REVIEW" if score >= 0.35 else "REJECT")

    summary = []
    if agg:
        summary.append(f"{agg['total']} verified contracts ({agg['n_prod']} on mainnet/L2)")
        summary.append("Good documentation" if agg["avg_doc"] > 0.5 else "Weak documentation")
        summary.append("Clean code ✓" if not agg["all_danger"] else f"⚠️ Danger: {agg['all_danger']}")

    result = {
        "wallet": wallet,
        "score": score,
        "verdict": verdict,
        "breakdown": {k: v for k, v in breakdown.items()},
        "summary": summary,
    }
    set_cached(wallet, result)

    return AuditResponse(**result, cached=False, processing_time_ms=(time.time()-t0)*1000)

@app.get("/audit/{wallet}", response_model=AuditResponse)
async def audit_get(wallet: str, force_refresh: bool = False):
    return await audit_endpoint(AuditRequest(wallet=wallet, force_refresh=force_refresh))