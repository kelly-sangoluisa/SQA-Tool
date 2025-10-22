'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import styles from './RegisterForm.module.css';

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
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear cuenta</h2>
          <p className={styles.subtitle}>Regístrate como evaluador</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fields}>
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
            <div className={styles.errorBox}>
              {error || validationError}
            </div>
          )}

          <div className={styles.buttonWrapper}>
            <Button
              type="submit"
              isLoading={isLoading}
              className={styles.fullWidth}
              size="lg"
              variant="primary"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </div>

          <div className={styles.textCenter}>
            <span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                ¿Ya tienes cuenta?{' '}
              </span>
              <a href="/auth/login" className={styles.link}>Inicia sesión aquí</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}