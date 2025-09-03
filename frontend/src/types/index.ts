// User types
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  task_count: number;
  project_count: number;
  created_at: string;
  updated_at: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  category: number;
  category_details?: Category;
  start_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  is_active: boolean;
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
  is_overdue: boolean;
  days_until_due?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Task types
export interface Task {
  id: number;
  name: string;
  description?: string;
  project: number;
  project_details?: Project;
  start_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  estimated_hours?: number;
  actual_hours?: number;
  progress: number;
  is_active: boolean;
  is_overdue: boolean;
  days_until_due?: number;
  completion_status: string;
  created_at: string;
  updated_at: string;
}

// Dashboard types
export interface DashboardData {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    todo: number;
    in_progress: number;
  };
  categories: {
    total: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  category: number;
  start_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
}

export interface TaskForm {
  name: string;
  description?: string;
  project: number;
  start_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  estimated_hours?: number;
  progress: number;
}

export interface CategoryForm {
  name: string;
  description?: string;
  color: string;
}
