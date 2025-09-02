from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from categories.models import Category
from .models import Project

User = get_user_model()


class ProjectModelTest(TestCase):
    """Test Project model functionality"""

    def setUp(self):
        """Create test user, category and project"""
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

    def test_project_creation(self):
        """Test that project is created correctly"""
        self.assertEqual(self.project.name, "Test Project")
        self.assertEqual(self.project.category, self.category)
        self.assertEqual(self.project.created_by, self.user)
        self.assertEqual(self.project.priority, "high")
        self.assertEqual(self.project.status, "active")
        self.assertTrue(self.project.is_active)

    def test_project_str(self):
        """Test string representation"""
        self.assertEqual(str(self.project), "Test Project")

    def test_unique_name_per_user(self):
        """Test that project names are unique per user"""
        # Same name, same user should fail
        with self.assertRaises(IntegrityError):
            Project.objects.create(
                name="Test Project",
                category=self.category,
                created_by=self.user,
            )

        # Same name, different user should work
        other_user = User.objects.create_user(
            email="other@example.com", username="otheruser", password="testpass123"
        )
        other_category = Category.objects.create(
            name="Other Category", created_by=other_user
        )
        other_project = Project.objects.create(
            name="Test Project",
            category=other_category,
            created_by=other_user,
        )
        self.assertEqual(other_project.name, "Test Project")

    def test_is_overdue(self):
        """Test overdue project detection"""
        # Project with future due date should not be overdue
        self.assertFalse(self.project.is_overdue())

        # Project with past due date should be overdue
        overdue_project = Project.objects.create(
            name="Overdue Project",
            category=self.category,
            due_date=date.today() - timedelta(days=1),
            status="active",
            created_by=self.user,
        )
        self.assertTrue(overdue_project.is_overdue())

        # Completed project should not be overdue
        overdue_project.status = "completed"
        overdue_project.save()
        self.assertFalse(overdue_project.is_overdue())

    def test_days_until_due(self):
        """Test days until due calculation"""
        # Project with future due date
        days_until = self.project.days_until_due()
        self.assertIsNotNone(days_until)
        self.assertGreater(days_until, 0)

        # Project with past due date
        overdue_project = Project.objects.create(
            name="Overdue Project",
            category=self.category,
            due_date=date.today() - timedelta(days=1),
            status="active",
            created_by=self.user,
        )
        days_until = overdue_project.days_until_due()
        self.assertIsNotNone(days_until)
        self.assertLess(days_until, 0)

        # Project without due date
        no_due_date_project = Project.objects.create(
            name="No Due Date Project",
            category=self.category,
            created_by=self.user,
        )
        self.assertIsNone(no_due_date_project.days_until_due())


class ProjectViewSetTest(APITestCase):
    """Test Project ViewSet API endpoints"""

    def setUp(self):
        """Create test user, category and authenticate"""
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.category = Category.objects.create(
            name="Work",
            description="Work-related tasks",
            color="#FF0000",
            created_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

        # Create a fresh project for each test
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

    def tearDown(self):
        """Clean up after each test"""
        # Django test framework handles cleanup automatically
        # No need for manual cleanup
        pass

    def test_list_projects(self):
        """Test listing projects"""
        url = reverse("projects:project-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle pagination - DRF wraps data in 'results' when pagination is enabled
        data = response.data.get("results", response.data)

        # Check that we have at least our test project
        self.assertGreaterEqual(len(data), 1)

        # Find our specific test project
        test_project = next((p for p in data if p["name"] == "Test Project"), None)
        self.assertIsNotNone(test_project)
        self.assertEqual(test_project["name"], "Test Project")

    def test_create_project(self):
        """Test creating a new project"""
        url = reverse("projects:project-list")
        data = {
            "name": "New Project",
            "description": "A new project",
            "category": self.category.id,
            "priority": "medium",
            "status": "planning",
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Project")
        self.assertEqual(response.data["priority"], "medium")

        # Verify project was created in database
        project_count = Project.objects.filter(created_by=self.user).count()
        self.assertGreaterEqual(project_count, 2)

    def test_retrieve_project(self):
        """Test retrieving a specific project"""
        url = reverse("projects:project-detail", args=[self.project.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Project")
        self.assertEqual(response.data["category_details"]["name"], "Work")

    def test_update_project(self):
        """Test updating a project"""
        url = reverse("projects:project-detail", args=[self.project.id])
        data = {"name": "Updated Project", "priority": "urgent"}

        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Project")
        self.assertEqual(response.data["priority"], "urgent")

    def test_delete_project(self):
        """Test deleting a project"""
        url = reverse("projects:project-detail", args=[self.project.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Project should be completely deleted
        self.assertLess(Project.objects.filter(created_by=self.user).count(), 1)

    def test_create_project_validation(self):
        """Test project creation validation"""
        url = reverse("projects:project-list")

        # Test duplicate name for same user
        data = {
            "name": "Test Project",  # Same name as existing project
            "category": self.category.id,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test invalid category
        data = {
            "name": "Valid Project",
            "category": 99999,  # Non-existent category
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProjectUniqueConstraintTest(TestCase):
    """Separate test class for unique constraint to avoid transaction issues"""

    def test_unique_name_per_user_constraint(self):
        """Test unique constraint in isolation"""
        # Create first user, category and project
        user1 = User.objects.create_user(
            email="user1@example.com", username="user1", password="testpass123"
        )
        category1 = Category.objects.create(name="Category 1", created_by=user1)
        project1 = Project.objects.create(
            name="Test Project", category=category1, created_by=user1
        )

        # Create second user with same project name (should work)
        user2 = User.objects.create_user(
            email="user2@example.com", username="user2", password="testpass123"
        )
        category2 = Category.objects.create(name="Category 2", created_by=user2)
        project2 = Project.objects.create(
            name="Test Project", category=category2, created_by=user2
        )

        # Try to create duplicate for same user (should fail)
        with self.assertRaises(IntegrityError):
            Project.objects.create(
                name="Test Project", category=category1, created_by=user1
            )

        # Verify the constraint works
        self.assertEqual(Project.objects.filter(created_by=user1).count(), 1)
        self.assertEqual(Project.objects.filter(created_by=user2).count(), 1)
