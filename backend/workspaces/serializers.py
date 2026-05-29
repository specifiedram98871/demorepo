from rest_framework import serializers

from workspaces.models import Organization, OrganizationMembership


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = ["id", "user", "user_name", "role", "invited_by", "created_at"]


class OrganizationSerializer(serializers.ModelSerializer):
    memberships = OrganizationMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "owner", "created_at", "memberships"]
        read_only_fields = ["owner", "created_at"]
