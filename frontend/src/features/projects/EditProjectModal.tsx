import { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../../lib/validations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Project, Category } from '../../types';
import { updateProject } from '../../api/projects';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  categories: Category[];
}

export default function EditProjectModal({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  categories = []
}: EditProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProjectFormData>();

  const watchedStartDate = watch('start_date');

  // Reset form when project changes
  useEffect(() => {
    if (project && isOpen) {
      console.log('EditProjectModal: Project data received:', project);
      console.log('EditProjectModal: Categories available:', categories);
      console.log('EditProjectModal: Project category value:', project.category, 'Type:', typeof project.category);
      console.log('EditProjectModal: Project category_details:', project.category_details);

      // Find the matching category to verify it exists
      const categoryId = project.category_details?.id || project.category;
      const matchingCategory = categories.find(cat => cat.id === categoryId);
      console.log('EditProjectModal: Using category ID:', categoryId);
      console.log('EditProjectModal: Matching category found:', matchingCategory);

      const formData = {
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date || '',
        due_date: project.due_date || '',
        category: project.category_details?.id || project.category || 0
      };

      console.log('EditProjectModal: Form data to be set:', formData);
      console.log('EditProjectModal: Category IDs in dropdown:', categories.map(cat => ({ id: cat.id, name: cat.name })));
      reset(formData);
    }
  }, [project, isOpen, reset, categories]);

  const handleClose = () => {
    setError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!project) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update project via API
      const updatedProject = await updateProject(project.id, {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date,
        due_date: data.due_date,
        category: data.category,
      });

      onProjectUpdated(updatedProject);
      handleClose();
    } catch (error: any) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  // Debug: Log current state
  console.log('EditProjectModal render - project:', project);
  console.log('EditProjectModal render - categories:', categories);
  console.log('EditProjectModal render - isOpen:', isOpen);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Edit Project</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Input
                {...register('description')}
                id="description"
                placeholder="Enter project description"
                className="w-full"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status *
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
                Priority *
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
                  Updating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
