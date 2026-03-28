from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AddressBase(BaseModel):
    name: str
    address: str
    city: str = "London"
    postcode: str
    country: str = "United Kingdom"
    instructions: Optional[str] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    instructions: Optional[str] = None
    is_default: Optional[bool] = None

class Address(AddressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
