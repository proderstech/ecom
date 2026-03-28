from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.address import Address

async def get_address(db: AsyncSession, address_id: int, user_id: int) -> Optional[Address]:
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def list_addresses(db: AsyncSession, user_id: int) -> List[Address]:
    result = await db.execute(
        select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    return result.scalars().all()

async def create_address(db: AsyncSession, user_id: int, **kwargs) -> Address:
    if kwargs.get("is_default"):
        # Reset other default addresses for this user
        await db.execute(
            update(Address).where(Address.user_id == user_id).values(is_default=False)
        )
    
    address = Address(user_id=user_id, **kwargs)
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address

async def update_address(db: AsyncSession, address_id: int, user_id: int, **kwargs) -> Optional[Address]:
    if kwargs.get("is_default"):
        # Reset other default addresses for this user
        await db.execute(
            update(Address).where(Address.user_id == user_id).values(is_default=False)
        )
    
    await db.execute(
        update(Address).where(Address.id == address_id, Address.user_id == user_id).values(**kwargs)
    )
    await db.commit()
    return await get_address(db, address_id, user_id)

async def delete_address(db: AsyncSession, address_id: int, user_id: int) -> bool:
    result = await db.execute(
        delete(Address).where(Address.id == address_id, Address.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0
