'use client';

import { useState, forwardRef } from 'react';
import { Input } from '@/components/shared';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  // Props adicionales que se pasan al Input del register de react-hook-form
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  disabled?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, placeholder = "••••••••", required, error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const EyeIcon = ({ show }: { show: boolean }) => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        {show ? (
          <path 
            fillRule="evenodd" 
            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" 
            clipRule="evenodd" 
          />
        ) : (
          <>
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path 
              fillRule="evenodd" 
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
              clipRule="evenodd" 
            />
          </>
        )}
      </svg>
    );

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          label={label}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
          {...props}
        />
        
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={togglePassword}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon show={showPassword} />
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;