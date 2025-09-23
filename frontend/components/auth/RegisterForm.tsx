'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Input, Button, Alert } from '@/components/shared';
import { SignUpRequest } from '@/lib/auth/types/auth';

interface RegisterFormProps {
  onSubmit: (data: SignUpRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function RegisterForm({ onSubmit, isLoading = false, error, success }: Readonly<RegisterFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignUpRequest & { confirmPassword: string }>();

  const password = watch('password');

  const handleFormSubmit = async (data: SignUpRequest & { confirmPassword: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...submitData } = data;
    await onSubmit(submitData);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Crear Cuenta
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Completa los datos para registrarte
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Nombre Completo"
          type="text"
          placeholder="Juan Pérez"
          required
          error={errors.name?.message}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
          {...register('name', {
            required: 'El nombre es requerido',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres'
            }
          })}
        />

        <Input
          id="email"
          label="Correo Electrónico"
          type="email"
          placeholder="usuario@ejemplo.com"
          required
          error={errors.email?.message}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
          {...register('email', {
            required: 'El correo electrónico es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo electrónico inválido'
            }
          })}
        />

        <div className="relative">
          <Input
            id="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            error={errors.password?.message}
            helperText="Mínimo 6 caracteres"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            }
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: 'La contraseña debe contener al menos una letra y un número'
              }
            })}
          />
          
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            id="confirmPassword"
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
          />
          
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-[#4E5EA3] focus:ring-[#4E5EA3] border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Acepto los{' '}
            <Link 
              href="/terms" 
              className="text-[#4E5EA3] hover:text-[#3d4a82] underline"
              target="_blank"
            >
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link 
              href="/privacy" 
              className="text-[#4E5EA3] hover:text-[#3d4a82] underline"
              target="_blank"
            >
              política de privacidad
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link 
            href="/auth/login"
            className="font-medium text-[#4E5EA3] hover:text-[#3d4a82] dark:text-[#8b9dc3] dark:hover:text-[#4E5EA3]"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}