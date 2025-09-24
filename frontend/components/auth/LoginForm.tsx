'use client';

import { useForm } from 'react-hook-form';
import { Button, Alert } from '@/components/shared';
import { EmailInput, emailValidation } from '@/components/shared';
import { PasswordInput, AuthLink, passwordValidation } from '@/components/auth';
import { SignInRequest } from '@/lib/auth/types/auth';

interface LoginFormProps {
  onSubmit: (data: SignInRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInRequest>();

  const handleFormSubmit = async (data: SignInRequest) => {
    await onSubmit(data);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <EmailInput
          required
          error={errors.email?.message}
          {...register('email', emailValidation)}
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          required
          error={errors.password?.message}
          {...register('password', passwordValidation)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-[#4E5EA3] focus:ring-[#4E5EA3] border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Recordarme
            </label>
          </div>

          <AuthLink href="/auth/forgot-password">
            ¿Olvidaste tu contraseña?
          </AuthLink>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes una cuenta?{' '}
          <AuthLink href="/auth/register">
            Regístrate aquí
          </AuthLink>
        </p>
      </div>
    </div>
  );
}