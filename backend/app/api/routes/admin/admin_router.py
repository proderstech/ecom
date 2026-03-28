from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import os, aiofiles, uuid, math

from app.db.session import get_db
from app.api.deps import require_admin
from app.crud.products import (
    get_products, get_product_by_id, create_product, update_product, delete_product, add_product_image
)
from app.crud.categories import get_categories, create_category, update_category, delete_category, get_category_by_id
from app.crud.orders import get_all_orders, update_order_status, get_order_by_id
from app.crud.users import list_users, update_user, get_user_by_id
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.user import UserAdminResponse
from app.core.config import settings
from app.models.user import User
from app.utils.pagination import PaginatedResponse

admin_router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Products ──────────────────────────────────────────────────────────────────
@admin_router.get("/products", response_model=PaginatedResponse)
async def admin_list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    skip = (page - 1) * limit
    products, total = await get_products(db, skip=skip, limit=limit, search=search, only_active=False)
    return PaginatedResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total, page=page, limit=limit,
        pages=math.ceil(total / limit) if total > 0 and limit > 0 else 1,
    )


@admin_router.post("/products", response_model=ProductResponse, status_code=201)
async def admin_create_product(
    data: ProductCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    return ProductResponse.model_validate(await create_product(db, data))


@admin_router.put("/products/{product_id}", response_model=ProductResponse)
async def admin_update_product(
    product_id: int, data: ProductUpdate,
    db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    p = await update_product(db, product_id, data)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(p)


@admin_router.delete("/products/{product_id}", status_code=204)
async def admin_delete_product(
    product_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    if not await delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


@admin_router.post("/products/{product_id}/images")
async def admin_upload_image(
    product_id: int, file: UploadFile = File(...), is_primary: bool = False,
    db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        raise HTTPException(status_code=400, detail="Invalid image format")
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, "products", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    url = f"/uploads/products/{filename}"
    img = await add_product_image(db, product_id, url, is_primary)
    return {"id": img.id, "image_url": url}


# ── Categories ────────────────────────────────────────────────────────────────
@admin_router.get("/categories", response_model=List[CategoryResponse])
async def admin_list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return [CategoryResponse.model_validate(c) for c in await get_categories(db, only_active=False)]


@admin_router.post("/categories", response_model=CategoryResponse, status_code=201)
async def admin_create_category(
    data: CategoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    cat = await create_category(db, data)
    return CategoryResponse.model_validate(cat)


@admin_router.put("/categories/{cat_id}", response_model=CategoryResponse)
async def admin_update_category(
    cat_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    c = await update_category(db, cat_id, data)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse.model_validate(c)


@admin_router.delete("/categories/{cat_id}", status_code=204)
async def admin_delete_category(
    cat_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    if not await delete_category(db, cat_id):
        raise HTTPException(status_code=404, detail="Category not found")


# ── Orders ────────────────────────────────────────────────────────────────────
@admin_router.get("/orders", response_model=PaginatedResponse)
async def admin_list_orders(
    page: int = Query(1, ge=1), limit: int = Query(20), status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    skip = (page - 1) * limit
    orders, total = await get_all_orders(db, skip, limit, status)
    return PaginatedResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total, page=page, limit=limit,
        pages=math.ceil(total / limit) if total else 1,
    )


@admin_router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def admin_update_order_status(
    order_id: int, data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    order = await update_order_status(db, order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.model_validate(order)


# ── Users ─────────────────────────────────────────────────────────────────────
@admin_router.get("/users", response_model=PaginatedResponse)
async def admin_list_users(
    page: int = Query(1, ge=1), limit: int = Query(20),
    db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    skip = (page - 1) * limit
    users, total = await list_users(db, skip, limit)
    return PaginatedResponse(
        items=[UserAdminResponse.model_validate(u) for u in users],
        total=total, page=page, limit=limit,
        pages=math.ceil(total / limit) if total else 1,
    )


@admin_router.put("/users/{user_id}/ban")
async def admin_ban_user(
    user_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    user = await update_user(db, user_id, is_active=False)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User banned"}


@admin_router.put("/users/{user_id}/activate")
async def admin_activate_user(
    user_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    user = await update_user(db, user_id, is_active=True, failed_login_attempts=0, locked_until=None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User activated"}


@admin_router.put("/users/{user_id}/promote")
async def admin_promote_user(
    user_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)
):
    from app.core.constants import UserRole
    user = await update_user(db, user_id, role=UserRole.ADMIN)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User promoted to admin"}
