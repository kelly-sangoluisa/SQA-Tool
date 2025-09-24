'use client';

import { useForm } from 'react-hook-form';
import { Input, Button, Alert, EmailInput } from '@/components/shared';
import { PasswordInput, AuthLink } from '@/components/auth';
import { SignUpRequest } from '@/lib/auth/types/auth';

interface RegisterFormProps {
  onSubmit: (data: SignUpRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function RegisterForm({ onSubmit, isLoading = false, error, success }: Readonly<RegisterFormProps>) {
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

        <EmailInput
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'El correo electrónico es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo electrónico inválido'
            }
          })}
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          required
          error={errors.password?.message}
          helperText="Mínimo 6 caracteres"
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

        <PasswordInput
          id="confirmPassword"
          label="Confirmar Contraseña"
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
            <AuthLink href="/terms" target="_blank">
              términos y condiciones
            </AuthLink>{' '}
            y la{' '}
            <AuthLink href="/privacy" target="_blank">
              política de privacidad
            </AuthLink>
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
          <AuthLink href="/auth/login">
            Inicia sesión aquí
          </AuthLink>
        </p>
      </div>
    </div>
  );
}