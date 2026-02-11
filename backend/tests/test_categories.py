import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import base64

def get_auth_headers(username="admin", password="password"):
    credentials = f"{username}:{password}"
    token = base64.b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {token}"}

@pytest.mark.asyncio
async def test_category_crud(client):
    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        auth = get_auth_headers()
        
        # 1. Create Category
        new_cat = {
            "name": "Test Category",
            "projected_total": 1000.00,
            "sort_order": 1
        }
        resp = await ac.post("/categories", json=new_cat, headers=auth)
        assert resp.status_code == 200
        cat_data = resp.json()
        cat_id = cat_data["id"]
        assert cat_data["name"] == "Test Category"
        
        # 2. Update Category
        update_data = {
            "name": "Updated Category",
            "projected_total": 1500.00,
            "sort_order": 2
        }
        resp = await ac.put(f"/categories/{cat_id}", json=update_data, headers=auth)
        assert resp.status_code == 200
        updated_cat = resp.json()
        assert updated_cat["name"] == "Updated Category"
        assert float(updated_cat["projected_total"]) == 1500.00
        
        # 3. Get Categories
        resp = await ac.get("/categories", headers=auth)
        assert resp.status_code == 200
        categories = resp.json()
        assert any(c["id"] == cat_id and c["name"] == "Updated Category" for c in categories)
        
        # 4. Delete Category
        resp = await ac.delete(f"/categories/{cat_id}", headers=auth)
        assert resp.status_code == 200
        
        # 5. Verify Deletion
        resp = await ac.get("/categories", headers=auth)
        categories = resp.json()
        assert not any(c["id"] == cat_id for c in categories)
