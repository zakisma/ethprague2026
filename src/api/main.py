from fastapi import FastAPI

from src.api.sourcify_receiver import router as sourcify_router
from src.api.application_receiver import router as application_router
from src.api.result_receiver import router as result_router

app = FastAPI(
    title="Agentic Grant Market AI Service",
    version="0.1.0"
)

app.include_router(sourcify_router)
app.include_router(application_router)
app.include_router(result_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}