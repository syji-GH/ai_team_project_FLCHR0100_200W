from app.db.database import SessionLocal, engine, Base
from app.models.user import User, Department
from app.models.document import DocNumberRule, Document
from app.models.contract import Contract
from app.core.security import get_password_hash

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. 建立部門
    it_dept = db.query(Department).filter(Department.code == "IT").first()
    if not it_dept:
        it_dept = Department(name="資訊技術部", code="IT", description="負責數位基礎設施與開發")
        db.add(it_dept)
    
    hr_dept = db.query(Department).filter(Department.code == "HR").first()
    if not hr_dept:
        hr_dept = Department(name="人力資源部", code="HR", description="人才獲取與發展")
        db.add(hr_dept)
    
    db.flush()

    # 2. 建立預設管理員
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            username="admin",
            email="admin@ecoco.com",
            full_name="系統管理員",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            dept_id=it_dept.id
        )
        db.add(admin_user)

    # 3. 建立預設編號規則
    rules = [
        {"code": "IT", "pattern": "ECOCO-IT-{YYYY}-{SEQ:4}"},
        {"code": "HR", "pattern": "ECOCO-HR-{YYYY}-{SEQ:4}"},
        {"code": "QA", "pattern": "ISO-{YYYY}-{MM}-{SEQ:3}"},
    ]

    for r in rules:
        exists = db.query(DocNumberRule).filter(DocNumberRule.category_code == r["code"]).first()
        if not exists:
            new_rule = DocNumberRule(category_code=r["code"], pattern=r["pattern"])
            db.add(new_rule)

    db.commit()
    db.close()
    print("✅ 資料初始化完成！預設帳密: admin / admin123")

if __name__ == "__main__":
    seed_data()
