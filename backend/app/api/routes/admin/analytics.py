from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timezone

from app.db.session import get_db
from app.api.deps import require_admin
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.product import Product
from app.core.constants import OrderStatus

analytics_router = APIRouter(prefix="/admin/stats", tags=["Analytics"])


@analytics_router.get("/revenue")
async def revenue_stats(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    # Today
    today = (await db.execute(
        select(func.sum(Order.total_price)).where(
            func.date(Order.created_at) == func.date(func.now()),
            Order.status != OrderStatus.CANCELLED
        )
    )).scalar_one() or 0
    # This month
    monthly = (await db.execute(
        select(func.sum(Order.total_price)).where(
            extract("month", Order.created_at) == now.month,
            extract("year", Order.created_at) == now.year,
            Order.status != OrderStatus.CANCELLED
        )
    )).scalar_one() or 0
    # Total all time
    total = (await db.execute(
        select(func.sum(Order.total_price)).where(Order.status != OrderStatus.CANCELLED)
    )).scalar_one() or 0

    return {
        "today": float(today),
        "monthly": float(monthly),
        "total": float(total),
        "currency": "GBP",
    }


@analytics_router.get("/orders")
async def order_stats(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    statuses = [s.value for s in OrderStatus]
    result = {}
    for s in statuses:
        count = (await db.execute(select(func.count(Order.id)).where(Order.status == s))).scalar_one()
        result[s] = count
    total = (await db.execute(select(func.count(Order.id)))).scalar_one()
    result["total"] = total
    return result


@analytics_router.get("/products")
async def product_stats(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    total = (await db.execute(select(func.count(Product.id)))).scalar_one()
    active = (await db.execute(select(func.count(Product.id)).where(Product.is_active == True))).scalar_one()
    # Top selling
    top = (await db.execute(
        select(OrderItem.product_id, OrderItem.product_name, func.sum(OrderItem.quantity).label("sold"))
        .group_by(OrderItem.product_id, OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    )).all()
    return {
        "total": total,
        "active": active,
        "top_selling": [{"product_id": r.product_id, "name": r.product_name, "sold": int(r.sold)} for r in top]
    }


@analytics_router.get("/users")
async def user_stats(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    total = (await db.execute(select(func.count(User.id)))).scalar_one()
    verified = (await db.execute(select(func.count(User.id)).where(User.is_verified == True))).scalar_one()
    today = (await db.execute(
        select(func.count(User.id)).where(func.date(User.created_at) == func.date(func.now()))
    )).scalar_one()
    return {"total": total, "verified": verified, "new_today": today}
