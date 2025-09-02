from rest_framework.serializers import ModelSerializer, Serializer
from .models import User
from rest_framework import serializers
from django.contrib.auth import authenticate


class UserSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = ("id", "email", "username")


class RegisterUserSerializer(ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        help_text="User account password",
        style={
            "input_type": "password",  # Shows as password field in browsable API
            "placeholder": "Enter password (min 8 characters)",
        },
        min_length=8,
        max_length=128,
    )

    class Meta:
        model = User
        fields = ("email", "username", "password")

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginUserSerializer(Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials!")
