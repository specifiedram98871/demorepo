from rest_framework import serializers

from issues.models import Issue, IssueActivity, IssueComment


class IssueCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = IssueComment
        fields = ["id", "issue", "author", "author_name", "body", "created_at"]
        read_only_fields = ["author", "created_at"]


class IssueActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = IssueActivity
        fields = ["id", "event", "meta", "actor_name", "created_at"]


class IssueSerializer(serializers.ModelSerializer):
    comments = IssueCommentSerializer(many=True, read_only=True)
    activities = IssueActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "project",
            "issue_number",
            "key",
            "title",
            "description",
            "priority",
            "status",
            "platform_type",
            "mobile_subtype",
            "labels",
            "attachments",
            "assignee",
            "reporter",
            "due_date",
            "share_slug",
            "is_share_public",
            "created_at",
            "updated_at",
            "comments",
            "activities",
        ]
        read_only_fields = ["reporter", "issue_number", "key", "share_slug", "created_at", "updated_at"]
