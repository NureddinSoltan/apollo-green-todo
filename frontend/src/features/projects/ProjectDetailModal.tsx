import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Project, Task } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';
import AddTaskModal from '../tasks/AddTaskModal';
import TaskTable from '../tasks/TaskTable';
import { getProjectTasks } from '../../api/tasks';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: number) => void;
  onTaskAdded: (task: Task) => void;
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted,
  onTaskAdded
}: ProjectDetailModalProps) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

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
      const projectTasks = await getProjectTasks(project.id);
      setTasks(projectTasks);
    } catch (err) {
      console.error('Error loading project tasks:', err);
      setTasksError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoadingTasks(false);
    }
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
              onClick={() => onProjectUpdated(project)}
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
                      console.log('Edit task:', task);
                      // TODO: Implement task editing
                    }}
                    onTaskDelete={(taskId) => {
                      console.log('Delete task:', taskId);
                      // TODO: Implement task deletion
                    }}
                    onTaskStatusChange={(taskId, status) => {
                      console.log('Change task status:', taskId, status);
                      // TODO: Implement status change
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
        onTaskAdded={onTaskAdded}
        projectId={project.id}
      />
    </div>
  );
}
