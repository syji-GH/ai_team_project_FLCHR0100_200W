#!/bin/bash
# DMS 文管平台 — 專案初始化腳本
# 執行前確認已安裝：node 20+, python 3.11+, docker, git

set -e
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== DMS 文管平台初始化 ===${NC}\n"

# ── 根目錄 ──────────────────────────────────────────────
mkdir -p dms && cd dms

# ── .env 範本 ────────────────────────────────────────────
cat > .env.example << 'EOF'
# PostgreSQL
POSTGRES_USER=dms
POSTGRES_PASSWORD=changeme
POSTGRES_DB=dms_db
DATABASE_URL=postgresql://dms:changeme@postgres:5432/dms_db

# Redis
REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme123
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=dms-files

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# App
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
EOF

cp .env.example .env
echo -e "${YELLOW}請編輯 .env 填入真實的密碼和金鑰${NC}"

# ── docker-compose.yml ──────────────────────────────────
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web Console

  backend:
    build: ./dms-backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./dms-backend:/app
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  celery-worker:
    build: ./dms-backend
    command: celery -A app.tasks.celery_app worker --loglevel=info
    volumes:
      - ./dms-backend:/app
    env_file: .env
    depends_on:
      - backend
      - redis

  celery-beat:
    build: ./dms-backend
    command: celery -A app.tasks.celery_app beat --loglevel=info
    volumes:
      - ./dms-backend:/app
    env_file: .env
    depends_on:
      - backend
      - redis

volumes:
  pg_data:
  redis_data:
  minio_data:
EOF

# ── Makefile ────────────────────────────────────────────
cat > Makefile << 'EOF'
.PHONY: up down restart logs migrate seed frontend

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart backend

logs:
	docker compose logs -f backend

migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python -m app.db.seed

shell-db:
	docker compose exec postgres psql -U dms dms_db

shell-backend:
	docker compose exec backend bash

frontend:
	cd dms-frontend && npm run dev

test:
	docker compose exec backend pytest -v
EOF

echo -e "${GREEN}✓ 根目錄設定完成${NC}"

# ═══════════════════════════════════════════════════════
# 後端 — FastAPI
# ═══════════════════════════════════════════════════════
mkdir -p dms-backend/app/{api/v1,core,models,schemas,services,tasks,db/migrations}

# requirements.txt
cat > dms-backend/requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy==2.0.30
alembic==1.13.1
psycopg2-binary==2.9.9
pydantic==2.7.1
pydantic-settings==2.3.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
minio==7.2.7
celery==5.4.0
redis==5.0.4
resend==0.8.0
pytest==8.2.0
httpx==0.27.0
EOF

# Dockerfile
cat > dms-backend/Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# main.py
cat > dms-backend/app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, departments, documents, contracts, number_rules, search, audit

app = FastAPI(
    title="DMS 文管平台 API",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = "/api/v1"
app.include_router(auth.router,         prefix=prefix, tags=["auth"])
app.include_router(users.router,        prefix=prefix, tags=["users"])
app.include_router(departments.router,  prefix=prefix, tags=["departments"])
app.include_router(documents.router,    prefix=prefix, tags=["documents"])
app.include_router(contracts.router,    prefix=prefix, tags=["contracts"])
app.include_router(number_rules.router, prefix=prefix, tags=["number-rules"])
app.include_router(search.router,       prefix=prefix, tags=["search"])
app.include_router(audit.router,        prefix=prefix, tags=["audit"])

@app.get("/health")
def health():
    return {"status": "ok"}
EOF

# core/config.py
cat > dms-backend/app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    REDIS_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MINIO_ENDPOINT: str
    MINIO_ROOT_USER: str
    MINIO_ROOT_PASSWORD: str
    MINIO_BUCKET: str = "dms-files"
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@example.com"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
EOF

# core/deps.py
cat > dms-backend/app/core/deps.py << 'EOF'
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.security import verify_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin",):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user
EOF

# db/database.py
cat > dms-backend/app/db/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
EOF

# services/number_generator.py (核心邏輯)
cat > dms-backend/app/services/number_generator.py << 'EOF'
"""
文件編號產生服務
Pattern 範例: {DEPT}-{YYYY}-{SEQ:4}
  {DEPT}   → 部門代碼
  {YYYY}   → 西元年
  {YY}     → 西元年後兩碼
  {MM}     → 月份
  {SEQ:N}  → N 位流水號（不足補零）
"""
import re
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.models.document import DocNumberRule

def generate_number(db: Session, org_id: str, category_code: str, dept_code: str) -> str:
    rule = db.execute(
        select(DocNumberRule).where(
            DocNumberRule.org_id == org_id,
            DocNumberRule.category_code == category_code,
        ).with_for_update()
    ).scalar_one_or_none()

    if not rule:
        raise ValueError(f"No number rule found for category: {category_code}")

    now = datetime.now()
    seq = rule.current_seq + 1

    # 解析 pattern
    result = rule.pattern
    result = result.replace("{DEPT}", dept_code.upper())
    result = result.replace("{YYYY}", str(now.year))
    result = result.replace("{YY}", str(now.year)[-2:])
    result = result.replace("{MM}", f"{now.month:02d}")

    # {SEQ:N} 處理
    def replace_seq(m):
        width = int(m.group(1)) if m.group(1) else 4
        return str(seq).zfill(width)
    result = re.sub(r'\{SEQ(?::(\d+))?\}', replace_seq, result)

    # 更新流水號
    db.execute(
        update(DocNumberRule)
        .where(DocNumberRule.id == rule.id)
        .values(current_seq=seq)
    )
    db.commit()
    return result
EOF

# tasks/celery_app.py
cat > dms-backend/app/tasks/celery_app.py << 'EOF'
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery("dms", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.timezone = "Asia/Taipei"
celery_app.conf.beat_schedule = {
    "check-contract-expiry-daily": {
        "task": "app.tasks.contract_reminders.check_expiry",
        "schedule": crontab(hour=8, minute=0),  # 每天早上 8 點
    },
}
EOF

# .env.example for backend
cp .env.example dms-backend/.env.example

echo -e "${GREEN}✓ 後端架構建立完成${NC}"

# ═══════════════════════════════════════════════════════
# 前端 — Next.js
# ═══════════════════════════════════════════════════════
echo -e "\n${BLUE}建立 Next.js 專案...${NC}"
npx create-next-app@latest dms-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-turbopack \
  --import-alias "@/*" \
  --yes

cd dms-frontend

# 安裝核心依賴
npm install \
  @tanstack/react-query \
  axios \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod \
  date-fns \
  react-pdf

# 安裝 shadcn/ui
npx shadcn@latest init --yes --defaults
npx shadcn@latest add button input label badge table dialog form select textarea card --yes

# .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF

cat > .env.example << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF

# src/lib/api.ts
mkdir -p src/lib src/hooks src/stores src/types
cat > src/lib/api.ts << 'EOF'
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// 自動附加 JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 自動跳回登入頁
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
EOF

# src/stores/authStore.ts
cat > src/stores/authStore.ts << 'EOF'
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  dept_id: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAdmin: () => get().user?.role === "admin",
}));
EOF

# src/types/document.ts
cat > src/types/document.ts << 'EOF'
export type Confidentiality = "public" | "restricted" | "confidential";
export type DocStatus = "draft" | "active" | "archived";

export interface Document {
  id: string;
  doc_number: string;
  title: string;
  category: string;
  status: DocStatus;
  confidentiality: Confidentiality;
  dept_id: string;
  created_by: string;
  tags: string[];
  summary?: string;
  retention_years: number;
  version_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  doc_id: string;
  version_number: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  change_note?: string;
  uploaded_by: string;
  created_at: string;
}
EOF

# src/types/contract.ts
cat > src/types/contract.ts << 'EOF'
export type ContractStatus = "draft" | "under_review" | "active" | "expiring_soon" | "expired" | "renewed" | "terminated";

export interface Contract {
  id: string;
  contract_number: string;
  doc_id: string;
  counterparty: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  owner_id: string;
  created_at: string;
}
EOF

cd ../..

echo -e "${GREEN}✓ 前端架構建立完成${NC}"

# ── 完成提示 ─────────────────────────────────────────────
echo ""
echo -e "${BLUE}══════════════════════════════════${NC}"
echo -e "${GREEN}  DMS 初始化完成！${NC}"
echo -e "${BLUE}══════════════════════════════════${NC}"
echo ""
echo "  下一步："
echo "  1. 編輯 dms/.env 填入密碼"
echo "  2. cd dms && make up        # 啟動所有服務"
echo "  3. make migrate             # 執行 DB migration"
echo "  4. make frontend            # 啟動前端"
echo ""
echo "  服務位址："
echo "  前端      http://localhost:3000"
echo "  後端 API  http://localhost:8000/api/docs"
echo "  MinIO     http://localhost:9001"
echo ""
