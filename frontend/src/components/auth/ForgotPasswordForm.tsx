'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import Link from 'next/link';
import styles from './ForgotPasswordForm.module.css';
import buttonStyles from '../shared/Button.module.css';

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    clearError();
    setSuccess(false);

    try {
      const redirectTo = `${globalThis.location.origin}/auth/reset-password`;
      await forgotPassword({ email, redirectTo });
      setSuccess(true);
      setEmail(''); // Limpiar el campo
    } catch (err: unknown) {
      console.error('Error al enviar email de recuperación:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Recupera tu contraseña</h2>
          <p className={styles.subtitle}>
            Ingresa tu email y te enviaremos un enlace para resetear tu contraseña
          </p>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>✓ Email enviado</p>
            <p className={styles.successText}>
              Si existe una cuenta con ese email, recibirás un enlace para recuperar tu contraseña.
              Revisa tu bandeja de entrada y spam.
            </p>
            <Link href="/auth/login" className={styles.backLink}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                autoComplete="email"
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
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </div>

            <div className={styles.links}>
              <Link href="/auth/login" className={styles.link}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
