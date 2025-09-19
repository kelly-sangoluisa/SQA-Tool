'use client';

import { useState } from 'react';
import { ForgotPasswordForm } from '@/components/auth';
import { ForgotPasswordRequest } from '@/lib/auth/types/auth';
import { authAPI } from '@/lib/auth/api/auth.api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authAPI.forgotPassword(
        data.email,
        `${window.location.origin}/auth/reset-password`
      );
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones.'
      );
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}