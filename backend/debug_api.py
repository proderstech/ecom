
import httpx
import asyncio

async def debug_api():
    async with httpx.AsyncClient() as client:
        # Login
        login_res = await client.post("http://localhost:8001/api/v1/auth/login", 
                                     json={"email": "abhay@gmail.com", "password": "rootpassword"}) # guessing password from general patterns or previously seen
        if login_res.status_code != 200:
            print(f"Login Failed: {login_res.status_code}")
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test Wishlist
        wish_res = await client.get("http://localhost:8001/api/v1/wishlist", headers=headers)
        print(f"Wishlist Response: {wish_res.status_code}")
        print(f"Body: {wish_res.text}")
        
        # Test Product
        prod_res = await client.get("http://localhost:8001/api/v1/products/18", headers=headers)
        print(f"Product 18 Response: {prod_res.status_code}")
        print(f"Body: {prod_res.text}")

if __name__ == "__main__":
    asyncio.run(debug_api())
