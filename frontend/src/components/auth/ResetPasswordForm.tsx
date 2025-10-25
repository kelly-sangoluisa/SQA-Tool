'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button, Input } from '../shared';
import Link from 'next/link';
import styles from './ResetPasswordForm.module.css';
import buttonStyles from '../shared/Button.module.css';

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Supabase envía el token en el hash: #access_token=...&expires_at=...
    const hash = window.location.hash.substring(1); // Quitar el #
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    
    if (token) {
      setAccessToken(token);
      console.log('Token encontrado:', token.substring(0, 20) + '...');
    } else {
      setLocalError('Token de recuperación no válido o expirado');
      console.error('No se encontró access_token en URL');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !accessToken) return;
    
    clearError();
    setLocalError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      console.log('Enviando petición de reset con:', {
        access_token: accessToken.substring(0, 20) + '...',
        new_password: '***'
      });
      
      await resetPassword({
        access_token: accessToken,
        new_password: formData.password,
      });
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: unknown) {
      console.error('Error al resetear contraseña:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const displayError = localError || error;

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Resetea tu contraseña</h2>
          <p className={styles.subtitle}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>✓ Contraseña actualizada</p>
            <p className={styles.successText}>
              Tu contraseña ha sido actualizada exitosamente. 
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Link href="/auth/login" className={styles.backLink}>
              Ir al inicio de sesión →
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <Input
                label="Nueva contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                disabled={isLoading || !accessToken}
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
                disabled={isLoading || !accessToken}
              />
            </div>

            {displayError && (
              <div className={styles.error}>
                {displayError}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                type="submit"
                isLoading={isLoading}
                className={buttonStyles.full}
                size="lg"
                variant="primary"
                disabled={!accessToken}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
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
