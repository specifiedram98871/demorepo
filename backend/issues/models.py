import uuid

from django.conf import settings
from django.db import models

from projects.models import Project


class Issue(models.Model):
	class Priority(models.TextChoices):
		LOW = "low", "Low"
		MEDIUM = "medium", "Medium"
		HIGH = "high", "High"
		CRITICAL = "critical", "Critical"

	class Status(models.TextChoices):
		BACKLOG = "backlog", "Backlog"
		TODO = "todo", "Todo"
		IN_PROGRESS = "in_progress", "In Progress"
		REVIEW = "review", "Review"
		TESTING = "testing", "Testing"
		DONE = "done", "Done"

	class PlatformType(models.TextChoices):
		WEB = "web", "Web"
		MOBILE = "mobile", "Mobile"

	class MobileSubtype(models.TextChoices):
		IOS = "ios", "iOS"
		ANDROID = "android", "Android"

	project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="issues")
	issue_number = models.PositiveIntegerField(default=1)
	key = models.CharField(max_length=24, unique=True)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
	status = models.CharField(max_length=16, choices=Status.choices, default=Status.BACKLOG)
	platform_type = models.CharField(max_length=12, choices=PlatformType.choices, default=PlatformType.WEB)
	mobile_subtype = models.CharField(max_length=12, choices=MobileSubtype.choices, blank=True)
	labels = models.JSONField(default=list, blank=True)
	attachments = models.JSONField(default=list, blank=True)
	assignee = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		null=True,
		blank=True,
		on_delete=models.SET_NULL,
		related_name="assigned_issues",
	)
	reporter = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		related_name="reported_issues",
	)
	due_date = models.DateField(null=True, blank=True)
	share_slug = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	is_share_public = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def save(self, *args, **kwargs):
		if not self.key and self.project_id:
			self.key = f"{self.project.key}-{self.issue_number}"
		super().save(*args, **kwargs)

	def __str__(self) -> str:
		return self.key


class IssueComment(models.Model):
	issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="comments")
	author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
	body = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)


class IssueActivity(models.Model):
	issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="activities")
	actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
	event = models.CharField(max_length=128)
	meta = models.JSONField(default=dict, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
