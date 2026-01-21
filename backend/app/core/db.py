from sqlmodel import SQLModel, create_engine, Session
from typing import Generator

# SQLite for local dev
DATABASE_URL = "sqlite:///./salon.db"

# connect_args check_same_thread=False is needed for SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)
