from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.product import Product, ProductImage
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    sort: Optional[str] = None,
    only_active: bool = True,
) -> tuple[List[Product], int]:
    query = select(Product)
    
    if only_active:
        query = query.where(Product.is_active == True)

    if category_id:
        query = query.where(Product.category_id == category_id)
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.brand.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.tags.ilike(f"%{search}%"),
            )
        )
    if brand:
        query = query.where(Product.brand == brand)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)

    # Count: Do count on the query WITHOUT eager loading options and ordering
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    # Apply eager loading to the result query
    query = query.options(
        selectinload(Product.images),
        selectinload(Product.category),
    )

    # Sort
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all(), total


async def get_product_by_id(db: AsyncSession, product_id: int) -> Optional[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .execution_options(populate_existing=True)
        .where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def get_product_by_slug(db: AsyncSession, slug: str) -> Optional[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .execution_options(populate_existing=True)
        .where(Product.slug == slug)
    )
    return result.scalar_one_or_none()


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()
    # Fetch again with eager loading to avoid session binding issues during response validation
    return await get_product_by_id(db, product.id)


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Optional[Product]:
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_product_by_id(db, product_id)
    await db.execute(update(Product).where(Product.id == product_id).values(**update_data))
    return await get_product_by_id(db, product_id)


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    result = await db.execute(delete(Product).where(Product.id == product_id))
    return result.rowcount > 0


async def add_product_image(db: AsyncSession, product_id: int, image_url: str, is_primary: bool = False) -> ProductImage:
    img = ProductImage(product_id=product_id, image_url=image_url, is_primary=is_primary)
    db.add(img)
    await db.flush()
    return img


async def get_featured_products(db: AsyncSession, limit: int = 8) -> List[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .where(and_(Product.is_featured == True, Product.is_active == True))
        .order_by(Product.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
