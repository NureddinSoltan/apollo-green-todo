import apiClient from './client';
import { Project, ApiResponse } from '../types';

export interface CreateProjectData {
  name: string;
  description?: string;
  category: number;
  start_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planning' | 'in progress' | 'on_hold' | 'completed' | 'cancelled';
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: number;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  category?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

// Get all projects with optional filtering
export const getProjects = async (filters?: ProjectFilters): Promise<ApiResponse<Project>> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.category) params.append('category', filters.category.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.page_size) params.append('page_size', filters.page_size.toString());

  const response = await apiClient.get(`/projects/${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

// Get a single project by ID
export const getProject = async (id: number): Promise<Project> => {
  const response = await apiClient.get(`/projects/${id}/`);
  return response.data;
};

// Create a new project
export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await apiClient.post('/projects/', data);
  return response.data;
};

// Update an existing project
export const updateProject = async (data: UpdateProjectData): Promise<Project> => {
  const { id, ...updateData } = data;
  const response = await apiClient.patch(`/projects/${id}/`, updateData);
  return response.data;
};

// Delete a project
export const deleteProject = async (id: number): Promise<void> => {
  await apiClient.delete(`/projects/${id}/`);
};

// Get project dashboard data
export const getProjectDashboard = async (): Promise<{
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  tasks: {
    total: number;
    completed: number;
    todo: number;
    in_progress: number;
  };
}> => {
  const response = await apiClient.get('/projects/dashboard/');
  return response.data;
};

// Get projects by category
export const getProjectsByCategory = async (categoryId: number): Promise<Project[]> => {
  const response = await apiClient.get(`/categories/${categoryId}/projects/`);
  return response.data;
};

// Update project status
export const updateProjectStatus = async (id: number, status: Project['status']): Promise<Project> => {
  const response = await apiClient.patch(`/projects/${id}/`, { status });
  return response.data;
};

// Update project priority
export const updateProjectPriority = async (id: number, priority: Project['priority']): Promise<Project> => {
  const response = await apiClient.patch(`/projects/${id}/`, { priority });
  return response.data;
};
