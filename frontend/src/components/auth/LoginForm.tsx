"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import styles from './LoginForm.module.css';
import buttonStyles from '../shared/Button.module.css';

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
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Iniciar sesión</h2>
          <p>{process.env.NEXT_PUBLIC_APP_NAME || 'Sistema de Evaluación SQA'}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles['field-group']}>
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
          </div>

          <div className={styles['field-group']}>
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </div>

          <div className={`${styles['text-center']} ${styles.links}`}>
            <a href="/auth/forgot-password" className={styles.link}>¿Olvidaste tu contraseña?</a>
            <br />
            <span>
              ¿No tienes cuenta?{' '}
              <a href="/auth/register" className={styles.link}>Regístrate aquí</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}