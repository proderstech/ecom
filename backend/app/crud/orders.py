import random
import string
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate


def generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=5))
    return f"BG-{suffix}"


async def create_order(db: AsyncSession, user_id: int, data: OrderCreate, items_data: list) -> Order:
    order_number = generate_order_number()
    subtotal = sum(i["price"] * i["quantity"] for i in items_data)
    tax = round(subtotal * 0.20, 2)  # UK VAT 20%
    shipping = 4.99 if subtotal < 50 else 0.0

    order = Order(
        order_number=order_number,
        user_id=user_id,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping,
        total_price=subtotal + tax + shipping,
        shipping_name=data.shipping_name,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        shipping_postcode=data.shipping_postcode,
        shipping_phone=data.shipping_phone,
        notes=data.notes,
        coupon_code=data.coupon_code,
    )
    db.add(order)
    await db.flush()

    for item in items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            product_name=item["product_name"],
            quantity=item["quantity"],
            price=item["price"],
        )
        db.add(order_item)

    await db.flush()
    return await get_order_by_id(db, order.id)


async def get_order_by_id(db: AsyncSession, order_id: int) -> Optional[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def get_orders_by_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 20) -> tuple[List[Order], int]:
    query = select(Order).where(Order.user_id == user_id)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    
    result = await db.execute(
        query.options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total


async def get_all_orders(db: AsyncSession, skip: int = 0, limit: int = 20, status: Optional[str] = None) -> tuple[List[Order], int]:
    query = select(Order).options(selectinload(Order.items), selectinload(Order.user))
    if status:
        query = query.where(Order.status == status)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    result = await db.execute(query.order_by(Order.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all(), total


async def update_order_status(db: AsyncSession, order_id: int, status: str) -> Optional[Order]:
    await db.execute(update(Order).where(Order.id == order_id).values(status=status))
    return await get_order_by_id(db, order_id)
