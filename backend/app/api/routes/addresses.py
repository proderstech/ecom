from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.addresses import list_addresses, create_address, update_address, delete_address, get_address
from app.schemas.address import Address, AddressCreate, AddressUpdate
from app.models.user import User

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("/", response_model=List[Address])
async def list_user_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_addresses(db, current_user.id)

@router.post("/", response_model=Address)
async def create_user_address(
    data: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_address(db, current_user.id, **data.model_dump())

@router.put("/{address_id}", response_model=Address)
async def update_user_address(
    address_id: int,
    data: AddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = await update_address(
        db, address_id, current_user.id, **data.model_dump(exclude_unset=True)
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.delete("/{address_id}")
async def delete_user_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = await delete_address(db, address_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted"}
