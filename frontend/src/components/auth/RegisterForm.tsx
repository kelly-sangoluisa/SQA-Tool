'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

export function RegisterForm() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        redirectTo: `${window.location.origin}/auth/callback`
      });
      
      // Mostrar mensaje de éxito y redirigir al login
      alert('Cuenta creada exitosamente. Por favor, verifica tu email.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error en registro:', error);
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
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate como evaluador
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Juan Pérez"
              autoComplete="name"
            />

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
              helperText="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || validationError}
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
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Inicia sesión aquí
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}