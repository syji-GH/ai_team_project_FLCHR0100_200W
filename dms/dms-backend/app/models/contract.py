from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Enum as SQLEnum, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_number = Column(String, unique=True, index=True, nullable=False)
    doc_id = Column(String, ForeignKey("documents.id"), nullable=False)
    
    # 商業屬性
    counterparty = Column(String, nullable=False) # 對方單位
    amount = Column(Float, default=0)
    currency = Column(String, default="TWD")
    
    # 時間與狀態
    start_date = Column(Date)
    end_date = Column(Date, index=True)
    status = Column(String, default="active") # draft, active, expiring, expired, terminated
    
    # 管理者
    owner_id = Column(String, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    document = relationship("Document", back_populates="contract")
    owner = relationship("User")
