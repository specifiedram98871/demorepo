# Database Schema (v1)

## users_user
- id (PK)
- username, email, password
- role: admin | project_manager | developer | viewer
- avatar_url
- created_at, updated_at

## workspaces_organization
- id (PK)
- name, slug
- owner_id -> users_user.id
- created_at

## workspaces_organizationmembership
- id (PK)
- organization_id -> workspaces_organization.id
- user_id -> users_user.id
- role
- invited_by_id -> users_user.id
- created_at

## projects_project
- id (PK)
- organization_id -> workspaces_organization.id
- key, name, description
- created_by_id -> users_user.id
- created_at

## issues_issue
- id (PK)
- project_id -> projects_project.id
- issue_number, key
- title, description
- priority
- status
- platform_type, mobile_subtype
- labels (JSON)
- attachments (JSON)
- assignee_id -> users_user.id
- reporter_id -> users_user.id
- due_date
- share_slug (UUID), is_share_public
- created_at, updated_at

## issues_issuecomment
- id (PK)
- issue_id -> issues_issue.id
- author_id -> users_user.id
- body
- created_at

## issues_issueactivity
- id (PK)
- issue_id -> issues_issue.id
- actor_id -> users_user.id
- event
- meta (JSON)
- created_at
