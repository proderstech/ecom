from fastapi.testclient import TestClient
from app.main import app

def main():
    client = TestClient(app)
    
    # First login to get the token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "password123"
    })
    
    if login_res.status_code != 200:
        print("Login failed:", login_res.json())
        return
    
    token = login_res.json()["access_token"]
    
    # Now create product exactly like frontend
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "t",
        "slug": "t-1",
        "price": 1,
        "stock_quantity": 1,
        "brand": None,
        "is_featured": False,
        "is_active": True,
        "description": None,
        "category_id": None,
        "sku": None,
        "badge": None,
        "tags": None,
        "abv": None,
        "volume": None,
        "country": None,
        "subcategory": None
    }
    res = client.post("/api/v1/admin/products", json=payload, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.text)

if __name__ == "__main__":
    main()
