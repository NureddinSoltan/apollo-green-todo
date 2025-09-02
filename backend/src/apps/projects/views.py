from rest_framework import viewsets
from .models import Project
from .serializers import ProjectSerializer
from categories.models import Category


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Project model with CRUD operations"""

    serializer_class = ProjectSerializer

    def get_queryset(self):
        """Return projects for the authenticated user"""
        return Project.objects.filter(
            created_by=self.request.user, is_active=True
        ).select_related("category", "created_by", "updated_by")

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
