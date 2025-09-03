import apiClient from './client';
import { Category } from '../types';

export interface CreateCategoryData {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

// Get a single category by ID
export const getCategory = async (id: number): Promise<Category> => {
  const response = await apiClient.get(`/categories/${id}/`);
  return response.data;
};

// Create a new category
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  const response = await apiClient.post('/categories/', data);
  return response.data;
};

// Update an existing category
export const updateCategory = async (data: UpdateCategoryData): Promise<Category> => {
  const { id, ...updateData } = data;
  const response = await apiClient.patch(`/categories/${id}/`, updateData);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}/`);
};

// Get active categories only
export const getActiveCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories/?is_active=true');
  return response.data;
};

// Toggle category active status
export const toggleCategoryStatus = async (id: number): Promise<Category> => {
  const response = await apiClient.patch(`/categories/${id}/`, { is_active: true });
  return response.data;
};
