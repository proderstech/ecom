
import httpx
import asyncio

async def test_wishlist():
    async with httpx.AsyncClient() as client:
        # Assuming you have a way to authenticate, but let's see what happens without authentication
        # or if we can get a token from the frontend state if needed.
        # But for now let's just see if it gives 500 or 401.
        try:
            res = await client.get("http://localhost:8001/api/v1/wishlist")
            print(f"Status: {res.status_code}")
            print(f"Body: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_wishlist())
