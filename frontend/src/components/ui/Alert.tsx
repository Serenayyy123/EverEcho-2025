import React from 'react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export function Alert({ children, variant = 'info', title, onClose }: AlertProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    info: {
      backgroundColor: '#dbeafe',
      borderColor: '#2563eb',
      color: '#1e40af',
    },
    success: {
      backgroundColor: '#d1fae5',
      borderColor: '#10b981',
      color: '#065f46',
    },
    warning: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      color: '#92400e',
    },
    error: {
      backgroundColor: '#fee2e2',
      borderColor: '#ef4444',
      color: '#991b1b',
    },
  };

  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const baseStyles: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '16px',
    position: 'relative',
  };

  return (
    <div
      style={{
        ...baseStyles,
        ...variantStyles[variant],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>{icons[variant]}</span>
        <div style={{ flex: 1 }}>
          {title && (
            <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
              {title}
            </p>
          )}
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
              color: 'inherit',
              opacity: 0.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
