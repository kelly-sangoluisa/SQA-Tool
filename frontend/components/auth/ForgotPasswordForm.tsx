'use client';

import { useForm } from 'react-hook-form';
import { Button, Alert } from '@/components/shared';
import { EmailInput, emailValidation } from '@/components/shared';
import { AuthLink } from '@/components/auth';

interface ForgotPasswordRequest {
  email: string;
}

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
    await onSubmit(data);
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
        <EmailInput
          required
          error={errors.email?.message}
          {...register('email', emailValidation)}
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
          <AuthLink href="/auth/login">
            Inicia sesión
          </AuthLink>
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <AuthLink href="/auth/register">
            Regístrate aquí
          </AuthLink>
        </p>
      </div>
    </div>
  );
}