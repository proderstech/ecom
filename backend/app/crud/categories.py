from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.schemas.product import CategoryCreate, CategoryUpdate


async def get_categories(db: AsyncSession, parent_id: Optional[int] = None, only_active: bool = True) -> List[Category]:
    query = select(Category).options(
        selectinload(Category.children),
        selectinload(Category.parent)
    )
    if only_active:
        query = query.where(Category.is_active == True)
    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)
    query = query.order_by(Category.sort_order.asc())
    result = await db.execute(query)
    return result.scalars().all()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Optional[Category]:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def get_category_by_id(db: AsyncSession, cat_id: int) -> Optional[Category]:
    result = await db.execute(
        select(Category)
        .options(selectinload(Category.parent), selectinload(Category.children))
        .execution_options(populate_existing=True)
        .where(Category.id == cat_id)
    )
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.flush()
    return await get_category_by_id(db, cat.id)


async def update_category(db: AsyncSession, cat_id: int, data: CategoryUpdate) -> Optional[Category]:
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(update(Category).where(Category.id == cat_id).values(**update_data))
    return await get_category_by_id(db, cat_id)


async def delete_category(db: AsyncSession, cat_id: int) -> bool:
    result = await db.execute(delete(Category).where(Category.id == cat_id))
    return result.rowcount > 0
