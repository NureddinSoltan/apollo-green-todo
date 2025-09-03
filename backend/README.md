# 🚀 Apollo Green Todo - Todo System

A comprehensive Django-based task management system with time tracking, metrics, and productivity insights.

## ✨ **Features Overview**

### **Core Applications**
- **Categories** - Organize projects by type with color coding
- **Projects** - Manage project lifecycle with status tracking
- **Tasks** - Break down projects into actionable items
- **Users** - Secure authentication and user management

### **Admin Interface**
- **Color-coded status displays** for projects and tasks
- **Visual progress indicators** with percentage bars
- **Productivity metrics** with color-coded scoring
- **Time tracking** with detailed analytics

### **Simple Time Management**
- **Start/stop timer** for tasks
- **Daily goal setting** with hour and task targets
- **Basic dashboard** showing today's progress
- **Recent activities** tracking

## **Architecture**

### **Technology Stack**
- **Backend**: Django 5.0 + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with cookie-based tokens
- **API**: RESTful with pagination and filtering

### **App Structure**
```
src/apps/
├── base/           # Base models (Trackable, Auditable, TimeStamped)
├── users/          # User authentication and management
├── categories/     # Project categorization system
├── projects/       # Project management and lifecycle
├── tasks/          # Task breakdown and tracking
├── metrics/        # Time tracking and analytics
└── notifications/  # Future: notification system
```

## 🚀 **Getting Started**

### **Prerequisites**
- Python 3.12+
- Django 5.0+
- Virtual environment (recommended)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/NureddinSoltan/apollo-green-todo
cd apollo-green-todo-2/backend

# Create a virtual environment with uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies from requirements.txt
uv pip install -r requirements.txt

# Run migrations
python src/manage.py migrate

# Create superuser
python src/manage.py createsuperuser

# Run development server
python src/manage.py runserver
```

### **API Endpoints**

#### **Authentication**
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/` - JWT token generation

#### **Categories**
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

#### **Projects**
- `GET /api/projects/` - List user's projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

#### **Tasks**
- `GET /api/tasks/` - List user's tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

#### **Dashboard**
- `GET /api/projects/dashboard/` - Project and task overview

## **Simple Dashboard**

### **Project Overview**
- **Project Counts** - Total, active, and completed projects
- **Task Statistics** - Total, completed, todo, and in-progress tasks
- **Category Management** - Total categories
- **Progress Tracking** - Automatic progress calculation for projects

### **Smart Features**
- **Overdue Detection** - See which projects are overdue
- **Due Date Tracking** - Days until project completion
- **Task Relationships** - Automatic task counting per project

## **Admin Features**

### **Visual Enhancements**
- **Color-coded Status** - Projects and tasks with status colors
- **Progress Indicators** - Visual progress bars and percentages
- **Priority Display** - Color-coded priority levels
- **Category Colors** - Visual category representation

### **Metrics Dashboard**
- **Project Overview** - Progress and efficiency metrics
- **User Analytics** - Productivity and completion rates
- **Time Tracking** - Detailed time entry management
- **Goal Management** - Daily goal setting and tracking

## 🧪 **Testing**

### **Run Tests**
```bash

# Run specific app tests
python src/manage.py test projects
python src/manage.py test tasks
python src/manage.py test categories
python src/manage.py test metrics

```

### **Test Coverage**
- **Model Tests** - CRUD operations and business logic
- **API Tests** - Endpoint functionality and permissions
- **Admin Tests** - Admin interface functionality

## 🔧 **Configuration**

### **Settings**
- **Database**: Configurable for SQLite/PostgreSQL
- **Pagination**: DRF pagination with configurable page size
- **Authentication**: JWT with customizable settings
- **CORS**: Configurable for frontend integration

## **Future Enhancements**

### **Planned Features**
- **Notifications** - Real-time alerts and reminders
- **Team Collaboration** - Multi-user project management
- **Advanced Analytics** - Charts and reporting
- **Mobile App** - React Native mobile application
- **API Documentation** - Swagger/OpenAPI integration
---

**Built with ❤️ using Django and modern web technologies**

## 📚 **API Documentation**

- **POSTMAN Doc**: `https://documenter.getpostman.com/view/44660624/2sB3HjM1m1` - Postman Documentation
- **Swagger UI**: `http://localhost:8000/api/docs/` - Interactive API testing
- **ReDoc**: `http://localhost:8000/api/redoc/` - Beautiful documentation view
- **OpenAPI Schema**: `http://localhost:8000/api/schema/` - Raw OpenAPI specification
---
