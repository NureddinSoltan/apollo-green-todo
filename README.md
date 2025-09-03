# 🚀 Apollo Green Todo

A modern, full-stack todo application built with Django REST API and React frontend, featuring user authentication, project management, and task organization.

## ✨ Features

- **User Authentication**: Secure JWT-based login/register system
- **Project Management**: Create, organize, and manage multiple projects
- **Task Organization**: Hierarchical task management within projects
- **Category System**: Organize projects and tasks by categories
- **Dashboard**: Visual overview of your productivity
- **Advanced Search**: Filter and search through projects and tasks
- **Responsive Design**: Modern UI built with Tailwind CSS
- **User Permissions**: Secure, user-specific data access
- **Statistics**: Track your progress and productivity

## 🛠️ Tech Stack

### Backend
- **Django 5.2+** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (with SQLite for development)
- **JWT Authentication** - Secure user sessions
- **Docker** - Containerization

### Frontend
- **React 19** - User interface
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.12+ (for backend development)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone  https://github.com/NureddinSoltan/apollo-green-todo
   cd apollo-green-todo
   ```

2. **Start the backend**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Start the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Option 2: Local Development

#### Backend Setup
```bash
# Clone the repository
git clone https://github.com/NureddinSoltan/apollo-green-todo
cd apollo-green-todo/backend

# Create a virtual environment with uv (recommended) or venv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Alternative: Create virtual environment with venv
# python -m venv venv
# source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
# Alternative: pip install -r requirements.txt

# Navigate to src directory
cd src

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Backend will be available at:** http://localhost:8000

#### Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd apollo-green-todo/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** http://localhost:5173

#### Database Setup
- **Development**: Uses SQLite by default (no additional setup needed)
- **Production**: PostgreSQL (configure in settings.py with docker)
- **Database file**: Located at `backend/src/db.sqlite3`

## 📚 Documentation
- **API POSTMAN Doc**: `Postman Documentation` - https://documenter.getpostman.com/view/44660624/2sB3HjM1m1
- **API Documentation**: [OpenAPI Spec](backend/docs/API_Doc/openapi.yaml)
- **Postman Collection**: [Download Collection](backend/docs/API_Doc/apollo-todo.postman_collection.json)
- **🗄️ Database Schema**: [ERD Diagram](backend/docs/Flowchart/TODO.erd)
- **📊 User Stories**: [View Stories](backend/docs/Overview/user_stories.md)

## 🔧 API Endpoints

- **Authentication**: `/api/auth/` - Login, register, token management
- **Users**: `/api/users/` - User management
- **Categories**: `/api/categories/` - Category CRUD operations
- **Projects**: `/api/projects/` - Project management
- **Tasks**: `/api/projects/{id}/tasks/` - Task operations within projects

## 🗄️ Database

The application uses PostgreSQL in production and SQLite for development. The database schema includes:

- **Users**: Authentication and user profiles
- **Categories**: Project and task categorization
- **Projects**: Project management with status tracking
- **Tasks**: Task management within projects
- **Audit Trail**: Trackable models with timestamps and user tracking

## 🧪 Testing

Run tests for the backend:
```bash
cd backend/src

# Run specific app tests
python manage.py test projects
python manage.py test tasks
python manage.py test categories
python manage.py test users
```

## 🔧 Backend Development

### **API Documentation (when running locally)**
- **Swagger UI**: http://localhost:8000/api/docs/ - Interactive API testing
- **ReDoc**: http://localhost:8000/api/redoc/ - Beautiful documentation view
- **OpenAPI Schema**: http://localhost:8000/api/schema/ - Raw OpenAPI specification

### **Admin Interface**
- **Django Admin**: http://localhost:8000/admin/ - Database management interface
- **Create superuser**: `python manage.py createsuperuser` to access admin panel

## 📦 Project Structure

```
apollo-green-todo-2/
├── backend/                 # Django REST API
│   ├── src/                # Source code
│   ├── docs/               # API documentation
│   └── docker-compose.yml  # Docker configuration
├── frontend/               # React application
│   ├── src/                # Source code
│   └── package.json        # Dependencies
└── README.md               # This file
```

## 📋 Project Goals

This document tracks the implementation progress and goals for the TaskFlow backend API.

- [x] **Design and implement core database schema (User, Category, Project, Task).**
- [x] **Implement JWT authentication system (register, login, logout, token refresh).**
- [x] **Build CRUD endpoints for Category model with user-specific permissions.**
- [x] **Build CRUD endpoints for Project model with user-specific permissions.**
- [x] **Build nested CRUD endpoints for Task model within Projects.**
- [x] **Implement `TrackableModel` (TimeStampedModel + AuditableModel) for all core models.**
- [x] **Add advanced querying: search, filter by category/status, and sort for Projects.**
- [x] **Containerize the application with Docker and Docker Compose.**
- [ ] Use environment variables for all configuration (secret key, database URL, etc.).
- [x] Switch from SQLite to PostgreSQL in the Docker configuration.
- [x] Add unit tests for all endpoints and models.
- [x] Implement basic statistics .
- [x] Add pagination to all list endpoints for scalability.
