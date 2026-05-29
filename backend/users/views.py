from django.contrib.auth import get_user_model
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers import SignUpSerializer, UserSerializer

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
	permission_classes = [AllowAny]

	@action(detail=False, methods=["post"], url_path="signup")
	def signup(self, request):
		serializer = SignUpSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()

		token_serializer = TokenObtainPairSerializer(
			data={"username": user.username, "password": request.data.get("password")}
		)
		token_serializer.is_valid(raise_exception=True)
		return Response(
			{"user": UserSerializer(user).data, "tokens": token_serializer.validated_data},
			status=status.HTTP_201_CREATED,
		)

	@action(detail=False, methods=["post"], url_path="login")
	def login(self, request):
		serializer = TokenObtainPairSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = User.objects.get(username=request.data.get("username"))
		return Response({"user": UserSerializer(user).data, "tokens": serializer.validated_data})

	@action(detail=False, methods=["post"], url_path="refresh")
	def refresh(self, request):
		serializer = TokenRefreshSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		return Response(serializer.validated_data)

	@action(detail=False, methods=["post"], url_path="logout")
	def logout(self, request):
		refresh = request.data.get("refresh")
		if refresh:
			token = RefreshToken(refresh)
			token.blacklist()
		return Response(status=status.HTTP_204_NO_CONTENT)


class UserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
	queryset = User.objects.all().order_by("username")
	serializer_class = UserSerializer

	@action(detail=False, methods=["get"], url_path="me")
	def me(self, request):
		return Response(UserSerializer(request.user).data)
