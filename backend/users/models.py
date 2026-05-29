from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
	class Role(models.TextChoices):
		ADMIN = "admin", "Admin"
		PROJECT_MANAGER = "project_manager", "Project Manager"
		DEVELOPER = "developer", "Developer"
		VIEWER = "viewer", "Viewer"

	role = models.CharField(max_length=32, choices=Role.choices, default=Role.VIEWER)
	avatar_url = models.URLField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return self.username
