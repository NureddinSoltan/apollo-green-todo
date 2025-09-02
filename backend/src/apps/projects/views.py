from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from categories.models import Category
from tasks.models import Task


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Project model with CRUD operations"""

    serializer_class = ProjectSerializer

    def get_queryset(self):
        """Return projects for the authenticated user"""
        return (
            Project.objects.filter(created_by=self.request.user, is_active=True)
            .select_related("category", "created_by", "updated_by")
            .prefetch_related("tasks")
        )

    def get_serializer(self, *args, **kwargs):
        """Get serializer with user-specific category queryset"""
        serializer = super().get_serializer(*args, **kwargs)

        # Set the category queryset to only show user's categories
        if hasattr(serializer, "fields") and "category" in serializer.fields:
            serializer.fields["category"].queryset = Category.objects.filter(
                created_by=self.request.user, is_active=True
            )

        return serializer

    def perform_create(self, serializer):
        """Set created_by and updated_by automatically"""
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        """Set updated_by automatically"""
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """Get dashboard overview with project and task counts"""
        user = request.user

        # Project counts
        total_projects = Project.objects.filter(created_by=user, is_active=True).count()
        active_projects = Project.objects.filter(
            created_by=user, status="active", is_active=True
        ).count()
        completed_projects = Project.objects.filter(
            created_by=user, status="completed", is_active=True
        ).count()

        # Task counts
        total_tasks = Task.objects.filter(
            project__created_by=user, is_active=True
        ).count()
        completed_tasks = Task.objects.filter(
            project__created_by=user, status="completed", is_active=True
        ).count()
        todo_tasks = Task.objects.filter(
            project__created_by=user, status="todo", is_active=True
        ).count()
        in_progress_tasks = Task.objects.filter(
            project__created_by=user, status="in_progress", is_active=True
        ).count()

        # Category counts
        total_categories = Category.objects.filter(
            created_by=user, is_active=True
        ).count()

        dashboard_data = {
            "projects": {
                "total": total_projects,
                "active": active_projects,
                "completed": completed_projects,
            },
            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "todo": todo_tasks,
                "in_progress": in_progress_tasks,
            },
            "categories": {
                "total": total_categories,
            },
        }

        return Response(dashboard_data)
