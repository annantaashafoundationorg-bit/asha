from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.store_item import StoreItemOut
from ..services.store_service import list_items, purchase_item, get_item, create_item, update_item, delete_item
from ..schemas.store_item import StoreItemCreate, StoreItemUpdate
from ..middleware.auth import get_current_user, get_current_admin

router = APIRouter()

@router.get("/store/items", response_model=list[StoreItemOut], tags=["store"])
def store_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return list_items(db, skip=skip, limit=limit)

@router.post("/store/purchase/{item_id}", tags=["store"])
def store_purchase(item_id: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        result = purchase_item(db, student_id=current_user, item_id=item_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Admin routes
@router.post("/admin/store/item", response_model=StoreItemOut, tags=["admin-store"])
def admin_create_item(item: StoreItemCreate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    return create_item(db, item)

@router.put("/admin/store/item/{item_id}", response_model=StoreItemOut, tags=["admin-store"])
def admin_update_item(item_id: str, item: StoreItemUpdate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    db_item = update_item(db, item_id, item)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/admin/store/item/{item_id}", tags=["admin-store"])
def admin_delete_item(item_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    success = delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}
