import asyncio
from app.db.session import engine, async_sessionmaker, AsyncSessionLocal
from app.crud.products import create_product
from app.schemas.product import ProductCreate

async def main():
    async with AsyncSessionLocal() as db:
        data = ProductCreate(
            name="Test",
            slug="test",
            description="Test desc",
            price=10.0,
            stock_quantity=10,
            is_active=True
        )
        try:
            p = await create_product(db, data)
            print("Product created:", p.id)
            await db.commit()
        except Exception as e:
            print("Error:")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
