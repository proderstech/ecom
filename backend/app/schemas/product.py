from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0
    parent_id: Optional[int] = None

    model_config = {"from_attributes": True}


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
# children: List["CategoryResponse"] = []

    model_config = {"from_attributes": True}


CategoryResponse.model_rebuild()


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: int = 0
    is_featured: bool = False
    is_active: bool = True
    badge: Optional[str] = None
    tags: Optional[str] = None
    abv: Optional[str] = None
    volume: Optional[str] = None
    country: Optional[str] = None
    subcategory: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    badge: Optional[str] = None
    tags: Optional[str] = None
    abv: Optional[str] = None
    volume: Optional[str] = None
    country: Optional[str] = None
    subcategory: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    rating: float
    review_count: int
    created_at: datetime
    images: List[ProductImageResponse] = []
    category: Optional[CategoryBase] = None

    model_config = {"from_attributes": True}
