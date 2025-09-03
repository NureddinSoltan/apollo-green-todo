import { useState, useEffect } from 'react';
import { useAuth } from '../../stores/auth-context';
import { useTheme } from '../../stores/theme-context';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import ProjectGrid from '../projects/ProjectGrid';
import ProjectDetailModal from '../projects/ProjectDetailModal';
import EditProjectModal from '../projects/EditProjectModal';
import Categories from '../categories/Categories';
import { Project, Task, Category } from '../../types';
import { getProjects, updateProject, deleteProject } from '../../api/projects';
import { getCategories } from '../../api/categories';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasDismissedWelcome, setHasDismissedWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');

  // Load real data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Dashboard: Starting to load data...');
      console.log('Dashboard: User auth state:', { user, isAuthenticated: !!user });

      // Check if user is authenticated
      if (!user) {
        console.log('Dashboard: No user found, redirecting to login...');
        setError('Please log in to access your dashboard.');
        return;
      }

      // Load projects and categories in parallel
      console.log('Dashboard: Calling getProjects()...');
      const projectsData = await getProjects();
      console.log('Dashboard: getProjects() response:', projectsData);

      console.log('Dashboard: Calling getCategories()...');
      const categoriesData = await getCategories();
      console.log('Dashboard: getCategories() response:', categoriesData);

      console.log('Dashboard: Projects data loaded:', projectsData);
      console.log('Dashboard: Categories data loaded:', categoriesData);
      console.log('Dashboard: Projects count:', projectsData.results?.length || 0);
      console.log('Dashboard: Categories count:', categoriesData.length || 0);

      const projectsList = projectsData.results || [];
      const categoriesList = categoriesData || [];

      setProjects(projectsList);
      setCategories(categoriesList);

      // Check if this is a new user (no projects and no categories)
      if (projectsList.length === 0 && categoriesList.length === 0) {
        console.log('Dashboard: New user detected - no projects or categories');
        setIsNewUser(true);
      } else {
        // User has some data, not new
        setIsNewUser(false);
      }
    } catch (err) {
      console.error('Dashboard: Error loading data:', err);
      console.error('Dashboard: Error type:', typeof err);
      console.error('Dashboard: Error message:', err instanceof Error ? err.message : 'No message');
      console.error('Dashboard: Error stack:', err instanceof Error ? err.stack : 'No stack');

      // Check if it's an authentication error or network error
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Authentication') || err.message.includes('403')) {
          setError('Authentication failed. Please log in again.');
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to load projects and categories. Please try again.');
        }
      } else {
        setError('Failed to load projects and categories. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load data if user is authenticated
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleProjectAdded = async () => {
    try {
      // Refresh projects from API to get the latest data
      const projectsData = await getProjects();
      setProjects(projectsData.results || []);

      // If this was a new user, they're no longer new
      if (isNewUser) {
        setIsNewUser(false);
        setHasDismissedWelcome(true); // Also dismiss welcome screen
      }
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

  const handleProjectEdit = (project: Project) => {
    console.log('Dashboard: Opening edit modal for project:', project);
    console.log('Dashboard: Current categories state:', categories);
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleProjectDeleted = async (projectId: number) => {
    // Confirm deletion with better message
    if (!confirm('🗑️ Are you sure you want to delete this project?\n\n⚠️ This action cannot be undone and will permanently remove:\n• The project and all its data\n• All associated tasks\n• Project history and progress\n\nThis is a destructive action that cannot be reversed.')) {
      return;
    }

    try {
      // Delete project via API
      await deleteProject(projectId);

      // Refresh projects from API to get the latest data
      const projectsData = await getProjects();
      setProjects(projectsData.results || []);

      // Close modal if the deleted project was selected
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setIsProjectDetailOpen(false);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleProjectView = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  const handleTaskAdded = (task: Task) => {
    console.log('Dashboard: Task added:', task);
    // TODO: Update project's task count
    // For now, just log the task
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">Apollo Todo</h1>
            <span className="text-sm text-muted-foreground">
              {user ? `Welcome back, ${user.username}!` : 'Please log in to continue'}
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
        {!user ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Authentication Required</h2>
              <p className="text-blue-700 mb-6 text-lg">
                Please log in to access your dashboard and manage your projects.
              </p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                Go to Login
              </Button>
              <p className="text-blue-600 text-sm mt-4">
                💡 If you just registered, please log in with your credentials.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md mx-auto">
              <p className="text-destructive mb-4">{error}</p>
              {error.includes('Authentication') || error.includes('log in') ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    It looks like your session has expired or you're not properly logged in.
                  </p>
                  <Button onClick={() => window.location.href = '/login'}>
                    Go to Login
                  </Button>
                </div>
              ) : (
                <Button onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  loadData();
                }}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (isNewUser && !hasDismissedWelcome) ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Welcome to Apollo Todo!</h2>
              <p className="text-blue-700 mb-6 text-lg">
                You're all set up! Ready to start organizing your tasks?
              </p>
              {/* Let's Go! Button to skip welcome screen */}
              <div className="text-center mb-6">
                <Button
                  onClick={() => {
                    setHasDismissedWelcome(true);
                    setActiveTab('projects'); // Set to projects tab by default
                  }}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold"
                >
                  🚀 Let's Go! Take me to the dashboard
                </Button>
              </div>

              <p className="text-blue-600 text-sm mt-4">
                💡 Tip: Start with a category (like "Work" or "Personal") then create projects within it!
              </p>
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
                onProjectUpdated={handleProjectEdit}
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

                    // If this was a new user, they're no longer new
                    if (isNewUser) {
                      setIsNewUser(false);
                      setHasDismissedWelcome(true); // Also dismiss welcome screen
                    }
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
        onProjectEdit={handleProjectEdit}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onProjectUpdated={handleProjectUpdated}
        categories={categories}
      />
    </div>
  );
}
