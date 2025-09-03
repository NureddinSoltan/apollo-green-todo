import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Project, Category } from '../../types';
import AddProjectModal from './AddProjectModal';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onProjectAdded: (project: Project) => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: number) => void;
  onProjectView?: (project: Project) => void;
  categories?: Category[];
}

export default function ProjectGrid({
  projects,
  onProjectAdded,
  onProjectUpdated,
  onProjectDeleted,
  onProjectView,
  categories = []
}: ProjectGridProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddProject = (project: Project) => {
    onProjectAdded(project);
    setIsAddModalOpen(false);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'in progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const overdue = projects.filter(p => p.is_overdue).length;

    return { total, active, completed, overdue };
  };

  const stats = getProjectStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started with task management
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onProjectUpdated}
              onDelete={onProjectDeleted}
              onView={onProjectView}
            />
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={handleAddProject}
        categories={categories}
      />
    </div>
  );
}
