from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal
from projects.models import Project
from categories.models import Category
from .models import Task

User = get_user_model()


class TaskModelTest(TestCase):
    """Test Task model functionality"""

    def setUp(self):
        """Create test user, category, project and task"""
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.category = Category.objects.create(
            name="Work",
            description="Work-related tasks",
            color="#FF0000",
            created_by=self.user,
        )
        self.project = Project.objects.create(
            name="Test Project",
            description="A test project",
            category=self.category,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            priority="high",
            status="active",
            created_by=self.user,
        )
        self.task = Task.objects.create(
            name="Test Task",
            description="A test task",
            project=self.project,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=7),
            priority="medium",
            status="todo",
            estimated_hours=Decimal("8.00"),
            progress=0,
            created_by=self.user,
        )

    def test_task_creation(self):
        """Test that task is created correctly"""
        self.assertEqual(self.task.name, "Test Task")
        self.assertEqual(self.task.project, self.project)
        self.assertEqual(self.task.created_by, self.user)
        self.assertEqual(self.task.priority, "medium")
        self.assertEqual(self.task.status, "todo")
        self.assertEqual(self.task.progress, 0)
        self.assertTrue(self.task.is_active)

    def test_task_str(self):
        """Test string representation"""
        self.assertEqual(str(self.task), "Test Task - Test Project")

    def test_unique_name_per_project(self):
        """Test that task names are unique per project"""
        # Count tasks before trying to create duplicate
        initial_count = Task.objects.filter(project=self.project).count()

        # Try to create same name in same project - should not be created
        try:
            duplicate_task = Task.objects.create(
                name="Test Task",
                project=self.project,
                created_by=self.user,
            )
            # If we get here, the constraint failed
            self.fail("Unique constraint should have prevented duplicate task creation")
        except IntegrityError:
            # This is expected - constraint worked
            pass

        # Verify no additional task was created
        final_count = Task.objects.filter(project=self.project).count()
        self.assertEqual(final_count, initial_count)

        # Same name, different project should work
        other_project = Project.objects.create(
            name="Other Project",
            category=self.category,
            created_by=self.user,
        )
        other_task = Task.objects.create(
            name="Test Task",
            project=other_project,
            created_by=self.user,
        )
        self.assertEqual(other_task.name, "Test Task")

    def test_is_overdue(self):
        """Test overdue task detection"""
        # Task with future due date should not be overdue
        self.assertFalse(self.task.is_overdue())

        # Task with past due date should be overdue
        overdue_task = Task.objects.create(
            name="Overdue Task 1",
            project=self.project,
            due_date=date.today() - timedelta(days=1),
            status="in_progress",
            created_by=self.user,
        )
        self.assertTrue(overdue_task.is_overdue())

        # Completed task should not be overdue
        overdue_task.status = "completed"
        overdue_task.save()
        self.assertFalse(overdue_task.is_overdue())

    def test_days_until_due(self):
        """Test days until due calculation"""
        # Task with future due date
        days_until = self.task.days_until_due()
        self.assertIsNotNone(days_until)
        self.assertGreater(days_until, 0)

        # Task with past due date
        overdue_task = Task.objects.create(
            name="Overdue Task 2",
            project=self.project,
            due_date=date.today() - timedelta(days=1),
            status="in_progress",
            created_by=self.user,
        )
        days_until = overdue_task.days_until_due()
        self.assertIsNotNone(days_until)
        self.assertLess(days_until, 0)

        # Task without due date
        no_due_date_task = Task.objects.create(
            name="No Due Date Task 1",
            project=self.project,
            created_by=self.user,
        )
        self.assertIsNone(no_due_date_task.days_until_due())

    def test_get_completion_status(self):
        """Test completion status calculation"""
        self.assertEqual(self.task.get_completion_status(), "Not Started")

        # Test different progress levels
        self.task.progress = 25
        self.assertEqual(self.task.get_completion_status(), "Just Started")

        self.task.progress = 50
        self.assertEqual(self.task.get_completion_status(), "In Progress")

        self.task.progress = 75
        self.assertEqual(self.task.get_completion_status(), "Almost Done")

        self.task.progress = 100
        self.assertEqual(self.task.get_completion_status(), "Completed")

    def test_auto_progress_update(self):
        """Test automatic progress update based on status"""
        # Status change to completed should set progress to 100
        self.task.status = "completed"
        self.task.save()
        self.assertEqual(self.task.progress, 100)

        # Status change to cancelled should set progress to 0
        self.task.status = "cancelled"
        self.task.save()
        self.assertEqual(self.task.progress, 0)


class TaskViewSetTest(APITestCase):
    """Test Task ViewSet API endpoints"""

    def setUp(self):
        """Create test user, category, project and authenticate"""
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.category = Category.objects.create(
            name="Work",
            description="Work-related tasks",
            color="#FF0000",
            created_by=self.user,
        )
        self.project = Project.objects.create(
            name="Test Project",
            description="A test project",
            category=self.category,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            priority="high",
            status="active",
            created_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

        # Create a fresh task for each test
        self.task = Task.objects.create(
            name="Test Task",
            description="A test task",
            project=self.project,
            start_date=date.today(),
            due_date=date.today() + timedelta(days=7),
            priority="medium",
            status="todo",
            estimated_hours=Decimal("8.00"),
            progress=0,
            created_by=self.user,
        )

    def tearDown(self):
        """Clean up after each test"""
        # Django test framework handles cleanup automatically
        # No need for manual cleanup
        pass

    def test_list_tasks(self):
        """Test listing tasks"""
        url = reverse("tasks:task-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle pagination - DRF wraps data in 'results' when pagination is enabled
        data = response.data.get("results", response.data)

        # Should have at least our test task
        self.assertGreaterEqual(len(data), 1)

        # Find our specific test task
        test_task = next((t for t in data if t["name"] == "Test Task"), None)
        self.assertIsNotNone(test_task)
        self.assertEqual(test_task["name"], "Test Task")

    def test_create_task(self):
        """Test creating a new task"""
        url = reverse("tasks:task-list")
        data = {
            "name": "New Task",
            "description": "A new task",
            "project": self.project.id,
            "priority": "high",
            "status": "todo",
            "estimated_hours": "4.00",
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Task")
        self.assertEqual(response.data["priority"], "high")

        # Verify task was created in database
        task_count = Task.objects.filter(project__created_by=self.user).count()
        self.assertGreaterEqual(task_count, 2)

    def test_retrieve_task(self):
        """Test retrieving a specific task"""
        url = reverse("tasks:task-detail", args=[self.task.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Task")
        self.assertEqual(response.data["project_details"]["name"], "Test Project")

    def test_update_task(self):
        """Test updating a task"""
        url = reverse("tasks:task-detail", args=[self.task.id])
        data = {"name": "Updated Task", "priority": "urgent"}

        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Task")
        self.assertEqual(response.data["priority"], "urgent")

    def test_delete_task(self):
        """Test deleting a task"""
        url = reverse("tasks:task-detail", args=[self.task.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Task should be completely deleted
        self.assertLess(Task.objects.filter(project__created_by=self.user).count(), 1)

    def test_create_task_validation(self):
        """Test task creation validation"""
        url = reverse("tasks:task-list")

        # Test duplicate name in same project
        data = {
            "name": "Test Task",  # Same name as existing task
            "project": self.project.id,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test invalid project
        data = {
            "name": "Valid Task",
            "project": 99999,  # Non-existent project
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test invalid dates
        data = {
            "name": "Valid Task",
            "project": self.project.id,
            "start_date": date.today() + timedelta(days=10),
            "due_date": date.today(),
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_task_user_isolation(self):
        """Test that users can only see tasks from their own projects"""
        # Create another user with their own project and task
        other_user = User.objects.create_user(
            email="other@example.com", username="otheruser", password="testpass123"
        )
        other_category = Category.objects.create(
            name="Other Category",
            created_by=other_user,
        )
        other_project = Project.objects.create(
            name="Other Project",
            category=other_category,
            created_by=other_user,
        )
        other_task = Task.objects.create(
            name="Other Task",
            project=other_project,
            created_by=other_user,
        )

        # Current user should not see other user's task
        url = reverse("tasks:task-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle pagination - DRF wraps data in 'results' when pagination is enabled
        data = response.data.get("results", response.data)

        # Should only see their own task
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Test Task")


class TaskUniqueConstraintTest(TestCase):
    """Separate test class for unique constraint to avoid transaction issues"""

    def test_unique_name_per_project_constraint(self):
        """Test unique constraint in isolation"""
        # Create first user, category, project and task
        user1 = User.objects.create_user(
            email="user1@example.com", username="user1", password="testpass123"
        )
        category1 = Category.objects.create(name="Category 1", created_by=user1)
        project1 = Project.objects.create(
            name="Project 1", category=category1, created_by=user1
        )
        task1 = Task.objects.create(
            name="Test Task", project=project1, created_by=user1
        )

        # Create second user with same task name in different project (should work)
        user2 = User.objects.create_user(
            email="user2@example.com", username="user2", password="testpass123"
        )
        category2 = Category.objects.create(name="Category 2", created_by=user2)
        project2 = Project.objects.create(
            name="Project 2", category=category2, created_by=user2
        )
        task2 = Task.objects.create(
            name="Test Task", project=project2, created_by=user2
        )

        # Try to create duplicate for same project (should fail)
        initial_count = Task.objects.filter(project=project1).count()
        try:
            Task.objects.create(name="Test Task", project=project1, created_by=user1)
            # If we get here, the constraint failed
            self.fail("Unique constraint should have prevented duplicate task creation")
        except IntegrityError:
            # This is expected - constraint worked
            pass

        # Verify the constraint works
        final_count = Task.objects.filter(project=project1).count()
        self.assertEqual(final_count, initial_count)
        self.assertEqual(Task.objects.filter(project=project2).count(), 1)
