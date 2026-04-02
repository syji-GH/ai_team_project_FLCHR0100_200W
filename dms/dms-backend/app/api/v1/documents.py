from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.document import Document
from app.models.user import Department
from app.schemas.document import DocumentCreate, DocumentRead, DocumentUpdate
from app.services.number_generator import generate_number

router = APIRouter()

@router.post("/", response_model=DocumentRead)
def create_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    """
    建立文件並自動產生編號
    """
    # 檢查部門是否存在
    dept = db.query(Department).filter(Department.code == doc_in.dept_code).first()
    if not dept:
        # 暫時為測試方便自動建立部門 (實際流程應報錯)
        dept = Department(name=f"Dept {doc_in.dept_code}", code=doc_in.dept_code)
        db.add(dept)
        db.flush()
    
    # 核心邏輯：產生編號
    doc_num = generate_number(
        db, 
        category_code=doc_in.category_code, 
        dept_code=doc_in.dept_code
    )
    
    new_doc = Document(
        **doc_in.dict(exclude={"dept_code"}),
        doc_number=doc_num,
        dept_id=dept.id
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.get("/", response_model=List[DocumentRead])
def list_documents(
    skip: int = 0, 
    limit: int = 100, 
    category_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if category_code:
        query = query.filter(Document.category_code == category_code)
    return query.offset(skip).limit(limit).all()

@router.get("/{doc_id}", response_model=DocumentRead)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
