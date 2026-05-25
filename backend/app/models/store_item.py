import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from ..database import Base

class StoreItem(Base):
    __tablename__ = "store_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price_tokens = Column(Integer, nullable=False)
    is_auction_item = Column(Boolean, default=False)
    auction_month = Column(String, nullable=True)  # format YYYY-MM
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)  # admin user id
