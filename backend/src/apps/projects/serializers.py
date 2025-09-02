from rest_framework import serializers
from .models import Project
from categories.models import Category
from categories.serializers import CategorySerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model with computed fields"""

    # Write-only field for category ID during creation/update
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),  # Will be set dynamically in views
        write_only=True,
        help_text="Category this project belongs to",
    )

    # Read-only field to show category details in responses
    category_details = CategorySerializer(source="category", read_only=True)

    # Computed fields
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()

    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "category",
            "category_details",
            "start_date",
            "due_date",
            "priority",
            "status",
            "is_active",
            "task_count",
            "completed_task_count",
            "progress_percentage",
            "is_overdue",
            "days_until_due",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def validate(self, data):
        """Validate project data"""
        # Check if start_date is after due_date
        start_date = data.get("start_date")
        due_date = data.get("due_date")

        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError("Start date cannot be after due date.")

        return data

    def get_task_count(self, obj):
        """Get total task count"""
        return obj.get_task_count()

    def get_completed_task_count(self, obj):
        """Get completed task count"""
        return obj.get_completed_task_count()

    def get_progress_percentage(self, obj):
        """Get progress percentage"""
        return obj.get_progress_percentage()

    def get_is_overdue(self, obj):
        """Get overdue status"""
        return obj.is_overdue()

    def get_days_until_due(self, obj):
        """Get days until due"""
        return obj.days_until_due()
