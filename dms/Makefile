.PHONY: up down backend frontend migrate logs

up:
	docker compose up -d

down:
	docker compose down

backend:
	cd dms-backend && uvicorn app.main:app --reload

frontend:
	cd dms-frontend && npm run dev

logs:
	docker compose logs -f
