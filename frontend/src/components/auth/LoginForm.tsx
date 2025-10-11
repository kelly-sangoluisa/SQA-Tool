'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

export function LoginForm() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await signIn(formData);
      router.push('/dashboard'); // Redirigir al dashboard después del login
    } catch (error) {
      // El error ya se maneja en el hook useAuth
      console.error('Error en login:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Sistema de Evaluación SQA'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              autoComplete="email"
            />
            
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
              variant="primary"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <a
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <br />
            <span className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <a
                href="/auth/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Regístrate aquí
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}