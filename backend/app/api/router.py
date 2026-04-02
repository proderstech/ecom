from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.products import router as products_router
from app.api.routes.categories import router as categories_router
from app.api.routes.cart import router as cart_router
from app.api.routes.orders import router as orders_router
from app.api.routes.reviews import reviews_router, wishlist_router
from app.api.routes.addresses import router as addresses_router
from app.api.routes.payments import router as payments_router
from app.api.routes.admin.admin_router import admin_router
from app.api.routes.admin.analytics import analytics_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(cart_router)
api_router.include_router(orders_router)
api_router.include_router(reviews_router)
api_router.include_router(wishlist_router)
api_router.include_router(admin_router)
api_router.include_router(analytics_router)
api_router.include_router(addresses_router)
api_router.include_router(payments_router)
