from fastapi import FastAPI

from src.routers import users, auth
from src.db.init_db import create_db_and_tables

create_db_and_tables()
app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)