import os
from pathlib import Path

BQ_JOB_PROJECT  = "fabled-zone-438910-n8"
BQ_DATA_PROJECT = "whaleteam-495709"
BQ_DATASET      = "sourcify_dataset"
BQ_LOCATION     = "europe-west1"

GOOGLE_CREDENTIALS = os.environ.get(
    "GOOGLE_APPLICATION_CREDENTIALS",
    str(Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/ETH/Sourcify/keys/sourcify-bq.json")
)

CACHE_DB_PATH   = "cache.db"
CACHE_TTL_DAYS  = 7
SOURCIFY_API    = "https://sourcify.dev/server"