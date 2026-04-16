'use client';

import { useTheme, type ThemeMode } from '@/components/providers/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const modes: ThemeMode[] = ['light', 'dark', 'system'];
  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  return (
    <div className="flex items-center gap-1 glass rounded-lg p-1">
      {modes.map((themeMode) => (
        <button
          key={themeMode}
          onClick={() => setMode(themeMode)}
          className={`
            p-2 rounded-md transition-all duration-200
            ${mode === themeMode
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
          title={`${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} mode`}
        >
          {icons[themeMode]}
        </button>
      ))}
    </div>
  );
}
