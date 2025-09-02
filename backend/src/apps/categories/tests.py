from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from .models import Category

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test Category model functionality"""

    def setUp(self):
        """Create test user and category"""
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.category = Category.objects.create(
            name="Work",
            description="Work-related tasks",
            color="#FF0000",
            created_by=self.user,
        )

    def test_category_creation(self):
        """Test that category is created correctly"""
        self.assertEqual(self.category.name, "Work")
        self.assertEqual(self.category.created_by, self.user)
        self.assertTrue(self.category.is_active)

    def test_category_str(self):
        """Test string representation"""
        self.assertEqual(str(self.category), "Work")

    def test_unique_name_per_user(self):
        """Test that category names are unique per user"""
        # Create another user first
        other_user = User.objects.create_user(
            email="other@example.com", username="otheruser", password="testpass123"
        )

        # Same name, same user should fail
        with self.assertRaises(IntegrityError):
            Category.objects.create(name="Work", created_by=self.user)

        # Same name, different user should work
        other_category = Category.objects.create(name="Work", created_by=other_user)
        self.assertEqual(other_category.name, "Work")


class CategoryViewSetTest(APITestCase):
    """Test Category ViewSet API endpoints"""

    def setUp(self):
        """Create test user and authenticate"""
        # Create a fresh user for each test
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        # Create a fresh category for each test
        self.category = Category.objects.create(
            name="Work",
            description="Work-related tasks",
            color="#FF0000",
            created_by=self.user,
        )

    def test_list_categories(self):
        """Test listing categories"""
        url = reverse("categories:category-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see the category created in setUp
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Work")

    def test_create_category(self):
        """Test creating a new category"""
        url = reverse("categories:category-list")
        data = {"name": "Personal", "description": "Personal tasks", "color": "#00FF00"}

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Should now have 2 categories (original + new)
        user_categories = Category.objects.filter(created_by=self.user)
        self.assertEqual(user_categories.count(), 2)
        self.assertEqual(response.data["name"], "Personal")

    def test_retrieve_category(self):
        """Test retrieving a specific category"""
        url = reverse("categories:category-detail", args=[self.category.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Work")

    def test_update_category(self):
        """Test updating a category"""
        url = reverse("categories:category-detail", args=[self.category.id])
        data = {"name": "Updated Work", "color": "#FF6600"}

        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Work")
        self.assertEqual(response.data["color"], "#FF6600")

    def test_delete_category(self):
        """Test deleting a category permanently"""
        url = reverse("categories:category-detail", args=[self.category.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Category should be completely deleted
        self.assertEqual(Category.objects.filter(created_by=self.user).count(), 0)


class CategoryUniqueConstraintTest(TestCase):
    """Separate test class for unique constraint to avoid transaction issues"""

    def test_unique_name_per_user_constraint(self):
        """Test unique constraint in isolation"""
        # Create first user and category
        user1 = User.objects.create_user(
            email="user1@example.com", username="user1", password="testpass123"
        )
        category1 = Category.objects.create(name="Work", created_by=user1)

        # Create second user with same category name (should work)
        user2 = User.objects.create_user(
            email="user2@example.com", username="user2", password="testpass123"
        )
        category2 = Category.objects.create(name="Work", created_by=user2)

        # Try to create duplicate for same user (should fail)
        with self.assertRaises(IntegrityError):
            Category.objects.create(name="Work", created_by=user1)

        # Verify the constraint works
        self.assertEqual(Category.objects.filter(created_by=user1).count(), 1)
        self.assertEqual(Category.objects.filter(created_by=user2).count(), 1)