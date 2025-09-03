import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      console.log('Theme loaded from localStorage:', savedTheme);
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('Theme set from system preference: dark');
      return 'dark';
    }
    
    console.log('Theme set to default: light');
    return 'light';
  });

  useEffect(() => {
    // Update localStorage and document attributes when theme changes
    localStorage.setItem('theme', theme);
    console.log('Theme changed to:', theme);
    
    // Apply theme to html element using data-theme attribute
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark');
      console.log('Dark mode applied to HTML element');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark');
      console.log('Light mode applied to HTML element');
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme called, current theme:', theme);
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
