from rest_framework import serializers
from .models import Task
from projects.serializers import ProjectSerializer


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""

    project_details = ProjectSerializer(source="project", read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    completion_status = serializers.SerializerMethodField()

    class Meta:
        """Meta options for TaskSerializer"""

        model = Task
        fields = [
            "id",
            "name",
            "description",
            "project",
            "project_details",
            "start_date",
            "due_date",
            "priority",
            "status",
            "estimated_hours",
            "actual_hours",
            "progress",
            "is_active",
            "is_overdue",
            "days_until_due",
            "completion_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "is_overdue",
            "days_until_due",
            "completion_status",
        ]

    def get_is_overdue(self, obj):
        """Get overdue status"""
        return obj.is_overdue()

    def get_days_until_due(self, obj):
        """Get days until due"""
        return obj.days_until_due()

    def get_completion_status(self, obj):
        """Get completion status"""
        return obj.get_completion_status()

    def validate(self, data):
        """Validate task data"""
        # Validate dates
        start_date = data.get("start_date")
        due_date = data.get("due_date")

        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError("Start date cannot be after due date")

        # Validate progress
        progress = data.get("progress", 0)
        if progress < 0 or progress > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")

        # Validate hours
        estimated_hours = data.get("estimated_hours")
        actual_hours = data.get("actual_hours")

        if estimated_hours and estimated_hours <= 0:
            raise serializers.ValidationError("Estimated hours must be greater than 0")

        if actual_hours and actual_hours < 0:
            raise serializers.ValidationError("Actual hours cannot be negative")

        return data

    def validate_project(self, value):
        """Validate that the project belongs to the current user"""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            if value.created_by != request.user:
                raise serializers.ValidationError(
                    "You can only create tasks for your own projects"
                )
        return value
