
import httpx
import asyncio
import uuid

async def test_wishlist_flow():
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    async with httpx.AsyncClient() as client:
        # 1. Register
        reg = await client.post("http://localhost:8001/api/v1/auth/register", 
                                json={"email": email, "password": "password123", "name": "Test User"})
        print(f"Register: {reg.status_code}")
        
        # 2. Login
        log = await client.post("http://localhost:8001/api/v1/auth/login", 
                                json={"email": email, "password": "password123"})
        print(f"Login: {log.status_code}")
        token = log.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Add to Wishlist
        add = await client.post("http://localhost:8001/api/v1/wishlist/add?product_id=18", headers=headers)
        print(f"Add Wishlist: {add.status_code}")
        
        # 4. Get Wishlist
        get = await client.get("http://localhost:8001/api/v1/wishlist", headers=headers)
        print(f"Get Wishlist: {get.status_code}")
        print(f"Body: {get.text}")

if __name__ == "__main__":
    asyncio.run(test_wishlist_flow())
