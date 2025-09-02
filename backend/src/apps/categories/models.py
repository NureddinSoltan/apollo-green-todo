from django.db import models
from base.models import TrackableModel


class Category(TrackableModel):
    """
    Provides a way to group related projects and tasks together.
    Inherits from TrackableModel for audit trail and timestamps.
    """

    name = models.CharField(
        max_length=100, help_text="Category name (e.g., Work, Personal, Shopping)"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of what this category is for",
    )
    color = models.CharField(
        max_length=7,
        default="#3B82F6",  # Default blue color
        help_text="Hex color code for category identification",
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether this category is active and can be used"
    )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]
        unique_together = ["name", "created_by"]

    def __str__(self):
        return self.name

    def get_task_count(self):
        """
        Get the total number of tasks in this category.

        Returns:
            int: Number of tasks in this category
        """
        # TODO: Implement when Task model is created
        # return self.tasks.count()
        return 0

    def get_project_count(self):
        """
        Get the total number of projects in this category.

        Returns:
            int: Number of projects in this category
        """
        # TODO: Implement when Project model is created
        # return self.projects.count()
        return 0
