import pytest
from rest_framework.test import APIClient

from issues.models import Issue
from projects.models import Project
from users.models import User
from workspaces.models import Organization


@pytest.fixture
def organization(db):
	owner = User.objects.create_user(username="owner", password="StrongPass123!", role=User.Role.ADMIN)
	return Organization.objects.create(name="Acme", slug="acme", owner=owner)


@pytest.fixture
def project(db, organization):
	admin = User.objects.create_user(username="admin", password="StrongPass123!", role=User.Role.ADMIN)
	return Project.objects.create(name="Acme Project", key="ACME", organization=organization, created_by=admin)


@pytest.fixture
def admin_user(db):
	return User.objects.create_user(username="admin2", password="StrongPass123!", role=User.Role.ADMIN)


@pytest.fixture
def developer_user(db):
	return User.objects.create_user(username="dev", password="StrongPass123!", role=User.Role.DEVELOPER)


@pytest.fixture
def second_developer_user(db):
	return User.objects.create_user(username="dev2", password="StrongPass123!", role=User.Role.DEVELOPER)


@pytest.mark.django_db
def test_admin_can_create_issue(admin_user, project):
	client = APIClient()
	client.force_authenticate(user=admin_user)

	response = client.post(
		"/api/v1/issues/",
		{
			"project": project.id,
			"title": "Admin-created ticket",
			"description": "Created by admin",
			"priority": "medium",
			"status": "backlog",
			"platform_type": "web",
		},
		format="json",
	)

	assert response.status_code == 201
	assert Issue.objects.filter(title="Admin-created ticket").exists()


@pytest.mark.django_db
def test_non_admin_cannot_create_issue(developer_user, project):
	client = APIClient()
	client.force_authenticate(user=developer_user)

	response = client.post(
		"/api/v1/issues/",
		{
			"project": project.id,
			"title": "Blocked ticket",
			"description": "Should not be created",
			"priority": "medium",
			"status": "backlog",
			"platform_type": "web",
		},
		format="json",
	)

	assert response.status_code == 403
	assert not Issue.objects.filter(title="Blocked ticket").exists()


@pytest.mark.django_db
def test_developer_can_only_progress_todo_to_in_progress_to_review(developer_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=1,
		key="ACME-1",
		title="Workflow ticket",
		priority="medium",
		status=Issue.Status.TODO,
		platform_type="web",
		assignee=developer_user,
		reporter=developer_user,
	)
	client = APIClient()
	client.force_authenticate(user=developer_user)

	direct_review_response = client.post(
		f"/api/v1/issues/{issue.id}/transition/", {"status": "review"}, format="json"
	)
	assert direct_review_response.status_code == 403

	in_progress_response = client.post(f"/api/v1/issues/{issue.id}/transition/", {"status": "in_progress"}, format="json")
	assert in_progress_response.status_code == 200

	issue.refresh_from_db()
	assert issue.status == Issue.Status.IN_PROGRESS

	review_response = client.post(f"/api/v1/issues/{issue.id}/transition/", {"status": "review"}, format="json")
	assert review_response.status_code == 200

	issue.refresh_from_db()
	assert issue.status == Issue.Status.REVIEW


@pytest.mark.django_db
def test_non_admin_cannot_move_issue_out_of_review(developer_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=2,
		key="ACME-2",
		title="Reviewed ticket",
		priority="medium",
		status=Issue.Status.REVIEW,
		platform_type="web",
		assignee=developer_user,
		reporter=developer_user,
	)
	client = APIClient()
	client.force_authenticate(user=developer_user)

	response = client.post(f"/api/v1/issues/{issue.id}/transition/", {"status": "done"}, format="json")

	assert response.status_code == 403
	issue.refresh_from_db()
	assert issue.status == Issue.Status.REVIEW


@pytest.mark.django_db
def test_regular_user_only_sees_assigned_issues(developer_user, second_developer_user, project):
	assigned_issue = Issue.objects.create(
		project=project,
		issue_number=4,
		key="ACME-4",
		title="Assigned to dev",
		priority="medium",
		status=Issue.Status.TODO,
		platform_type="web",
		assignee=developer_user,
		reporter=developer_user,
	)
	Issue.objects.create(
		project=project,
		issue_number=5,
		key="ACME-5",
		title="Assigned to dev2",
		priority="medium",
		status=Issue.Status.TODO,
		platform_type="web",
		assignee=second_developer_user,
		reporter=developer_user,
	)

	client = APIClient()
	client.force_authenticate(user=developer_user)
	response = client.get("/api/v1/issues/")

	assert response.status_code == 200
	assert len(response.data) == 1
	assert response.data[0]["id"] == assigned_issue.id


@pytest.mark.django_db
def test_admin_can_assign_ticket(admin_user, developer_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=6,
		key="ACME-6",
		title="Needs assignment",
		priority="medium",
		status=Issue.Status.BACKLOG,
		platform_type="web",
		reporter=admin_user,
	)

	client = APIClient()
	client.force_authenticate(user=admin_user)
	response = client.post(f"/api/v1/issues/{issue.id}/assign/", {"assignee": developer_user.id}, format="json")

	assert response.status_code == 200
	issue.refresh_from_db()
	assert issue.assignee_id == developer_user.id


@pytest.mark.django_db
def test_regular_user_cannot_assign_ticket(developer_user, second_developer_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=7,
		key="ACME-7",
		title="Assignment blocked",
		priority="medium",
		status=Issue.Status.BACKLOG,
		platform_type="web",
		assignee=developer_user,
		reporter=developer_user,
	)

	client = APIClient()
	client.force_authenticate(user=developer_user)
	response = client.post(f"/api/v1/issues/{issue.id}/assign/", {"assignee": second_developer_user.id}, format="json")

	assert response.status_code == 403
	issue.refresh_from_db()
	assert issue.assignee_id == developer_user.id


@pytest.mark.django_db
def test_admin_can_edit_and_delete_ticket(admin_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=8,
		key="ACME-8",
		title="Editable ticket",
		priority="medium",
		status=Issue.Status.BACKLOG,
		platform_type="web",
		reporter=admin_user,
	)

	client = APIClient()
	client.force_authenticate(user=admin_user)

	update_response = client.patch(
		f"/api/v1/issues/{issue.id}/",
		{"title": "Updated title", "status": Issue.Status.DONE},
		format="json",
	)

	assert update_response.status_code == 200
	issue.refresh_from_db()
	assert issue.title == "Updated title"
	assert issue.status == Issue.Status.DONE

	delete_response = client.delete(f"/api/v1/issues/{issue.id}/")

	assert delete_response.status_code == 204
	assert not Issue.objects.filter(id=issue.id).exists()


@pytest.mark.django_db
def test_regular_user_cannot_edit_or_delete_ticket(developer_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=9,
		key="ACME-9",
		title="Locked ticket",
		priority="medium",
		status=Issue.Status.BACKLOG,
		platform_type="web",
		assignee=developer_user,
		reporter=developer_user,
	)

	client = APIClient()
	client.force_authenticate(user=developer_user)

	update_response = client.patch(
		f"/api/v1/issues/{issue.id}/",
		{"title": "Blocked update"},
		format="json",
	)
	delete_response = client.delete(f"/api/v1/issues/{issue.id}/")

	assert update_response.status_code == 403
	assert delete_response.status_code == 403
	issue.refresh_from_db()
	assert issue.title == "Locked ticket"


@pytest.mark.django_db
def test_admin_can_move_backlog_to_todo(admin_user, project):
	issue = Issue.objects.create(
		project=project,
		issue_number=3,
		key="ACME-3",
		title="Backlog ticket",
		priority="medium",
		status=Issue.Status.BACKLOG,
		platform_type="web",
		reporter=admin_user,
	)
	client = APIClient()
	client.force_authenticate(user=admin_user)

	response = client.post(f"/api/v1/issues/{issue.id}/transition/", {"status": "todo"}, format="json")

	assert response.status_code == 200
	issue.refresh_from_db()
	assert issue.status == Issue.Status.TODO
