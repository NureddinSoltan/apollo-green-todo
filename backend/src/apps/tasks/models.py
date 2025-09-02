from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from base.models import TrackableModel
from projects.models import Project


class Task(TrackableModel):
    """Task model for managing individual tasks within projects"""

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("review", "Review"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    name = models.CharField(max_length=200, help_text="Task name")
    description = models.TextField(blank=True, help_text="Task description")
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
        help_text="Project this task belongs to",
    )
    start_date = models.DateField(null=True, blank=True, help_text="Task start date")
    due_date = models.DateField(null=True, blank=True, help_text="Task due date")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="medium",
        help_text="Task priority level",
    )
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="todo",
        help_text="Current task status",
    )
    estimated_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.01), MaxValueValidator(999.99)],
        help_text="Estimated hours to complete the task",
    )
    actual_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(999.99)],
        help_text="Actual hours spent on the task",
    )
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Task completion percentage (0-100)",
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether the task is active"
    )

    class Meta:
        """Meta options for Task model"""

        ordering = ["-created_at"]
        unique_together = ["name", "project", "created_by"]
        verbose_name = "Task"
        verbose_name_plural = "Tasks"

    def __str__(self):
        """String representation of the task"""
        return f"{self.name} - {self.project.name}"

    def is_overdue(self):
        """Check if the task is overdue"""
        if not self.due_date or self.status in ["completed", "cancelled"]:
            return False
        from django.utils import timezone

        return self.due_date < timezone.now().date()

    def days_until_due(self):
        """Calculate days until due date"""
        if not self.due_date:
            return None
        from django.utils import timezone
        from datetime import date

        today = timezone.now().date()
        delta = self.due_date - today
        return delta.days

    def get_completion_status(self):
        """Get human-readable completion status"""
        if self.progress == 0:
            return "Not Started"
        elif self.progress <= 25:
            return "Just Started"
        elif self.progress <= 50:
            return "In Progress"
        elif self.progress <= 75:
            return "Almost Done"
        elif self.progress < 100:
            return "Nearly Complete"
        else:
            return "Completed"

    def save(self, *args, **kwargs):
        """Override save to auto-update progress based on status"""
        if self.status == "completed":
            self.progress = 100
        elif self.status == "cancelled":
            self.progress = 0
        super().save(*args, **kwargs)
