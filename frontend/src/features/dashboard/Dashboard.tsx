import { useState, useEffect } from 'react';
import { useAuth } from '../../stores/auth-context';
import { useTheme } from '../../stores/theme-context';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import ProjectGrid from '../projects/ProjectGrid';
import ProjectDetailModal from '../projects/ProjectDetailModal';
import { Project, Task, Category } from '../../types';
import { getProjects } from '../../api/projects';
import { getCategories } from '../../api/categories';
import Categories from '../categories/Categories';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('projects');

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load projects and categories in parallel
        const [projectsData, categoriesData] = await Promise.all([
          getProjects(),
          getCategories()
        ]);

        setProjects(projectsData.results || []);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load projects and categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleProjectAdded = async () => {
    try {
      // Refresh projects from API to get the latest data
      const projectsData = await getProjects();
      setProjects(projectsData.results || []);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    }
  };

  const handleProjectUpdated = async (updatedProject: Project) => {
    try {
      // Refresh projects from API to get the latest data
      const projectsData = await getProjects();
      setProjects(projectsData.results || []);

      // Update selected project if it's the one being edited
      if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
      }
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    }
  };

  const handleProjectDeleted = async (projectId: number) => {
    try {
      // Refresh projects from API to get the latest data
      const projectsData = await getProjects();
      setProjects(projectsData.results || []);

      // Close modal if the deleted project was selected
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setIsProjectDetailOpen(false);
      }
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    }
  };

  const handleProjectView = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  const handleTaskAdded = (task: Task) => {
    // TODO: Update project's task count
    console.log('Task added:', task);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">Apollo Todo</h1>
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.username}!
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Logout button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md mx-auto">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
              <Button
                variant={activeTab === 'projects' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('projects')}
                className="flex-1"
              >
                Projects
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('categories')}
                className="flex-1"
              >
                Categories
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'projects' ? (
              <ProjectGrid
                projects={projects}
                onProjectAdded={handleProjectAdded}
                onProjectUpdated={handleProjectUpdated}
                onProjectDeleted={handleProjectDeleted}
                onProjectView={handleProjectView}
                categories={categories}
              />
            ) : (
              <Categories onCategoryUpdated={() => {
                // Refresh categories when they're updated
                const refreshCategories = async () => {
                  try {
                    const categoriesData = await getCategories();
                    setCategories(categoriesData);
                  } catch (err) {
                    console.error('Error refreshing categories:', err);
                  }
                };
                refreshCategories();
              }} />
            )}
          </>
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isProjectDetailOpen}
        onClose={() => {
          setIsProjectDetailOpen(false);
          setSelectedProject(null);
        }}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
