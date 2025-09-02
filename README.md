# TaskFlow Backend

## 📋 Project Goals

This document tracks the implementation progress and goals for the TaskFlow backend API.

- [x] **Design and implement core database schema (User, Category, Project, Task).**
- [x] **Implement JWT authentication system (register, login, logout, token refresh).**
- [ ] **Build CRUD endpoints for Category model with user-specific permissions.**
- [ ] **Build CRUD endpoints for Project model with user-specific permissions.**
- [ ] **Build nested CRUD endpoints for Task model within Projects.**
- [x] **Implement `TrackableModel` (TimeStampedModel + AuditableModel) for all core models.**
- [ ] **Add advanced querying: search, filter by category/status, and sort for Projects.**
- [ ] **Containerize the application with Docker and Docker Compose.**
- [ ] Use environment variables for all configuration (secret key, database URL, etc.).
- [ ] Switch from SQLite to PostgreSQL in the Docker configuration.
- [ ] Add unit tests for all endpoints and models.
- [ ] Implement basic statistics .
- [x] Add pagination to all list endpoints for scalability.