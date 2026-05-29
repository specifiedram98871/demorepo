from django.urls import include, path
from rest_framework.routers import DefaultRouter

from issues.views import IssueCommentViewSet, IssueShareView, IssueViewSet
from projects.views import ProjectViewSet
from users.views import AuthViewSet, UserViewSet
from workspaces.views import OrganizationViewSet

router = DefaultRouter()
router.register("auth", AuthViewSet, basename="auth")
router.register("users", UserViewSet, basename="users")
router.register("organizations", OrganizationViewSet, basename="organizations")
router.register("projects", ProjectViewSet, basename="projects")
router.register("issues", IssueViewSet, basename="issues")
router.register("issue-comments", IssueCommentViewSet, basename="issue-comments")

urlpatterns = [
    path("", include(router.urls)),
    path("share/<uuid:slug>/", IssueShareView.as_view(), name="issue-share"),
]
