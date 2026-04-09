from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from sqlalchemy.orm import selectinload

from app.models.review import Review
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.schemas.order import ReviewCreate


async def create_review(db: AsyncSession, user_id: int, data: ReviewCreate) -> Review:
    review = Review(product_id=data.product_id, user_id=user_id, rating=data.rating, review_text=data.review_text)
    db.add(review)
    await db.flush()
    # Update product rating
    avg = (await db.execute(
        select(func.avg(Review.rating)).where(Review.product_id == data.product_id)
    )).scalar_one()
    count = (await db.execute(
        select(func.count(Review.id)).where(Review.product_id == data.product_id)
    )).scalar_one()
    await db.execute(update(Product).where(Product.id == data.product_id).values(rating=round(float(avg), 1), review_count=count))
    return review


async def get_reviews_for_product(db: AsyncSession, product_id: int) -> List[Review]:
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product_id, Review.is_approved == True)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()


# ── Wishlist ──────────────────────────────────────────────────────────────────

async def get_wishlist(db: AsyncSession, user_id: int) -> List[Wishlist]:
    result = await db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.product).selectinload(Product.images),
            selectinload(Wishlist.product).selectinload(Product.category)
        )
        .where(Wishlist.user_id == user_id)
    )
    return result.scalars().all()


async def add_to_wishlist(db: AsyncSession, user_id: int, product_id: int) -> Wishlist:
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    item = Wishlist(user_id=user_id, product_id=product_id)
    db.add(item)
    await db.flush()
    return item


async def remove_from_wishlist(db: AsyncSession, user_id: int, product_id: int) -> bool:
    result = await db.execute(
        delete(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
    )
    return result.rowcount > 0
