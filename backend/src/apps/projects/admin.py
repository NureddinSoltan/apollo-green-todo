from django.contrib import admin
from django.utils.html import format_html
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model"""

    list_display = [
        "name",
        "category",
        "colored_status",
        "colored_priority",
        "task_count",
        "progress_percentage",
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

    def colored_status(self, obj):
        """Display status with color coding"""
        colors = {
            "planning": "#FFA500",  # Orange
            "active": "#008000",  # Green
            "on_hold": "#FFD700",  # Gold
            "completed": "#0000FF",  # Blue
            "cancelled": "#FF0000",  # Red
        }
        color = colors.get(obj.status, "#000000")
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display(),
        )

    colored_status.short_description = "Status"

    def colored_priority(self, obj):
        """Display priority with color coding"""
        colors = {
            "low": "#28a745",  # Green
            "medium": "#ffc107",  # Yellow
            "high": "#fd7e14",  # Orange
            "urgent": "#dc3545",  # Red
        }
        color = colors.get(obj.priority, "#000000")
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display(),
        )

    colored_priority.short_description = "Priority"

    def task_count(self, obj):
        """Display total task count"""
        count = obj.get_task_count()
        return format_html('<span style="font-weight: bold;">{}</span>', count)

    task_count.short_description = "Tasks"

    def progress_percentage(self, obj):
        """Display progress as colored percentage"""
        percentage = obj.get_progress_percentage()

        if percentage >= 80:
            color = "#28a745"  # Green
        elif percentage >= 60:
            color = "#ffc107"  # Yellow
        elif percentage >= 40:
            color = "#fd7e14"  # Orange
        else:
            color = "#dc3545"  # Red

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>', color, percentage
        )

    progress_percentage.short_description = "Progress"
