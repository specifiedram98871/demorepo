import pytest
from rest_framework.test import APIClient

from issues.models import Issue
from projects.models import Project
from users.models import User
from workspaces.models import Organization


@pytest.fixture
def admin_user(db):
	return User.objects.create_user(username="project-admin", password="StrongPass123!", role=User.Role.ADMIN)


@pytest.fixture
def regular_user(db):
	return User.objects.create_user(username="project-dev", password="StrongPass123!", role=User.Role.DEVELOPER)


@pytest.fixture
def organization(db, admin_user):
	return Organization.objects.create(name="Org", slug="org", owner=admin_user)


@pytest.fixture
def project(organization, admin_user):
	return Project.objects.create(name="Roadmap", key="RM", organization=organization, created_by=admin_user)


@pytest.mark.django_db
def test_admin_can_create_project(admin_user, organization):
	client = APIClient()
	client.force_authenticate(user=admin_user)

	response = client.post(
		"/api/v1/projects/",
		{"name": "Mobile", "key": "MOB", "description": "Mobile app", "organization": organization.id},
		format="json",
	)

	assert response.status_code == 201


@pytest.mark.django_db
def test_regular_user_cannot_create_project(regular_user, organization):
	client = APIClient()
	client.force_authenticate(user=regular_user)

	response = client.post(
		"/api/v1/projects/",
		{"name": "Blocked", "key": "BLK", "description": "No access", "organization": organization.id},
		format="json",
	)

	assert response.status_code == 403


@pytest.mark.django_db
def test_regular_user_only_lists_projects_with_assigned_tickets(admin_user, regular_user, organization, project):
	other_project = Project.objects.create(name="Other", key="OTH", organization=organization, created_by=admin_user)
	Issue.objects.create(
		project=project,
		issue_number=1,
		key="RM-1",
		title="Assigned",
		priority="medium",
		status="todo",
		platform_type="web",
		assignee=regular_user,
		reporter=admin_user,
	)
	Issue.objects.create(
		project=other_project,
		issue_number=1,
		key="OTH-1",
		title="Not assigned",
		priority="medium",
		status="todo",
		platform_type="web",
		reporter=admin_user,
	)

	client = APIClient()
	client.force_authenticate(user=regular_user)
	response = client.get("/api/v1/projects/")

	assert response.status_code == 200
	assert len(response.data) == 1
	assert response.data[0]["id"] == project.id
