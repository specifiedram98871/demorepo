from django.conf import settings
from django.db import models

from workspaces.models import Organization


class Project(models.Model):
	name = models.CharField(max_length=150)
	key = models.CharField(max_length=12)
	description = models.TextField(blank=True)
	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="projects")
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("organization", "key")

	def __str__(self) -> str:
		return f"{self.key} - {self.name}"
