from rest_framework import serializers

from projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "key", "description", "organization", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]
