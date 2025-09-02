-- Core User Table (Django's auth_user)
CREATE TABLE auth_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Category Table
CREATE TABLE categories_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#1976d2',
    user_id INTEGER NOT NULL,
    -- TrackableModel: TimeStampedModel fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- TrackableModel: AuditableModel fields
    created_by INTEGER NULL,
    updated_by INTEGER NULL,
    -- Constraints and Foreign Keys
    CONSTRAINT unique_user_category UNIQUE (user_id, name),
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES auth_user(id) ON DELETE SET NULL
);

-- Project Table
CREATE TABLE projects_project (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    category_id INTEGER NULL,
    -- TrackableModel: TimeStampedModel fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- TrackableModel: AuditableModel fields
    created_by INTEGER NULL,
    updated_by INTEGER NULL,
    -- Constraints and Foreign Keys
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories_category(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES auth_user(id) ON DELETE SET NULL
);

-- Task Table
CREATE TABLE tasks_task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    deadline TIMESTAMP WITH TIME ZONE,
    project_id INTEGER NOT NULL,
    -- TrackableModel: TimeStampedModel fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- TrackableModel: AuditableModel fields
    created_by INTEGER NULL,
    updated_by INTEGER NULL,
    -- Constraints and Foreign Keys
    FOREIGN KEY (project_id) REFERENCES projects_project(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES auth_user(id) ON DELETE SET NULL
);

-- Notification Table (Optional)
CREATE TABLE notifications_notification (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    -- TimeStampedModel fields (only)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);