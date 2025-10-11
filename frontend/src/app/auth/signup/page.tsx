'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/auth/useAuth';
import { Button, Input } from '../../../components/shared';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error: contextError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Limpiar errores previos del contexto
    setLocalError(''); // Limpiar errores locales
    setSuccess('');

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Si llegamos aquí, el registro fue exitoso
      setSuccess('Registro exitoso. Redirigiendo al dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error en registro:', err);
      // El error ya se maneja en el contexto
    }
  };

  const displayError = localError || contextError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
              placeholder="Ingresa tu nombre completo"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
            />
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {displayError}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}