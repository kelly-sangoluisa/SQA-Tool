'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Input, Button, Alert } from '@/components/shared';
import { ResetPasswordRequest } from '@/lib/auth/types/auth';

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  accessToken?: string;
}

export default function ResetPasswordForm({ 
  onSubmit, 
  isLoading = false, 
  error, 
  success,
  accessToken 
}: Readonly<ResetPasswordFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordRequest & { confirmPassword: string }>();

  const password = watch('new_password');

  const handleFormSubmit = async (data: ResetPasswordRequest & { confirmPassword: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...submitData } = data;
    await onSubmit({
      ...submitData,
      access_token: accessToken || data.access_token
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ¡Contraseña Actualizada!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tu contraseña ha sido restablecida exitosamente
          </p>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={() => window.location.href = '/auth/login'}
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Nueva Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu nueva contraseña
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {!accessToken && (
          <Input
            id="access_token"
            label="Token de Acceso"
            type="text"
            placeholder="Ingresa el token de acceso recibido"
            required
            error={errors.access_token?.message}
            helperText="Revisa tu correo electrónico y copia el token de acceso"
            {...register('access_token', {
              required: 'El token de acceso es requerido'
            })}
          />
        )}

        <div className="relative">
          <Input
            id="new_password"
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            error={errors.new_password?.message}
            helperText="Mínimo 6 caracteres con al menos una letra y un número"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            }
            {...register('new_password', {
              required: 'La nueva contraseña es requerida',
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
            label="Confirmar Nueva Contraseña"
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
              required: 'Confirma tu nueva contraseña',
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

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Recordaste tu contraseña?{' '}
          <Link 
            href="/auth/login"
            className="font-medium text-[#4E5EA3] hover:text-[#3d4a82] dark:text-[#8b9dc3] dark:hover:text-[#4E5EA3]"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}