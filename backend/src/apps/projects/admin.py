from django.contrib import admin
from django.utils.html import format_html
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model"""

    list_display = [
        "name",
        "category",
        "status",
        "priority",
        "created_by",
        "start_date",
        "due_date",
        "is_active",
        "created_at",
    ]
    list_filter = [
        "status",
        "priority",
        "category",
        "is_active",
        "start_date",
        "due_date",
        "created_at",
    ]
    search_fields = ["name", "description", "created_by__username", "created_by__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at", "created_by", "updated_by"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "description", "category", "is_active")},
        ),
        ("Timeline", {"fields": ("start_date", "due_date")}),
        ("Status & Priority", {"fields": ("status", "priority")}),
        (
            "Audit Information",
            {
                "fields": ("created_at", "updated_at", "created_by", "updated_by"),
                "classes": ("collapse",),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        """Override save to automatically set created_by/updated_by"""
        if not change:  # Creating new object
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Custom queryset with related fields"""
        return (
            super()
            .get_queryset(request)
            .select_related("category", "created_by", "updated_by")
        )