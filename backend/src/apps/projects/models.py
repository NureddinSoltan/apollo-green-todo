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
        null=True,
        blank=True,
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
            ("in progress", "In Progress"),
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
        return self.tasks.filter(is_active=True).count()

    def get_completed_task_count(self):
        """Get the number of completed tasks in this project"""
        return self.tasks.filter(status="completed", is_active=True).count()

    def get_progress_percentage(self):
        """Calculate project progress based on completed tasks"""
        total_tasks = self.get_task_count()
        if total_tasks == 0:
            return 0

        completed_tasks = self.get_completed_task_count()
        return int((completed_tasks / total_tasks) * 100)

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
