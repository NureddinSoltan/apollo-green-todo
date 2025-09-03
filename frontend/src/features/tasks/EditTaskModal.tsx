import { useState, useEffect } from 'react';
import { X, Clock, FileText, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../../lib/validations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Task } from '../../types';
import { updateTask } from '../../api/tasks';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export default function EditTaskModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated
}: EditTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<TaskFormData>();

  const watchedStartDate = watch('start_date');

  // Reset form when task changes
  useEffect(() => {
    if (task && isOpen) {
      console.log('EditTaskModal: Task data received:', task);

      const formData = {
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        start_date: task.start_date || '',
        due_date: task.due_date || '',
        project: task.project,
        estimated_hours: task.estimated_hours || 0,
        progress: task.progress
      };

      console.log('EditTaskModal: Form data to be set:', formData);
      reset(formData);
    }
  }, [task, isOpen, reset]);

  const handleClose = () => {
    setError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!task) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('EditTaskModal: Submitting task data:', data);

      // Update task via API
      const updatedTask = await updateTask({
        id: task.id,
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date,
        due_date: data.due_date,
        project: data.project,
        estimated_hours: data.estimated_hours,
        progress: data.progress
      });

      console.log('EditTaskModal: Task updated successfully:', updatedTask);
      onTaskUpdated(updatedTask);
      handleClose();
    } catch (error: any) {
      console.error('EditTaskModal: Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Edit Task</h2>
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
                Task Name *
              </label>
              <Input
                {...register('name')}
                id="name"
                placeholder="Enter task name"
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
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                placeholder="Describe the task"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
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

          {/* Estimated Hours and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimated_hours" className="block text-sm font-medium text-foreground mb-2">
                Estimated Hours
              </label>
              <Input
                {...register('estimated_hours', { valueAsNumber: true })}
                type="number"
                id="estimated_hours"
                step="0.5"
                min="0"
                placeholder="0.0"
                className="w-full"
              />
              {errors.estimated_hours && (
                <p className="mt-1 text-sm text-destructive">{errors.estimated_hours.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-foreground mb-2">
                Progress (%) *
              </label>
              <Input
                {...register('progress', { valueAsNumber: true })}
                type="number"
                id="progress"
                min="0"
                max="100"
                step="1"
                className="w-full"
              />
              {errors.progress && (
                <p className="mt-1 text-sm text-destructive">{errors.progress.message}</p>
              )}
            </div>
          </div>

          {/* Hidden project field */}
          <input type="hidden" {...register('project')} />

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
                  Update Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
