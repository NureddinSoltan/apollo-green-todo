from django.shortcuts import render
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from projects.models import Project


# Create your views here.


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task model with CRUD operations"""

    serializer_class = TaskSerializer

    def get_queryset(self):
        """Return tasks for the authenticated user's projects"""
        return Task.objects.filter(
            project__created_by=self.request.user, is_active=True
        ).select_related("project", "created_by", "updated_by")

    def get_serializer(self, *args, **kwargs):
        """Get serializer with user-specific project queryset"""
        serializer = super().get_serializer(*args, **kwargs)

        # Set the project queryset to only show user's projects
        if hasattr(serializer, "fields") and "project" in serializer.fields:
            serializer.fields["project"].queryset = Project.objects.filter(
                created_by=self.request.user, is_active=True
            )

        return serializer

    def perform_create(self, serializer):
        """Set created_by and updated_by automatically"""
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        """Set updated_by automatically"""
        serializer.save(updated_by=self.request.user)
