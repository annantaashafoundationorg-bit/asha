"""
Admin Store Routes
Provides CRUD operations for StoreItem, protected by admin authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.store_item import StoreItemCreate, StoreItemUpdate, StoreItemOut
from ..services.store_service import create_item, update_item, delete_item, get_item
from ..middleware.auth import get_current_admin

router = APIRouter(prefix="/admin/store", tags=["admin-store"])

@router.post("/item", response_model=StoreItemOut)
def admin_create_item(item: StoreItemCreate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    return create_item(db, item)

@router.put("/item/{item_id}", response_model=StoreItemOut)
def admin_update_item(item_id: str, item: StoreItemUpdate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    db_item = update_item(db, item_id, item)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/item/{item_id}")
def admin_delete_item(item_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    success = delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}
