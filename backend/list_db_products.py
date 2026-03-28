
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add backend to path
sys.path.append(r'c:\Users\pravi\OneDrive\Desktop\ecom\backend')

from app.models.product import Product

DATABASE_URL = "mysql+aiomysql://root:@127.0.0.1:3306/ecommerce"

async def list_products():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Product))
        items = result.scalars().all()
        print(f"Products in DB: {len(items)}")
        for i in items:
            print(f"ID: {i.id}, Name: {i.name}, Slug: {i.slug}")

if __name__ == "__main__":
    asyncio.run(list_products())
