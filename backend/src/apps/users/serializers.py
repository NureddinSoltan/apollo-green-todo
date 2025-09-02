from rest_framework.serializers import ModelSerializer, Serializer
from .models import User
from rest_framework import serializers
from django.contrib.auth import authenticate


class UserSerializer(ModelSerializer):
    """
    Serializer for user data in API responses.

    Exposes safe user fields (id, email, username) for profile
    display and updates while keeping sensitive data private.
    """

    class Meta:
        model = User
        fields = ("id", "email", "username")


class RegisterUserSerializer(ModelSerializer):
    """
    Serializer for user account registration.

    Handles new user creation with password validation and
    secure password handling through the UserManager.
    """

    password = serializers.CharField(
        write_only=True,
        help_text="User account password",
        style={
            "input_type": "password",
            "placeholder": "Enter password (min 8 characters)",
        },
        min_length=8,
        max_length=128,
    )

    class Meta:
        model = User
        fields = ("email", "username", "password")

    def create(self, validated_data):
        """
        Create new user with properly hashed password.

        Args:
            validated_data: Cleaned and validated user data

        Returns:
            User: The newly created user instance
        """
        user = User.objects.create_user(**validated_data)
        return user


class LoginUserSerializer(Serializer):
    """
    Serializer for user login authentication.

    Validates login credentials and authenticates users
    using Django's built-in authentication system.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate user login credentials.

        Args:
            data: Serializer data containing email and password

        Returns:
            User: Authenticated user if credentials are valid

        Raises:
            ValidationError: If credentials are invalid or user inactive
        """
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials!")
