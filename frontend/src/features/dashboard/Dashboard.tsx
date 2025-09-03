import { useAuth } from '../../stores/auth-context';
import { useTheme } from '../../stores/theme-context';
import { Moon, Sun, LogOut, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats cards */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Projects</h3>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Completed Tasks</h3>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
        </div>

        {/* Projects section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Projects</h2>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects yet. Create your first project to get started!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
