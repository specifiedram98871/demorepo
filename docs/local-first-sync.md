# Local-First and Sync Strategy

## Current behavior
- Drafts are persisted to IndexedDB (`drafts` store).
- Offline write actions are queued in IndexedDB (`queue` store).
- Drag-and-drop status updates are optimistic in UI.

## Sync flow
1. User action updates local state immediately (Zustand).
2. If offline, action is queued (`enqueueAction`).
3. On reconnect, queue is replayed (`flushOfflineQueue`).
4. Server state is revalidated with TanStack Query invalidation.

## Migration to cloud DB
- No UI rewrite needed.
- Keep API surface stable.
- Swap Django DB engine and env values.
- For Supabase/Neon/PostgreSQL: use `django.db.backends.postgresql`.
- For PlanetScale: use MySQL adapter package and same service/repository contracts.
