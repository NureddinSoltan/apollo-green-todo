from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Provides organized views for user management including permissions,
    system roles, and account status. Inherits from UserAdmin for
    consistency with Django's built-in user management.
    """

    list_display = (
        "email",
        "username",
        "system_role",
        "is_active",
        "is_staff",
        "is_superuser",
    )
    list_filter = ("system_role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username")
    ordering = ("email",)
    readonly_fields = ("date_joined", "last_login")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "system_role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important dates",
            {"fields": ("last_login", "date_joined"), "classes": ("collapse",)},
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "system_role",
                ),
            },
        ),
    )
