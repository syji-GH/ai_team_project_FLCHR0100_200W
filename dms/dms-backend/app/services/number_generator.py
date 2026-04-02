import re
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.models.document import DocNumberRule

def generate_number(db: Session, category_code: str, dept_code: str, org_id: str = "default") -> str:
    """
    產生流水號: 支援 {DEPT}, {YYYY}, {YY}, {MM}, {SEQ:N}
    範例 Rule Pattern: {DEPT}-{YYYY}-{MM}-{SEQ:4}
    """
    rule = db.execute(
        select(DocNumberRule).where(
            DocNumberRule.org_id == org_id,
            DocNumberRule.category_code == category_code,
        ).with_for_update()
    ).scalar_one_or_none()

    if not rule:
        rule = DocNumberRule(
            category_code=category_code,
            pattern="{DEPT}-{YYYY}-{SEQ:4}",
            current_seq=0
        )
        db.add(rule)
        db.flush()

    now = datetime.now()
    seq = rule.current_seq + 1
    rule.current_seq = seq
    
    result = rule.pattern
    result = result.replace("{DEPT}", dept_code.upper())
    result = result.replace("{YYYY}", str(now.year))
    result = result.replace("{YY}", str(now.year)[-2:])
    result = result.replace("{MM}", f"{now.month:02d}")

    def replace_seq(m):
        width = int(m.group(1)) if m.group(1) else 4
        return str(seq).zfill(width)
        
    result = re.sub(r'\{SEQ(?::(\d+))?\}', replace_seq, result)
    
    db.commit()
    return result
