
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
import os
import sys

# Add backend to path
sys.path.append(r'c:\Users\pravi\OneDrive\Desktop\ecom\backend')

from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.user import User

DATABASE_URL = "mysql+aiomysql://root:rootpassword@localhost:3306/belgravia_spirits"

async def test_wishlist():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(
            select(Wishlist).options(selectinload(Wishlist.product).selectinload(Product.images))
        )
        items = result.scalars().all()
        print(f"Found {len(items)} wishlist items")
        for i in items:
            print(f"Item ID: {i.id}, Product ID: {i.product_id}")
            if i.product:
                print(f"Product: {i.product.name}")
                print(f"Images: {[img.image_url for img in i.product.images]}")
            else:
                print("Product NOT FOUND")

if __name__ == "__main__":
    asyncio.run(test_wishlist())
