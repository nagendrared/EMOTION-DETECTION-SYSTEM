import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  gradient = false,
  hover = false 
}) => {
  const baseClasses = 'rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50 transition-all duration-300';
  const backgroundClasses = gradient 
    ? 'bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60'
    : 'bg-white/70 dark:bg-gray-800/70';
  const hoverClasses = hover 
    ? 'hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1'
    : '';

  return (
    <div className={`${baseClasses} ${backgroundClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};