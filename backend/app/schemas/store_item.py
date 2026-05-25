from pydantic import BaseModel, Field
from typing import Optional

class StoreItemBase(BaseModel):
    sku: str = Field(..., description="Unique SKU for the item")
    name: str = Field(..., description="Name of the item")
    description: Optional[str] = Field(None, description="Optional description of the item")
    price_tokens: int = Field(..., ge=0, description="Price in tokens")
    is_auction_item: bool = Field(False, description="Whether the item is part of the monthly auction")
    auction_month: Optional[str] = Field(None, description="Auction month in YYYY-MM format, if applicable")

class StoreItemCreate(StoreItemBase):
    created_by: Optional[str] = Field(None, description="Admin user ID creating the item")

class StoreItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_tokens: Optional[int] = None
    is_auction_item: Optional[bool] = None
    auction_month: Optional[str] = None

class StoreItemOut(StoreItemBase):
    id: str = Field(..., description="UUID of the store item")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    created_by: Optional[str] = None
    class Config:
        orm_mode = True
