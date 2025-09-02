from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

app_name = "categories"

# Create router and register viewsets
router = DefaultRouter()
router.register(r"", CategoryViewSet, basename="category")

urlpatterns = router.urls
