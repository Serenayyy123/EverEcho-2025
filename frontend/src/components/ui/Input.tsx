import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  const inputStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px 12px',
    fontSize: '16px',
    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          {label}
        </label>
      )}
      <input
        style={inputStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : '#2563eb';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : '#d1d5db';
        }}
        {...props}
      />
      {error && (
        <p
          style={{
            marginTop: '4px',
            fontSize: '14px',
            color: '#ef4444',
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function TextArea({
  label,
  error,
  hint,
  fullWidth = true,
  className = '',
  ...props
}: TextAreaProps) {
  const textareaStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px 12px',
    fontSize: '16px',
    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={textareaStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : '#2563eb';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : '#d1d5db';
        }}
        {...props}
      />
      {error && (
        <p
          style={{
            marginTop: '4px',
            fontSize: '14px',
            color: '#ef4444',
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
