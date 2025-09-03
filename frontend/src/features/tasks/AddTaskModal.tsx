import { useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../../lib/validations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Task } from '../../types';
import { createTask } from '../../api/tasks';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
  projectId: number;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onTaskAdded,
  projectId
}: AddTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      estimated_hours: 0,
      progress: 0,
      project: projectId
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    console.log('AddTaskModal: Form submitted with data:', data);
    console.log('AddTaskModal: Form errors:', errors);
    console.log('AddTaskModal: Project ID from prop:', projectId);

    setIsLoading(true);
    try {
      console.log('AddTaskModal: Submitting task data:', data);
      console.log('AddTaskModal: Project ID:', projectId);

      // Create task via API
      const newTask = await createTask({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date,
        project: projectId,
        estimated_hours: data.estimated_hours,
        progress: data.progress
      });

      console.log('AddTaskModal: Task created successfully:', newTask);

      onTaskAdded(newTask);
      reset();
      onClose();
    } catch (error) {
      console.error('AddTaskModal: Error creating task:', error);
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
            <h2 className="text-xl font-semibold text-foreground">Add New Task</h2>
            <p className="text-sm text-muted-foreground">Create a new task for this project</p>
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
          {/* Hidden project field */}
          <input type="hidden" {...register('project')} value={projectId} />

          {/* Name */}
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

          {/* Description */}
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
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

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-foreground mb-2">
                Due Date
              </label>
              <div className="relative">
                <Input
                  {...register('due_date')}
                  type="date"
                  id="due_date"
                  className="w-full pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="estimated_hours" className="block text-sm font-medium text-foreground mb-2">
                Estimated Hours
              </label>
              <Input
                {...register('estimated_hours', { valueAsNumber: true })}
                type="number"
                id="estimated_hours"
                min="0"
                step="0.5"
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-foreground mb-2">
              Progress (%)
            </label>
            <Input
              {...register('progress', { valueAsNumber: true })}
              type="number"
              id="progress"
              min="0"
              max="100"
              step="5"
              placeholder="0"
              className="w-full"
            />
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
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
