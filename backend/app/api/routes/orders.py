from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import math

from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.orders import create_order, get_order_by_id, get_orders_by_user
from app.crud.cart import get_or_create_cart, clear_cart
from app.crud.products import get_product_by_id
from app.schemas.order import OrderCreate, OrderResponse
from app.models.user import User
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await get_or_create_cart(db, user_id=current_user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items_data = []
    for ci in cart.items:
        product = await get_product_by_id(db, ci.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {ci.product_id} not found")
        if product.stock_quantity < ci.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        items_data.append({
            "product_id": ci.product_id,
            "product_name": product.name,
            "quantity": ci.quantity,
            "price": float(ci.price),
        })
        # Deduct stock
        product.stock_quantity -= ci.quantity

    order = await create_order(db, current_user.id, data, items_data)
    await clear_cart(db, cart.id)
    return OrderResponse.model_validate(order)


@router.get("", response_model=PaginatedResponse)
async def my_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    orders, total = await get_orders_by_user(db, current_user.id, skip, limit)
    return PaginatedResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 1
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return OrderResponse.model_validate(order)
