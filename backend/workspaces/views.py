from rest_framework import permissions, viewsets

from workspaces.models import Organization
from workspaces.serializers import OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
	serializer_class = OrganizationSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Organization.objects.filter(memberships__user=self.request.user).distinct()

	def perform_create(self, serializer):
		organization = serializer.save(owner=self.request.user)
		organization.memberships.create(user=self.request.user, role="admin")
