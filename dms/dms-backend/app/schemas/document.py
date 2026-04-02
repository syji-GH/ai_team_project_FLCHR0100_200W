from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class DocumentBase(BaseModel):
    title: str
    category_code: str
    summary: Optional[str] = None
    confidentiality: str = "public"

class DocumentCreate(DocumentBase):
    dept_code: str # Used for number generation

class DocumentRead(DocumentBase):
    id: str
    doc_number: str
    status: str
    dept_id: Optional[str]
    author_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    status: Optional[str] = None
    confidentiality: Optional[str] = None
