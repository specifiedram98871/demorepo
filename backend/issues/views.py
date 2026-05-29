from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from config.permissions import IsAdminRole
from issues.models import Issue, IssueComment
from issues.serializers import IssueCommentSerializer, IssueSerializer
from issues.services import IssueService

UserModel = get_user_model()


class IssueViewSet(viewsets.ModelViewSet):
	serializer_class = IssueSerializer
	permission_classes = [permissions.IsAuthenticated]
	queryset = (
		Issue.objects.select_related("project", "assignee", "reporter")
		.prefetch_related("comments", "activities")
		.all()
	)
	filterset_fields = ["project", "priority", "status", "platform_type", "mobile_subtype", "assignee"]
	search_fields = ["title", "description", "key"]
	ordering_fields = ["created_at", "updated_at", "priority", "due_date"]

	def get_queryset(self):
		base = super().get_queryset()
		if IsAdminRole().has_permission(self.request, self):
			return base
		return base.filter(assignee=self.request.user)

	def perform_create(self, serializer):
		if not IsAdminRole().has_permission(self.request, self):
			raise PermissionDenied("Only admins can create issues.")
		issue = IssueService.create_issue(serializer.validated_data, reporter=self.request.user)
		serializer.instance = issue

	def perform_update(self, serializer):
		if not IsAdminRole().has_permission(self.request, self):
			raise PermissionDenied("Only admins can edit ticket details.")
		serializer.save()

	def perform_destroy(self, instance):
		if not IsAdminRole().has_permission(self.request, self):
			raise PermissionDenied("Only admins can delete issues.")
		instance.delete()

	@action(detail=True, methods=["post"], url_path="transition")
	def transition(self, request, pk=None):
		issue = self.get_object()
		new_status = request.data.get("status")
		if new_status not in Issue.Status.values:
			return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
		issue = IssueService.transition_issue(issue, new_status, request.user)
		return Response(self.get_serializer(issue).data)

	@action(detail=True, methods=["post"], url_path="assign")
	def assign(self, request, pk=None):
		if not IsAdminRole().has_permission(request, self):
			raise PermissionDenied("Only admins can assign tickets.")

		issue = self.get_object()
		assignee_id = request.data.get("assignee")
		assignee = None
		if assignee_id is not None:
			try:
				assignee = UserModel.objects.get(pk=assignee_id)
			except UserModel.DoesNotExist:
				return Response({"detail": "Assignee not found"}, status=status.HTTP_404_NOT_FOUND)

		issue = IssueService.assign_issue(issue, assignee, request.user)
		return Response(self.get_serializer(issue).data)


class IssueCommentViewSet(viewsets.ModelViewSet):
	serializer_class = IssueCommentSerializer
	permission_classes = [permissions.IsAuthenticated]
	queryset = IssueComment.objects.select_related("issue", "author").all().order_by("created_at")
	filterset_fields = ["issue"]

	def get_queryset(self):
		base = super().get_queryset()
		if IsAdminRole().has_permission(self.request, self):
			return base
		return base.filter(issue__assignee=self.request.user)

	def perform_create(self, serializer):
		if not IsAdminRole().has_permission(self.request, self):
			issue_id = serializer.validated_data["issue"].id
			if not Issue.objects.filter(id=issue_id, assignee=self.request.user).exists():
				raise PermissionDenied("You can only comment on tickets assigned to you.")
		serializer.save(author=self.request.user)


class IssueShareView(RetrieveAPIView):
	serializer_class = IssueSerializer
	permission_classes = [permissions.AllowAny]
	lookup_field = "share_slug"
	queryset = Issue.objects.filter(is_share_public=True).select_related("project", "assignee", "reporter")
