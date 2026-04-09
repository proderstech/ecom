from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.reviews import create_review, get_reviews_for_product, get_wishlist, add_to_wishlist, remove_from_wishlist
from app.schemas.order import ReviewCreate, ReviewResponse, WishlistResponse
from app.models.user import User

# ── Reviews ────────────────────────────────────────────────────────────────────
reviews_router = APIRouter(prefix="/reviews", tags=["Reviews"])


@reviews_router.get("/{product_id}", response_model=List[ReviewResponse])
async def get_reviews(product_id: int, db: AsyncSession = Depends(get_db)):
    reviews = await get_reviews_for_product(db, product_id)
    results = []
    for r in reviews:
        resp = ReviewResponse.model_validate(r)
        if getattr(r, "user", None):
            resp.user_name = r.user.name
        results.append(resp)
    return results


@reviews_router.post("", response_model=ReviewResponse, status_code=201)
async def add_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not 1.0 <= data.rating <= 5.0:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    try:
        review = await create_review(db, current_user.id, data)
        resp = ReviewResponse.model_validate(review)
        resp.user_name = current_user.name
        return resp
    except Exception:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")


# ── Wishlist ───────────────────────────────────────────────────────────────────
wishlist_router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@wishlist_router.get("", response_model=List[WishlistResponse])
async def my_wishlist(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        items = await get_wishlist(db, current_user.id)
        # Manually validate to trigger any DetachedInstanceErrors here where we can catch them
        return [WishlistResponse.model_validate(i) for i in items]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@wishlist_router.post("/add")
async def wishlist_add(product_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await add_to_wishlist(db, current_user.id, product_id)
    return {"message": "Added to wishlist"}


@wishlist_router.delete("/remove/{product_id}")
async def wishlist_remove(product_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    removed = await remove_from_wishlist(db, current_user.id, product_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    return {"message": "Removed from wishlist"}
