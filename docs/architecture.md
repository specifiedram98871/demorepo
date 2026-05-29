# System Architecture

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Zustand, TanStack Query, Framer Motion, dnd-kit, Recharts.
- Backend: Django + DRF + SimpleJWT + drf-spectacular.
- Database: SQLite by default, env-driven DB adapter for PostgreSQL/Supabase/Neon/PlanetScale.

## Layers
- API Layer: versioned REST endpoints under `/api/v1`.
- Service Layer: business rules (`issues/services.py`).
- Repository Layer: data-access abstraction (`issues/repositories.py`).
- Domain Models: modular apps (`users`, `workspaces`, `projects`, `issues`, `notifications`).
- Client Data Layer: repository + service abstractions in frontend `src/lib/repositories` and `src/lib/services`.
- Local-first Layer: IndexedDB drafts + offline action queue.

## Migration Readiness
- Database wiring is controlled by env vars (`DB_ENGINE`, `DB_*`).
- Business logic is kept out of views/components.
- Shared contracts in `shared/contracts` reduce API coupling.

## API Versioning
- Current: `v1` (`config/api_v1_urls.py`).
- Future: add `api_v2_urls.py`, keep backward compatibility.
