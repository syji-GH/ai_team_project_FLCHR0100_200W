from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    category_code = Column(String, index=True, nullable=False) # e.g. QA, FORM, REPORT
    summary = Column(Text)
    status = Column(String, default="active") # draft, active, archived
    confidentiality = Column(String, default="public") # public, restricted, confidential
    
    # 關聯
    dept_id = Column(String, ForeignKey("departments.id"))
    author_id = Column(String, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 關聯對像
    author = relationship("User", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    contract = relationship("Contract", back_populates="document", uselist=False)

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    
    # 存展資訊
    file_name = Column(String, nullable=False)
    file_size = Column(Float) # MB
    mime_type = Column(String)
    file_path = Column(String, nullable=False) # MinIO path
    
    change_note = Column(Text)
    uploaded_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    document = relationship("Document", back_populates="versions")

class DocNumberRule(Base):
    __tablename__ = "doc_number_rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, index=True, default="default") 
    category_code = Column(String, unique=True, nullable=False) # e.g. QA
    pattern = Column(String, nullable=False) # {DEPT}-{YYYY}-{SEQ:4}
    current_seq = Column(Integer, default=0)
    reset_mode = Column(String, default="yearly") # yearly, monthly, none
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
