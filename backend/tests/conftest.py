import pytest
import os
from sqlmodel import SQLModel, create_engine, Session
from app.core.db import get_session
from app.main import app
from app.domain.models import FixedCosts, OperationalInputs

# Use a physical test file for total isolation during tests
TEST_DB_FILE = "test_run.db"
DATABASE_URL = f"sqlite:///./{TEST_DB_FILE}"

@pytest.fixture(name="session")
def session_fixture():
    # 1. Clean up any stale test DB
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
        
    # 2. Setup fresh engine and schema
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    
    # 3. Yield session
    with Session(engine) as session:
        yield session
        
    # 4. Cleanup after test
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

@pytest.fixture(name="client")
def client_fixture(session):
    def get_session_override():
        return session
    
    # Force the app to use our test session
    app.dependency_overrides[get_session] = get_session_override
    
    # Set environment variable so any internal engine creation uses the same DB
    os.environ["DATABASE_URL"] = DATABASE_URL
    
    yield app
    
    app.dependency_overrides.clear()
    if "DATABASE_URL" in os.environ:
        del os.environ["DATABASE_URL"]
