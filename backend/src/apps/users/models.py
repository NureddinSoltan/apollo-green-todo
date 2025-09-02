from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
    AbstractUser,
)
from base.models import TrackableModel
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user manager for User model.
    Purpose: To handle user and superuser creation and management.
    How it works: It overrides the create_user and create_superuser methods to set the email as the unique identifier for users.
    """

    def create_user(self, email, username=None, password=None, **extra_fields):
        """Create and return a user with an email, username, password, role and any additional fields."""
        if not email:
            raise ValueError("Email is required.")
        if not username:
            raise ValueError("Username is required.")
        email = self.normalize_email(email)
        user = self.model(
            email=email, username=username, **extra_fields
        )  # Create user instance
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username=None, password=None, **extra_fields):
        """
        Create a superuser with admin privileges.

        Args:
            email: Superuser's email address
            username: Superuser's username
            password: Superuser's password
            **extra_fields: Additional superuser fields

        Returns:
            User: The created superuser instance
        """
        extra_fields.setdefault("system_role", "root")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TrackableModel):
    """
    Custom user model for the todo application.

    Extends Django's user system with email-based authentication,
    role-based permissions, and audit trail capabilities.
    """

    SYSTEM_ROLE_CHOICES = [
        ("root", "Root"),  # System owner
        ("superuser", "Superuser"),  # full access per hospital
        ("none", "None"),  # default
    ]
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    system_role = models.CharField(
        max_length=20, choices=SYSTEM_ROLE_CHOICES, default="none"
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.email}) - {self.system_role}"

    class Meta:
        app_label = "users"
