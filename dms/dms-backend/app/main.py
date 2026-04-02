from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, documents
from app.models import User, Department, Document, Contract # 強制載入所有模型

app = FastAPI(
    title="ECOCO DMS API",
    description="Document Management System Platform Prototype",
    docs_url="/api/docs",
)

# 修正 CORS 設定，明確指定來源以滿足瀏覽器安全規定 (當 allow_credentials=True 時)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 註冊 API 路由 (v1)
api_router = APIRouter()
# 移除 prefix 的斜線敏感性 (也可在單一 router 設定)
@api_router.get("/debug")
def debug():
    return {"message": "DMS API is reachable"}

api_router.include_router(auth.router,       prefix="/auth", tags=["auth"])
api_router.include_router(documents.router,  prefix="/documents", tags=["documents"])

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "DMS API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
