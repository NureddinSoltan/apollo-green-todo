import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Project, Task } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';
import AddTaskModal from '../tasks/AddTaskModal';
import EditTaskModal from '../tasks/EditTaskModal';
import TaskTable from '../tasks/TaskTable';
import { getProjectTasks, deleteTask, updateTaskStatus, completeTask, updateTaskStatusAndProgress } from '../../api/tasks';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: number) => void;
  onTaskAdded: (task: Task) => void;
  onProjectEdit: (project: Project) => void;
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted,
  onTaskAdded,
  onProjectEdit
}: ProjectDetailModalProps) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load tasks when project changes
  useEffect(() => {
    if (project && isOpen) {
      loadProjectTasks();
    }
  }, [project, isOpen]);

  const loadProjectTasks = async () => {
    if (!project) return;

    try {
      setIsLoadingTasks(true);
      setTasksError(null);
      console.log('ProjectDetailModal: Loading tasks for project ID:', project.id);

      const projectTasks = await getProjectTasks(project.id);
      console.log('ProjectDetailModal: Tasks loaded successfully:', projectTasks);
      console.log('ProjectDetailModal: Number of tasks for project:', projectTasks.length);

      setTasks(projectTasks);
    } catch (err) {
      console.error('ProjectDetailModal: Error loading project tasks:', err);
      setTasksError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      console.log('ProjectDetailModal: Deleting task:', taskId);
      await deleteTask(taskId);
      console.log('ProjectDetailModal: Task deleted successfully');

      // Refresh tasks after deletion
      loadProjectTasks();
    } catch (err) {
      console.error('ProjectDetailModal: Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleTaskStatusChange = async (taskId: number, status: Task['status']) => {
    try {
      console.log('ProjectDetailModal: Changing task status:', taskId, 'to', status);
      await updateTaskStatus(taskId, status);
      console.log('ProjectDetailModal: Task status updated successfully');

      // Refresh tasks after status change
      loadProjectTasks();
    } catch (err) {
      console.error('ProjectDetailModal: Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      console.log('ProjectDetailModal: Handling complete/reset for task:', taskId);

      // Find the current task to check its status
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return;

      if (currentTask.status === 'completed') {
        // If already completed, reset to TODO with 0% progress
        console.log('ProjectDetailModal: Resetting completed task to TODO:', taskId);

        // Update both status and progress
        await updateTaskStatusAndProgress(taskId, 'todo', 0);
        console.log('ProjectDetailModal: Task reset to TODO successfully');

        // Show success message
        setSuccessMessage('✅ Task reset to "To Do" with 0% progress');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // If not completed, mark as completed with 100% progress
        console.log('ProjectDetailModal: Marking task as completed:', taskId);
        await completeTask(taskId);
        console.log('ProjectDetailModal: Task completed successfully');

        // Show success message
        setSuccessMessage('🎉 Task marked as completed with 100% progress!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      // Refresh tasks after any status change
      loadProjectTasks();
    } catch (err) {
      console.error('ProjectDetailModal: Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('ProjectDetailModal: Opening edit modal for task:', task);
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    console.log('ProjectDetailModal: Task updated:', updatedTask);
    // Refresh tasks after update
    loadProjectTasks();
  };

  if (!isOpen || !project) return null;

  const getProgressPercentage = () => {
    return project.progress_percentage || 0;
  };

  const progress = getProgressPercentage();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      onProjectDeleted(project.id);
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Circle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'planning':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground">Project Details & Tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onProjectEdit(project)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="px-6 py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
            {successMessage}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Description */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
            </div>

            {/* Project Details */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Project Details</h3>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Priority</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>

              {/* Category */}
              {project.category_details && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Category</span>
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">
                    {project.category_details.name}
                  </span>
                </div>
              )}

              {/* Dates */}
              {project.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(project.start_date)}
                  </div>
                </div>
              )}

              {project.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatDate(project.due_date)}
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.completed_task_count} of {project.task_count} tasks completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
                <Button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>

              {/* Tasks List */}
              {isLoadingTasks ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : tasksError ? (
                <div className="text-center py-12">
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-destructive mb-4">{tasksError}</p>
                    <Button onClick={loadProjectTasks}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Add your first task to get started with this project
                  </p>
                  <Button onClick={() => setIsAddTaskModalOpen(true)}>
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <TaskTable
                    tasks={tasks}
                    onTaskEdit={(task) => {
                      handleEditTask(task);
                    }}
                    onTaskDelete={(taskId) => {
                      console.log('ProjectDetailModal: Delete task:', taskId);
                      if (confirm('🗑️ Are you sure you want to delete this task?\n\nThis action cannot be undone and will permanently remove the task from the project.')) {
                        handleDeleteTask(taskId);
                      }
                    }}
                    onTaskCompleteToggle={handleCompleteTask}
                    onTaskStatusChange={(taskId, status) => {
                      console.log('ProjectDetailModal: Change task status:', taskId, status);
                      if (status === 'completed') {
                        handleCompleteTask(taskId);
                      } else {
                        handleTaskStatusChange(taskId, status);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={(task) => {
          console.log('ProjectDetailModal: Task added:', task);
          onTaskAdded(task);
          // Refresh tasks after adding
          loadProjectTasks();
        }}
        projectId={project.id}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setEditingTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
