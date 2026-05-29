from django.conf import settings
from django.db import models


class Organization(models.Model):
	name = models.CharField(max_length=150)
	slug = models.SlugField(unique=True)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_organizations")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return self.name


class OrganizationMembership(models.Model):
	class Role(models.TextChoices):
		ADMIN = "admin", "Admin"
		PROJECT_MANAGER = "project_manager", "Project Manager"
		DEVELOPER = "developer", "Developer"
		VIEWER = "viewer", "Viewer"

	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="memberships")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organization_memberships")
	role = models.CharField(max_length=32, choices=Role.choices, default=Role.VIEWER)
	invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="sent_invites")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("organization", "user")

	def __str__(self) -> str:
		return f"{self.user} in {self.organization}"
