'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Input, Button, Alert } from '@/components/shared';
import { ForgotPasswordRequest } from '@/lib/auth/types/auth';

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function ForgotPasswordForm({ 
  onSubmit, 
  isLoading = false, 
  error, 
  success 
}: Readonly<ForgotPasswordFormProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordRequest>();

  const handleFormSubmit = async (data: ForgotPasswordRequest) => {
    await onSubmit({
      ...data,
      redirectTo: `${globalThis.location.origin}/auth/reset-password`
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
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

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Recordaste tu contraseña?{' '}
          <Link 
            href="/auth/login"
            className="font-medium text-[#4E5EA3] hover:text-[#3d4a82] dark:text-[#8b9dc3] dark:hover:text-[#4E5EA3]"
          >
            Inicia sesión
          </Link>
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link 
            href="/auth/register"
            className="font-medium text-[#4E5EA3] hover:text-[#3d4a82] dark:text-[#8b9dc3] dark:hover:text-[#4E5EA3]"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}