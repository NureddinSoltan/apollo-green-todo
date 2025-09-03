import apiClient from './client';
import { Task, ApiResponse } from '../types';

export interface CreateTaskData {
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

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: number;
}

export interface TaskFilters {
  project?: number;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  page_size?: number;
  overdue?: boolean;
}

// Get all tasks with optional filtering
export const getTasks = async (filters?: TaskFilters): Promise<ApiResponse<Task>> => {
  const params = new URLSearchParams();

  if (filters?.project) params.append('project', filters.project.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.page_size) params.append('page_size', filters.page_size.toString());
  if (filters?.overdue) params.append('overdue', filters.overdue.toString());

  const response = await apiClient.get(`/tasks/${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

// Get tasks for a specific project
export const getProjectTasks = async (projectId: number, filters?: Omit<TaskFilters, 'project'>): Promise<Task[]> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.overdue) params.append('overdue', filters.overdue.toString());

  const response = await apiClient.get(`/projects/${projectId}/tasks/${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

// Get a single task by ID
export const getTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get(`/tasks/${id}/`);
  return response.data;
};

// Create a new task
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await apiClient.post('/tasks/', data);
  return response.data;
};

// Update an existing task
export const updateTask = async (data: UpdateTaskData): Promise<Task> => {
  const { id, ...updateData } = data;
  const response = await apiClient.patch(`/tasks/${id}/`, updateData);
  return response.data;
};

// Delete a task
export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}/`);
};

// Update task status
export const updateTaskStatus = async (id: number, status: Task['status']): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, { status });
  return response.data;
};

// Update task priority
export const updateTaskPriority = async (id: number, priority: Task['priority']): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, { priority });
  return response.data;
};

// Update task progress
export const updateTaskProgress = async (id: number, progress: number): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, { progress });
  return response.data;
};

// Mark task as completed
export const completeTask = async (id: number): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, {
    status: 'completed',
    progress: 100
  });
  return response.data;
};

// Get overdue tasks
export const getOverdueTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/overdue/');
  return response.data;
};

// Get tasks due today
export const getTasksDueToday = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/due-today/');
  return response.data;
};
