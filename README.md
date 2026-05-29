# PulseBoard (Jira-like Project & Bug Tracker)

Full-stack local-first issue tracking platform built with Next.js + Django REST.

## Monorepo Structure
- `frontend/` Next.js App Router UI
- `backend/` Django REST API
- `shared/` shared contracts
- `docs/` architecture and API docs

## Quick Start
1. Backend
```powershell
cd backend
../.venv/Scripts/python.exe -m pip install -r requirements.txt
../.venv/Scripts/python.exe manage.py migrate
../.venv/Scripts/python.exe manage.py runserver
```

2. Frontend
```powershell
cd frontend
npm install
npm run dev
```

3. Open
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Swagger: http://localhost:8000/api/docs/

## Docker
```powershell
docker compose up --build
```

### Database in Docker
The Docker stack starts PostgreSQL automatically and the backend connects to it through the `db` service.

1. Set the database values in [backend/.env.example](backend/.env.example) or provide them through your shell before starting Docker:
```powershell
DB_ENGINE=django.db.backends.postgresql
DB_NAME=bugtracker
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=db
DB_PORT=5432
```

2. Start the stack:
```powershell
docker compose up --build
```

3. Run migrations the first time if the database is new:
```powershell
docker compose exec backend python manage.py migrate
```

4. Open the app:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Swagger: http://localhost:8000/api/docs/

If PostgreSQL is not available, switch `DB_ENGINE` to `django.db.backends.sqlite3` and set `DB_NAME=db.sqlite3` for a local-only fallback.

### Admin Registration
The signup API accepts a `role` field. To register an admin account, send `role: "admin"` when calling `/api/v1/auth/signup/`.

Example payload:
```json
{
	"username": "admin",
	"email": "admin@example.com",
	"password": "StrongPass123!",
	"role": "admin"
}
```

## Testing
- Backend: `cd backend; ../.venv/Scripts/python.exe -m pytest`
- Frontend: `cd frontend; npm run test`

## Roles
- Admin
- Project Manager
- Developer
- Viewer

## Core Features Included
- JWT auth with refresh/logout
- Versioned REST API (`/api/v1`)
- Organizations, projects, and issue tracking
- Jira-style workflow statuses
- Shareable issue links (`/share/{uuid}`)
- Drag-and-drop Kanban board
- Dashboard with charts
- Local-first offline queue and drafts
- Migration-ready repository/service architecture
