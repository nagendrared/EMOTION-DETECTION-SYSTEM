import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      icon={theme === 'light' ? Moon : Sun}
      className="transition-transform hover:scale-105"
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
};