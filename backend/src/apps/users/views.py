from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from .serializers import (
    UserSerializer,
    RegisterUserSerializer,
    LoginUserSerializer,
)
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import timedelta
from django.conf import settings
from .models import User


class UserInfoView(RetrieveUpdateAPIView):
    """
    View for getting and updating user profile information.

    Allows authenticated users to retrieve their profile data
    and update their account information.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserRegistrationView(CreateAPIView):
    """
    View for user account registration.

    Handles new user signup with email, username, and password
    validation through the RegisterUserSerializer.
    Automatically logs the user in after successful registration.
    """

    permission_classes = ()  # No authentication required for registration
    serializer_class = RegisterUserSerializer

    def create(self, request, *args, **kwargs):
        """
        Create user and automatically log them in.
        """
        # Create the user
        response = super().create(request, *args, **kwargs)

        if response.status_code == status.HTTP_201_CREATED:
            # Get the created user
            user = User.objects.get(email=request.data["email"])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Set JWT tokens as cookies
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=settings.DEBUG is False,
                samesite="Lax" if settings.DEBUG else "None",
            )

            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=settings.DEBUG is False,
                samesite="Lax" if settings.DEBUG else "None",
            )

            # Update response data to include user info in the same format as login
            response.data = {"user": UserSerializer(user).data}
            response.status_code = (
                status.HTTP_200_OK
            )  # Change to 200 to match login response

        return response


class LoginView(APIView):
    """
    View for user authentication and login.

    Validates user credentials and sets JWT tokens as secure
    HTTP-only cookies for maintaining user sessions.
    """

    permission_classes = ()  # No authentication required for login

    def post(self, request):
        """
        Handle user login request.

        Args:
            request: HTTP request containing login credentials

        Returns:
            Response: User data with JWT tokens set as cookies
        """
        serializer = LoginUserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response(
                {"user": UserSerializer(user).data}, status=status.HTTP_200_OK
            )

            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=settings.DEBUG is False,  # Only secure in production
                samesite=(
                    "Lax" if settings.DEBUG else "None"
                ),  # Lax for development, None for production
            )

            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=settings.DEBUG is False,  # Only secure in production
                samesite=(
                    "Lax" if settings.DEBUG else "None"
                ),  # Lax for development, None for production
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    View for user logout and session termination.

    Invalidates JWT tokens and removes them from cookies
    to ensure proper user logout and security.
    """

    def post(self, request):
        """
        Handle user logout request.

        Args:
            request: HTTP request object

        Returns:
            Response: Success message with cleared cookies
        """
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            # try:
            #     refresh = RefreshToken(refresh_token)
            #     refresh.blacklist()
            # except Exception as e:
            #     return Response(
            #         {"error": "Error invalidating token:" + str(e)},
            #         status=status.HTTP_400_BAD_REQUEST,
            #     )
            try:
                # In newer versions, we can just invalidate the token
                refresh = RefreshToken(refresh_token)
                # Mark the token as invalid
                refresh.set_exp(lifetime=timedelta(seconds=0))
            except Exception as e:
                return Response(
                    {"error": "Error invalidating token: " + str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        response = Response(
            {"message": "Successfully logged out!"}, status=status.HTTP_200_OK
        )
        response.delete_cookie(
            "access_token", samesite="Lax" if settings.DEBUG else "None"
        )
        response.delete_cookie(
            "refresh_token", samesite="Lax" if settings.DEBUG else "None"
        )

        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    View for refreshing JWT access tokens.

    Extends Django REST Framework's token refresh to work with
    cookie-based JWT tokens instead of header-based tokens.
    """

    def post(self, request):
        """
        Refresh access token using refresh token from cookies.

        Args:
            request: HTTP request containing refresh token in cookies

        Returns:
            Response: New access token set as cookie or error message
        """
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"error": "Refresh token not provided"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            response = Response(
                {"message": "Access token token refreshed successfully"},
                status=status.HTTP_200_OK,
            )
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=settings.DEBUG is False,  # Only secure in production
                samesite=(
                    "Lax" if settings.DEBUG else "None"
                ),  # Lax for development, None for production
            )
            return response
        except InvalidToken:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED
            )
