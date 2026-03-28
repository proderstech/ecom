from typing import Optional, List
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload, joinedload

from app.models.cart import Cart, CartItem
from app.models.product import Product


async def get_or_create_cart(
    db: AsyncSession,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
) -> Cart:
    # Use a common options set for consistent eager loading
    cart_options = [
        selectinload(Cart.items).options(
            joinedload(CartItem.product).options(
                selectinload(Product.images),
                joinedload(Product.category)
            )
        )
    ]

    query = select(Cart).options(*cart_options)
    if user_id:
        query = query.where(Cart.user_id == user_id)
    else:
        query = query.where(Cart.session_id == session_id)

    result = await db.execute(query)
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user_id, session_id=session_id)
        db.add(cart)
        await db.flush()
        # After flush, we re-fetch to apply loading options
        result = await db.execute(select(Cart).options(*cart_options).where(Cart.id == cart.id))
        cart = result.scalar_one()
    
    return cart


async def add_to_cart(db: AsyncSession, cart_id: int, product_id: int, quantity: int, price: Decimal) -> CartItem:
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.quantity += quantity
        return existing
    item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity, price=price)
    db.add(item)
    await db.flush()
    return item


async def update_cart_item(db: AsyncSession, item_id: int, quantity: int) -> Optional[CartItem]:
    if quantity <= 0:
        await db.execute(delete(CartItem).where(CartItem.id == item_id))
        return None
    await db.execute(update(CartItem).where(CartItem.id == item_id).values(quantity=quantity))
    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    return result.scalar_one_or_none()


async def remove_from_cart(db: AsyncSession, item_id: int) -> bool:
    result = await db.execute(delete(CartItem).where(CartItem.id == item_id))
    return result.rowcount > 0


async def clear_cart(db: AsyncSession, cart_id: int) -> None:
    await db.execute(delete(CartItem).where(CartItem.cart_id == cart_id))
