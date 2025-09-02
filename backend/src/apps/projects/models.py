from django.db import models
from django.core.validators import MinLengthValidator
from base.models import TrackableModel
from categories.models import Category


class Project(TrackableModel):
    """Project model for organizing tasks and categories"""

    name = models.CharField(
        max_length=100,
    )
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.CASCADE,
        related_name="projects",
        help_text="Category this project belongs to",
    )
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=[
            ("low", "Low"),
            ("medium", "Medium"),
            ("high", "High"),
            ("urgent", "Urgent"),
        ],
        default="medium",
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("planning", "Planning"),
            ("active", "Active"),
            ("on_hold", "On Hold"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ],
        default="planning",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "projects_project"
        ordering = ["-created_at"]
        unique_together = ["name", "created_by"]
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        """String representation of the project"""
        return self.name

    def get_task_count(self):
        """Get the total number of tasks in this project"""
        # TODO: Implement when Task model is created
        return 0

    def get_completed_task_count(self):
        """Get the number of completed tasks in this project"""
        # TODO: Implement when Task model is created
        return 0

    def get_progress_percentage(self):
        """Calculate project progress based on completed tasks"""
        # TODO: Implement when Task model is created
        return 0

    def is_overdue(self):
        """Check if project is overdue"""
        if self.due_date and self.status not in ["completed", "cancelled"]:
            from django.utils import timezone

            return timezone.now().date() > self.due_date
        return False

    def days_until_due(self):
        """Calculate days until project is due"""
        if self.due_date and self.status not in ["completed", "cancelled"]:
            from django.utils import timezone

            delta = self.due_date - timezone.now().date()
            return delta.days
        return None
