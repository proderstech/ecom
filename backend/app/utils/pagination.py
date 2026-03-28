from typing import List
from pydantic import BaseModel


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    limit: int
    pages: int
