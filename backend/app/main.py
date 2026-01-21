from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.db import init_db
from app.api import costs, forecast

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown

app = FastAPI(
    title="Salon Ops & Financial Forecasting API",
    description="Internal component for salon decision support.",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Configuration
# For local dev, allow all. In prod, strict allowlist.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(costs.router, tags=["Costs"])
app.include_router(forecast.router, tags=["Forecast"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "salon-ops-api"}
