import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Cookie, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_optional_user
from app.crud.cart import get_or_create_cart, add_to_cart, update_cart_item, remove_from_cart, clear_cart
from app.crud.products import get_product_by_id
from app.schemas.order import CartItemBase, CartItemUpdate, CartResponse, CartItemResponse
from app.models.user import User
from decimal import Decimal

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_session_id(session_id: Optional[str] = Cookie(None)) -> str:
    return session_id or str(uuid.uuid4())


@router.get("", response_model=CartResponse)
async def get_cart(
    response: Response,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
    session_id: str = Depends(get_session_id),
):
    if not current_user:
        response.set_cookie("session_id", session_id, httponly=True, max_age=86400*30)
    cart = await get_or_create_cart(db, user_id=current_user.id if current_user else None, session_id=session_id if not current_user else None)
    items = [CartItemResponse.model_validate(i) for i in cart.items]
    total = sum(i.price * i.quantity for i in cart.items)
    return CartResponse(id=cart.id, items=items, total=total, item_count=sum(i.quantity for i in cart.items))


@router.post("/add")
async def add_item(
    data: CartItemBase,
    response: Response,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
    session_id: str = Depends(get_session_id),
):
    if not current_user:
        response.set_cookie("session_id", session_id, httponly=True, max_age=86400*30)
    product = await get_product_by_id(db, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock_quantity < data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    cart = await get_or_create_cart(db, user_id=current_user.id if current_user else None, session_id=session_id if not current_user else None)
    price = product.discount_price if product.discount_price else product.price
    await add_to_cart(db, cart.id, data.product_id, data.quantity, Decimal(str(price)))
    return {"message": "Item added to cart"}


@router.put("/update")
async def update_item(
    data: CartItemUpdate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    item = await update_cart_item(db, data.item_id, data.quantity)
    return {"message": "Cart updated"}


@router.delete("/remove/{item_id}")
async def remove_item(
    item_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    removed = await remove_from_cart(db, item_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed"}


@router.post("/clear")
async def clear_cart_endpoint(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
    session_id: str = Depends(get_session_id),
):
    cart = await get_or_create_cart(db, user_id=current_user.id if current_user else None, session_id=session_id if not current_user else None)
    await clear_cart(db, cart.id)
    return {"message": "Cart cleared"}
