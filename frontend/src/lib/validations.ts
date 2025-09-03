import { z } from "zod";

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Registration validation
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format (use #RRGGBB)"),
});

// Project validation
export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  category: z.number().positive("Category is required"),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["planning", "in progress", "on_hold", "completed", "cancelled"]),
});

// Task validation
export const taskSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().optional(),
  project: z.number().positive("Project is required"),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]),
  estimated_hours: z.number().min(0.01, "Estimated hours must be greater than 0").max(999.99, "Estimated hours must be less than 1000").optional(),
  progress: z.number().min(0, "Progress must be at least 0").max(100, "Progress must be at most 100"),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
