import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'lg', hover = false }: CardProps) {
  const paddingStyles: Record<string, string> = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  const baseStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: paddingStyles[padding],
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
  };

  const hoverStyles: React.CSSProperties = hover ? {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  } : {};

  return (
    <div
      className={className}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (hover) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {children}
    </div>
  );
}
