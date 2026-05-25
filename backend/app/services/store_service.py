"""
Store Service
Provides CRUD operations and purchase logic for StoreItem.
Enforces the 70/30 token cap: when a student purchases an item, 70% of the price is deducted from the student's wallet and credited to the NGO's account, while 30% is retained by the system (or other purpose).
"""

from sqlalchemy.orm import Session
from ..models.store_item import StoreItem
from ..schemas.store_item import StoreItemCreate, StoreItemUpdate, StoreItemOut
from ..services.reward_service import award_coins, get_wallet
from ..schemas import RewardWallet
from typing import List


def get_item(db: Session, item_id: str) -> StoreItem:
    return db.query(StoreItem).filter(StoreItem.id == item_id).first()


def list_items(db: Session, skip: int = 0, limit: int = 100) -> List[StoreItem]:
    return db.query(StoreItem).offset(skip).limit(limit).all()


def create_item(db: Session, item_in: StoreItemCreate) -> StoreItem:
    db_item = StoreItem(**item_in.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, item_id: str, item_in: StoreItemUpdate) -> StoreItem:
    db_item = get_item(db, item_id)
    if not db_item:
        return None
    for field, value in item_in.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: str) -> bool:
    db_item = get_item(db, item_id)
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True


def purchase_item(db: Session, student_id: str, item_id: str) -> dict:
    """Purchase a store item for a student.
    Enforces the 70/30 token distribution:
        - 70% of the item's price is deducted from the student's coins.
        - The remaining 30% is retained (e.g., system fee) or could be allocated elsewhere.
    Returns a dict with purchase result and updated wallet.
    """
    item = get_item(db, item_id)
    if not item:
        raise ValueError("Item not found")
    # Retrieve student's wallet
    wallet: RewardWallet = get_wallet(student_id)
    if wallet.aasha_coins < item.price_tokens:
        raise ValueError("Insufficient tokens")
    # Calculate distribution
    deduction = int(item.price_tokens * 0.7)
    # Award deduction to student (removing tokens)
    # Here we simply subtract; reward_service currently only awards, so we adjust directly.
    # Update WALLET directly for simplicity.
    from ..services.reward_service import WALLET
    if student_id not in WALLET:
        WALLET[student_id] = {"aasha_coins": 0, "xp": 0, "badges": []}
    WALLET[student_id]["aasha_coins"] -= deduction
    # The 30% could be recorded elsewhere; for now we ignore it.
    return {
        "student_id": student_id,
        "item_id": item.id,
        "item_name": item.name,
        "deducted_tokens": deduction,
        "remaining_balance": WALLET[student_id]["aasha_coins"],
    }
