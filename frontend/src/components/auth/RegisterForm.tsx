'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import Link from 'next/link';
import styles from './RegisterForm.module.css';

export function RegisterForm() {
  const router = useRouter();
  const { signUp, isLoading, error: contextError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
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
      
      setSuccess('Registro exitoso. Redirigiendo al dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error en registro:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const displayError = localError || contextError;

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crea tu cuenta</h2>
          <p className={styles.subtitle}>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className={styles.link}>
              Inicia sesión aquí
            </Link>
          </p>
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
              placeholder="Ingresa tu nombre completo"
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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
            />
          </div>

          {displayError && (
            <div className={styles.errorBox}>
              {displayError}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              {success}
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
              Crear Cuenta
            </Button>
          </div>

          <div className={styles.textCenter}>
            <Link href="/auth/login" className={styles.link}>
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}