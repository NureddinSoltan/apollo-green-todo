import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine CSS classes with Tailwind merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get priority color
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'low':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'active':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    case 'in_progress':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    case 'on_hold':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'cancelled':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
}

// Calculate days until due
export function getDaysUntilDue(dueDate: string | Date): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Check if overdue
export function isOverdue(dueDate: string | Date): boolean {
  return getDaysUntilDue(dueDate) < 0;
}
