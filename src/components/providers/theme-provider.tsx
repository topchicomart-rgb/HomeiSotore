'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get saved theme mode
    const savedMode = (localStorage.getItem('theme-mode') || 'system') as ThemeMode;
    setModeState(savedMode);
    
    // Apply theme based on mode
    applyTheme(savedMode);
  }, []);

  const applyTheme = (newMode: ThemeMode) => {
    let shouldBeDark = false;
    
    if (newMode === 'dark') {
      shouldBeDark = true;
    } else if (newMode === 'light') {
      shouldBeDark = false;
    } else {
      // System mode
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
    applyTheme(newMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system' || !mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode: handleSetMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a default context instead of throwing
    return { mode: 'system' as ThemeMode, isDark: false, setMode: () => {} };
  }
  return context;
}
