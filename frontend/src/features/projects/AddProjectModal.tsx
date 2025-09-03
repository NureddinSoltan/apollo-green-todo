import { useState } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../../lib/validations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Project, Category } from '../../types';
import { createProject } from '../../api/projects';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (project: Project) => void;
  categories?: Category[];
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onProjectAdded,
  categories = []
}: AddProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'in progress',
      priority: 'medium',
      start_date: '',
      due_date: '',
      category: 0
    }
  });

  const watchedStartDate = watch('start_date');

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create project via API
      const newProject = await createProject({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date,
        due_date: data.due_date,
        category: data.category,
      });

      onProjectAdded(newProject);
      reset();
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);

      // Handle different types of errors
      if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the backend is running.');

        // Fallback: Create mock project for testing
        if (confirm('Backend is not available. Would you like to create a test project for demonstration?')) {
          const mockProject: Project = {
            id: Date.now(),
            name: data.name,
            description: data.description,
            status: data.status,
            priority: data.priority,
            start_date: data.start_date,
            due_date: data.due_date,
            category: data.category,
            category_details: categories.find(c => c.id === data.category),
            is_active: true,
            task_count: 0,
            completed_task_count: 0,
            progress_percentage: 0,
            is_overdue: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'test_user',
            updated_by: 'test_user'
          };

          onProjectAdded(mockProject);
          reset();
          onClose();
        }
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors.join(', '));
        } else {
          setError('Invalid data provided. Please check your input.');
        }
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in to create projects.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create New Project</h2>
            <p className="text-sm text-muted-foreground">Add a new project to your workspace</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Project Name *
            </label>
            <Input
              {...register('name')}
              id="name"
              placeholder="Enter project name"
              className="w-full"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              placeholder="Describe your project"
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="planning">Planning</option>
                <option value="in progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                id="priority"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <div className="relative">
                <Input
                  {...register('start_date')}
                  type="date"
                  id="start_date"
                  className="w-full pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-foreground mb-2">
                Due Date
              </label>
              <div className="relative">
                <Input
                  {...register('due_date')}
                  type="date"
                  id="due_date"
                  min={watchedStartDate}
                  className="w-full pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category *
            </label>
            <div className="relative">
              <select
                {...register('category', { valueAsNumber: true })}
                id="category"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value={0}>Select a category</option>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value={0} disabled>
                    No categories available
                  </option>
                )}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
            )}
            {Array.isArray(categories) && categories.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                No categories found. Please create a category first.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
