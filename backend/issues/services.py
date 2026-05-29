from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from issues.models import Issue, IssueActivity
from issues.repositories import IssueRepository
from users.models import User


class IssueService:
    @staticmethod
    def _is_admin(user) -> bool:
        return getattr(user, "role", None) == User.Role.ADMIN

    @staticmethod
    @transaction.atomic
    def create_issue(validated_data, reporter):
        project = validated_data["project"]
        issue_number = IssueRepository.next_issue_number(project.id)
        issue = IssueRepository.create_issue(
            **validated_data,
            issue_number=issue_number,
            key=f"{project.key}-{issue_number}",
            reporter=reporter,
        )
        IssueActivity.objects.create(
            issue=issue,
            actor=reporter,
            event="issue_created",
            meta={"status": issue.status, "priority": issue.priority},
        )
        return issue

    @staticmethod
    def transition_issue(issue: Issue, new_status: str, actor):
        if not IssueService.can_transition(issue, new_status, actor):
            raise PermissionDenied("You are not allowed to move this issue to that status.")

        previous = issue.status
        issue.status = new_status
        issue.save(update_fields=["status", "updated_at"])
        IssueActivity.objects.create(
            issue=issue,
            actor=actor,
            event="status_changed",
            meta={"from": previous, "to": new_status},
        )
        return issue

    @staticmethod
    def assign_issue(issue: Issue, assignee, actor):
        previous_assignee = issue.assignee_id
        issue.assignee = assignee
        issue.save(update_fields=["assignee", "updated_at"])
        IssueActivity.objects.create(
            issue=issue,
            actor=actor,
            event="assignee_changed",
            meta={"from": previous_assignee, "to": issue.assignee_id},
        )
        return issue

    @staticmethod
    def can_transition(issue: Issue, new_status: str, actor) -> bool:
        if IssueService._is_admin(actor):
            return True

        if issue.assignee_id != getattr(actor, "id", None):
            return False

        allowed_transitions = {
            Issue.Status.TODO: {Issue.Status.IN_PROGRESS},
            Issue.Status.IN_PROGRESS: {Issue.Status.REVIEW},
        }

        if issue.status not in allowed_transitions:
            return False

        return new_status in allowed_transitions[issue.status]
