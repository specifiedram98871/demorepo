# API Contracts (v1)

## Auth
- `POST /api/v1/auth/signup/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/refresh/`
- `POST /api/v1/auth/logout/`

## Users
- `GET /api/v1/users/`
- `GET /api/v1/users/{id}/`
- `GET /api/v1/users/me/`

## Organizations
- `GET|POST /api/v1/organizations/`
- `GET|PATCH|DELETE /api/v1/organizations/{id}/`

## Projects
- `GET|POST /api/v1/projects/`
- `GET|PATCH|DELETE /api/v1/projects/{id}/`

## Issues
- `GET|POST /api/v1/issues/`
- `GET|PATCH|DELETE /api/v1/issues/{id}/`
- `POST /api/v1/issues/{id}/transition/`
- `GET|POST /api/v1/issue-comments/`
- `GET /api/v1/share/{uuid}/`

## Documentation
- `GET /api/schema/` (OpenAPI)
- `GET /api/docs/` (Swagger UI)
