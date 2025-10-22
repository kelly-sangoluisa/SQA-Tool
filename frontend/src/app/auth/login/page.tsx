'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/auth/useAuth';
import { Button, Input } from '../../../components/shared';
import buttonStyles from '../../../components/shared/Button.module.css';
import Link from 'next/link';
import styles from '../../../styles/auth/login.module.css';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    clearError();
    setIsSubmitting(true);

    try {
      await signIn(formData);
      // Forzar redirección inmediata después del login exitoso
      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error('Error en login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si está verificando autenticación inicial, mostrar fondo blanco elegante
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="text-gray-500 text-sm">Verificando sesión...</div>
      </div>
    );
  }

  // Si ya está autenticado, mostrar fondo blanco mientras redirige
  if (isAuthenticated && user) {
    return (
      <div className={styles.container}>
        <div className="text-gray-500 text-sm"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          <h2 className={styles.title}>
            Inicia sesión en tu cuenta
          </h2>
          <p className={styles.subtitle}>
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.spaceY4}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="tu@email.com"
              disabled={isSubmitting}
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={buttonStyles.full}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className={styles.centerText}>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}