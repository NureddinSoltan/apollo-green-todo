import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Project } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onView?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleView = () => {
    if (onView) {
      setShowMenu(false); // Close menu when viewing
      onView(project);
    }
  };

  const getProgressPercentage = () => {
    return project.progress_percentage || 0;
  };

  const progress = getProgressPercentage();

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-10">
              <div className="py-1">
                {onView && (
                  <button
                    onClick={handleView}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                )}
                <button
                  onClick={() => onEdit(project)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
          {project.priority}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>{project.completed_task_count} of {project.task_count} tasks</span>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        {project.start_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Started: {formatDate(project.start_date)}</span>
          </div>
        )}
        {project.due_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Due: {formatDate(project.due_date)}</span>
          </div>
        )}
      </div>

      {/* Category */}
      {project.category_details && (
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-accent text-accent-foreground rounded text-xs">
            {project.category_details.name}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(project)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}
