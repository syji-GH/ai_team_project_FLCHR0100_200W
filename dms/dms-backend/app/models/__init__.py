from .user import User, Department
from .document import Document, DocumentVersion, DocNumberRule
from .contract import Contract

# 確保所有模型都被載入到 SQLAlchemy Base 的 Registry 中
__all__ = [
    "User",
    "Department",
    "Document",
    "DocumentVersion",
    "DocNumberRule",
    "Contract"
]
