
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

DATABASE_URL = "mysql+aiomysql://root:rootpassword@localhost:3306/belgravia_spirits"

async def check_wishlist_integrity():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Wishlist))
        items = result.scalars().all()
        print(f"Checking {len(items)} wishlist items...")
        for i in items:
            p_res = await session.execute(select(Product).where(Product.id == i.product_id))
            p = p_res.scalar_one_or_none()
            if not p:
                print(f"BROKEN! Wishlist ID {i.id} points to missing product ID {i.product_id}")
            else:
                print(f"Wishlist ID {i.id} -> Product {p.name} (Valid)")

if __name__ == "__main__":
    asyncio.run(check_wishlist_integrity())
