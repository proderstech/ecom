from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel
from app.schemas.product import ProductResponse


class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    item_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal
    product: Optional[ProductResponse] = None

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse] = []
    total: Decimal = Decimal("0.00")
    item_count: int = 0

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postcode: str
    shipping_phone: str
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = "card"
    stripe_payment_intent_id: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    payment_status: str
    total_price: Decimal
    subtotal: Decimal
    tax: Decimal
    discount: Decimal
    shipping_cost: Decimal
    shipping_name: Optional[str]
    shipping_address: Optional[str]
    shipping_city: Optional[str]
    shipping_postcode: Optional[str]
    shipping_phone: Optional[str] = None
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


class ReviewCreate(BaseModel):
    product_id: int
    rating: float
    review_text: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: Optional[str] = None
    rating: float
    review_text: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class WishlistResponse(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductResponse] = None

    model_config = {"from_attributes": True}


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: Decimal
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    is_active: bool = True
    expiry_date: Optional[datetime] = None


class CouponResponse(CouponCreate):
    id: int
    used_count: int

    model_config = {"from_attributes": True}


class CouponApplyRequest(BaseModel):
    code: str
    order_total: Decimal
