from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""

    task_count = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "description",
            "color",
            "is_active",
            "task_count",
            "project_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "task_count",
            "project_count",
        )

    def get_task_count(self, obj):
        """Get count of tasks in this category"""
        return obj.get_task_count()

    def get_project_count(self, obj):
        """Get count of projects in this category"""
        return obj.get_project_count()


class CategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new categories"""

    class Meta:
        model = Category
        fields = ("name", "description", "color")

    def validate_name(self, value):
        """Ensure category name is unique per user"""
        user = self.context["request"].user
        if Category.objects.filter(name=value, created_by=user).exists():
            raise serializers.ValidationError(
                "You already have a category with this name."
            )
        return value
