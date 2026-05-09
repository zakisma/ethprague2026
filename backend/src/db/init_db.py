from sqlmodel import SQLModel

from src.db.session import engine
from src.db import models #type: ignore

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)