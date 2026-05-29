from django.db.models import Max

from issues.models import Issue


class IssueRepository:
    @staticmethod
    def next_issue_number(project_id: int) -> int:
        latest_number = Issue.objects.filter(project_id=project_id).aggregate(max_number=Max("issue_number"))["max_number"]
        return (latest_number or 0) + 1

    @staticmethod
    def for_board(project_id: int):
        return Issue.objects.filter(project_id=project_id).select_related("assignee", "reporter", "project")

    @staticmethod
    def create_issue(**kwargs):
        return Issue.objects.create(**kwargs)
