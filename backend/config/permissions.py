from rest_framework.permissions import BasePermission

from users.models import User


class IsAdminRole(BasePermission):
    """Allow access only to users with the application admin role."""

    message = "Admin role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == User.Role.ADMIN)