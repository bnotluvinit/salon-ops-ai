import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from decimal import Decimal
import base64

def get_auth_headers(username="admin", password="password"):
    credentials = f"{username}:{password}"
    token = base64.b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {token}"}

@pytest.mark.asyncio
async def test_health_check(client):
    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_unauthorized_access(client):
    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.get("/costs")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_forecast_endpoint_basic(client):
    payload = {
        "operating_days_per_month": 30,
        "haircuts_per_day": 20,
        "price_per_cut": 30,
        "num_stylists": 1,
        "stylist_hours_per_day": 8,
        "stylist_hourly_rate": 20,
        "retail_sales": 1000,
        "party_sales": 0,
        "stylist_payroll_tax_pct": 0.10,
        "retail_cogs_pct": 0.50,
        "party_cogs_pct": 0.20,
        "royalties_pct": 0.05,
        "cc_fees_pct": 0.02,
        "ad_fund_pct": 0.02
    }
    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.post("/forecast", json=payload, headers=get_auth_headers())
    
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "net_profit" in data

@pytest.mark.asyncio
async def test_costs_endpoints(client):
    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        # GET default costs
        get_res = await ac.get("/costs", headers=get_auth_headers())
        assert get_res.status_code == 200
        
        # POST update costs
        new_costs = get_res.json()
        new_costs["rent"] = 7000.00
        new_costs["software"] = 0.00 # Avoid warning
        new_costs["other"] = 0.00    # Avoid warning
        post_res = await ac.post("/costs", json=new_costs, headers=get_auth_headers())
        assert post_res.status_code == 200
        # The API returns Decimal as string due to model config
        assert str(post_res.json()["rent"]) == "7000.00"
