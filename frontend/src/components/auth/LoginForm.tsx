'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import Link from 'next/link';
import styles from './LoginForm.module.css';
import buttonStyles from '../shared/Button.module.css';
import Image from 'next/image';

export function LoginForm() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    clearError();

    try {
      await signIn(formData);
      // El useEffect se encarga de la redirección cuando isAuthenticated cambie
    } catch (err: unknown) {
      console.error('Error en login:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // No mostrar nada mientras verifica o redirige, solo el formulario normal
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>SQA-Tool</h2>
          <Image src="/logo-SQATool.png" alt="SQA Tool" width={75} height={75} />
          <h2>Inicia sesión en tu cuenta</h2>
          <p className={styles.subtitle}>
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fields}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="submit"
              isLoading={isLoading}
              className={buttonStyles.full}
              size="lg"
              variant="primary"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className={styles.links}>
            <Link href="/auth/forgot-password" className={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}