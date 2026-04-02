from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="member") # admin, manager, member
    is_active = Column(Boolean, default=True)
    dept_id = Column(String, ForeignKey("departments.id"))
    
    department = relationship("Department", back_populates="users")
    documents = relationship("Document", back_populates="author")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False) # e.g. IT, HR, RD
    description = Column(Text)
    
    users = relationship("User", back_populates="department")
