
## 📋 User Stories & Backend Implementation

### Epic: User Authentication & Authorization

| User Story | Backend Feature & Endpoint | Description |
| :--- | :--- | :--- |
| **As a new user, I want to register** so I can access the system. | **`POST /api/auth/register/`** <br> - Validates unique email/username. <br> - Hashes password securely. <br> - Returns success message or validation errors. | Creates a new user account in the database. |
| **As a registered user, I want to log in** so I can access my dashboard. | **`POST /api/auth/login/`** <br> - Validates credentials. <br> - Returns JWT access/refresh tokens upon success. <br> - Implements throttling to prevent brute-force attacks. | Authenticates a user and provides tokens for subsequent requests. |
| **As a logged-in user, I want my session maintained** so I don't have to log in repeatedly. | **JWT Token Authentication** <br> - All protected endpoints require a valid `Authorization: Bearer <token>` header. <br> - **`POST /api/auth/refresh/`** allows refreshing an expired access token. | Stateless authentication ensures scalability and a seamless user experience. |

### Epic: Category Management

| User Story | Backend Feature & Endpoint | Description |
| :--- | :--- | :--- |
| **As a user, I want to create personal categories** so I can organize my projects. | **`POST /api/categories/`** <br> - `name` must be unique per user (enforced by model constraint). <br> - Automatically sets `user` and `created_by` from the request. | Creates a new `Category` instance linked to the authenticated user. |
| **As a user, I want to view and delete my categories** so I can keep my workspace organized. | **`GET /api/categories/`** <br> - Filters queryset to return only the current user's categories. <br><br> **`DELETE /api/categories/{id}/`** <br> - User can only delete their own categories (permission class). <br> - Sets projects' `category_id` to `NULL` (handled by `on_delete`). | Provides full CRUD for the Category resource, scoped to the authenticated user. |

### Epic: Project & Task Management

| User Story | Backend Feature & Endpoint | Description |
| :--- | :--- | :--- |
| **As a user, I want to create a new project** with a title, deadline, and category. | **`POST /api/projects/`** <br> - Handles validation of `deadline` (must be in the future). <br> - Validates that the `category` belongs to the current user. <br> - Sets `user`, `created_by`, and timestamps automatically. | Creates a new `Project` instance, the top-level organizational unit. |
| **As a user, I want to see a list of all my projects.** | **`GET /api/projects/`** <br> - Filters queryset to return only the current user's projects. <br> - Supports **searching** (`?search=term`), **filtering** (`?category=id&is_complete=true`), and **sorting** (`?ordering=-deadline`). | Returns a paginated list of projects, with advanced querying capabilities. |
| **As a user, I want to add a new task to a specific project.** | **`POST /api/projects/{id}/tasks/`** <br> - Nested router endpoint. <br> - Automatically sets the `project_id` from the URL. <br> - Ensures the user owns the parent project. | Creates a new `Task` instance, nested under a specific project. |
| **As a user, I want to mark a task as complete or incomplete.** | **`PATCH /api/tasks/{id}/`** <br> - Partial update endpoint. <br> - Updates the `is_complete` boolean field. <br> - Permission class ensures user can only update their own tasks. | Provides a simple endpoint for toggling task completion status. |

### Epic: Advanced Features

| User Story | Backend Feature & Endpoint | Description |
| :--- | :--- | :--- |
| **As a user, I want to search, filter, and sort** my projects and tasks. | **Django Filter Backends** <br> - **Search:** `?search=website` (searches `title` and `description`). <br> - **Filter:** `?category=2&is_complete=false`. <br> - **Ordering:** `?ordering=-deadline,title`. | Implemented using DRF's `SearchFilter`, `OrderingFilter`, and `DjangoFilterBackend` for powerful list views. |
| **As a user, I want to see a visual deadline countdown.** | **Serializer Method Fields** <br> - The `ProjectSerializer` and `TaskSerializer` include a computed `is_overdue` boolean field. <br> - The frontend calculates the countdown text from the provided `deadline` ISO string. | The API provides the raw deadline data and a calculated `is_overdue` flag for UI logic. |