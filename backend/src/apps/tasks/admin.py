from django.contrib import admin
from django.utils.html import format_html
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin interface for Task model"""

    list_display = [
        "name",
        "project",
        "status",
        "priority",
        "progress_bar",
        "due_date",
        "created_by",
        "is_active",
    ]
    list_filter = [
        "status",
        "priority",
        "is_active",
        "project",
        "created_at",
        "due_date",
    ]
    search_fields = ["name", "description", "project__name"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at", "created_by", "updated_by"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "description", "project", "is_active")},
        ),
        ("Timing", {"fields": ("start_date", "due_date")}),
        ("Status & Progress", {"fields": ("status", "priority", "progress")}),
        ("Time Tracking", {"fields": ("estimated_hours", "actual_hours")}),
        (
            "Audit Information",
            {
                "fields": ("created_at", "updated_at", "created_by", "updated_by"),
                "classes": ("collapse",),
            },
        ),
    )

    def progress_bar(self, obj):
        """Display progress as a visual bar"""
        if obj.progress is None:
            return "N/A"

        color = (
            "green" if obj.progress >= 75 else "orange" if obj.progress >= 50 else "red"
        )
        return format_html(
            '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">'
            '<div style="width: {}%; height: 20px; background-color: {}; border-radius: 3px; '
            "display: flex; align-items: center; justify-content: center; color: white; "
            'font-size: 12px; font-weight: bold;">{}%</div></div>',
            obj.progress,
            color,
            obj.progress,
        )

    progress_bar.short_description = "Progress"

    def save_model(self, request, obj, form, change):
        """Set created_by and updated_by automatically"""
        if not change:  # Creating new task
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return (
            super()
            .get_queryset(request)
            .select_related("project", "created_by", "updated_by")
        )
