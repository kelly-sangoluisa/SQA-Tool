'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/shared';

interface EmailInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  [key: string]: any; // Para props adicionales del register
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ 
    id = "email",
    label = "Correo Electrónico",
    placeholder = "usuario@ejemplo.com",
    required = false,
    error,
    ...props 
  }, ref) => {
    return (
      <Input
        ref={ref}
        id={id}
        label={label}
        type="email"
        placeholder={placeholder}
        required={required}
        error={error}
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';

export default EmailInput;