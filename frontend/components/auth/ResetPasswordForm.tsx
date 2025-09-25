'use client';

import { useForm } from 'react-hook-form';
import { Input, Button, Alert } from '@/components/shared';
import { PasswordInput, AuthLink, strongPasswordValidation } from '@/components/auth';
import { ResetPasswordRequest } from '@/lib/auth/types/auth';

interface ResetPasswordFormProps {
  readonly onSubmit: (data: ResetPasswordRequest) => Promise<void>;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly success?: string | null;
  readonly accessToken?: string;
}

export default function ResetPasswordForm({ 
  onSubmit, 
  isLoading = false, 
  error, 
  success,
  accessToken 
}: Readonly<ResetPasswordFormProps>) {
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
          onClick={() => {
            if (globalThis.window !== undefined) {
              globalThis.window.location.href = '/auth/login';
            }
          }}
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
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            }
            {...register('access_token', {
              required: 'El token de acceso es requerido'
            })}
          />
        )}

        <PasswordInput
          id="new_password"
          label="Nueva Contraseña"
          helperText="Mínimo 6 caracteres con al menos una letra y un número"
          required
          error={errors.new_password?.message}
          {...register('new_password', strongPasswordValidation)}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirmar Nueva Contraseña"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirma tu nueva contraseña',
            validate: value => value === password || 'Las contraseñas no coinciden'
          })}
        />

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
          <AuthLink href="/auth/login">
            Inicia sesión
          </AuthLink>
        </p>
      </div>
    </div>
  );
}