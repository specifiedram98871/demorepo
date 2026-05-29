from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from config.permissions import IsAdminRole
from projects.models import Project
from projects.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
	serializer_class = ProjectSerializer
	permission_classes = [permissions.IsAuthenticated]
	queryset = Project.objects.select_related("organization", "created_by").all().order_by("name")

	def get_queryset(self):
		base = super().get_queryset()
		if IsAdminRole().has_permission(self.request, self):
			return base
		return base.filter(issues__assignee=self.request.user).distinct()

	def _ensure_admin(self):
		if not IsAdminRole().has_permission(self.request, self):
			raise PermissionDenied("Only admins can manage projects.")

	def perform_create(self, serializer):
		self._ensure_admin()
		serializer.save(created_by=self.request.user)

	def perform_update(self, serializer):
		self._ensure_admin()
		serializer.save()

	def perform_destroy(self, instance):
		self._ensure_admin()
		instance.delete()
