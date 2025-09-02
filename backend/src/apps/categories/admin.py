from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model"""

    list_display = ("name", "color", "is_active", "created_by", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")

    fieldsets = (
        (None, {"fields": ("name", "description", "color", "is_active")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
        ("Audit", {"fields": ("created_by", "updated_by"), "classes": ("collapse",)}),
    )

    def save_model(self, request, obj, form, change):
        """Set created_by/updated_by automatically"""
        if not change:  # Creating new object
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
