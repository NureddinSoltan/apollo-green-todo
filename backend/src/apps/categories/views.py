from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Category
from .serializers import CategorySerializer, CategoryCreateSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations"""

    permission_classes = (IsAuthenticated,)
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Get categories for current user"""
        return Category.objects.filter(created_by=self.request.user, is_active=True)

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == "create":
            return CategoryCreateSerializer
        return CategorySerializer

    def perform_create(self, serializer):
        """Set the creator automatically"""
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        """Set the updater automatically"""
        serializer.save(updated_by=self.request.user)

    # TODO: Implement soft deletion with restore functionality
    # - Override perform_destroy to mark as inactive instead of deleting
    # - Add inactive action to list inactive categories
    # - Add restore action to reactivate categories
    # - Update get_queryset to filter by is_active=True by default
    # - Add get_object override for restore action to find inactive categories

    def perform_destroy(self, instance):
        """Delete the category permanently"""
        instance.delete()


# TODO: Future enhancements for soft deletion:
# @action(detail=False, methods=["get"])
# def inactive(self, request):
#     """Get inactive categories for the user"""
#     inactive_categories = Category.objects.filter(
#         created_by=request.user, is_active=False
#     )
#     serializer = self.get_serializer(inactive_categories, many=True)
#     return Response(serializer.data)

# @action(detail=True, methods=["post"])
# def restore(self, request, pk=None):
#     """Restore an inactive category"""
#     category = self.get_object()
#     if category.is_active:
#         return Response(
#             {"message": "Category is already active"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#     category.is_active = True
#     category.updated_by = request.user
#     category.save()
#     serializer = self.get_serializer(category)
#     return Response(serializer.data)
