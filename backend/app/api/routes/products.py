from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import math

from app.db.session import get_db
from app.crud.products import get_products, get_product_by_slug, get_product_by_id, get_featured_products
from app.schemas.product import ProductResponse
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    products, total = await get_products(
        db, skip=skip, limit=limit, category_id=category_id,
        search=search, brand=brand, min_price=min_price,
        max_price=max_price, sort=sort,
    )
    return PaginatedResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total, page=page, limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 1,
    )


@router.get("/featured", response_model=List[ProductResponse])
async def featured_products(limit: int = Query(8, ge=1, le=20), db: AsyncSession = Depends(get_db)):
    products = await get_featured_products(db, limit)
    return [ProductResponse.model_validate(p) for p in products]


@router.get("/{slug_or_id}", response_model=ProductResponse)
async def get_product(slug_or_id: str, db: AsyncSession = Depends(get_db)):
    # Try ID first if it looks like an integer
    if slug_or_id.isdigit():
        product = await get_product_by_id(db, int(slug_or_id))
    else:
        product = await get_product_by_slug(db, slug_or_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)
