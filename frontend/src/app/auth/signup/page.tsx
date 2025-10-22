'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/auth/useAuth';
import { Button, Input } from '../../../components/shared';
import buttonStyles from '../../../components/shared/Button.module.css';
import Link from 'next/link';
import styles from '../../../styles/auth/signup.module.css';

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
    } catch (err: unknown) {
      console.error('Error en registro:', err);
      // El error ya se maneja en el contexto
    }
  };

  const displayError = localError || contextError;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          <h2 className={styles.title}>
            Crea tu cuenta
          </h2>
          <p className={styles.subtitle}>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.spaceY4}>
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
            <div className={styles.errorBox}>
              {displayError}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              {success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className={buttonStyles.full}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}